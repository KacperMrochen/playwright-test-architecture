import type { APIRequestContext } from '@playwright/test';
import type { ApiResult, ProductsResult } from './types';

export async function getProducts(api: APIRequestContext): Promise<ProductsResult> {
  const response = await api.get('/api/productsList');
  return response.json();
}

export async function postProducts(api: APIRequestContext): Promise<ApiResult> {
  const response = await api.post('/api/productsList');
  return response.json();
}
