import { test, expect } from '../../fixtures/test-data';
import { getBrands, putBrands } from '../../api/brands';

test('AC-17.2 returns the brand list', { tag: '@regression' }, async ({ request }) => {
  const body = await getBrands(request);

  expect(body.responseCode).toBe(200);
  expect(body.brands.length).toBeGreaterThan(0);

  for (const brand of body.brands) {
    expect.soft(brand, `brand ${brand.id}`).toMatchObject({
      id: expect.any(Number),
      brand: expect.stringMatching(/\S/),
    });
  }
  // Names repeat across ids, so uniqueness is deliberately not asserted.
});

test('AC-14.5 reports 405 for PUT on the brand list', { tag: '@regression' }, async ({ request }) => {
  const body = await putBrands(request);

  expect(body.responseCode).toBe(405);
  expect(body.message).toBe('This request method is not supported.');
});
