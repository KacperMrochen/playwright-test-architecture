import { test, expect, PRODUCTS } from '../../fixtures/test-data';
import { ProductsPage } from '../../pages/ProductsPage';
import { ProductDetailPage } from '../../pages/ProductDetailPage';

const { blueTop } = PRODUCTS;

test('AC-15.1 searches the catalog', { tag: '@regression' }, async ({ page }) => {
  const products = new ProductsPage(page);

  await products.goto();
  await products.search('top');

  await expect(products.title).toHaveText('Searched Products');
  await expect(page).toHaveURL('/products?search=top');
  await expect(products.products.first()).toBeVisible();

  await test.step('AC-15.2 products whose name matches are listed', async () => {
    // Asserted as "known matches appear", never "every result matches":
    // the site also matches on category (AC-15.2).
    await expect(products.productNames.filter({ hasText: blueTop.name })).toHaveCount(1);
    await expect(products.productNames.filter({ hasText: 'Winter Top' })).toHaveCount(1);
  });
});

test('AC-15.4 lists nothing when the search matches nothing', { tag: '@regression' }, async ({ page }) => {
  const products = new ProductsPage(page);

  await products.goto();
  await products.search('zzzznomatch');

  await expect(products.title).toHaveText('Searched Products');
  await expect(products.products).toHaveCount(0);
});

test('AC-16.1 browses by category', { tag: '@regression' }, async ({ page }) => {
  const products = new ProductsPage(page);

  await products.goto();

  await expect(products.categoryPanels).toHaveText(['Women', 'Men', 'Kids']);

  await test.step('AC-16.2 a category opens its filtered listing', async () => {
    const category = await products.openCategory('Women');

    await expect(page).toHaveURL(category.path);
    await expect(products.title).toHaveText(`Women - ${category.name} Products`);
    await expect(products.products.first()).toBeVisible();
  });
});

test('AC-17.1 browses by brand', { tag: '@regression' }, async ({ page }) => {
  const products = new ProductsPage(page);

  await products.goto();
  await expect(products.brandLinks.first()).toBeVisible();
  const brand = await products.openFirstBrand();

  await expect(page).toHaveURL(brand.path);
  await expect(products.title).toHaveText(`Brand - ${brand.name} Products`);
  await expect(products.products.first()).toBeVisible();
});

test('AC-18.1 shows a product\'s details', { tag: '@regression' }, async ({ page }) => {
  const detail = new ProductDetailPage(page);

  await detail.goto(blueTop.id);

  await expect(detail.name).toHaveText(blueTop.name);
  await expect(detail.detail('Category')).toContainText('Women > Tops');
  await expect(detail.price).toHaveText(blueTop.price);
  await expect(detail.detail('Availability')).toContainText('In Stock');
  await expect(detail.detail('Condition')).toContainText('New');
  await expect(detail.detail('Brand')).toContainText('Polo');
  await expect(detail.quantity).toHaveValue('1');
  await expect(detail.addToCartButton).toBeVisible();
});
