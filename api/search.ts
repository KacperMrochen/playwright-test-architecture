import type { APIRequestContext } from '@playwright/test';
import type { ApiResult, ProductsResult } from './types';

export async function searchProducts(
  api: APIRequestContext,
  term: string,
): Promise<ProductsResult> {
  const response = await api.post('/api/searchProduct', { form: { search_product: term } });
  return response.json();
}

export async function searchWithoutTerm(api: APIRequestContext): Promise<ApiResult> {
  const response = await api.post('/api/searchProduct');
  return response.json();
}

export async function getSearch(api: APIRequestContext): Promise<ApiResult> {
  const response = await api.get('/api/searchProduct');
  return response.json();
}
