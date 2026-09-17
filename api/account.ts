import type { APIRequestContext } from '@playwright/test';
import type { Account } from '../fixtures/test-data';
import type { ApiResult, UserDetailsResult } from './types';

/** Translates an account into the field names the site's API accepts,
 * which differ from the names it reads back (`firstname` returns as
 * `first_name`). Unset fields are omitted, so a caller can submit a
 * deliberately incomplete account. */
function accountForm(account: Partial<Account>): Record<string, string> {
  const fields = {
    name: account.name,
    email: account.email,
    password: account.password,
    title: account.title,
    birth_date: account.birthDate,
    birth_month: account.birthMonth,
    birth_year: account.birthYear,
    firstname: account.firstName,
    lastname: account.lastName,
    company: account.company,
    address1: account.address1,
    address2: account.address2,
    country: account.country,
    zipcode: account.zipcode,
    state: account.state,
    city: account.city,
    mobile_number: account.mobileNumber,
  };
  const form: Record<string, string> = {};
  for (const [field, value] of Object.entries(fields)) {
    if (value !== undefined) form[field] = value;
  }
  return form;
}

export async function createAccount(
  request: APIRequestContext,
  account: Partial<Account>,
): Promise<ApiResult> {
  const response = await request.post('/api/createAccount', { form: accountForm(account) });
  return response.json();
}

export async function updateAccount(request: APIRequestContext, account: Account): Promise<ApiResult> {
  const response = await request.put('/api/updateAccount', { form: accountForm(account) });
  return response.json();
}

export async function deleteAccount(
  request: APIRequestContext,
  credentials: { email: string; password: string },
): Promise<ApiResult> {
  const response = await request.delete('/api/deleteAccount', { form: credentials });
  return response.json();
}

export async function getUserDetails(
  request: APIRequestContext,
  email: string,
): Promise<UserDetailsResult> {
  const response = await request.get('/api/getUserDetailByEmail', { params: { email } });
  return response.json();
}
