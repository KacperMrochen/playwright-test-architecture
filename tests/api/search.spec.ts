import { test, expect } from '../../fixtures/test-data';
import { getSearch, searchProducts, searchWithoutTerm } from '../../api/search';

test('AC-15.3 returns products matching the term', { tag: '@regression' }, async ({ api }) => {
  const body = await searchProducts(api, 'tshirt');

  expect(body.responseCode).toBe(200);
  expect(body.products.length).toBeGreaterThan(0);
  // The site matches more than the name (AC-15.2), so this asserts the
  // shape and that a known match is present — not that every result matches.
  expect(body.products.some((product) => /tshirt/i.test(product.name))).toBe(true);
  expect(body.products[0]).toMatchObject({
    id: expect.any(Number),
    name: expect.any(String),
    price: expect.any(String),
  });
});

test('AC-15.5 returns an empty array when nothing matches', { tag: '@regression' }, async ({ api }) => {
  const body = await searchProducts(api, 'zzzznomatch');

  expect(body.responseCode).toBe(200);
  expect(body.products).toEqual([]);
});

test('AC-14.6 reports 400 when the search term is missing', { tag: '@regression' }, async ({ api }) => {
  const body = await searchWithoutTerm(api);

  expect(body.responseCode).toBe(400);
  expect(body.message).toBe('Bad request, search_product parameter is missing in POST request.');
});

test('AC-14.7 reports 405 for GET on search', { tag: '@regression' }, async ({ api }) => {
  const body = await getSearch(api);

  expect(body.responseCode).toBe(405);
  expect(body.message).toBe('This request method is not supported.');
});
