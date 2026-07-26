import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {isInitializeRequest} from '@modelcontextprotocol/sdk/types.js';
import {randomUUID} from 'node:crypto';
import {
	createServer,
	type IncomingMessage,
	type ServerResponse,
} from 'node:http';
import {createRemotionMcpServer} from './server.js';

const SESSION_HEADER = 'mcp-session-id';

const setCorsHeaders = (res: ServerResponse) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Content-Type, Authorization, mcp-session-id, mcp-protocol-version, last-event-id',
	);
	res.setHeader('Access-Control-Expose-Headers', SESSION_HEADER);
};

const sendJson = ({
	res,
	statusCode,
	body,
}: {
	res: ServerResponse;
	statusCode: number;
	body: unknown;
}) => {
	res.writeHead(statusCode, {'Content-Type': 'application/json'});
	res.end(JSON.stringify(body));
};

const sendJsonRpcError = ({
	res,
	statusCode,
	code,
	message,
}: {
	res: ServerResponse;
	statusCode: number;
	code: number;
	message: string;
}) => {
	sendJson({
		res,
		statusCode,
		body: {jsonrpc: '2.0', error: {code, message}, id: null},
	});
};

const readBody = async (req: IncomingMessage): Promise<unknown> => {
	// `setEncoding()` makes the stream yield strings and takes care of multi-byte
	// characters that are split across chunks.
	req.setEncoding('utf-8');

	let body = '';
	for await (const chunk of req) {
		body += String(chunk);
	}

	if (body.length === 0) {
		return undefined;
	}

	return JSON.parse(body);
};

const getSessionId = (req: IncomingMessage): string | null => {
	const header = req.headers[SESSION_HEADER];
	if (typeof header === 'string' && header.length > 0) {
		return header;
	}

	return null;
};

/**
 * Serves the MCP server over Streamable HTTP so that it can be added as a
 * remote connector, instead of having to be spawned locally over stdio.
 *
 * One session equals one `McpServer` instance, as required by the SDK.
 */
export const startHttpServer = async ({
	port,
	host,
	endpoint,
}: {
	port: number;
	host: string;
	endpoint: string;
}) => {
	const transports = new Map<string, StreamableHTTPServerTransport>();

	const createSession = async () => {
		const transport = new StreamableHTTPServerTransport({
			sessionIdGenerator: () => randomUUID(),
			onsessioninitialized: (sessionId) => {
				transports.set(sessionId, transport);
			},
			onsessionclosed: (sessionId) => {
				transports.delete(sessionId);
			},
		});

		transport.onclose = () => {
			if (transport.sessionId) {
				transports.delete(transport.sessionId);
			}
		};

		await createRemotionMcpServer().connect(transport);

		return transport;
	};

	const handleRequest = async (req: IncomingMessage, res: ServerResponse) => {
		setCorsHeaders(res);

		if (req.method === 'OPTIONS') {
			res.writeHead(204).end();
			return;
		}

		const url = new URL(req.url ?? '/', `http://${req.headers.host ?? host}`);

		if (url.pathname === '/health') {
			sendJson({res, statusCode: 200, body: {status: 'ok'}});
			return;
		}

		if (url.pathname !== endpoint) {
			sendJson({res, statusCode: 404, body: {error: 'Not found'}});
			return;
		}

		if (req.method === 'POST') {
			let body: unknown;
			try {
				body = await readBody(req);
			} catch {
				sendJsonRpcError({
					res,
					statusCode: 400,
					code: -32700,
					message: 'Parse error: the request body is not valid JSON.',
				});
				return;
			}

			const sessionId = getSessionId(req);
			const existing = sessionId ? transports.get(sessionId) : undefined;

			if (existing) {
				await existing.handleRequest(req, res, body);
				return;
			}

			if (sessionId !== null) {
				sendJsonRpcError({
					res,
					statusCode: 404,
					code: -32001,
					message: 'Session not found.',
				});
				return;
			}

			if (!isInitializeRequest(body)) {
				sendJsonRpcError({
					res,
					statusCode: 400,
					code: -32000,
					message: 'Bad Request: no session ID provided.',
				});
				return;
			}

			const transport = await createSession();
			await transport.handleRequest(req, res, body);
			return;
		}

		if (req.method === 'GET' || req.method === 'DELETE') {
			const sessionId = getSessionId(req);
			const transport = sessionId ? transports.get(sessionId) : undefined;

			if (!transport) {
				sendJsonRpcError({
					res,
					statusCode: 404,
					code: -32001,
					message: 'Session not found.',
				});
				return;
			}

			await transport.handleRequest(req, res);
			return;
		}

		sendJsonRpcError({
			res,
			statusCode: 405,
			code: -32000,
			message: `Method ${req.method} is not allowed.`,
		});
	};

	const httpServer = createServer((req, res) => {
		handleRequest(req, res).catch((err) => {
			// eslint-disable-next-line no-console
			console.error('Error while handling request:', err);
			if (!res.headersSent) {
				sendJsonRpcError({
					res,
					statusCode: 500,
					code: -32603,
					message: 'Internal server error.',
				});
			}
		});
	});

	await new Promise<void>((resolve, reject) => {
		httpServer.once('error', reject);
		httpServer.listen(port, host, () => {
			httpServer.off('error', reject);
			resolve();
		});
	});

	// eslint-disable-next-line no-console
	console.log(`remotion-mcp listening on http://${host}:${port}${endpoint}`);

	return httpServer;
};
