import { expect, test } from '@playwright/test';

test('AC-01: home page links to sign-in, GitHub and the dashboard', async ({ page }) => {
	await page.goto('/');

	await expect(page).toHaveTitle(/JabStack/);
	await expect(page.getByRole('heading', { level: 1 })).toContainText('JabStack');

	await expect(page.getByRole('link', { name: 'Sign In' })).toHaveAttribute('href', '/auth/login');
	await expect(page.getByRole('link', { name: 'View Dashboard' })).toHaveAttribute('href', '/dashboard');

	const githubLinks = page.getByRole('link', { name: 'GitHub' });
	await expect(githubLinks).toHaveCount(2);
	for (const link of await githubLinks.all()) {
		await expect(link).toHaveAttribute('href', 'https://github.com/jabarihunt/jabstack');
		await expect(link).toHaveAttribute('target', '_blank');
		await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
	}
});
