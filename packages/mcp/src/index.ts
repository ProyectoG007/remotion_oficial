#! /usr/bin/env node

import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {HELP_TEXT, parseCliArgs} from './cli-args.js';
import {startHttpServer} from './http-server.js';
import {createRemotionMcpServer} from './server.js';

const argv = process.argv.slice(2);

if (argv.includes('--help') || argv.includes('-h')) {
	// eslint-disable-next-line no-console
	console.log(HELP_TEXT);
	process.exit(0);
}

const parsed = parseCliArgs(argv);

if (parsed.type === 'error') {
	// eslint-disable-next-line no-console
	console.error(`${parsed.reason}\n\n${HELP_TEXT}`);
	process.exit(1);
}

const {transport, port, host, endpoint} = parsed.args;

if (transport === 'http') {
	await startHttpServer({port, host, endpoint});
} else {
	const stdioTransport = new StdioServerTransport();
	await createRemotionMcpServer().connect(stdioTransport);
}
