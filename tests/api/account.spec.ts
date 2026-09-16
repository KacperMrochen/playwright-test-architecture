import { test, expect, newAccount } from '../../fixtures/test-data';
import {
  createAccount,
  createAccountWith,
  deleteAccount,
  getUserDetails,
  updateAccount,
} from '../../api/account';
import { verifyLogin } from '../../api/auth';

test('AC-01.4 creates an account', { tag: '@smoke' }, async ({ api, signupData }) => {
  const body = await createAccount(api, signupData);

  expect(body.responseCode).toBe(201);
  expect(body.message).toBe('User created!');
});

test('AC-01.5 reads the account details back', { tag: '@regression' }, async ({ api, account }) => {
  const body = await getUserDetails(api, account.email);

  expect(body.responseCode).toBe(200);
  // The response renames several fields it was given.
  expect(body.user).toMatchObject({
    name: account.name,
    email: account.email,
    title: account.title,
    birth_day: account.birthDate,
    birth_month: account.birthMonth,
    birth_year: account.birthYear,
    first_name: account.firstName,
    last_name: account.lastName,
    company: account.company,
    address1: account.address1,
    country: account.country,
    state: account.state,
    city: account.city,
    zipcode: account.zipcode,
  });
});

test('AC-01.6 reports 404 for an unknown email', { tag: '@regression' }, async ({ api }) => {
  const body = await getUserDetails(api, 'pta-never-registered@example.com');

  expect(body.responseCode).toBe(404);
  expect(body.message).toBe('Account not found with this email, try another email!');
});

test('AC-02.2 rejects an email already in use', { tag: '@regression' }, async ({ api, account }) => {
  const duplicate = newAccount({ email: account.email });

  const body = await createAccount(api, duplicate);

  expect(body.responseCode).toBe(400);
  expect(body.message).toBe('Email already exists!');
});

test('AC-14.4 reports 400 when a field is missing', { tag: '@regression' }, async ({ api }) => {
  const body = await createAccountWith(api, { email: 'pta-incomplete@example.com' });

  expect(body.responseCode).toBe(400);
  expect(body.message).toBe('Bad request, name parameter is missing in POST request.');
});

test('AC-13.1 deletes an account and its sessions', { tag: '@regression' }, async ({ api, signupData }) => {
  const created = await createAccount(api, signupData);
  expect(created.responseCode).toBe(201);

  const deleted = await deleteAccount(api, {
    email: signupData.email,
    password: signupData.password,
  });

  expect(deleted.responseCode).toBe(200);
  expect(deleted.message).toBe('Account deleted!');

  const afterDelete = await verifyLogin(api, {
    email: signupData.email,
    password: signupData.password,
  });
  expect(afterDelete.responseCode).toBe(404);
});

test('AC-13.2 reports 404 when deleting an unknown account', { tag: '@regression' }, async ({ api }) => {
  const body = await deleteAccount(api, {
    email: 'pta-never-registered@example.com',
    password: 'whatever',
  });

  expect(body.responseCode).toBe(404);
  expect(body.message).toBe('Account not found!');
});

test('AC-13.3 refuses a wrong password and keeps the account', { tag: '@regression' }, async ({ api, account }) => {
  const body = await deleteAccount(api, { email: account.email, password: 'not-the-password' });

  // Reported as "not found", which is why cleanup can't read 404 as proof
  // the account is gone.
  expect(body.responseCode).toBe(404);
  expect(body.message).toBe('Account not found!');

  const stillThere = await verifyLogin(api, {
    email: account.email,
    password: account.password,
  });
  expect(stillThere.responseCode).toBe(200);
});

test('AC-22.1 updates the stored details', { tag: '@regression' }, async ({ api, account }) => {
  const changed = { ...account, firstName: 'Updated', city: 'Vancouver', company: 'New Company' };

  const body = await updateAccount(api, changed);

  expect(body.responseCode).toBe(200);
  expect(body.message).toBe('User updated!');

  const details = await getUserDetails(api, account.email);
  expect(details.user).toMatchObject({
    first_name: 'Updated',
    city: 'Vancouver',
    company: 'New Company',
  });
});

test('AC-22.2 reports 404 when updating an unknown account', { tag: '@regression' }, async ({ api }) => {
  const body = await updateAccount(api, newAccount({ email: 'pta-never-registered@example.com' }));

  expect(body.responseCode).toBe(404);
  expect(body.message).toBe('Account not found!');
});

test('AC-22.3 refuses a wrong password and changes nothing', { tag: '@regression' }, async ({ api, account }) => {
  const body = await updateAccount(api, {
    ...account,
    password: 'not-the-password',
    city: 'Nowhere',
  });

  expect(body.responseCode).toBe(404);
  expect(body.message).toBe('Account not found!');

  const details = await getUserDetails(api, account.email);
  expect(details.user.city).toBe(account.city);
});
