import type { APIRequestContext } from '@playwright/test';
import type { ApiResult, BrandsResult } from './types';

export async function getBrands(request: APIRequestContext): Promise<BrandsResult> {
  const response = await request.get('/api/brandsList');
  return response.json();
}

export async function putBrands(request: APIRequestContext): Promise<ApiResult> {
  const response = await request.put('/api/brandsList');
  return response.json();
}
