import { test, expect, newAccount } from '../../fixtures/test-data';
import { ContactUsPage } from '../../pages/ContactUsPage';

test('AC-20.1 submits the contact form', { tag: '@regression' }, async ({ page }) => {
  const contact = new ContactUsPage(page);

  await contact.goto();

  await expect(contact.name).toBeVisible();
  await expect(contact.email).toBeVisible();
  await expect(contact.subject).toBeVisible();
  await expect(contact.message).toBeVisible();
  await expect(contact.uploadFile).toBeAttached();
  // Only the email field is marked required — the others are not, despite
  // the site's own test case filling all four.
  await expect(contact.email).toHaveJSProperty('required', true);
  await expect(contact.name).toHaveJSProperty('required', false);
  await expect(contact.subject).toHaveJSProperty('required', false);
  await expect(contact.message).toHaveJSProperty('required', false);

  await contact.fill({
    name: 'PTA Tester',
    email: newAccount().email,
    subject: 'Automated check',
    message: 'Submitted by an automated test suite. No response needed.',
  });

  await test.step('AC-20.2 submitting raises a confirm dialog', async () => {
    // The handler must accept inside the callback: registering one stops
    // Playwright auto-dismissing, and the click cannot settle until the
    // dialog is answered. Awaiting the dialog before the click deadlocks.
    let type = '';
    let message = '';
    page.once('dialog', async (dialog) => {
      type = dialog.type();
      message = dialog.message();
      await dialog.accept();
    });

    await contact.submit.click();

    expect(type).toBe('confirm');
    expect(message).toBe('Press OK to proceed!');
  });

  await test.step('AC-20.3 accepting it submits the form', async () => {
    await expect(contact.success).toHaveText(
      'Success! Your details have been submitted successfully.',
    );
    await expect(contact.homeButton).toHaveText(/Home/);
  });
});
