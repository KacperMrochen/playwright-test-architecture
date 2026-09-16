import type { APIRequestContext } from '@playwright/test';
import type { ApiResult, BrandsResult } from './types';

export async function getBrands(api: APIRequestContext): Promise<BrandsResult> {
  const response = await api.get('/api/brandsList');
  return response.json();
}

export async function putBrands(api: APIRequestContext): Promise<ApiResult> {
  const response = await api.put('/api/brandsList');
  return response.json();
}
