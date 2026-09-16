import { test, expect, PRODUCT_SHAPE } from '../../fixtures/test-data';
import { getProducts, postProducts } from '../../api/products';

test('AC-12.1 returns the catalog with complete products', { tag: '@smoke' }, async ({ request }) => {
  const body = await getProducts(request);

  expect(body.responseCode).toBe(200);
  expect(body.products.length).toBeGreaterThan(0);

  // Soft, so one run names every malformed product in a 300-item catalog
  // instead of stopping at the first.
  for (const product of body.products) {
    expect.soft(product, `product ${product.id}`).toMatchObject(PRODUCT_SHAPE);
  }
});

test('AC-14.1 reports 405 for POST on the catalog', { tag: '@regression' }, async ({ request }) => {
  const body = await postProducts(request);

  expect(body.responseCode).toBe(405);
  expect(body.message).toBe('This request method is not supported.');
});
