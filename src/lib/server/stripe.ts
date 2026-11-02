import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$app/env/private';

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
	apiVersion: '2026-10-28.endive'
});

// Helper to create a checkout session
export async function createCheckoutSession({
	customerId,
	priceId,
	successUrl,
	cancelUrl
}: {
	customerId: string;
	priceId: string;
	successUrl: string;
	cancelUrl: string;
}) {
	return stripe.checkout.sessions.create({
		customer: customerId,
		mode: 'subscription',
		line_items: [
			{
				price: priceId,
				quantity: 1
			}
		],
		success_url: successUrl,
		cancel_url: cancelUrl
	});
}

// Helper to create a customer portal session
export async function createPortalSession({
	customerId,
	returnUrl
}: {
	customerId: string;
	returnUrl: string;
}) {
	return stripe.billingPortal.sessions.create({
		customer: customerId,
		return_url: returnUrl
	});
}

// Helper to get or create the Stripe customer for a user.
// Customers are matched by the userId in their metadata, not by email, so two
// accounts that share an email address never share billing.
export async function getOrCreateCustomer({
	email,
	name,
	userId
}: {
	email: string;
	name?: string;
	userId: string;
}) {
	const escapedUserId = userId.replace(/["\\]/g, '\\$&');
	const existingCustomers = await stripe.customers.search({
		query: `metadata["userId"]:"${escapedUserId}"`,
		limit: 1
	});

	if (existingCustomers.data.length > 0) {
		return existingCustomers.data[0];
	}

	// Stripe's search can lag behind newly created customers (usually under a
	// minute), so a second call soon after the first may not find the customer.
	// The idempotency key makes Stripe return the same customer instead of
	// creating a duplicate. For a lookup that never lags, store the customer ID
	// on the user in your database.
	return stripe.customers.create(
		{
			email,
			name: name || undefined,
			metadata: {
				userId
			}
		},
		{ idempotencyKey: `create-customer-${userId}` }
	);
}
