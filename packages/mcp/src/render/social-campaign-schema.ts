import * as z from 'zod/v4';

export const ORIENTATIONS = ['landscape', 'portrait', 'square'] as const;

export type Orientation = (typeof ORIENTATIONS)[number];

export const ORIENTATION_DIMENSIONS: Record<
	Orientation,
	{width: number; height: number}
> = {
	landscape: {width: 1920, height: 1080},
	portrait: {width: 1080, height: 1920},
	square: {width: 1080, height: 1080},
};

const socialProfileSchema = z.object({
	platform: z
		.string()
		.describe('Name of the platform, for example "instagram" or "tiktok".'),
	username: z.string().describe('The handle, for example "@remotion".'),
	url: z.string().optional().describe('Link to the profile.'),
	iconUrl: z
		.string()
		.optional()
		.describe(
			'Publicly reachable URL of the platform icon. Must be an absolute URL because the renderer has no access to local files.',
		),
});

/**
 * Mirrors the `SocialCampaignInput` props of the `social-campaign-template`
 * composition. Kept as a raw shape because `registerTool()` expects one.
 */
export const socialCampaignPropsSchema = {
	title: z.string().describe('The headline of the video. Keep it short.'),
	subtitle: z.string().optional().describe('Secondary line below the title.'),
	description: z
		.string()
		.optional()
		.describe('One or two sentences describing the offering.'),
	objective: z
		.string()
		.optional()
		.describe('The goal of the campaign, rendered as a muted line.'),
	backgroundColor: z
		.string()
		.optional()
		.describe('CSS color for the background, for example "#0f172a".'),
	brandLogoUrl: z
		.string()
		.optional()
		.describe('Absolute URL of the brand logo, shown in the top left corner.'),
	brandName: z.string().optional().describe('Brand name shown next to the logo.'),
	imageUrl: z
		.string()
		.optional()
		.describe('Absolute URL of the hero image of the campaign.'),
	includeSocials: z
		.boolean()
		.optional()
		.describe('Whether to render the list of social profiles.'),
	socials: z
		.array(socialProfileSchema)
		.optional()
		.describe('Social profiles to display. Only used if `includeSocials` is true.'),
	showWebsite: z
		.boolean()
		.optional()
		.describe('Whether to render the website URL in the top right corner.'),
	websiteUrl: z
		.string()
		.optional()
		.describe('The website to display. Only used if `showWebsite` is true.'),
	hasAudio: z.boolean().optional().describe('Whether the video has a soundtrack.'),
	audioTrackUrl: z
		.string()
		.optional()
		.describe('Absolute URL of the soundtrack. You must have the rights to it.'),
	audioVolume: z
		.number()
		.min(0)
		.max(1)
		.optional()
		.describe('Volume of the soundtrack between 0 and 1.'),
	ctaText: z.string().optional().describe('Label of the call to action button.'),
};

export const renderOptionsSchema = {
	orientation: z
		.enum(ORIENTATIONS)
		.optional()
		.describe(
			'Aspect ratio of the output. "portrait" for TikTok, Reels and Shorts, "landscape" for YouTube, "square" for feeds. Defaults to the dimensions of the composition.',
		),
	durationInSeconds: z
		.number()
		.positive()
		.max(600)
		.optional()
		.describe(
			'Length of the video in seconds. Defaults to the duration of the composition.',
		),
};

export const socialCampaignPropsObject = z.object(socialCampaignPropsSchema);

export type SocialCampaignProps = z.infer<typeof socialCampaignPropsObject>;
