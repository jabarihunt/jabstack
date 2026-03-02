import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
	apiVersion: '2025-02-24.acacia'
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
		payment_method_types: ['card'],
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

// Helper to create or get a Stripe customer
export async function getOrCreateCustomer({
	email,
	name,
	userId
}: {
	email: string;
	name?: string;
	userId: string;
}) {
	// Search for existing customer
	const existingCustomers = await stripe.customers.list({
		email,
		limit: 1
	});

	if (existingCustomers.data.length > 0) {
		return existingCustomers.data[0];
	}

	// Create new customer
	return stripe.customers.create({
		email,
		name: name || undefined,
		metadata: {
			userId
		}
	});
}
