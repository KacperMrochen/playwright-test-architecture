import type { Locator, Page } from '@playwright/test';

/** `/login` carries both forms: "Login to your account" and
 * "New User Signup!". The page ships `data-qa` attributes, so they're used
 * in preference to roles here (TESTING.md, Selectors). */
export class LoginPage {
  readonly loginEmail: Locator;
  readonly loginPassword: Locator;
  readonly loginButton: Locator;
  readonly loginError: Locator;

  readonly signupName: Locator;
  readonly signupEmail: Locator;
  readonly signupButton: Locator;
  readonly signupError: Locator;

  constructor(private readonly page: Page) {
    this.loginEmail = page.locator('[data-qa="login-email"]');
    this.loginPassword = page.locator('[data-qa="login-password"]');
    this.loginButton = page.locator('[data-qa="login-button"]');
    this.loginError = page.locator('.login-form p');

    this.signupName = page.locator('[data-qa="signup-name"]');
    this.signupEmail = page.locator('[data-qa="signup-email"]');
    this.signupButton = page.locator('[data-qa="signup-button"]');
    this.signupError = page.locator('.signup-form p');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(credentials: { email: string; password: string }) {
    await this.loginEmail.fill(credentials.email);
    await this.loginPassword.fill(credentials.password);
    await this.loginButton.click();
  }

  async startSignup(details: { name: string; email: string }) {
    await this.signupName.fill(details.name);
    await this.signupEmail.fill(details.email);
    await this.signupButton.click();
  }
}
