import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {getRenderConfig} from '../render/config.js';
import {renderOnLambda, type RenderOverrides} from '../render/render-on-lambda.js';
import {
	ORIENTATION_DIMENSIONS,
	renderOptionsSchema,
	socialCampaignPropsSchema,
	type Orientation,
} from '../render/social-campaign-schema.js';

type ToolInput = {
	orientation?: Orientation;
	durationInSeconds?: number;
} & Record<string, unknown>;

const textResult = (text: string, isError?: boolean) => {
	return {
		content: [{type: 'text' as const, text}],
		...(isError ? {isError: true} : {}),
	};
};

const getOverrides = ({
	orientation,
	durationInSeconds,
	fps,
}: {
	orientation: Orientation | undefined;
	durationInSeconds: number | undefined;
	fps: number;
}): RenderOverrides => {
	const dimensions = orientation ? ORIENTATION_DIMENSIONS[orientation] : null;

	return {
		forceWidth: dimensions?.width ?? null,
		forceHeight: dimensions?.height ?? null,
		forceDurationInFrames: durationInSeconds
			? Math.max(1, Math.round(durationInSeconds * fps))
			: null,
	};
};

const formatSize = (bytes: number | null) => {
	if (bytes === null) {
		return null;
	}

	return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

export const registerRenderVideoTool = (server: McpServer) => {
	server.registerTool(
		'remotion-render-video',
		{
			title: 'Render a social campaign video',
			description: [
				'Renders a branded social media campaign video with Remotion and returns a URL to the finished MP4.',
				'Use this when the user asks for a promo, launch, announcement or campaign video.',
				'All asset URLs must be absolute and publicly reachable, because the render happens on a remote machine.',
				'Rendering takes a while, the tool only returns once the video is finished.',
			].join(' '),
			inputSchema: {...socialCampaignPropsSchema, ...renderOptionsSchema},
		},
		async (input: ToolInput) => {
			const configResult = getRenderConfig();
			if (configResult.type === 'error') {
				return textResult(configResult.reason, true);
			}

			const {config} = configResult;
			const {orientation, durationInSeconds, ...inputProps} = input;

			try {
				const result = await renderOnLambda({
					config,
					inputProps,
					overrides: getOverrides({
						orientation,
						durationInSeconds,
						fps: config.fps,
					}),
				});

				const size = formatSize(result.outputSizeInBytes);

				return textResult(
					[
						'The video was rendered successfully.',
						`URL: ${result.outputFile}`,
						`Render ID: ${result.renderId}`,
						...(size ? [`Size: ${size}`] : []),
						...(result.timeToFinish
							? [`Took: ${(result.timeToFinish / 1000).toFixed(1)}s`]
							: []),
					].join('\n'),
				);
			} catch (err) {
				return textResult(
					`Rendering failed: ${(err as Error).message}`,
					true,
				);
			}
		},
	);
};
