import type { Locator, Page } from '@playwright/test';
import type { Account } from '../fixtures/test-data';

/** `/signup` — the account information form, reached from the login page
 * with the name and email already carried over (AC-01.1). */
export class SignupPage {
  readonly name: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly createAccountButton: Locator;
  readonly accountCreated: Locator;
  readonly continueButton: Locator;

  constructor(private readonly page: Page) {
    this.name = page.locator('[data-qa="name"]');
    this.email = page.locator('[data-qa="email"]');
    this.password = page.locator('[data-qa="password"]');
    this.createAccountButton = page.locator('[data-qa="create-account"]');
    this.accountCreated = page.locator('[data-qa="account-created"]');
    this.continueButton = page.locator('[data-qa="continue-button"]');
  }

  async fillAccountInformation(account: Account) {
    await this.page.locator(`#id_gender${account.title === 'Mr' ? 1 : 2}`).check();
    await this.password.fill(account.password);
    await this.page.locator('[data-qa="days"]').selectOption(account.birthDate);
    await this.page.locator('[data-qa="months"]').selectOption({ label: account.birthMonth });
    await this.page.locator('[data-qa="years"]').selectOption(account.birthYear);

    await this.page.locator('[data-qa="first_name"]').fill(account.firstName);
    await this.page.locator('[data-qa="last_name"]').fill(account.lastName);
    await this.page.locator('[data-qa="company"]').fill(account.company);
    await this.page.locator('[data-qa="address"]').fill(account.address1);
    await this.page.locator('[data-qa="address2"]').fill(account.address2);
    await this.page.locator('[data-qa="country"]').selectOption(account.country);
    await this.page.locator('[data-qa="state"]').fill(account.state);
    await this.page.locator('[data-qa="city"]').fill(account.city);
    await this.page.locator('[data-qa="zipcode"]').fill(account.zipcode);
    await this.page.locator('[data-qa="mobile_number"]').fill(account.mobileNumber);
  }

  async submit() {
    await this.createAccountButton.click();
    await this.page.waitForURL('**/account_created');
  }

  async continueToHome() {
    await this.continueButton.click();
    await this.page.waitForURL(`${new URL(this.page.url()).origin}/`);
  }
}
