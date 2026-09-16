import type { Locator, Page } from '@playwright/test';
import { TEST_CARD } from '../fixtures/test-data';

/** `/checkout` and `/payment`: address details, order review, the comment
 * field (AC-10.7), the card form and the confirmation. */
export class CheckoutPage {
  readonly deliveryAddress: Locator;
  readonly billingAddress: Locator;
  readonly reviewRows: Locator;
  readonly totalAmount: Locator;
  readonly comment: Locator;
  readonly placeOrder: Locator;

  readonly nameOnCard: Locator;
  readonly cardNumber: Locator;
  readonly cvc: Locator;
  readonly expiryMonth: Locator;
  readonly expiryYear: Locator;
  readonly payButton: Locator;

  readonly orderPlaced: Locator;
  readonly downloadInvoice: Locator;

  constructor(private readonly page: Page) {
    this.deliveryAddress = page.locator('#address_delivery');
    this.billingAddress = page.locator('#address_invoice');
    this.reviewRows = page.locator('#cart_info tbody tr');
    this.totalAmount = page.locator('.cart_total_price').last();
    this.comment = page.locator('textarea[name="message"]');
    this.placeOrder = page.getByText('Place Order');

    this.nameOnCard = page.locator('[data-qa="name-on-card"]');
    this.cardNumber = page.locator('[data-qa="card-number"]');
    this.cvc = page.locator('[data-qa="cvc"]');
    this.expiryMonth = page.locator('[data-qa="expiry-month"]');
    this.expiryYear = page.locator('[data-qa="expiry-year"]');
    this.payButton = page.locator('[data-qa="pay-button"]');

    this.orderPlaced = page.locator('[data-qa="order-placed"]');
    this.downloadInvoice = page.getByRole('link', { name: 'Download Invoice' });
  }

  /** The address block as lines, for comparing against the account. */
  async deliveryAddressLines(): Promise<string[]> {
    const text = await this.deliveryAddress.innerText();
    return text.split('\n').map((line) => line.trim()).filter(Boolean);
  }

  async addComment(comment: string) {
    await this.comment.fill(comment);
  }

  async goToPayment() {
    await this.placeOrder.click();
    await this.page.waitForURL('**/payment');
  }

  async pay(card = TEST_CARD) {
    await this.nameOnCard.fill(card.nameOnCard);
    await this.cardNumber.fill(card.cardNumber);
    await this.cvc.fill(card.cvc);
    await this.expiryMonth.fill(card.expiryMonth);
    await this.expiryYear.fill(card.expiryYear);
    await this.payButton.click();
    await this.orderPlaced.waitFor({ state: 'visible' });
  }
}
