import { test, expect, NEVER_REGISTERED_EMAIL } from '../../fixtures/test-data';
import { deleteVerifyLogin, verifyLogin } from '../../api/auth';

test('AC-03.3 confirms valid credentials', { tag: '@smoke' }, async ({ request, account }) => {
  const body = await verifyLogin(request, { email: account.email, password: account.password });

  expect(body.responseCode).toBe(200);
  expect(body.message).toBe('User exists!');
});

test('AC-04.3 rejects a wrong password', { tag: '@regression' }, async ({ request, account }) => {
  const body = await verifyLogin(request, { email: account.email, password: 'not-the-password' });

  expect(body.responseCode).toBe(404);
  expect(body.message).toBe('User not found!');
});

test('AC-04.4 rejects an unknown email', { tag: '@regression' }, async ({ request }) => {
  const body = await verifyLogin(request, {
    email: NEVER_REGISTERED_EMAIL,
    password: 'not-the-password',
  });

  // The endpoint doesn't reveal whether the account exists.
  expect(body.responseCode).toBe(404);
  expect(body.message).toBe('User not found!');
});

test('AC-14.3 reports 400 when a credential is missing', { tag: '@regression' }, async ({ request }) => {
  const body = await verifyLogin(request, { password: 'not-the-password' });

  expect(body.responseCode).toBe(400);
  expect(body.message).toBe(
    'Bad request, email or password parameter is missing in POST request.',
  );
});

test('AC-14.2 reports 405 for DELETE on login', { tag: '@regression' }, async ({ request }) => {
  const body = await deleteVerifyLogin(request);

  expect(body.responseCode).toBe(405);
  expect(body.message).toBe('This request method is not supported.');
});
