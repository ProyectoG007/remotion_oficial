export const DEFAULT_PORT = 3111;
export const DEFAULT_HOST = '127.0.0.1';
export const DEFAULT_ENDPOINT = '/mcp';

export type CliArgs = {
	transport: 'stdio' | 'http';
	port: number;
	host: string;
	endpoint: string;
};

export type CliArgsResult =
	| {type: 'success'; args: CliArgs}
	| {type: 'error'; reason: string};

export const HELP_TEXT = [
	'Usage: remotion-mcp [options]',
	'',
	'Options:',
	'  --http                Serve over Streamable HTTP instead of stdio.',
	`  --port <number>       Port to listen on in HTTP mode. Default: ${DEFAULT_PORT} (or $PORT).`,
	`  --host <host>         Host to bind to in HTTP mode. Default: ${DEFAULT_HOST}.`,
	`  --endpoint <path>     Path to serve the MCP endpoint on. Default: ${DEFAULT_ENDPOINT}.`,
	'  -h, --help            Show this help.',
	'',
	'Environment variables for the remotion-render-video tool:',
	'  REMOTION_MCP_SERVE_URL        Bundled Remotion site to render (required).',
	'  REMOTION_MCP_FUNCTION_NAME    Deployed Lambda function name (required).',
	'  REMOTION_MCP_AWS_REGION       AWS region. Default: us-east-1.',
	'  REMOTION_MCP_COMPOSITION      Composition ID. Default: social-campaign-template.',
	'  REMOTION_MCP_PRIVACY          "public" or "private". Default: public.',
	'  REMOTION_MCP_FPS              FPS of the composition. Default: 30.',
	'  REMOTION_MCP_RENDER_TIMEOUT_MS  How long to wait for a render. Default: 300000.',
].join('\n');

/**
 * A flag value may be passed as `--port 3000` or `--port=3000`.
 */
const readFlagValue = ({
	argv,
	index,
	flag,
}: {
	argv: string[];
	index: number;
	flag: string;
}): {value: string; nextIndex: number} | {error: string} => {
	const arg = argv[index];
	const inline = arg.slice(flag.length);

	if (inline.startsWith('=')) {
		const value = inline.slice(1);
		if (value.length === 0) {
			return {error: `${flag} was passed without a value.`};
		}

		return {value, nextIndex: index + 1};
	}

	const next = argv[index + 1];
	if (next === undefined || next.startsWith('-')) {
		return {error: `${flag} was passed without a value.`};
	}

	return {value: next, nextIndex: index + 2};
};

const parsePort = (value: string): number | {error: string} => {
	const parsed = Number(value);
	if (!Number.isInteger(parsed) || parsed < 0 || parsed > 65535) {
		return {error: `"${value}" is not a valid port.`};
	}

	return parsed;
};

export const parseCliArgs = (
	argv: string[],
	env: Record<string, string | undefined> = process.env,
): CliArgsResult => {
	let transport: CliArgs['transport'] = 'stdio';
	let port: number | null = null;
	let host = DEFAULT_HOST;
	let endpoint = DEFAULT_ENDPOINT;

	let i = 0;
	while (i < argv.length) {
		const arg = argv[i];

		if (arg === '--http') {
			transport = 'http';
			i++;
			continue;
		}

		if (arg === '--stdio') {
			transport = 'stdio';
			i++;
			continue;
		}

		if (arg.startsWith('--port')) {
			const read = readFlagValue({argv, index: i, flag: '--port'});
			if ('error' in read) {
				return {type: 'error', reason: read.error};
			}

			const parsed = parsePort(read.value);
			if (typeof parsed !== 'number') {
				return {type: 'error', reason: parsed.error};
			}

			port = parsed;
			i = read.nextIndex;
			continue;
		}

		if (arg.startsWith('--host')) {
			const read = readFlagValue({argv, index: i, flag: '--host'});
			if ('error' in read) {
				return {type: 'error', reason: read.error};
			}

			host = read.value;
			i = read.nextIndex;
			continue;
		}

		if (arg.startsWith('--endpoint')) {
			const read = readFlagValue({argv, index: i, flag: '--endpoint'});
			if ('error' in read) {
				return {type: 'error', reason: read.error};
			}

			endpoint = read.value.startsWith('/') ? read.value : `/${read.value}`;
			i = read.nextIndex;
			continue;
		}

		return {
			type: 'error',
			reason: `Unknown option "${arg}".`,
		};
	}

	if (port === null) {
		const fromEnv = env.PORT;
		if (fromEnv !== undefined && fromEnv.trim().length > 0) {
			const parsed = parsePort(fromEnv.trim());
			if (typeof parsed !== 'number') {
				return {type: 'error', reason: `$PORT: ${parsed.error}`};
			}

			port = parsed;
		}
	}

	return {
		type: 'success',
		args: {transport, port: port ?? DEFAULT_PORT, host, endpoint},
	};
};
