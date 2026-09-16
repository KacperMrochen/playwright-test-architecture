import { text } from 'node:stream/consumers';
import type { Page } from '@playwright/test';
import { test, expect, PRODUCTS, rupees } from '../../fixtures/test-data';
import { ProductsPage } from '../../pages/ProductsPage';
import { CartPage } from '../../pages/CartPage';
import { LoginPage } from '../../pages/LoginPage';
import { SignupPage } from '../../pages/SignupPage';
import { CheckoutPage } from '../../pages/CheckoutPage';
import { Header } from '../../pages/Header';

const { blueTop, menTshirt } = PRODUCTS;

/** The journey through the cart is AC-06/AC-09's subject, not these tests'
 * — they start where checkout does. */
async function checkoutWithOneProduct(page: Page, productId: number): Promise<CheckoutPage> {
  const products = new ProductsPage(page);
  await products.goto();
  await products.addToCart(productId);
  await products.viewCart();
  await new CartPage(page).checkout();
  await page.waitForURL('**/checkout');
  return new CheckoutPage(page);
}

/** The suite's widest journey: a logged-out visitor fills a cart, is asked
 * to register at checkout, registers, and pays. Each criterion is a step,
 * so a failure names the behavior that broke. */
test('registers and places an order', { tag: '@smoke' }, async ({ page, signupData }) => {
  const products = new ProductsPage(page);
  const cart = new CartPage(page);
  const login = new LoginPage(page);
  const signup = new SignupPage(page);
  const checkout = new CheckoutPage(page);
  const header = new Header(page);

  await test.step('a logged-out visitor fills a cart', async () => {
    await products.goto();
    await products.addToCart(blueTop.id);
    await products.continueShopping();
    await products.addToCart(menTshirt.id);
    await products.viewCart();
    await expect(cart.rows).toHaveCount(2);
  });

  await test.step('AC-09.1 checkout asks them to register or log in', async () => {
    await cart.checkout();

    await expect(cart.checkoutModal).toContainText('Register / Login account to proceed on checkout.');
    await expect(cart.registerLoginLink).toBeVisible();
    await expect(page).toHaveURL('/view_cart');
  });

  await test.step('AC-01.1 the signup form carries name and email over', async () => {
    await cart.registerLoginLink.click();
    await page.waitForURL('**/login');
    await login.startSignup({ name: signupData.name, email: signupData.email });

    await page.waitForURL('**/signup');
    await expect(page.getByText('Enter Account Information')).toBeVisible();
    await expect(signup.name).toHaveValue(signupData.name);
    await expect(signup.email).toHaveValue(signupData.email);
    await expect(signup.email).toBeDisabled();
  });

  await test.step('AC-01.2 the account is created', async () => {
    await signup.fillAccountInformation(signupData);
    await signup.submit();

    await expect(signup.accountCreated).toHaveText('Account Created!');
  });

  await test.step('AC-01.3 continuing lands logged in', async () => {
    await signup.continueToHome();

    await expect(header.loggedInAs).toHaveText(`Logged in as ${signupData.name}`);
  });

  await test.step('AC-08.2 the logged-out cart is now the account cart', async () => {
    await cart.goto();

    await expect(cart.rows).toHaveCount(2);
    await expect(cart.row(blueTop.id).root).toBeVisible();
    await expect(cart.row(menTshirt.id).root).toBeVisible();
  });

  await test.step('AC-10.1 checkout shows addresses and the order review', async () => {
    await cart.checkout();
    await page.waitForURL('**/checkout');

    await expect(page.getByRole('heading', { name: 'Address Details' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Review Your Order' })).toBeVisible();
  });

  await test.step('AC-10.3 the review lists the products and totals them', async () => {
    await expect(checkout.reviewRows.filter({ hasText: blueTop.name })).toContainText(blueTop.price);
    await expect(checkout.reviewRows.filter({ hasText: menTshirt.name })).toContainText(menTshirt.price);

    // Summed from the page so the total is proved to be the arithmetic of
    // the lines, not a constant restated.
    const lineTotals = await checkout.lineTotals();
    expect(lineTotals).toEqual([rupees(blueTop.price), rupees(menTshirt.price)]);
    await expect(checkout.totalAmount).toHaveText(
      `Rs. ${lineTotals.reduce((sum, line) => sum + line, 0)}`,
    );
  });

  await test.step('AC-10.7 an order comment can be added', async () => {
    await expect(checkout.comment).toBeVisible();
    await checkout.addComment('Automated check — please ignore.');
  });

  await test.step('AC-10.5 paying confirms the order', async () => {
    await checkout.goToPayment();
    await checkout.pay();

    await expect(checkout.orderPlaced).toHaveText('Order Placed!');
    await expect(page.getByText('Congratulations! Your order has been confirmed!')).toBeVisible();
  });

  await test.step('AC-10.6 the cart is empty afterwards', async () => {
    await cart.goto();

    await expect(cart.emptyMessage).toBeVisible();
    await expect(cart.rows).toHaveCount(0);
  });
});

test('AC-10.2 checkout shows the registered address', { tag: '@regression' }, async ({ loggedInPage, account }) => {
  const checkout = await checkoutWithOneProduct(loggedInPage, blueTop.id);

  const expected = [
    `${account.title}. ${account.firstName} ${account.lastName}`,
    account.company,
    account.address1,
    account.address2,
    `${account.city} ${account.state} ${account.zipcode}`,
    account.country,
    account.mobileNumber,
  ];
  const delivery = await checkout.deliveryAddressLines();
  for (const line of expected) {
    expect(delivery, `delivery address should contain "${line}"`).toContain(line);
  }
  await expect(checkout.billingAddress).toContainText(account.address1);
});

test('AC-10.4 the payment form requires every card field', { tag: '@regression' }, async ({ loggedInPage }) => {
  const checkout = await checkoutWithOneProduct(loggedInPage, blueTop.id);
  await checkout.goToPayment();

  for (const field of [
    checkout.nameOnCard,
    checkout.cardNumber,
    checkout.cvc,
    checkout.expiryMonth,
    checkout.expiryYear,
  ]) {
    await expect(field).toHaveAttribute('required');
  }

  // An empty submit is refused by the browser, so the page never leaves.
  await checkout.payButton.click();
  await expect(loggedInPage).toHaveURL('/payment');
  await expect(checkout.orderPlaced).toHaveCount(0);
});

test('AC-11.1 downloads the invoice for a placed order', { tag: '@regression' }, async ({ loggedInPage, account }) => {
  const checkout = await checkoutWithOneProduct(loggedInPage, blueTop.id);
  await checkout.goToPayment();
  await checkout.pay();

  const downloadPromise = loggedInPage.waitForEvent('download');
  await checkout.downloadInvoice.click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe('invoice.txt');
  expect(await text(await download.createReadStream())).toBe(
    `Hi ${account.firstName} ${account.lastName}, Your total purchase amount is ${rupees(blueTop.price)}. Thank you`,
  );
});
