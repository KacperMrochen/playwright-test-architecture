import type { Locator, Page } from '@playwright/test';

/** `/view_cart`. One row per product, keyed `#product-<id>`; the quantity
 * is a disabled control (AC-06.6). */
export class CartPage {
  readonly rows: Locator;
  readonly emptyMessage: Locator;
  readonly proceedToCheckout: Locator;

  readonly checkoutModal: Locator;
  readonly registerLoginLink: Locator;
  readonly continueOnCartButton: Locator;

  constructor(private readonly page: Page) {
    this.rows = page.locator('#cart_info_table tbody tr');
    this.emptyMessage = page.locator('#empty_cart');
    this.proceedToCheckout = page.getByText('Proceed To Checkout');

    this.checkoutModal = page.locator('#checkoutModal');
    this.registerLoginLink = this.checkoutModal.getByRole('link', { name: 'Register / Login' });
    this.continueOnCartButton = this.checkoutModal.getByRole('button', { name: 'Continue On Cart' });
  }

  async goto() {
    await this.page.goto('/view_cart');
  }

  row(productId: number) {
    const row = this.page.locator(`#product-${productId}`);
    return {
      root: row,
      name: row.locator('.cart_description h4 a'),
      price: row.locator('.cart_price p'),
      quantity: row.locator('.cart_quantity button'),
      total: row.locator('.cart_total .cart_total_price'),
      delete: row.locator('.cart_quantity_delete'),
    };
  }

  async removeProduct(productId: number) {
    await this.row(productId).delete.click();
    await this.row(productId).root.waitFor({ state: 'detached' });
  }

  async checkout() {
    await this.proceedToCheckout.click();
  }
}
