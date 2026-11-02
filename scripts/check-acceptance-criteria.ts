// Checks that tests/acceptance/criteria.md and the Playwright acceptance tests agree:
// every criterion has a test, every test names at least one criterion, and every ID a
// test names is listed. Runs `playwright test --list`, so no browser or server is needed.
//
// Usage: bun run test:criteria

const CRITERIA_FILE = 'tests/acceptance/criteria.md';
const ID = /\bAC-\d+\b/g;
const CRITERION_LINE = /^- \*\*(AC-\d+)\*\*: \S/;

type Suite = { title: string; file: string; specs?: Spec[]; suites?: Suite[] };
type Spec = { title: string; file: string; line: number };

const problems: string[] = [];

// 1. Criteria
const criteria = new Map<string, number>(); // ID -> line number
const lines = (await Bun.file(CRITERIA_FILE).text()).split('\n');
lines.forEach((line, index) => {
	if (!line.startsWith('- ') || !line.match(ID)) return;
	const match = CRITERION_LINE.exec(line);
	if (!match) {
		problems.push(`${CRITERIA_FILE}:${index + 1} isn't in the format "- **AC-NN**: description": ${line}`);
		return;
	}
	const id = match[1];
	if (criteria.has(id)) {
		problems.push(`${CRITERIA_FILE}:${index + 1} defines ${id} again (first defined on line ${criteria.get(id)})`);
		return;
	}
	criteria.set(id, index + 1);
});

// 2. Tests (titles include any test.describe titles around them)
const list = Bun.spawnSync(['bun', 'x', 'playwright', 'test', '--list', '--reporter=json'], {
	env: { ...process.env, FORCE_COLOR: '0' }
});
if (list.exitCode !== 0) {
	console.error('playwright test --list failed:\n' + list.stderr.toString() + list.stdout.toString());
	process.exit(1);
}
const report: { suites: Suite[] } = JSON.parse(list.stdout.toString());

const tests: { title: string; location: string; ids: string[] }[] = [];
const seen = new Set<string>();
function collect(suite: Suite, parents: string[]) {
	// The top-level suites are files, whose titles are paths, so they're skipped
	const path = suite.title && suite.title !== suite.file ? [...parents, suite.title] : parents;
	for (const spec of suite.specs ?? []) {
		const location = `${spec.file}:${spec.line}`;
		if (seen.has(location)) continue; // the same test appears once per browser project
		seen.add(location);
		const title = [...path, spec.title].join(' › ');
		tests.push({ title, location: `tests/acceptance/${location}`, ids: [...new Set(title.match(ID) ?? [])] });
	}
	for (const child of suite.suites ?? []) collect(child, path);
}
report.suites.forEach((suite) => collect(suite, []));

// 3. Compare
const tested = new Set<string>();
for (const test of tests) {
	if (test.ids.length === 0) problems.push(`${test.location} "${test.title}" has no criterion ID in its title`);
	for (const id of test.ids) {
		if (criteria.has(id)) tested.add(id);
		else problems.push(`${test.location} "${test.title}" names ${id}, which isn't in ${CRITERIA_FILE}`);
	}
}
for (const [id, line] of criteria) {
	if (!tested.has(id)) problems.push(`${CRITERIA_FILE}:${line} ${id} has no acceptance test`);
}

if (problems.length > 0) {
	console.error(`Acceptance criteria check failed (${problems.length} problem${problems.length === 1 ? '' : 's'}):`);
	for (const problem of problems) console.error(`  - ${problem}`);
	process.exit(1);
}
console.log(`Acceptance criteria check passed: ${criteria.size} criteria, ${tests.length} tests, every criterion covered.`);
