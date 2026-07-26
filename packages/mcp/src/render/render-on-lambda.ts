import {POLL_INTERVAL_IN_MILLISECONDS, type RenderConfig} from './config.js';

/**
 * Minimal shape of the `@remotion/lambda-client` API that is used here.
 * Declared locally so that `@remotion/mcp` does not need to depend on the
 * package (and with it the AWS SDK) at build time.
 */
type LambdaClient = {
	renderMediaOnLambda: (input: {
		region: string;
		functionName: string;
		serveUrl: string;
		composition: string;
		codec: 'h264';
		inputProps: Record<string, unknown>;
		privacy: 'public' | 'private';
		downloadBehavior: {type: 'play-in-browser'};
		forceWidth?: number | null;
		forceHeight?: number | null;
		forceDurationInFrames?: number | null;
	}) => Promise<{renderId: string; bucketName: string}>;
	getRenderProgress: (input: {
		functionName: string;
		bucketName: string;
		renderId: string;
		region: string;
	}) => Promise<{
		done: boolean;
		outputFile: string | null;
		overallProgress: number;
		fatalErrorEncountered: boolean;
		errors: {message: string}[];
		outputSizeInBytes: number | null;
		timeToFinish: number | null;
	}>;
};

// Indirected so that TypeScript does not need the optional peer dependency to
// be installed in order to type-check this package.
const LAMBDA_CLIENT_SPECIFIER = '@remotion/lambda-client';

const importLambdaClient = async (): Promise<LambdaClient> => {
	try {
		const mod: unknown = await import(LAMBDA_CLIENT_SPECIFIER);
		return mod as LambdaClient;
	} catch {
		throw new Error(
			[
				'@remotion/lambda-client is not installed, but is required to render videos.',
				'Install it with: npm i @remotion/lambda-client --save-exact',
			].join('\n'),
		);
	}
};

const sleep = (ms: number) => {
	return new Promise<void>((resolve) => {
		setTimeout(resolve, ms);
	});
};

export type RenderOverrides = {
	forceWidth: number | null;
	forceHeight: number | null;
	forceDurationInFrames: number | null;
};

export type RenderResult = {
	outputFile: string;
	renderId: string;
	outputSizeInBytes: number | null;
	timeToFinish: number | null;
};

export const renderOnLambda = async ({
	config,
	inputProps,
	overrides,
}: {
	config: RenderConfig;
	inputProps: Record<string, unknown>;
	overrides: RenderOverrides;
}): Promise<RenderResult> => {
	const {renderMediaOnLambda, getRenderProgress} = await importLambdaClient();

	const {renderId, bucketName} = await renderMediaOnLambda({
		region: config.region,
		functionName: config.functionName,
		serveUrl: config.serveUrl,
		composition: config.composition,
		codec: 'h264',
		inputProps,
		privacy: config.privacy,
		// So that the returned URL plays in the browser instead of downloading
		downloadBehavior: {type: 'play-in-browser'},
		forceWidth: overrides.forceWidth,
		forceHeight: overrides.forceHeight,
		forceDurationInFrames: overrides.forceDurationInFrames,
	});

	const startedAt = Date.now();

	while (true) {
		const progress = await getRenderProgress({
			functionName: config.functionName,
			bucketName,
			renderId,
			region: config.region,
		});

		if (progress.fatalErrorEncountered) {
			const message =
				progress.errors.length === 0
					? 'No error message was reported.'
					: progress.errors.map((error) => error.message).join('\n');
			throw new Error(`The render failed: ${message}`);
		}

		if (progress.done) {
			if (progress.outputFile === null) {
				throw new Error(
					'The render reported to be done but did not return an output file.',
				);
			}

			return {
				outputFile: progress.outputFile,
				renderId,
				outputSizeInBytes: progress.outputSizeInBytes,
				timeToFinish: progress.timeToFinish,
			};
		}

		if (Date.now() - startedAt > config.timeoutInMilliseconds) {
			throw new Error(
				[
					`The render did not finish within ${
						config.timeoutInMilliseconds / 1000
					} seconds and was given up on.`,
					`It may still complete. Render ID: ${renderId}, bucket: ${bucketName}.`,
					`Progress was at ${Math.round(progress.overallProgress * 100)}%.`,
				].join(' '),
			);
		}

		await sleep(POLL_INTERVAL_IN_MILLISECONDS);
	}
};
