import type { Locator, Page } from '@playwright/test';

/** The navigation bar, shared by every page. Its contents are how the site
 * shows whether anyone is logged in. */
export class Header {
  readonly loggedInAs: Locator;
  readonly logout: Locator;
  readonly signupLogin: Locator;
  readonly deleteAccount: Locator;
  readonly cart: Locator;

  constructor(private readonly page: Page) {
    this.loggedInAs = page.locator('.shop-menu').getByText('Logged in as');
    this.logout = page.locator('.shop-menu').getByRole('link', { name: 'Logout' });
    this.signupLogin = page.locator('.shop-menu').getByRole('link', { name: 'Signup / Login' });
    this.deleteAccount = page.locator('.shop-menu').getByRole('link', { name: 'Delete Account' });
    this.cart = page.locator('.shop-menu').getByRole('link', { name: 'Cart' });
  }

  async clickLogout() {
    await this.logout.click();
    await this.page.waitForURL('**/login');
  }
}
