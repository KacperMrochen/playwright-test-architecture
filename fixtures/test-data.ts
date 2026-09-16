import {
  test as base,
  request,
  type APIRequestContext,
  type BrowserContext,
  type Page,
} from '@playwright/test';
import { createAccount, deleteAccount } from '../api/account';

export const BASE_URL = 'https://automationexercise.com';

/** Hosts a browser context may reach. Everything else is aborted — see
 * docs/adr/0001-third-party-network-isolation.md. The font CDN stays so
 * pages render as a real visitor sees them. */
const ALLOWED_HOSTS = [
  'automationexercise.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

/** Blocks every host but the site and its font CDN. Applied to the default
 * context by the fixture below, and called directly by tests that open a
 * second context (AC-05.2, AC-08.1). */
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

/** A unique account per test. The site rejects a reused email, and a
 * logged-in account's cart lives on the server (FR-08), so sharing one
 * would leak state between tests. The `pta-` prefix marks ours if a run is
 * interrupted before teardown. */
export function newAccount(overrides: Partial<Account> = {}): Account {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    name: 'PTA Tester',
    email: `pta-${unique}@example.com`,
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
 * do this — it confirms credentials and issues nothing (AC-03.3) — so the
 * login form is posted directly, CSRF token and all. */
export async function loginCookies(credentials: { email: string; password: string }) {
  const api = await request.newContext({ baseURL: BASE_URL });
  try {
    const loginPage = await api.get('/login');
    const html = await loginPage.text();
    const csrf = html.match(/name="csrfmiddlewaretoken"\s+value="([^"]+)"/)?.[1];
    if (!csrf) throw new Error('No CSRF token on /login — has the form changed?');

    await api.post('/login', {
      form: {
        csrfmiddlewaretoken: csrf,
        email: credentials.email,
        password: credentials.password,
      },
      headers: { Referer: `${BASE_URL}/login` },
    });

    const { cookies } = await api.storageState();
    if (!cookies.some((cookie) => cookie.name === 'sessionid')) {
      throw new Error(`Login did not produce a session for ${credentials.email}`);
    }
    return cookies;
  } finally {
    await api.dispose();
  }
}

/** Best-effort cleanup. 404 means the account is already gone — a test may
 * have deleted it, or registration may have failed — and a cleanup problem
 * must never turn a passing behavior red. */
async function removeAccount(api: APIRequestContext, credentials: { email: string; password: string }) {
  try {
    const result = await deleteAccount(api, credentials);
    if (result.responseCode !== 200 && result.responseCode !== 404) {
      console.warn(`cleanup: ${credentials.email} not deleted (${result.responseCode})`);
    }
  } catch (error) {
    console.warn(`cleanup: ${credentials.email} failed — ${(error as Error).message}`);
  }
}

type Fixtures = {
  /** Request context against the site, for API calls and setup. */
  api: APIRequestContext;
  /** An account that already exists, deleted after the test. */
  account: Account;
  /** Account data that does NOT exist yet, for registration tests.
   * Whatever the test creates is deleted afterwards. */
  signupData: Account;
  /** A page already logged in as `account`, without touching the form. */
  loggedInPage: Page;
};

export const test = base.extend<Fixtures>({
  // Third-party blocking, applied once for every browser-based test.
  context: async ({ context }, use) => {
    await blockThirdParty(context);
    await use(context);
  },

  api: async ({ playwright }, use) => {
    const api = await playwright.request.newContext({ baseURL: BASE_URL });
    await use(api);
    await api.dispose();
  },

  account: async ({ api }, use) => {
    const account = newAccount();
    const created = await createAccount(api, account);
    if (created.responseCode !== 201) {
      throw new Error(`Could not create ${account.email}: ${JSON.stringify(created)}`);
    }

    await use(account);

    await removeAccount(api, account);
  },

  signupData: async ({ api }, use) => {
    const account = newAccount();

    await use(account);

    await removeAccount(api, account);
  },

  loggedInPage: async ({ context, account }, use) => {
    await context.addCookies(await loginCookies(account));
    const page = await context.newPage();
    await use(page);
    await page.close();
  },
});

export { expect } from '@playwright/test';
