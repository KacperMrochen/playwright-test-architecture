import { test, expect, uniqueEmail } from '../../fixtures/test-data';
import { HomePage } from '../../pages/HomePage';
import { CartPage } from '../../pages/CartPage';

test('AC-19.1 subscribes from the home page', { tag: '@regression' }, async ({ page }) => {
  const home = new HomePage(page);

  await home.goto();
  await expect(home.subscriptionHeading).toBeVisible();
  await home.subscribe(uniqueEmail());

  await expect(home.subscriptionSuccess).toHaveText('You have been successfully subscribed!');

  await test.step('AC-19.2 the cart page carries the same form', async () => {
    // Literally the same footer component, so one test covers both pages.
    await new CartPage(page).goto();
    await home.subscribe(uniqueEmail());

    await expect(home.subscriptionSuccess).toHaveText('You have been successfully subscribed!');
  });
});
