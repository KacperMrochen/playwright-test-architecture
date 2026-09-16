import type { APIRequestContext } from '@playwright/test';
import type { ApiResult } from './types';

export async function verifyLogin(
  api: APIRequestContext,
  credentials: { email?: string; password?: string },
): Promise<ApiResult> {
  const response = await api.post('/api/verifyLogin', { form: credentials });
  return response.json();
}

export async function verifyLoginWithMethod(
  api: APIRequestContext,
  method: 'get' | 'delete',
): Promise<ApiResult> {
  const response = await api[method]('/api/verifyLogin');
  return response.json();
}
