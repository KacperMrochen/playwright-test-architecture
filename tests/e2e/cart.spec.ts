import { test, expect, blockThirdParty, loginCookies, PRODUCTS, rupees } from '../../fixtures/test-data';
import { ProductsPage } from '../../pages/ProductsPage';
import { ProductDetailPage } from '../../pages/ProductDetailPage';
import { CartPage } from '../../pages/CartPage';
import { HomePage } from '../../pages/HomePage';

const { blueTop, menTshirt } = PRODUCTS;

test('AC-06.1 confirms an added product with a modal', { tag: '@regression' }, async ({ page }) => {
  const products = new ProductsPage(page);

  await products.goto();
  await products.addToCart(blueTop.id);

  await expect(products.cartModal).toContainText('Added!');
  await expect(products.cartModal).toContainText('Your product has been added to cart.');
  await expect(products.viewCartLink).toBeVisible();
  await expect(products.continueShoppingButton).toBeVisible();
});

test('AC-06.2 lists each product with price, quantity and total', { tag: '@regression' }, async ({ page }) => {
  const products = new ProductsPage(page);
  const cart = new CartPage(page);

  await products.goto();
  await products.addToCart(blueTop.id);
  await products.continueShopping();
  await products.addToCart(menTshirt.id);
  await products.viewCart();

  await expect(cart.rows).toHaveCount(2);
  for (const product of [blueTop, menTshirt]) {
    const row = cart.row(product.id);
    await expect(row.name).toHaveText(product.name);
    await expect(row.price).toHaveText(product.price);
    await expect(row.quantity).toHaveText('1');
    await expect(row.total).toHaveText(product.price);
  }
});

test('AC-06.3 increments the quantity instead of adding a row', { tag: '@regression' }, async ({ page }) => {
  const products = new ProductsPage(page);
  const cart = new CartPage(page);

  await products.goto();
  await products.addToCart(menTshirt.id);
  await products.continueShopping();
  await products.addToCart(menTshirt.id);
  await products.viewCart();

  await expect(cart.rows).toHaveCount(1);
  await expect(cart.row(menTshirt.id).quantity).toHaveText('2');
  await expect(cart.row(menTshirt.id).total).toHaveText(`Rs. ${rupees(menTshirt.price) * 2}`);
});

test('AC-06.4 carries the quantity chosen on the detail page', { tag: '@regression' }, async ({ page }) => {
  const detail = new ProductDetailPage(page);
  const products = new ProductsPage(page);
  const cart = new CartPage(page);

  await detail.goto(blueTop.id);
  await detail.addToCart(4);
  await products.viewCart();

  await expect(cart.row(blueTop.id).quantity).toHaveText('4');
  await expect(cart.row(blueTop.id).total).toHaveText(`Rs. ${rupees(blueTop.price) * 4}`);
});

test('AC-06.5 uses the same add-to-cart control on every listing', { tag: '@regression' }, async ({ page }) => {
  const products = new ProductsPage(page);
  const home = new HomePage(page);
  const cart = new CartPage(page);

  const recommendedId = await test.step('recommended items on the home page', async () => {
    await home.goto();
    const id = await products.firstProductId(home.recommendedItems);
    await products.addToCart(id, home.recommendedItems);
    await expect(products.cartModal).toContainText('Added!');
    await products.continueShopping();
    return id;
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
  await expect(cart.row(recommendedId).root).toBeVisible();
  await expect(cart.row(brandProductId).root).toBeVisible();
});

test('AC-06.6 shows the cart quantity as a disabled control', { tag: '@regression' }, async ({ page }) => {
  const products = new ProductsPage(page);
  const cart = new CartPage(page);

  await products.goto();
  await products.addToCart(blueTop.id);
  await products.viewCart();

  await expect(cart.row(blueTop.id).quantity).toContainClass('disabled');
});

test('AC-07.1 removes a row without navigating', { tag: '@regression' }, async ({ page }) => {
  const products = new ProductsPage(page);
  const cart = new CartPage(page);

  await products.goto();
  await products.addToCart(blueTop.id);
  await products.continueShopping();
  await products.addToCart(menTshirt.id);
  await products.viewCart();
  const url = page.url();

  await cart.removeProduct(blueTop.id);

  await expect(cart.rows).toHaveCount(1);
  await expect(cart.row(menTshirt.id).root).toBeVisible();
  await expect(page).toHaveURL(url);
});

test('AC-07.2 shows the empty-cart message', { tag: '@regression' }, async ({ page }) => {
  const cart = new CartPage(page);

  await cart.goto();

  await expect(cart.emptyMessage).toContainText('Cart is empty!');
});

test('AC-08.1 shows the cart in another browser session', { tag: '@regression' }, async ({ browser, loggedInPage, account }) => {
  const products = new ProductsPage(loggedInPage);
  await products.goto();
  await products.addToCart(menTshirt.id);
  await products.viewCart();
  await expect(new CartPage(loggedInPage).row(menTshirt.id).root).toBeVisible();

  await using second = await browser.newContext();
  await blockThirdParty(second);
  await second.addCookies(await loginCookies(account));
  const secondPage = await second.newPage();

  const cartElsewhere = new CartPage(secondPage);
  await cartElsewhere.goto();

  await expect(cartElsewhere.row(menTshirt.id).root).toBeVisible();
  await expect(cartElsewhere.row(menTshirt.id).quantity).toHaveText('1');
});
