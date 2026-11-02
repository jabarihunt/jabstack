import { Resend } from 'resend';
import { EMAIL_FROM, RESEND_API_KEY } from '$app/env/private';
import { PUBLIC_APP_URL } from '$app/env/public';

export const resend = new Resend(RESEND_API_KEY);

// Names come from users (for example their Google profile), so escape them
// before putting them into HTML.
function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

export async function sendWelcomeEmail({
	to,
	name
}: {
	to: string;
	name?: string;
}) {
	return resend.emails.send({
		from: EMAIL_FROM,
		to,
		subject: 'Welcome to JabStack!',
		html: `
			<h1>Welcome${name ? `, ${escapeHtml(name)}` : ''}!</h1>
			<p>Thank you for signing up for JabStack.</p>
			<p>Get started by visiting your <a href="${PUBLIC_APP_URL}/dashboard">dashboard</a>.</p>
		`
	});
}

export async function sendSubscriptionConfirmation({
	to,
	name,
	plan
}: {
	to: string;
	name?: string;
	plan: string;
}) {
	return resend.emails.send({
		from: EMAIL_FROM,
		to,
		subject: 'Subscription Confirmed',
		html: `
			<h1>Subscription Confirmed</h1>
			<p>Hi${name ? ` ${escapeHtml(name)}` : ''},</p>
			<p>Your subscription to the <strong>${escapeHtml(plan)}</strong> plan has been confirmed.</p>
			<p>Visit your <a href="${PUBLIC_APP_URL}/dashboard">dashboard</a> to get started.</p>
		`
	});
}

export async function sendSubscriptionCancellation({
	to,
	name,
	endDate
}: {
	to: string;
	name?: string;
	endDate: Date;
}) {
	return resend.emails.send({
		from: EMAIL_FROM,
		to,
		subject: 'Subscription Cancelled',
		html: `
			<h1>Subscription Cancelled</h1>
			<p>Hi${name ? ` ${escapeHtml(name)}` : ''},</p>
			<p>Your subscription has been cancelled and will end on ${endDate.toLocaleDateString()}.</p>
			<p>You can resubscribe anytime from your <a href="${PUBLIC_APP_URL}/dashboard/settings">settings</a>.</p>
		`
	});
}
