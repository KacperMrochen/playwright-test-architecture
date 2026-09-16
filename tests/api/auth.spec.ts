import { test, expect } from '../../fixtures/test-data';
import { verifyLogin, verifyLoginWithMethod } from '../../api/auth';

test('AC-03.3 confirms valid credentials', { tag: '@smoke' }, async ({ api, account }) => {
  const body = await verifyLogin(api, { email: account.email, password: account.password });

  expect(body.responseCode).toBe(200);
  expect(body.message).toBe('User exists!');
});

test('AC-04.3 rejects a wrong password', { tag: '@regression' }, async ({ api, account }) => {
  const body = await verifyLogin(api, { email: account.email, password: 'not-the-password' });

  expect(body.responseCode).toBe(404);
  expect(body.message).toBe('User not found!');
});

test('AC-04.4 answers identically for an unknown email', { tag: '@regression' }, async ({ api }) => {
  const body = await verifyLogin(api, {
    email: 'pta-never-registered@example.com',
    password: 'not-the-password',
  });

  // Same code and message as AC-04.3: the endpoint doesn't reveal whether
  // the account exists.
  expect(body.responseCode).toBe(404);
  expect(body.message).toBe('User not found!');
});

test('AC-14.3 reports 400 when a credential is missing', { tag: '@regression' }, async ({ api }) => {
  const body = await verifyLogin(api, { password: 'not-the-password' });

  expect(body.responseCode).toBe(400);
  expect(body.message).toBe(
    'Bad request, email or password parameter is missing in POST request.',
  );
});

test('AC-14.2 reports 405 for DELETE on login', { tag: '@regression' }, async ({ api }) => {
  const body = await verifyLoginWithMethod(api, 'delete');

  expect(body.responseCode).toBe(405);
  expect(body.message).toBe('This request method is not supported.');
});
