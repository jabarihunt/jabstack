# Database templates

JabStack is set up for PostgreSQL. `bun run setup:database turso` (in `scripts/setup-database.ts`) switches a new project to SQLite and Turso using this folder, and both `setup:database postgres` and `setup:database turso` delete it afterwards.

`turso/` holds what differs from the PostgreSQL version:

- `files/` holds whole files, at the paths they're copied to. The setup deletes `drizzle/` and `src/lib/components/icons/postgres-icon.svelte`, then copies these over the project.
- `shared-files.patch` changes the files both databases share: docs, `.env.example`, ignore files, the MCP server list in `scripts/mcp-setup.ts`, `src/env.ts`, `src/lib/server/auth.ts`, `playwright.config.ts` and the home page.
- The setup also swaps the packages (`postgres` and `@electric-sql/pglite` for `@libsql/client`).

## Keeping Turso up to date

`.github/workflows/scaffold.yml` sets up each database in CI and runs every check, so a Turso version that no longer applies or builds fails there.

- When you change the schema, make the same change in `turso/files/src/lib/server/db/schema.ts` and regenerate its migration (step 2 below).
- When the patch no longer applies, or you want to change the Turso text in a shared file, rewrite the patch. Start from a clean working tree:

```bash
# 1. Apply the Turso changes to the shared files (--reject keeps going and writes .rej files for conflicts)
git apply --reject templates/database/turso/shared-files.patch
# 2. Edit the shared files. For a Turso migration, set up Turso in a scratch copy
#    (bun run setup:database turso), run bun run db:generate there, and copy drizzle/ back to turso/files/.
# 3. Write the patch again and put the PostgreSQL versions back
git diff -- . ':(exclude)templates' > /tmp/shared-files.patch
git checkout -- . ':(exclude)templates'
mv /tmp/shared-files.patch templates/database/turso/shared-files.patch
```
