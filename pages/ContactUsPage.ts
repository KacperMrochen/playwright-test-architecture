import type { Locator, Page } from '@playwright/test';

/** `/contact_us`. Submitting raises a native `confirm` (AC-20.2), so the
 * caller must be listening for the dialog before clicking. */
export class ContactUsPage {
  readonly name: Locator;
  readonly email: Locator;
  readonly subject: Locator;
  readonly message: Locator;
  readonly uploadFile: Locator;
  readonly submit: Locator;
  readonly success: Locator;
  readonly homeButton: Locator;

  constructor(private readonly page: Page) {
    this.name = page.locator('[data-qa="name"]');
    this.email = page.locator('[data-qa="email"]');
    this.subject = page.locator('[data-qa="subject"]');
    this.message = page.locator('[data-qa="message"]');
    this.uploadFile = page.locator('input[name="upload_file"]');
    this.submit = page.locator('[data-qa="submit-button"]');
    this.success = page.locator('.status.alert-success');
    this.homeButton = page.locator('.btn-success');
  }

  async goto() {
    await this.page.goto('/contact_us');
  }

  async fill(details: { name: string; email: string; subject: string; message: string }) {
    await this.name.fill(details.name);
    await this.email.fill(details.email);
    await this.subject.fill(details.subject);
    await this.message.fill(details.message);
  }
}
