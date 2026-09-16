import { test, expect } from '../../fixtures/test-data';
import { getProducts, postProducts } from '../../api/products';

test('AC-12.1 returns the catalog with complete products', { tag: '@smoke' }, async ({ api }) => {
  const body = await getProducts(api);

  expect(body.responseCode).toBe(200);
  expect(body.products.length).toBeGreaterThan(0);

  for (const product of body.products) {
    expect(typeof product.id, `product ${product.name}`).toBe('number');
    expect(product.name).toBeTruthy();
    expect(product.price).toMatch(/^Rs\. \d+$/);
    expect(product.brand).toBeTruthy();
    expect(product.category.category).toBeTruthy();
    expect(product.category.usertype.usertype).toBeTruthy();
  }
});

test('AC-14.1 reports 405 for POST on the catalog', { tag: '@regression' }, async ({ api }) => {
  const body = await postProducts(api);

  expect(body.responseCode).toBe(405);
  expect(body.message).toBe('This request method is not supported.');
});
