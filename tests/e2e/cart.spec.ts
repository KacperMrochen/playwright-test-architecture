import { test, expect, blockThirdParty, loginCookies } from '../../fixtures/test-data';
import { ProductsPage } from '../../pages/ProductsPage';
import { ProductDetailPage } from '../../pages/ProductDetailPage';
import { CartPage } from '../../pages/CartPage';
import { HomePage } from '../../pages/HomePage';

const BLUE_TOP = 1;
const MEN_TSHIRT = 2;

test('AC-06.1 confirms an added product with a modal', { tag: '@regression' }, async ({ page }) => {
  const products = new ProductsPage(page);

  await products.goto();
  await products.addToCart(BLUE_TOP);

  await expect(products.cartModal).toContainText('Added!');
  await expect(products.cartModal).toContainText('Your product has been added to cart.');
  await expect(products.viewCartLink).toBeVisible();
  await expect(products.continueShoppingButton).toBeVisible();
});

test('AC-06.2 lists each product with price, quantity and total', { tag: '@regression' }, async ({ page }) => {
  const products = new ProductsPage(page);
  const cart = new CartPage(page);

  await products.goto();
  await products.addToCart(BLUE_TOP);
  await products.continueShopping();
  await products.addToCart(MEN_TSHIRT);
  await products.viewCart();

  await expect(cart.rows).toHaveCount(2);
  await expect(cart.row(BLUE_TOP).name).toHaveText('Blue Top');
  await expect(cart.row(BLUE_TOP).price).toHaveText('Rs. 500');
  await expect(cart.row(BLUE_TOP).quantity).toHaveText('1');
  await expect(cart.row(BLUE_TOP).total).toHaveText('Rs. 500');
});

test('AC-06.3 increments the quantity instead of adding a row', { tag: '@regression' }, async ({ page }) => {
  const products = new ProductsPage(page);
  const cart = new CartPage(page);

  await products.goto();
  await products.addToCart(MEN_TSHIRT);
  await products.continueShopping();
  await products.addToCart(MEN_TSHIRT);
  await products.viewCart();

  await expect(cart.rows).toHaveCount(1);
  await expect(cart.row(MEN_TSHIRT).quantity).toHaveText('2');
  await expect(cart.row(MEN_TSHIRT).total).toHaveText('Rs. 800');
});

test('AC-06.4 carries the quantity chosen on the detail page', { tag: '@regression' }, async ({ page }) => {
  const detail = new ProductDetailPage(page);
  const products = new ProductsPage(page);
  const cart = new CartPage(page);

  await detail.goto(BLUE_TOP);
  await detail.addToCart(4);
  await products.viewCart();

  await expect(cart.row(BLUE_TOP).quantity).toHaveText('4');
  await expect(cart.row(BLUE_TOP).total).toHaveText('Rs. 2000');
});

test('AC-06.5 uses the same add-to-cart control on every listing', { tag: '@regression' }, async ({ page }) => {
  const products = new ProductsPage(page);
  const home = new HomePage(page);
  const cart = new CartPage(page);

  await test.step('recommended items on the home page', async () => {
    await home.goto();
    const recommendedId = await products.firstProductId(home.recommendedItems);
    await products.addToCart(recommendedId, home.recommendedItems);
    await expect(products.cartModal).toContainText('Added!');
    await products.continueShopping();
  });

  const brandProductId = await test.step('a brand listing', async () => {
    await products.goto();
    await products.openFirstBrand();
    const id = await products.firstProductId();
    await products.addToCart(id);
    await expect(products.cartModal).toContainText('Added!');
    await products.continueShopping();
    return id;
  });

  await cart.goto();
  await expect(cart.row(brandProductId).root).toBeVisible();
});

test('AC-06.6 shows the cart quantity as a disabled control', { tag: '@regression' }, async ({ page }) => {
  const products = new ProductsPage(page);
  const cart = new CartPage(page);

  await products.goto();
  await products.addToCart(BLUE_TOP);
  await products.viewCart();

  await expect(cart.row(BLUE_TOP).quantity).toHaveClass(/disabled/);
});

test('AC-07.1 removes a row without navigating', { tag: '@regression' }, async ({ page }) => {
  const products = new ProductsPage(page);
  const cart = new CartPage(page);

  await products.goto();
  await products.addToCart(BLUE_TOP);
  await products.continueShopping();
  await products.addToCart(MEN_TSHIRT);
  await products.viewCart();
  const url = page.url();

  await cart.removeProduct(BLUE_TOP);

  await expect(cart.rows).toHaveCount(1);
  await expect(cart.row(MEN_TSHIRT).root).toBeVisible();
  expect(page.url()).toBe(url);
});

test('AC-07.2 shows the empty-cart message', { tag: '@regression' }, async ({ page }) => {
  const cart = new CartPage(page);

  await cart.goto();

  await expect(cart.emptyMessage).toContainText('Cart is empty!');
});

test('AC-08.1 shows the cart in another browser session', { tag: '@regression' }, async ({ browser, loggedInPage, account }) => {
  const products = new ProductsPage(loggedInPage);
  await products.goto();
  await products.addToCart(MEN_TSHIRT);
  await products.viewCart();
  await expect(new CartPage(loggedInPage).row(MEN_TSHIRT).root).toBeVisible();

  const second = await browser.newContext();
  await blockThirdParty(second);
  await second.addCookies(await loginCookies(account));
  const secondPage = await second.newPage();

  const cartElsewhere = new CartPage(secondPage);
  await cartElsewhere.goto();

  await expect(cartElsewhere.row(MEN_TSHIRT).root).toBeVisible();
  await expect(cartElsewhere.row(MEN_TSHIRT).quantity).toHaveText('1');

  await second.close();
});
