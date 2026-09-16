import type { APIRequestContext } from '@playwright/test';
import type { Account } from '../fixtures/test-data';
import type { ApiResult, UserDetailsResult } from './types';

/** The site's account form field names. They differ from the names
 * `getUserDetailByEmail` reads back (`firstname` → `first_name`), which is
 * what AC-01.5 pins down. */
function accountForm(account: Account): Record<string, string> {
  return {
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
}

export async function createAccount(api: APIRequestContext, account: Account): Promise<ApiResult> {
  const response = await api.post('/api/createAccount', { form: accountForm(account) });
  return response.json();
}

export async function createAccountWith(
  api: APIRequestContext,
  form: Record<string, string>,
): Promise<ApiResult> {
  const response = await api.post('/api/createAccount', { form });
  return response.json();
}

export async function updateAccount(api: APIRequestContext, account: Account): Promise<ApiResult> {
  const response = await api.put('/api/updateAccount', { form: accountForm(account) });
  return response.json();
}

export async function deleteAccount(
  api: APIRequestContext,
  credentials: { email: string; password: string },
): Promise<ApiResult> {
  const response = await api.delete('/api/deleteAccount', { form: credentials });
  return response.json();
}

export async function getUserDetails(
  api: APIRequestContext,
  email: string,
): Promise<UserDetailsResult> {
  const response = await api.get('/api/getUserDetailByEmail', { params: { email } });
  return response.json();
}
