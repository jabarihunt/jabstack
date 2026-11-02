import { expect, test } from '@playwright/test';

test('AC-02: dashboard shows the sidebar, stats cards, chart and table', async ({ page }) => {
	await page.goto('/dashboard');

	await expect(page).toHaveTitle('Dashboard - JabStack');
	await expect(page.locator('[data-sidebar="sidebar"]')).toBeVisible();

	for (const stat of ['Total Revenue', 'New Customers', 'Active Accounts', 'Growth Rate']) {
		await expect(page.getByText(stat, { exact: true })).toBeVisible();
	}

	await expect(page.getByText('Total Visitors')).toBeVisible();
	await expect(page.locator('canvas')).toBeVisible();

	const table = page.getByRole('table');
	await expect(table).toBeVisible();
	await expect(table.getByRole('row')).toHaveCount(7); // header row + 6 sample rows
});

test('AC-03: sidebar links to Dashboard and Settings and highlights the current page', async ({ page }) => {
	await page.goto('/dashboard');

	const sidebar = page.locator('[data-sidebar="sidebar"]');
	const dashboardLink = sidebar.getByRole('link', { name: 'Dashboard', exact: true });
	const settingsLink = sidebar.getByRole('link', { name: 'Settings', exact: true });

	await expect(dashboardLink).toHaveAttribute('data-active', 'true');
	await expect(settingsLink).toHaveAttribute('data-active', 'false');

	await settingsLink.click();
	await expect(page).toHaveURL('/dashboard/settings');
	await expect(page.getByText('Placeholder page for account, billing and app settings.')).toBeVisible();
	await expect(settingsLink).toHaveAttribute('data-active', 'true');
	await expect(dashboardLink).toHaveAttribute('data-active', 'false');
});

test('AC-03: every dashboard link loads', async ({ page, request }) => {
	await page.goto('/dashboard');

	const hrefs = await page
		.locator('a[href^="/"]')
		.evaluateAll((links) => [...new Set(links.map((link) => link.getAttribute('href')!))]);
	expect(hrefs).toContain('/dashboard/settings');

	for (const href of hrefs) {
		const response = await request.get(href);
		expect(response.status(), `GET ${href}`).toBe(200);
	}
});
