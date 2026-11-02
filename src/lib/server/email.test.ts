import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sendSubscriptionCancellation, sendSubscriptionConfirmation, sendWelcomeEmail } from './email.js';

// Replace Resend with a fake that records each email instead of sending it
const { send } = vi.hoisted(() => ({
	send: vi.fn(async (_email: { from: string; to: string; subject: string; html: string }) => ({
		data: { id: 'test-email' },
		error: null
	}))
}));

vi.mock('resend', () => ({
	Resend: class {
		emails = { send };
	}
}));
vi.mock('$app/env/private', () => ({
	RESEND_API_KEY: 're_test',
	EMAIL_FROM: 'Test App <hello@example.com>'
}));
vi.mock('$app/env/public', () => ({ PUBLIC_APP_URL: 'http://localhost:5173' }));

const sentHtml = () => send.mock.calls.map(([email]) => email.html);

beforeEach(() => {
	send.mockClear();
});

describe('email templates', () => {
	const hostileName = `<img src=x onerror="alert('x')">&`;
	const escapedName = '&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;&amp;';

	it('escapes user-supplied names in every template', async () => {
		await sendWelcomeEmail({ to: 'user@example.com', name: hostileName });
		await sendSubscriptionConfirmation({ to: 'user@example.com', name: hostileName, plan: 'Pro' });
		await sendSubscriptionCancellation({ to: 'user@example.com', name: hostileName, endDate: new Date('2026-12-01') });

		expect(send).toHaveBeenCalledTimes(3);
		for (const html of sentHtml()) {
			expect(html).not.toContain('<img');
			expect(html).toContain(escapedName);
		}
	});

	it('escapes the plan name', async () => {
		await sendSubscriptionConfirmation({ to: 'user@example.com', plan: '<b>Pro</b>' });

		expect(sentHtml()[0]).toContain('<strong>&lt;b&gt;Pro&lt;/b&gt;</strong>');
	});

	it('leaves ordinary names readable and handles a missing name', async () => {
		await sendWelcomeEmail({ to: 'user@example.com', name: 'Jabari' });
		await sendWelcomeEmail({ to: 'user@example.com' });

		const [withName, withoutName] = sentHtml();
		expect(withName).toContain('<h1>Welcome, Jabari!</h1>');
		expect(withoutName).toContain('<h1>Welcome!</h1>');
	});

	it('sends from EMAIL_FROM and links to PUBLIC_APP_URL', async () => {
		await sendWelcomeEmail({ to: 'user@example.com' });

		const [[email]] = send.mock.calls;
		expect(email.from).toBe('Test App <hello@example.com>');
		expect(email.to).toBe('user@example.com');
		expect(email.html).toContain('<a href="http://localhost:5173/dashboard">dashboard</a>');
	});
});
