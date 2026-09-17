import type { APIRequestContext } from '@playwright/test';
import type { ApiResult, ProductsResult } from './types';

export async function searchProducts(
  request: APIRequestContext,
  term: string,
): Promise<ProductsResult> {
  const response = await request.post('/api/searchProduct', { form: { search_product: term } });
  return response.json();
}

export async function searchWithoutTerm(request: APIRequestContext): Promise<ApiResult> {
  const response = await request.post('/api/searchProduct');
  return response.json();
}

export async function getSearch(request: APIRequestContext): Promise<ApiResult> {
  const response = await request.get('/api/searchProduct');
  return response.json();
}
