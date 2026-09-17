import { test, expect, uniqueEmail } from '../../fixtures/test-data';
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
  await expect(contact.email).toHaveAttribute('required');
  await expect(contact.name).not.toHaveAttribute('required');
  await expect(contact.subject).not.toHaveAttribute('required');
  await expect(contact.message).not.toHaveAttribute('required');

  await contact.fill({
    name: 'PTA Tester',
    email: uniqueEmail(),
    subject: 'Automated check',
    message: 'Submitted by an automated test suite. No response needed.',
  });

  await test.step('AC-20.2 submitting raises a confirm dialog', async () => {
    // Registering a handler stops Playwright auto-dismissing, so it must
    // accept or the click never settles.
    const dialogClosed = page.waitForEvent('dialogclosed');
    page.once('dialog', (dialog) => dialog.accept());

    await contact.submit.click();

    const dialog = await dialogClosed;
    expect(dialog.type()).toBe('confirm');
    expect(dialog.message()).toBe('Press OK to proceed!');
  });

  await test.step('AC-20.3 accepting it submits the form', async () => {
    await expect(contact.success).toHaveText(
      'Success! Your details have been submitted successfully.',
    );
    await expect(contact.homeButton).toHaveText('Home');
  });
});
