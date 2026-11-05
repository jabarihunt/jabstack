// Chooses the project's database. Run it once, right after copying JabStack:
//
//   bun run setup:database postgres   Keep PostgreSQL, which the scaffold already uses
//   bun run setup:database turso      Switch to SQLite locally and Turso in production
//
// Turso's versions of the database files are in templates/database/turso/: files/ holds
// whole files, and shared-files.patch changes the files both databases share (docs,
// config, the home page). Either way, the script then deletes everything that only the
// scaffold needs, including itself.
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

process.chdir(join(import.meta.dir, '..'));

const turso = 'templates/database/turso';
const patch = `${turso}/shared-files.patch`;

// Docs with sections that only make sense before the choice is made
const docsWithScaffoldSections = ['AGENTS.md', 'README.md'];
const scaffoldStart = '<!-- scaffold:start -->';
const scaffoldEnd = '<!-- scaffold:end -->';

// Files and folders that only the scaffold needs
const scaffoldOnly = ['templates', '.github/workflows/scaffold.yml', 'scripts/setup-database.ts'];

function fail(message: string): never {
	console.error(`\n${message}`);
	process.exit(1);
}

// Removes each section from `<!-- scaffold:start -->` to `<!-- scaffold:end -->`,
// plus the blank line after it. Returns null if a marker has no partner.
function removeScaffoldSections(text: string): string | null {
	const lines = text.split('\n');
	const kept: string[] = [];
	let inSection = false;
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		if (line === scaffoldStart) {
			if (inSection) return null;
			inSection = true;
		} else if (line === scaffoldEnd) {
			if (!inSection) return null;
			inSection = false;
			if (lines[i + 1] === '') i++;
		} else if (!inSection) {
			kept.push(lines[i]);
		}
	}
	return inSection ? null : kept.join('\n');
}

// git apply reads paths in the patch relative to the repository root. --directory
// adds the path from there to this project, in case the project is in a subfolder.
function gitApply(...options: string[]) {
	const prefix = Bun.spawnSync(['git', 'rev-parse', '--show-prefix']);
	const directory = prefix.exitCode === 0 ? prefix.stdout.toString().trim() : '';
	const args = directory ? [`--directory=${directory}`] : [];
	return Bun.spawnSync(['git', 'apply', ...args, ...options, patch]);
}

const choice = process.argv[2];
if (choice !== 'postgres' && choice !== 'turso') {
	fail('Usage: bun run setup:database postgres|turso');
}
if (!existsSync(turso)) {
	fail('This project has already chosen its database (templates/database/ is gone).');
}

// Check everything before changing anything
for (const path of docsWithScaffoldSections) {
	if (removeScaffoldSections(readFileSync(path, 'utf8')) === null) {
		fail(`${path} has a ${scaffoldStart} without a matching ${scaffoldEnd}, or the other way round.`);
	}
}
if (choice === 'turso') {
	const check = gitApply('--check');
	if (check.exitCode !== 0) {
		fail(
			`${patch} doesn't apply to this copy, so nothing was changed.\n` +
				'Run the setup before changing the files it edits. git said:\n' +
				check.stderr.toString()
		);
	}
}

if (choice === 'turso') {
	console.log('Switching to SQLite and Turso...');
	rmSync('drizzle', { recursive: true, force: true });
	rmSync('src/lib/components/icons/postgres-icon.svelte', { force: true });
	cpSync(`${turso}/files`, '.', { recursive: true });
	const result = gitApply();
	if (result.exitCode !== 0) fail(`git apply ${patch} failed:\n${result.stderr.toString()}`);
}

for (const path of docsWithScaffoldSections) {
	writeFileSync(path, removeScaffoldSections(readFileSync(path, 'utf8'))!);
}

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
delete packageJson.scripts['setup:database'];
writeFileSync('package.json', `${JSON.stringify(packageJson, null, 2)}\n`);

for (const path of scaffoldOnly) rmSync(path, { recursive: true, force: true });

// Last, because it needs the network. If it fails, the message says what's left to run.
if (choice === 'turso') {
	const commands = [
		['bun', 'remove', 'postgres', '@electric-sql/pglite'],
		['bun', 'add', '@libsql/client@^0.18.0']
	];
	for (const [i, command] of commands.entries()) {
		console.log(`$ ${command.join(' ')}`);
		const result = Bun.spawnSync(command, { stdout: 'inherit', stderr: 'inherit' });
		if (result.exitCode !== 0) {
			const left = commands.slice(i).map((c) => `  ${c.join(' ')}`).join('\n');
			fail(`Everything else is done, but installing packages failed. Finish with:\n${left}`);
		}
	}
}

const name = choice === 'turso' ? 'SQLite locally and Turso in production' : 'PostgreSQL';
console.log(`\nThis project now uses ${name}. Next:`);
if (existsSync('.env') && choice === 'turso') {
	console.log('- .env still has the PostgreSQL settings. Copy the database section from .env.example.');
}
if (existsSync('.pglite') && choice === 'turso') {
	console.log('- .pglite/ holds local PostgreSQL data that Turso doesn\'t use. Delete it when you no longer need it.');
}
console.log('- Run `bun run db:migrate` to create the local database, then commit the changes.');
