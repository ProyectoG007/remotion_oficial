import React from 'react';
import {AbsoluteFill, Img, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';

export type SocialProfile = {
	platform: string;
	username: string;
	url?: string;
	iconUrl?: string;
};

export type SocialCampaignInput = {
	title: string;
	subtitle?: string;
	description?: string;
	objective?: string;
	backgroundColor?: string;
	brandLogoUrl?: string;
	brandName?: string;
	imageUrl?: string;
	includeSocials?: boolean;
	socials?: SocialProfile[];
	showWebsite?: boolean;
	websiteUrl?: string;
	hasAudio?: boolean;
	audioTrackUrl?: string;
	audioVolume?: number;
	ctaText?: string;
};

const safe = (value: string | undefined, fallback: string): string => {
	if (typeof value !== 'string' || value.trim().length === 0) {
		return fallback;
	}
	return value;
};

export const SocialCampaignTemplate: React.FC<SocialCampaignInput> = ({
	title,
	subtitle,
	description,
	objective,
	backgroundColor = '#0d0f1d',
	brandLogoUrl,
	brandName,
	imageUrl,
	includeSocials = false,
	socials = [],
	showWebsite = false,
	websiteUrl,
	ctaText = 'Acceder ahora',
}) => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();

	const textOpacity = Math.min(1, frame / 20);
	const textY = 50 + Math.max(0, 40 - Math.max(0, frame));

	return (
		<AbsoluteFill style={{backgroundColor, color: 'white', fontFamily: 'sans-serif', padding: 40}}>
			{brandLogoUrl ? (
				<div style={{position: 'absolute', top: 24, left: 24, display: 'flex', alignItems: 'center', gap: 12}}>
					<Img src={brandLogoUrl} style={{width: 64, height: 64, objectFit: 'contain'}} />
					<div style={{fontSize: 22, fontWeight: 600}}>{safe(brandName, 'Marca')}</div>
				</div>
			) : null}

			<div style={{position: 'absolute', top: `${textY}px`, left: 60, right: 60, opacity: textOpacity}}>
				<h1 style={{fontSize: 80, lineHeight: 1.1, margin: 0}}>{safe(title, 'Título del video')}</h1>
				{subTitleElement(subtitle)}
				<p style={{fontSize: 28, maxWidth: 820, marginTop: 20}}>{safe(description, 'Descripción del contenido')}</p>
				<p style={{fontSize: 24, color: '#a2a6b6', marginTop: 12}}>{safe(objective, 'Objetivo: comunicar la propuesta')}</p>
			</div>

			{imageUrl ? (
				<Sequence from={10} durationInFrames={90}>
					<div
						style={{
							position: 'absolute',
							right: 60,
							top: 140,
							borderRadius: 24,
							overflow: 'hidden',
							height: 500,
							width: 860,
							boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
						}}>
						<Img
							style={{width: '100%', height: '100%', objectFit: 'cover'}}
							src={imageUrl}
							alt="Imagen de campaña"
						/>
					</div>
				</Sequence>
			) : null}

			<div
				style={{
					position: 'absolute',
					bottom: 72,
					left: 60,
					fontSize: 30,
					fontWeight: 700,
					color: '#fff',
					padding: '12px 24px',
					backgroundColor: '#1f6ad7',
					borderRadius: 12,
					width: 360,
					textAlign: 'center',
					transform: `translateY(${80 - frame * 2}px)`,
					opacity: Math.min(1, frame / 25),
				}}>
				{safe(ctaText, 'Comenzar ahora')}
			</div>

			{includeSocials && socials.length > 0 ? (
				<div
					style={{
						position: 'absolute',
						bottom: 22,
						left: 520,
						right: 60,
						borderRadius: 12,
						padding: 16,
						background: 'rgba(0,0,0,0.35)',
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
						gap: 8,
					}}>
					{socials.map((social) => (
						<div
							key={`${social.platform}-${social.username}`}
							style={{display: 'flex', alignItems: 'center', gap: 8}}
						>
							{social.iconUrl ? (
								<Img src={social.iconUrl} style={{width: 24, height: 24, borderRadius: 4}} />
							) : (
								<div
									style={{
										width: 24,
										height: 24,
										borderRadius: '50%',
										background: '#ffffff88',
										color: '#000',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										fontSize: 11,
									}}>
									{social.platform.slice(0, 2).toUpperCase()}
								</div>
							)}
							<div style={{color: 'white', fontSize: 24}}>
								{social.platform}: {social.username}
							</div>
						</div>
					))}
				</div>
			) : null}

			{showWebsite && websiteUrl ? (
				<div
					style={{
						position: 'absolute',
						top: 24,
						right: 24,
						fontSize: 18,
						color: '#f5f5f5',
						textDecoration: 'underline',
					}}>
					{websiteUrl}
				</div>
			) : null}
		</AbsoluteFill>
	);
};

function subTitleElement(subtitle?: string) {
	if (!subtitle) {
		return null;
	}
	return <h2 style={{fontSize: 40, margin: '10px 0 0 0', color: '#f1f2f4'}}>{subtitle}</h2>;
}
