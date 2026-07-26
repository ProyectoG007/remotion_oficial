export const DEFAULT_COMPOSITION = 'social-campaign-template';
export const DEFAULT_REGION = 'us-east-1';
export const DEFAULT_FPS = 30;
export const DEFAULT_TIMEOUT_IN_MILLISECONDS = 5 * 60 * 1000;
export const POLL_INTERVAL_IN_MILLISECONDS = 2000;

export type RenderConfig = {
	serveUrl: string;
	functionName: string;
	region: string;
	composition: string;
	privacy: 'public' | 'private';
	fps: number;
	timeoutInMilliseconds: number;
};

export type RenderConfigResult =
	| {type: 'success'; config: RenderConfig}
	| {type: 'error'; reason: string};

const ENV_SERVE_URL = 'REMOTION_MCP_SERVE_URL';
const ENV_FUNCTION_NAME = 'REMOTION_MCP_FUNCTION_NAME';
const ENV_REGION = 'REMOTION_MCP_AWS_REGION';
const ENV_COMPOSITION = 'REMOTION_MCP_COMPOSITION';
const ENV_PRIVACY = 'REMOTION_MCP_PRIVACY';
const ENV_FPS = 'REMOTION_MCP_FPS';
const ENV_TIMEOUT = 'REMOTION_MCP_RENDER_TIMEOUT_MS';

const readString = (
	env: Record<string, string | undefined>,
	key: string,
): string | null => {
	const value = env[key];
	if (typeof value !== 'string' || value.trim().length === 0) {
		return null;
	}

	return value.trim();
};

const readPositiveNumber = ({
	env,
	key,
	fallback,
}: {
	env: Record<string, string | undefined>;
	key: string;
	fallback: number;
}): number | {error: string} => {
	const value = readString(env, key);
	if (value === null) {
		return fallback;
	}

	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed <= 0) {
		return {error: `${key} must be a positive number, but is "${value}".`};
	}

	return parsed;
};

/**
 * The render tool needs a deployed Remotion Lambda function and a bundled site.
 * Both are deploy-time concerns, so they are read from the environment instead
 * of being passed in by the model.
 */
export const getRenderConfig = (
	env: Record<string, string | undefined> = process.env,
): RenderConfigResult => {
	const serveUrl = readString(env, ENV_SERVE_URL);
	const functionName = readString(env, ENV_FUNCTION_NAME);

	const missing = [
		serveUrl === null ? ENV_SERVE_URL : null,
		functionName === null ? ENV_FUNCTION_NAME : null,
	].filter(Boolean);

	if (serveUrl === null || functionName === null) {
		return {
			type: 'error',
			reason: [
				`Rendering is not configured: ${missing.join(' and ')} ${
					missing.length === 1 ? 'is' : 'are'
				} missing.`,
				'',
				`Set ${ENV_SERVE_URL} to the URL of a bundled Remotion site (npx remotion lambda sites create)`,
				`and ${ENV_FUNCTION_NAME} to a deployed Lambda function (npx remotion lambda functions deploy).`,
				'',
				'See https://www.remotion.dev/docs/lambda/setup for the full setup.',
			].join('\n'),
		};
	}

	const privacyValue = readString(env, ENV_PRIVACY) ?? 'public';
	if (privacyValue !== 'public' && privacyValue !== 'private') {
		return {
			type: 'error',
			reason: `${ENV_PRIVACY} must be either "public" or "private", but is "${privacyValue}".`,
		};
	}

	const fps = readPositiveNumber({env, key: ENV_FPS, fallback: DEFAULT_FPS});
	if (typeof fps !== 'number') {
		return {type: 'error', reason: fps.error};
	}

	const timeoutInMilliseconds = readPositiveNumber({
		env,
		key: ENV_TIMEOUT,
		fallback: DEFAULT_TIMEOUT_IN_MILLISECONDS,
	});
	if (typeof timeoutInMilliseconds !== 'number') {
		return {type: 'error', reason: timeoutInMilliseconds.error};
	}

	return {
		type: 'success',
		config: {
			serveUrl,
			functionName,
			region: readString(env, ENV_REGION) ?? DEFAULT_REGION,
			composition: readString(env, ENV_COMPOSITION) ?? DEFAULT_COMPOSITION,
			privacy: privacyValue,
			fps,
			timeoutInMilliseconds,
		},
	};
};
