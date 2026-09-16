import { test, expect, PRODUCTS, PRODUCT_SHAPE } from '../../fixtures/test-data';
import { getSearch, searchProducts, searchWithoutTerm } from '../../api/search';

test('AC-15.3 returns products matching the term', { tag: '@regression' }, async ({ request }) => {
  const body = await searchProducts(request, 'tshirt');

  expect(body.responseCode).toBe(200);
  // The site matches on more than the name (AC-15.2), so a known product is
  // asserted to be present rather than every result asserted to match.
  expect(body.products.map((product) => product.name)).toContain(PRODUCTS.menTshirt.name);

  // AC-15.3 pins search results to AC-12.1's shape, not a looser one.
  for (const product of body.products) {
    expect.soft(product, `product ${product.id}`).toMatchObject(PRODUCT_SHAPE);
  }
});

test('AC-15.5 returns an empty array when nothing matches', { tag: '@regression' }, async ({ request }) => {
  const body = await searchProducts(request, 'zzzznomatch');

  expect(body.responseCode).toBe(200);
  expect(body.products).toEqual([]);
});

test('AC-14.6 reports 400 when the search term is missing', { tag: '@regression' }, async ({ request }) => {
  const body = await searchWithoutTerm(request);

  expect(body.responseCode).toBe(400);
  expect(body.message).toBe('Bad request, search_product parameter is missing in POST request.');
});

test('AC-14.7 reports 405 for GET on search', { tag: '@regression' }, async ({ request }) => {
  const body = await getSearch(request);

  expect(body.responseCode).toBe(405);
  expect(body.message).toBe('This request method is not supported.');
});
