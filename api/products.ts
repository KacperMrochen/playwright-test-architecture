import type { APIRequestContext } from '@playwright/test';
import type { ApiResult, ProductsResult } from './types';

export async function getProducts(request: APIRequestContext): Promise<ProductsResult> {
  const response = await request.get('/api/productsList');
  return response.json();
}

export async function postProducts(request: APIRequestContext): Promise<ApiResult> {
  const response = await request.post('/api/productsList');
  return response.json();
}
