import type { APIRequestContext } from '@playwright/test';
import type { ApiResult } from './types';

export async function verifyLogin(
  request: APIRequestContext,
  credentials: { email?: string; password?: string },
): Promise<ApiResult> {
  const response = await request.post('/api/verifyLogin', { form: credentials });
  return response.json();
}

export async function deleteVerifyLogin(request: APIRequestContext): Promise<ApiResult> {
  const response = await request.delete('/api/verifyLogin');
  return response.json();
}
