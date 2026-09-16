import { test, expect } from '../../fixtures/test-data';
import { getBrands, putBrands } from '../../api/brands';

test('AC-17.2 returns the brand list', { tag: '@regression' }, async ({ api }) => {
  const body = await getBrands(api);

  expect(body.responseCode).toBe(200);
  expect(body.brands.length).toBeGreaterThan(0);

  for (const brand of body.brands) {
    expect(typeof brand.id).toBe('number');
    expect(brand.brand).toBeTruthy();
  }
  // Names repeat across ids, so uniqueness is deliberately not asserted.
});

test('AC-14.5 reports 405 for PUT on the brand list', { tag: '@regression' }, async ({ api }) => {
  const body = await putBrands(api);

  expect(body.responseCode).toBe(405);
  expect(body.message).toBe('This request method is not supported.');
});
