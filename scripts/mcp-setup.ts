// Writes the MCP server config for AI coding tools. Each tool keeps its MCP servers in
// its own file and format, so this script holds the one list and writes it for each.
//
//   bun run mcp:setup <tool...> [--agent-key]
//
// Tools: claude, cursor, vscode, kiro, codex, gemini, windsurf
//
// Stripe signs in with OAuth by default. On first use, the tool opens Stripe's consent
// page, where you grant access to the project's sandbox only. Where the tool allows it,
// the script also makes the tool ask before every Stripe tool call.
//
// --agent-key is for agents that run without a person, for example in CI. Stripe then
// signs in with a sandbox Agent API key from the STRIPE_AGENT_API_KEY environment
// variable, and the script refuses a live-mode key. It also leaves out the Stripe
// approval settings: Claude Code's ask rule, for one, would override the run's own
// approval. Unattended runs still refuse tool calls that need approval, so the run must
// allow Stripe's tools itself, for example claude -p "..." --allowedTools "mcp__stripe__*".
// The key's permissions are then the limit (docs/stripe-agent-permissions.md). Never
// commit the files this mode writes (ci.yml fails if you do). Run the script again
// without --agent-key to switch back.
//
// Existing files are updated in place: only these servers' entries are replaced.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

type Remote = { url: string; agentKeyEnv?: string; askBeforeEachCall?: boolean };
type Local = { command: string; args: string[] };
type Server = Remote | Local;

const servers: Record<string, Server> = {
	// Stripe's hosted server. Which tools work depends on the OAuth grant or the key.
	stripe: {
		url: 'https://mcp.stripe.com',
		agentKeyEnv: 'STRIPE_AGENT_API_KEY',
		askBeforeEachCall: true
	},
	shadcn: { command: 'bunx', args: ['--bun', 'shadcn@latest', 'mcp'] },
	svelte: { command: 'bunx', args: ['--bun', 'sv', 'mcp'] }
};

const isRemote = (server: Server): server is Remote => 'url' in server;
const local = (server: Local) => ({ command: server.command, args: server.args });

process.chdir(join(import.meta.dir, '..'));

function fail(message: string): never {
	console.error(`\n${message}`);
	process.exit(1);
}

function writeFile(path: string, text: string) {
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, text);
}

