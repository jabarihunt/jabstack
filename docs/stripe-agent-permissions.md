# Stripe agent permissions

What this project's AI agents may do in Stripe through the Stripe MCP server. The permissions live in Stripe, on the Agent API key or the OAuth grant, so this file is the record of what they should be. Agents read it. People apply it in the Stripe Dashboard.

Each project starts with JabStack's list below and changes it as its features change.

## Rules

- Agents only ever get sandbox access. Never give an agent a live-mode key or a live-mode OAuth grant. An administrator can turn off live-mode MCP access for the whole team in the Dashboard.
- Each project has its own sandbox. Stripe recommends separate sandboxes for local development and CI.
- Each use gets its own Agent API key, named after the project and the use (for example `myapp-local-agent` and `myapp-ci-agent`), with an expiry date. People in an editor sign in with OAuth instead and grant the same permissions to the project's sandbox.
- Agents use Stripe only through the MCP server. They never use the app's `STRIPE_SECRET_KEY`, from `.env` or anywhere else, to get around a missing permission.

## Permissions

Write includes read. Every resource not listed is None.

| Resource | Access | Why |
|----------|--------|-----|
| Customers | Read | Check the customers the app creates (`getOrCreateCustomer` in `src/lib/server/stripe.ts`) |
| Checkout Sessions | Read | Check the sessions the app creates for subscriptions |
| Customer portal | Read | Check the billing portal sessions and configuration |
| Subscriptions | Read | Check subscription state while building webhooks and the `subscriptions` table |
| Events | Read | Debug webhook deliveries |
| Products | Write | Set up the sandbox's test catalog |
| Prices | Write | Set up the sandbox's test catalog |

The app creates customers, checkout sessions and portal sessions with its own key, so agents only need to read those.

## Changing permissions

1. When work needs a permission that isn't listed, the agent adds or changes the row in this file, in the same change as the work, with the reason.
2. The agent tells the person which permission to add and stops using Stripe for that task until it's added.
3. The person edits the Agent API key in the project's sandbox (API keys, then Edit key on the key's menu). OAuth users reconnect and grant the new permission.

When a Stripe call fails for lack of a permission, the error names the permission, and the key's request logs in the Dashboard list failed requests.
