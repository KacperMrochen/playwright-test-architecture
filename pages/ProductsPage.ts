import type { Locator, Page } from '@playwright/test';

/** Where a listing link led, and the name the resulting heading uses. */
export type Destination = { path: string; name: string };

/** `/products`, plus the category and brand listings, which reuse the same
 * product-card markup and the same add-to-cart control. */
export class ProductsPage {
  readonly title: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly products: Locator;
  readonly productNames: Locator;
  readonly categoryPanels: Locator;
  readonly brandLinks: Locator;

  readonly cartModal: Locator;
  readonly viewCartLink: Locator;
  readonly continueShoppingButton: Locator;

  constructor(private readonly page: Page) {
    this.title = page.locator('h2.title');
    this.searchInput = page.locator('#search_product');
    this.searchButton = page.locator('#submit_search');
    this.products = page.locator('.productinfo');
    this.productNames = page.locator('.productinfo p');
    this.categoryPanels = page.locator('.left-sidebar .panel-title a');
    this.brandLinks = page.locator('.brands-name a');

    this.cartModal = page.locator('#cartModal');
    this.viewCartLink = this.cartModal.getByRole('link', { name: 'View Cart' });
    this.continueShoppingButton = this.cartModal.getByRole('button', { name: 'Continue Shopping' });
  }

  async goto() {
    await this.page.goto('/products');
  }

  async search(term: string) {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }

  /** The add-to-cart control, identical on every listing. */
  addToCartButton(productId: number, scope?: Locator): Locator {
    const root = scope ?? this.page;
    return root.locator(`a.add-to-cart[data-product-id="${productId}"]`).first();
  }

  async addToCart(productId: number, scope?: Locator) {
    await this.addToCartButton(productId, scope).click();
    await this.cartModal.waitFor({ state: 'visible' });
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
    await this.cartModal.waitFor({ state: 'hidden' });
  }

  async viewCart() {
    await this.viewCartLink.click();
    await this.page.waitForURL('**/view_cart');
  }

  /** The product id of the first card in the current listing — lets a test
   * work against category and brand pages without hard-coding their
   * contents, which are site data rather than behavior. */
  async firstProductId(scope?: Locator): Promise<number> {
    const root = scope ?? this.page;
    const id = await root.locator('a.add-to-cart[data-product-id]').first().getAttribute('data-product-id');
    if (!id) throw new Error('No add-to-cart control found in this listing');
    return Number(id);
  }

  /** Reports the destination so the caller can assert the exact URL and
   * heading, rather than a pattern any category would satisfy. */
  async openCategory(usertype: 'Women' | 'Men' | 'Kids'): Promise<Destination> {
    await this.page.locator(`a[href="#${usertype}"]`).click();
    const firstCategory = this.page.locator(`#${usertype} a[href*="/category_products/"]`).first();
    await firstCategory.waitFor({ state: 'visible' });
    const path = await firstCategory.getAttribute('href');
    // `textContent`, not `innerText`: the sidebar uppercases these names
    // with CSS, which `innerText` honours and the heading does not.
    const name = (await firstCategory.textContent())?.trim();
    if (!path || !name) throw new Error(`No category link under ${usertype}`);
    await firstCategory.click();
    return { path, name };
  }

  /** The name comes from the path, not the link text: the link also
   * carries a product count (`(6)Polo`). */
  async openFirstBrand(): Promise<Destination> {
    const firstBrand = this.page.locator('.brands-name a[href*="/brand_products/"]').first();
    const path = await firstBrand.getAttribute('href');
    if (!path) throw new Error('No brand link on this page');
    await firstBrand.click();
    return { path, name: path.split('/').pop() as string };
  }
}
