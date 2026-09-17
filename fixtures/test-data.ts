import {
  test as base,
  expect,
  request as playwrightRequest,
  type APIRequestContext,
  type BrowserContext,
  type Page,
} from '@playwright/test';
import { createAccount, deleteAccount } from '../api/account';

/** The one definition of the target site. `playwright.config.ts` imports it
 * for `use.baseURL`, so config and fixtures can't drift apart. */
export const BASE_URL = 'https://automationexercise.com';

/** Hosts a browser context may reach. Everything else is aborted — see
 * docs/adr/0001-third-party-network-isolation.md. The font CDN stays so
 * pages render as a real visitor sees them. */
const ALLOWED_HOSTS = [
  'automationexercise.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

/** Blocks every host but the site and its font CDN. The fixture below
 * applies it to the default context; a test that opens its own context
 * has to call it itself. */
export async function blockThirdParty(context: BrowserContext) {
  await context.route('**/*', (route) => {
    const host = new URL(route.request().url()).hostname;
    const allowed = ALLOWED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
    return allowed ? route.continue() : route.abort();
  });
}

export type Account = {
  name: string;
  email: string;
  password: string;
  title: 'Mr' | 'Mrs';
  birthDate: string;
  birthMonth: string;
  birthYear: string;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  zipcode: string;
  state: string;
  city: string;
  mobileNumber: string;
};

/** The `pta-` prefix marks an address as ours if a run is interrupted before
 * teardown. */
export function uniqueEmail(): string {
  return `pta-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

/** An address nothing ever registers, for checking how the site answers
 * about an account that doesn't exist. */
export const NEVER_REGISTERED_EMAIL = 'pta-never-registered@example.com';

/** The catalog items the suite pins by id. Names and prices are site data
 * recorded in docs/criteria/; the nightly drift run is what catches them
 * moving. */
export const PRODUCTS = {
  blueTop: { id: 1, name: 'Blue Top', price: 'Rs. 500' },
  menTshirt: { id: 2, name: 'Men Tshirt', price: 'Rs. 400' },
} as const;

/** The site writes every price as `Rs. 500`, in the API and on the page. */
export const PRICE_FORMAT = /^Rs\. (\d+)$/;

/** Prices are compared as arithmetic so a failure reports the sum rather
 * than two strings. */
export function rupees(price: string): number {
  const amount = price.trim().match(PRICE_FORMAT)?.[1];
  if (amount === undefined) throw new Error(`Not a price: "${price}"`);
  return Number(amount);
}

const NON_EMPTY = expect.stringMatching(/\S/);

/** What a complete product looks like. The catalog and search endpoints
 * return the same shape, so both are checked against this. */
export const PRODUCT_SHAPE = {
  id: expect.any(Number),
  name: NON_EMPTY,
  price: expect.stringMatching(PRICE_FORMAT),
  brand: NON_EMPTY,
  category: {
    category: NON_EMPTY,
    usertype: { usertype: NON_EMPTY },
  },
};

/** A unique account per test. The site rejects a reused email, and a
 * logged-in account's cart lives on the server, so sharing one
 * would leak state between tests. */
export function newAccount(overrides: Partial<Account> = {}): Account {
  return {
    name: 'PTA Tester',
    email: uniqueEmail(),
    password: 'Passw0rd!pta',
    title: 'Mr',
    birthDate: '1',
    birthMonth: 'January',
    birthYear: '1990',
    firstName: 'Pta',
    lastName: 'Tester',
    company: 'Playwright Test Architecture',
    address1: '1 Test Street',
    address2: 'Flat 2',
    country: 'Canada',
    zipcode: 'M4B1B3',
    state: 'Ontario',
    city: 'Toronto',
    mobileNumber: '5550000000',
    ...overrides,
  };
}

/** Fake card details. The payment form accepts anything (see the criteria's
 * Out of scope), which is all the more reason never to use something that
 * looks real. */
export const TEST_CARD = {
  nameOnCard: 'PTA Tester',
  cardNumber: '4111111111111111',
  cvc: '123',
  expiryMonth: '12',
  expiryYear: '2030',
};

/** Logs in over HTTP and returns the session cookies. `verifyLogin` can't
 * do this — it confirms credentials but issues no session — so the
 * login form is posted directly, CSRF token and all. */
export async function loginCookies(credentials: { email: string; password: string }) {
  const session = await playwrightRequest.newContext({ baseURL: BASE_URL });
  try {
    const loginPage = await session.get('/login');
    const html = await loginPage.text();
    const csrf = html.match(/name="csrfmiddlewaretoken"\s+value="([^"]+)"/)?.[1];
    if (!csrf) throw new Error('No CSRF token on /login — has the form changed?');

    const response = await session.post('/login', {
      form: {
        csrfmiddlewaretoken: csrf,
        email: credentials.email,
        password: credentials.password,
      },
      headers: { Referer: `${BASE_URL}/login` },
    });

    // A successful login redirects to the home page; a failure re-renders
    // /login with the error. A session cookie alone would not tell them
    // apart if the site ever issued one to anonymous visitors.
    const landedOn = new URL(response.url()).pathname;
    if (landedOn !== '/') {
      throw new Error(
        `Login failed for ${credentials.email}: POST /login landed on ${landedOn} (HTTP ${response.status()})`,
      );
    }

    const { cookies } = await session.storageState();
    if (!cookies.some((cookie) => cookie.name === 'sessionid')) {
      throw new Error(`Login did not produce a session for ${credentials.email}`);
    }
    return cookies;
  } finally {
    await session.dispose();
  }
}

/** Best-effort cleanup. 404 means the account is already gone — a test may
 * have deleted it, or registration may have failed — and a cleanup problem
 * must never turn a passing behavior red. */
async function removeAccount(request: APIRequestContext, credentials: { email: string; password: string }) {
  try {
    const result = await deleteAccount(request, credentials);
    if (result.responseCode !== 200 && result.responseCode !== 404) {
      console.warn(`cleanup: ${credentials.email} not deleted (${result.responseCode})`);
    }
  } catch (error) {
    console.warn(`cleanup: ${credentials.email} failed — ${(error as Error).message}`);
  }
}

type Fixtures = {
  /** An account that already exists, deleted after the test. */
  account: Account;
  /** Account data that does NOT exist yet, for registration tests.
   * Whatever the test creates is deleted afterwards. */
  signupData: Account;
  /** A page already logged in as `account`, without touching the form. */
  loggedInPage: Page;
};

export const test = base.extend<Fixtures>({
  context: async ({ context }, use) => {
    await blockThirdParty(context);
    await use(context);
  },

  account: async ({ request }, use) => {
    const account = newAccount();
    const created = await createAccount(request, account);
    if (created.responseCode !== 201) {
      throw new Error(`Could not create ${account.email}: ${JSON.stringify(created)}`);
    }

    await use(account);

    await removeAccount(request, account);
  },

  signupData: async ({ request }, use) => {
    const account = newAccount();

    await use(account);

    await removeAccount(request, account);
  },

  loggedInPage: async ({ context, account }, use) => {
    await context.addCookies(await loginCookies(account));
    const page = await context.newPage();
    await use(page);
    await page.close();
  },
});

export { expect };
