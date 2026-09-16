import type { Locator, Page } from '@playwright/test';

/** The home page, and the footer subscription form it shares with every
 * other page. */
export class HomePage {
  readonly recommendedItems: Locator;
  readonly subscriptionHeading: Locator;
  readonly subscriptionEmail: Locator;
  readonly subscribeButton: Locator;
  readonly subscriptionSuccess: Locator;

  constructor(private readonly page: Page) {
    this.recommendedItems = page.locator('.recommended_items');
    this.subscriptionHeading = page.locator('#footer').getByText('Subscription');
    // The site's own spelling of the field id.
    this.subscriptionEmail = page.locator('#susbscribe_email');
    this.subscribeButton = page.locator('#subscribe');
    this.subscriptionSuccess = page.locator('#success-subscribe');
  }

  async goto() {
    await this.page.goto('/');
  }

  async subscribe(email: string) {
    await this.subscriptionEmail.fill(email);
    await this.subscribeButton.click();
    await this.subscriptionSuccess.waitFor({ state: 'visible' });
  }
}
