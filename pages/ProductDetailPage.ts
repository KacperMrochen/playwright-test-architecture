import type { Locator, Page } from '@playwright/test';

/** `/product_details/<id>` — product information, the quantity field that
 * feeds AC-06.4, and the review form (AC-21.1). */
export class ProductDetailPage {
  readonly information: Locator;
  readonly name: Locator;
  readonly price: Locator;
  readonly quantity: Locator;
  readonly addToCartButton: Locator;

  readonly reviewTab: Locator;
  readonly reviewName: Locator;
  readonly reviewEmail: Locator;
  readonly reviewText: Locator;
  readonly reviewSubmit: Locator;
  readonly reviewSuccess: Locator;

  constructor(private readonly page: Page) {
    this.information = page.locator('.product-information');
    this.name = this.information.locator('h2');
    this.price = this.information.locator('span span').first();
    this.quantity = page.locator('#quantity');
    this.addToCartButton = page.getByRole('button', { name: 'Add to cart' });

    this.reviewTab = page.locator('.category-tab a');
    this.reviewName = page.locator('#name');
    this.reviewEmail = page.locator('#email');
    this.reviewText = page.locator('#review');
    this.reviewSubmit = page.locator('#button-review');
    this.reviewSuccess = page.locator('#review-section .alert-success');
  }

  async goto(productId: number) {
    await this.page.goto(`/product_details/${productId}`);
  }

  /** The `<p>` carrying one labelled detail. Scoped to the paragraph
   * because the label sits in a `<b>` inside it, and matching on text
   * alone would resolve to both. */
  detail(label: 'Availability' | 'Condition' | 'Brand' | 'Category'): Locator {
    return this.information.locator('p').filter({ hasText: new RegExp(`^${label}:`) });
  }

  async addToCart(quantity?: number) {
    if (quantity !== undefined) await this.quantity.fill(String(quantity));
    await this.addToCartButton.click();
    await this.page.locator('#cartModal').waitFor({ state: 'visible' });
  }

  async submitReview(review: { name: string; email: string; text: string }) {
    await this.reviewName.fill(review.name);
    await this.reviewEmail.fill(review.email);
    await this.reviewText.fill(review.text);
    await this.reviewSubmit.click();
  }
}
