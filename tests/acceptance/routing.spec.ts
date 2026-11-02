import { expect, test } from '@playwright/test';

test('AC-04: /auth/login redirects to the dashboard', async ({ page }) => {
	await page.goto('/auth/login');

	await expect(page).toHaveURL('/dashboard');
	await expect(page).toHaveTitle('Dashboard - JabStack');
});

test('AC-05: unknown URLs show the 404 page with a link home', async ({ page }) => {
	const response = await page.goto('/this-page-does-not-exist');

	expect(response?.status()).toBe(404);
	await expect(page).toHaveTitle('Page not found - JabStack');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');

	await page.getByRole('link', { name: 'Go home' }).click();
	await expect(page).toHaveURL('/');
});
