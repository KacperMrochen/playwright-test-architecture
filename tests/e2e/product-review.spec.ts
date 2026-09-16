import { test, expect, newAccount } from '../../fixtures/test-data';
import { ProductDetailPage } from '../../pages/ProductDetailPage';

test('AC-21.1 accepts a product review', { tag: '@regression' }, async ({ page }) => {
  const detail = new ProductDetailPage(page);

  await detail.goto(2);

  await expect(detail.reviewTab).toContainText('Write Your Review');

  // No login needed, and the review isn't shown back — the confirmation is
  // the whole of the observable behavior.
  await detail.submitReview({
    name: 'PTA Tester',
    email: newAccount().email,
    text: 'Submitted by an automated test suite.',
  });

  await expect(detail.reviewSuccess).toHaveText('Thank you for your review.');
});