// Reads a JSON file (or {} if it doesn't exist), lets `update` change it, and writes it
// back with the file's own indentation
function updateJson(path: string, update: (data: Record<string, any>) => void) {
	let data: Record<string, any> = {};
	let indent: string | number = 2;
	if (existsSync(path)) {
		const text = readFileSync(path, 'utf8');
		try {
			data = JSON.parse(text);
		} catch {
			fail(`${path} isn't plain JSON (comments aren't supported). Fix or delete it, then run this again.`);
		}
		indent = text.match(/^[ \t]+(?=")/m)?.[0] ?? 2;
	}
	update(data);
	writeFile(path, `${JSON.stringify(data, null, indent)}\n`);
}

type Options = {
	agentKey: boolean;
	// How the tool's config refers to an environment variable
	envRef: (name: string) => string;
};

// The Authorization header that sends the Agent API key, in --agent-key mode
const authHeaders = (server: Remote, { agentKey, envRef }: Options) =>
	agentKey && server.agentKeyEnv ? { headers: { Authorization: `Bearer ${envRef(server.agentKeyEnv)}` } } : {};

// Asks before each call, except for a server that uses the Agent API key in --agent-key
// mode, where the unattended run approves its tools instead
const asks = (server: Server, { agentKey }: Options) =>
	isRemote(server) && !!server.askBeforeEachCall && !(agentKey && server.agentKeyEnv);

// Sets each server's entry under `key` in a JSON file
function writeServers(path: string, key: string, entry: (server: Server) => Record<string, unknown>) {
	updateJson(path, (data) => {
		data[key] ??= {};
		for (const [name, server] of Object.entries(servers)) data[key][name] = entry(server);
	});
	return path;
}

type Tool = {
	envRef: (name: string) => string;
	// Writes the files and returns their paths
	write: (options: Options) => string[];
	// What the person does next
	notes: (options: Options) => string[];
};

const dollarBraces = (name: string) => `\${${name}}`;
const envColon = (name: string) => `\${env:${name}}`;

// The remote servers, which sign in with OAuth unless --agent-key gives them a key
const remoteNames = Object.keys(servers).filter((name) => isRemote(servers[name]));
const oauthOnlyNames = remoteNames.filter((name) => !(servers[name] as Remote).agentKeyEnv);
const list = (names: string[]) => names.join(' and ');

// `how` says how to sign in with OAuth, with {servers} for the server names. In
// --agent-key mode, `allow` says how the unattended run allows Stripe's tools.
const signIn =
	(how: string, allow = "with the tool's own option for approving MCP tools") =>
	({ agentKey }: Options) =>
		agentKey
			? [
					'Set STRIPE_AGENT_API_KEY in the environment the tool runs in.',
					`Unattended runs refuse tool calls that need approval. Allow Stripe's tools in the run ${allow}.`,
					...(oauthOnlyNames.length
						? [`${list(oauthOnlyNames)} only signs in with OAuth, so unattended runs can't use it.`]
						: [])
				]
			: [how.replace('{servers}', list(remoteNames))];

// A note that only applies when a person approves tool calls
const interactiveOnly = ({ agentKey }: Options, note: string) => (agentKey ? [] : [note]);

const tools: Record<string, Tool> = {
	claude: {
		envRef: dollarBraces,
		write: (options) => {
			const files = [
				writeServers('.mcp.json', 'mcpServers', (server) =>
					isRemote(server) ? { type: 'http', url: server.url, ...authHeaders(server, options) } : local(server)
				)
			];
			// Ask rules win over allow rules, so a broad allow rule can't skip the prompt
			const settings = '.claude/settings.json';
			const rules = Object.keys(servers)
				.filter((name) => asks(servers[name], options))
				.map((name) => `mcp__${name}__*`);
			if (rules.length === 0 && !existsSync(settings)) return files;
			const ours = (rule: string) =>
				Object.keys(servers).some((name) => rule === `mcp__${name}` || rule.startsWith(`mcp__${name}__`));
			updateJson(settings, (data) => {
				const ask: string[] = [...(data.permissions?.ask ?? []).filter((rule: string) => !ours(rule)), ...rules];
				data.permissions = { ...data.permissions, ask };
				if (ask.length === 0) delete data.permissions.ask;
				if (Object.keys(data.permissions).length === 0) delete data.permissions;
			});
			return [...files, settings];
		},
		notes: (options) => [
			'Start Claude Code here and approve the project MCP servers when it asks.',
			...signIn('Run /mcp and authenticate {servers}.', 'with --allowedTools "mcp__stripe__*"')(options)
		]
	},
	cursor: {
		envRef: envColon,
		write: (options) => [
			writeServers('.cursor/mcp.json', 'mcpServers', (server) =>
				isRemote(server) ? { url: server.url, ...authHeaders(server, options) } : local(server)
			)
		],
		notes: (options) => [
			"Turn the servers on in Cursor's MCP settings.",
			...signIn('Sign in to {servers} there.')(options),
			...interactiveOnly(options, "Approval is a personal setting in Cursor: don't let it run Stripe tools without asking.")
		]
	},
	vscode: {
		envRef: envColon,
		write: (options) => [
			writeServers('.vscode/mcp.json', 'servers', (server) =>
				isRemote(server)
					? { type: 'http', url: server.url, ...authHeaders(server, options) }
					: { type: 'stdio', ...local(server) }
			)
		],
		notes: (options) => [
			'Start the servers from .vscode/mcp.json.',
			...signIn('Sign in to {servers} when VS Code asks.')(options),
			...interactiveOnly(options, 'Approval is a personal setting in VS Code: don\'t choose "Always allow" for Stripe tools.')
		]
	},
	kiro: {
		envRef: dollarBraces,
		write: (options) => {
			const file = writeServers('.kiro/settings/mcp.json', 'mcpServers', (server) =>
				isRemote(server)
					? {
							url: server.url,
							...authHeaders(server, options),
							// An empty list means Kiro asks before every call
							...(asks(server, options) ? { autoApprove: [] } : {})
						}
					: local(server)
			);
			// Kiro only loads MCP servers in a workspace where this setting is on
			updateJson('.vscode/settings.json', (data) => {
				data['kiroAgent.configureMCP'] = 'Enabled';
			});
			return [file, '.vscode/settings.json'];
		},
		notes: (options) => [
			'Kiro now loads MCP servers in this workspace (kiroAgent.configureMCP in .vscode/settings.json).',
			...signIn('Sign in to {servers} from the MCP Servers view in the Kiro panel.')(options),
			...(options.agentKey ? ['Kiro also asks once before it uses STRIPE_AGENT_API_KEY: approve the variable.'] : [])
		]
	},
	codex: {
		envRef: dollarBraces,
		write: (options) => {
			const path = '.codex/config.toml';
			const begin = '# >>> bun run mcp:setup writes this block';
			const end = '# <<< bun run mcp:setup';
			const block = [begin];
			for (const [name, server] of Object.entries(servers)) {
				block.push(`[mcp_servers.${name}]`);
				if (isRemote(server)) {
					block.push(`url = ${JSON.stringify(server.url)}`);
					if (options.agentKey && server.agentKeyEnv) {
						block.push(`bearer_token_env_var = ${JSON.stringify(server.agentKeyEnv)}`);
					}
					if (asks(server, options)) block.push('default_tools_approval_mode = "prompt"');
				} else {
					const args = server.args.map((arg) => JSON.stringify(arg)).join(', ');
					block.push(`command = ${JSON.stringify(server.command)}`, `args = [${args}]`);
				}
				block.push('');
			}
			block.push(end);

			// Keep whatever else the file holds, outside this script's block. A block with a
			// missing or extra marker can't be replaced safely, so stop instead.
			const existing = existsSync(path) ? readFileSync(path, 'utf8') : '';
			const count = (marker: string) => existing.split(marker).length - 1;
			const start = existing.indexOf(begin);
			const stop = existing.indexOf(end);
			if (count(begin) > 1 || count(end) > 1 || count(begin) !== count(end) || stop < start) {
				fail(
					`${path} has a damaged mcp:setup block. It needs one "${begin}" line followed by one ` +
						`"${end}" line, or neither. Fix the file, then run this again.`
				);
			}
			const before = start === -1 ? existing : existing.slice(0, start);
			const after = start === -1 ? '' : existing.slice(stop + end.length);
			for (const name of Object.keys(servers)) {
				if ((before + after).includes(`[mcp_servers.${name}]`)) {
					fail(`${path} already defines [mcp_servers.${name}] outside this script's block. Remove it, then run this again.`);
				}
			}
			const text = `${[before.trimEnd(), block.join('\n'), after.trim()].filter(Boolean).join('\n\n')}\n`;
			try {
				Bun.TOML.parse(text);
			} catch (error) {
				fail(`Writing ${path} would make it invalid TOML: ${error}`);
			}
			writeFile(path, text);
			return [path];
		},
		notes: (options) => [
			'Codex reads .codex/config.toml only in a project you trust.',
			...signIn(
				'Run `codex mcp login <server>` to sign in to {servers}.',
				'with an approval setting your Codex version honors in `codex exec`. Some versions cancel every MCP call there, so test it first'
			)(options)
		]
	},
	gemini: {
		envRef: dollarBraces,
		write: (options) => [
			writeServers('.gemini/settings.json', 'mcpServers', (server) =>
				isRemote(server)
					? {
							httpUrl: server.url,
							...authHeaders(server, options),
							...(asks(server, options) ? { trust: false } : {})
						}
					: local(server)
			)
		],
		notes: signIn(
			'Gemini CLI asks you to sign in to {servers} when it first connects (or run /mcp auth <server>).',
			'with a user policy rule: mcpName = "stripe", decision = "allow"'
		)
	},
	windsurf: {
		envRef: envColon,
		// Windsurf has no project file, so this prints the servers instead
		write: (options) => {
			const entries = Object.entries(servers).map(([name, server]) => [
				name,
				isRemote(server) ? { serverUrl: server.url, ...authHeaders(server, options) } : local(server)
			]);
			console.log(JSON.stringify({ mcpServers: Object.fromEntries(entries) }, null, 2));
			return [];
		},
		notes: (options) => [
			'Windsurf has no project MCP file. Add the servers above to ~/.codeium/windsurf/mcp_config.json.',
			...signIn('Sign in to {servers} when Windsurf asks.')(options),
			...interactiveOnly(options, 'Approval is a personal setting in Windsurf: keep Stripe tools asking before they run.')
		]
	}
};

const args = process.argv.slice(2);
const agentKey = args.includes('--agent-key');
const chosen = args.filter((arg) => arg !== '--agent-key');
const unknown = chosen.filter((name) => !(name in tools));
if (chosen.length === 0 || unknown.length > 0) {
	fail(
		`${unknown.length ? `Unknown tool: ${unknown.join(', ')}\n` : ''}` +
			`Usage: bun run mcp:setup <tool...> [--agent-key]\nTools: ${Object.keys(tools).join(', ')}`
	);
}

// Agents never get a live-mode key. The files only refer to the variable, so this can
// only check the value when the variable is set while the script runs.
if (agentKey) {
	for (const server of Object.values(servers)) {
		if (isRemote(server) && server.agentKeyEnv && process.env[server.agentKeyEnv]?.includes('_live_')) {
			fail(
				`${server.agentKeyEnv} holds a live-mode key. Agents only ever get sandbox keys: ` +
					"create an Agent API key in the project's Stripe sandbox."
			);
		}
	}
}

for (const name of chosen) {
	const tool = tools[name];
	const options = { agentKey, envRef: tool.envRef };
	console.log(`\n${name}:`);
	const files = tool.write(options);
	if (files.length) console.log(`- Wrote ${files.join(', ')}`);
	for (const note of tool.notes(options)) console.log(`- ${note}`);
}

console.log(
	agentKey
		? '\nStripe signs in with the sandbox Agent API key in STRIPE_AGENT_API_KEY. ' +
				"Never commit these files: ci.yml fails on committed MCP config that uses the key."
		: "\nWhen Stripe asks, grant access to the project's sandbox only, never live mode."
);
console.log('What agents may do in Stripe: docs/stripe-agent-permissions.md');
