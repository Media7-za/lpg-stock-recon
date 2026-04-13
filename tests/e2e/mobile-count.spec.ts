import { test, expect } from '@playwright/test';

test.describe('Mobile Count Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the count session page
    await page.goto('/count');
  });

  test('should increment cylinder count', async ({ page }) => {
    // Locate a counter control (e.g., for 9kg Oryx)
    // Based on CounterControl.tsx, we can look for the text or use an aria-label if we add one.
    // For now, we'll search by text content.
    
    // Locate the row specifically using its unique structure/classes
    const row = page.locator('.py-4.border-b').filter({ hasText: /Oryx/i }).filter({ hasText: /9kg/i }).first();
    const plusButton = row.locator('button').filter({ has: page.locator('svg') }).last();
    const valueDisplay = row.locator('button').filter({ hasNot: page.locator('svg') });

    const initialValue = await valueDisplay.textContent();
    const expectedValue = (parseInt(initialValue || '0') + 1).toString();

    // Click the plus button
    await plusButton.click();

    // Assert the value updated
    await expect(valueDisplay).toHaveText(expectedValue);
  });

  test('should allow counting while offline', async ({ context, page }) => {
    // 1. Go offline
    await context.setOffline(true);

    // 2. Perform a count action
    const row = page.locator('.py-4.border-b').filter({ hasText: /Oryx/i }).filter({ hasText: /9kg/i }).first();
    const plusButton = row.locator('button').filter({ has: page.locator('svg') }).last();
    const valueDisplay = row.locator('button').filter({ hasNot: page.locator('svg') });

    await plusButton.click();

    // 3. Verify it still works (Offline-first / Dexie)
    await expect(valueDisplay).toHaveText('1');

    // 4. Restore connectivity
    await context.setOffline(false);
  });

  test('should open custom numpad on value click', async ({ page }) => {
    const row = page.locator('.py-4.border-b').filter({ hasText: /Oryx/i }).filter({ hasText: /9kg/i }).first();
    const valueButton = row.locator('button').filter({ hasNot: page.locator('svg') });

    await valueButton.click();

    // CustomNumpad should appear
    await expect(page.locator('text=Stock Entry')).toBeVisible();
  });

  test('should navigate through Review and Submit flow successfully', async ({ page }) => {
    // 1. Add some counts
    const row = page.locator('.py-4.border-b').filter({ hasText: /Oryx/i }).filter({ hasText: /9kg/i }).first();
    const plusButton = row.locator('button').filter({ has: page.locator('svg') }).last();
    
    await plusButton.click();
    await plusButton.click();

    // Navigate to next sizes to reach the review button
    // The sizes are 9kg, 14kg, 19kg, SV, DV. 
    // We are at 9kg. We need to click "Next: 14kg", "Next: 19kg", "Next: SV", "Next: DV", "Next: Empties"
    // Wait, the "Review & Submit" button appears when `isLastSize` is true. `isLastSize` is true when `size === 'DV'`.
    await page.getByRole('button', { name: /Next: 14kg/i }).click();
    await page.getByRole('button', { name: /Next: 19kg/i }).click();
    await page.getByRole('button', { name: /Next: SV/i }).click();
    await page.getByRole('button', { name: /Next: DV/i }).click();

    // Click Review & Submit (it appears when at DV)
    await page.getByRole('button', { name: /Review & Submit/i }).click();

    // 2. Verify Review Summary Screen renders correctly
    await expect(page.getByRole('heading', { name: 'Review Your Count' })).toBeVisible();
    
    // Total items should be 2
    await expect(page.locator('text=Total Items').locator('..').locator('p').last()).toHaveText('2');

    // 3. Confirm & Submit
    
    // We need to bypass the alert that occurs in CountSession.tsx when submitting
    page.on('dialog', dialog => dialog.accept());

    await page.getByRole('button', { name: /Confirm & Submit/i }).click();

    // 4. Verification that it routes correctly to the results page
    await expect(page).toHaveURL(/\/results\?countId=/);
  });
});
