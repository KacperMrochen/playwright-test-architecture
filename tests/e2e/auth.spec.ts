import {
  test,
  expect,
  blockThirdParty,
  loginCookies,
  NEVER_REGISTERED_EMAIL,
} from '../../fixtures/test-data';
import { LoginPage } from '../../pages/LoginPage';
import { SignupPage } from '../../pages/SignupPage';
import { Header } from '../../pages/Header';

const WRONG_CREDENTIALS = 'Your email or password is incorrect!';

test('AC-03.1 logs in and out', { tag: '@smoke' }, async ({ page, account }) => {
  const login = new LoginPage(page);
  const header = new Header(page);

  await login.goto();
  await login.login(account);

  // The fixture created this account through POST /api/createAccount, so
  // the same sign-in proves AC-03.2 as well.
  await test.step('AC-03.2 an API-created account logs in through the form', async () => {
    await expect(header.loggedInAs).toHaveText(`Logged in as ${account.name}`);
  });

  await expect(header.logout).toBeVisible();
  await expect(header.deleteAccount).toBeVisible();

  await test.step('AC-05.1 logging out restores the signed-out navigation', async () => {
    await header.clickLogout();

    await expect(header.loggedInAs).toBeHidden();
    await expect(header.signupLogin).toBeVisible();
  });
});

test('AC-04.1 rejects a wrong password', { tag: '@regression' }, async ({ page, account }) => {
  const login = new LoginPage(page);

  await login.goto();
  await login.login({ email: account.email, password: 'not-the-password' });

  await expect(login.loginError).toHaveText(WRONG_CREDENTIALS);
  await expect(new Header(page).loggedInAs).toBeHidden();
});

test('AC-04.2 answers identically for an unknown email', { tag: '@regression' }, async ({ page }) => {
  const login = new LoginPage(page);

  await login.goto();
  await login.login({ email: NEVER_REGISTERED_EMAIL, password: 'not-the-password' });

  // Same wording as AC-04.1 — the page doesn't reveal whether the account
  // exists.
  await expect(login.loginError).toHaveText(WRONG_CREDENTIALS);
});

test('AC-02.1 rejects signup with an email already in use', { tag: '@regression' }, async ({ page, account }) => {
  const login = new LoginPage(page);
  const signup = new SignupPage(page);

  await login.goto();
  await login.startSignup({ name: 'Someone Else', email: account.email });

  await expect(login.signupError).toHaveText('Email Address already exist!');
  await expect(signup.createAccountButton).toHaveCount(0);
});

test('AC-05.2 logging out leaves another session alone', { tag: '@regression' }, async ({ browser, page, account }) => {
  const header = new Header(page);
  const login = new LoginPage(page);
  await login.goto();
  await login.login(account);
  await expect(header.loggedInAs).toBeVisible();

  await using second = await browser.newContext();
  await blockThirdParty(second);
  await second.addCookies(await loginCookies(account));
  const secondPage = await second.newPage();

  await header.clickLogout();
  await expect(header.loggedInAs).toBeHidden();

  await secondPage.goto('/');
  await expect(new Header(secondPage).loggedInAs).toHaveText(`Logged in as ${account.name}`);
});
