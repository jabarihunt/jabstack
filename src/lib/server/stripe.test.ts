import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getOrCreateCustomer } from './stripe.js';

// Replace the Stripe client with fakes for the two calls getOrCreateCustomer makes.
// Any other Stripe call (such as customers.list) would throw, which keeps the tests honest.
const { search, create } = vi.hoisted(() => ({
	search: vi.fn(),
	create: vi.fn()
}));

vi.mock('stripe', () => ({
	default: class {
		customers = { search, create };
	}
}));
vi.mock('$app/env/private', () => ({ STRIPE_SECRET_KEY: 'sk_test_fake' }));

beforeEach(() => {
	search.mockReset();
	create.mockReset();
	create.mockImplementation(async (params: { metadata: { userId: string } }) => ({
		id: `cus_new_${params.metadata.userId}`,
		...params
	}));
});

describe('getOrCreateCustomer', () => {
	it("returns the user's existing customer without creating one", async () => {
		search.mockResolvedValue({ data: [{ id: 'cus_existing' }] });

		const customer = await getOrCreateCustomer({ email: 'user@example.com', userId: 'user_a' });

		expect(customer.id).toBe('cus_existing');
		expect(search).toHaveBeenCalledWith({ query: 'metadata["userId"]:"user_a"', limit: 1 });
		expect(create).not.toHaveBeenCalled();
	});

	it('creates a customer tagged with the userId when none exists', async () => {
		search.mockResolvedValue({ data: [] });

		const customer = await getOrCreateCustomer({ email: 'shared@example.com', name: 'User B', userId: 'user_b' });

		expect(customer.id).toBe('cus_new_user_b');
		expect(create).toHaveBeenCalledWith(
			{ email: 'shared@example.com', name: 'User B', metadata: { userId: 'user_b' } },
			{ idempotencyKey: 'create-customer-user_b' }
		);
	});

	it('matches by userId, so a second user with the same email gets their own customer', async () => {
		search.mockResolvedValue({ data: [] });

		await getOrCreateCustomer({ email: 'shared@example.com', userId: 'user_b' });

		const [[{ query }]] = search.mock.calls;
		expect(query).toContain('user_b');
		expect(query).not.toContain('shared@example.com');
	});

	it('escapes quotes and backslashes in the search query', async () => {
		search.mockResolvedValue({ data: [] });

		await getOrCreateCustomer({ email: 'user@example.com', userId: 'odd"id\\x' });

		expect(search).toHaveBeenCalledWith({ query: 'metadata["userId"]:"odd\\"id\\\\x"', limit: 1 });
	});
});
