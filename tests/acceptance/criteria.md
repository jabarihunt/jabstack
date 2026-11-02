# Acceptance Criteria

Each criterion has an ID and at least one Playwright test in this folder whose title starts with that ID, for example `AC-03: the sidebar ...`. `bun run test:criteria` fails if a criterion has no test, a test has no ID, or a test names an ID that isn't listed here.

Format rules:
- One criterion per line: `- **AC-NN**: description`
- IDs are unique and never reused. When a criterion is dropped, delete its line and its tests.

## Criteria

- **AC-01**: The home page loads and links to sign-in, GitHub and the dashboard.
- **AC-02**: The dashboard shows the sidebar, four stats cards, the visitors chart and the data table.
- **AC-03**: The sidebar links to Dashboard and Settings, every dashboard link loads, and the current page is highlighted.
- **AC-04**: Visiting /auth/login redirects to /dashboard.
- **AC-05**: Unknown URLs show the 404 page, which links back home.
