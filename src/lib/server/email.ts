import { Resend } from 'resend';
import { RESEND_API_KEY } from '$env/static/private';
import { PUBLIC_APP_URL } from '$env/static/public';

export const resend = new Resend(RESEND_API_KEY);

// Default from address - update this with your verified domain
const FROM_EMAIL = 'JabStack <noreply@yourdomain.com>';

export async function sendWelcomeEmail({
	to,
	name
}: {
	to: string;
	name?: string;
}) {
	return resend.emails.send({
		from: FROM_EMAIL,
		to,
		subject: 'Welcome to JabStack!',
		html: `
			<h1>Welcome${name ? `, ${name}` : ''}!</h1>
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
		from: FROM_EMAIL,
		to,
		subject: 'Subscription Confirmed',
		html: `
			<h1>Subscription Confirmed</h1>
			<p>Hi${name ? ` ${name}` : ''},</p>
			<p>Your subscription to the <strong>${plan}</strong> plan has been confirmed.</p>
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
		from: FROM_EMAIL,
		to,
		subject: 'Subscription Cancelled',
		html: `
			<h1>Subscription Cancelled</h1>
			<p>Hi${name ? ` ${name}` : ''},</p>
			<p>Your subscription has been cancelled and will end on ${endDate.toLocaleDateString()}.</p>
			<p>You can resubscribe anytime from your <a href="${PUBLIC_APP_URL}/dashboard/settings">settings</a>.</p>
		`
	});
}
