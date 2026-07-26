import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {registerDocumentationTool} from './tools/documentation.js';
import {registerRenderVideoTool} from './tools/render-video.js';

export const createRemotionMcpServer = (): McpServer => {
	const server = new McpServer({
		name: 'remotion-mcp',
		version: '1.0.0',
	});

	registerDocumentationTool(server);
	registerRenderVideoTool(server);

	return server;
};
