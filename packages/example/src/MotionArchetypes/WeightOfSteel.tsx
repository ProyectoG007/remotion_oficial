import {zColor} from '@remotion/zod-types';
import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {z} from 'zod';
import {seeded, SPRING} from './springs';

export const weightOfSteelSchema = z.object({
	title1: z.string(),
	title2: z.string(),
	closer: z.string(),
	paper: zColor(),
	ink: zColor(),
	smoke: zColor(),
});

export type WeightOfSteelProps = z.infer<typeof weightOfSteelSchema>;

const DISPLAY_SERIF =
	'"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Times New Roman", serif';

/** How much of the frame a torn panel covers when fully open. */
const PANEL_COVER = 0.6;
/** Jitter of the torn edge, in percent of the frame width. */
const TEETH_JITTER = 4;

/**
 * A torn-paper panel anchored to one side. `progress` 0 hides it, 1 opens it to
 * `PANEL_COVER` of the frame — never the full width, so the scene behind stays
 * visible.
 */
const tornClip = ({
	progress,
	teeth,
	seed,
	from,
}: {
	progress: number;
	teeth: number;
	seed: number;
	from: 'left' | 'right';
}): string => {
	const edge = progress * PANEL_COVER * 100;
	const points: string[] = [];

	const anchor = from === 'left' ? 0 : 100;
	points.push(`${anchor}% 0%`);

	for (let i = 0; i <= teeth; i++) {
		const y = (i / teeth) * 100;
		const jitter = (seeded(seed + i * 1.7) - 0.5) * TEETH_JITTER;
		const offset = Math.max(0, edge + jitter);
		const x =
			from === 'left' ? Math.min(100, offset) : Math.max(0, 100 - offset);
		points.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
	}

	points.push(`${anchor}% 100%`);
	return `polygon(${points.join(', ')})`;
};

const Samurai: React.FC<{ink: string; stride: number; scale: number}> = ({
	ink,
	stride,
	scale,
}) => {
	// A small bob keeps the silhouette alive without animating limbs.
	const bob = Math.sin(stride * Math.PI * 2) * 6;
	const lean = Math.sin(stride * Math.PI * 2) * 3;

	return (
		<g transform={`scale(${scale}) translate(0 ${bob}) rotate(${lean})`}>
			{/* Katana, behind the body */}
			<g transform="rotate(-28) translate(-30 40)">
				<rect x={-250} y={-4} width={330} height={8} rx={4} fill={ink} />
				<rect x={78} y={-16} width={16} height={32} rx={4} fill={ink} />
				<rect x={94} y={-7} width={64} height={14} rx={7} fill={ink} />
			</g>

			{/* Robe, with an angular hem */}
			<path
				d="M -8 -66
				   L 58 -50 L 92 92 L 116 150 L 40 138 L 16 176
				   L -26 140 L -96 154 L -74 86 L -60 -46 Z"
				fill={ink}
			/>
			{/* Shoulder wedges give it the kamishimo silhouette */}
			<path d="M -8 -66 L 96 -20 L 58 -50 Z" fill={ink} />
			<path d="M -60 -46 L -140 -6 L -74 -44 Z" fill={ink} />

			{/* Head */}
			<rect x={-34} y={-104} width={44} height={44} rx={16} fill={ink} />

			{/* Conical hat */}
			<path d="M -132 -96 Q -12 -186 108 -96 Q -12 -66 -132 -96 Z" fill={ink} />
		</g>
	);
};

export const WeightOfSteel: React.FC<WeightOfSteelProps> = ({
	title1,
	title2,
	closer,
	paper,
	ink,
	smoke,
}) => {
	const frame = useCurrentFrame();
	const {fps, width, height, durationInFrames} = useVideoConfig();

	const samuraiIn = interpolate(frame, [26, 54], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// Two torn panels: the first from the left, the second from the right.
	const tear1 = interpolate(frame, [60, 96, 132, 150], [0, 1, 1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const tear2 = interpolate(frame, [152, 188, 208, 224], [0, 1, 1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// Titles only appear once their panel is fully open, so the torn edge never
	// cuts a letter in half.
	const title1Opacity = interpolate(tear1, [0.88, 1], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const title2Opacity = interpolate(tear2, [0.88, 1], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const closerIn = spring({frame: frame - 226, fps, config: SPRING.precise});

	// The samurai stays on whichever side the panel is not covering. The
	// single-frame steps read as cuts, which is what a montage wants.
	const samuraiX = interpolate(
		frame,
		[26, 58, 59, 148, 149, durationInFrames],
		[0.44, 0.5, 0.8, 0.84, 0.2, 0.26],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);
	const stride = (frame / fps) * 0.9;

	return (
		<AbsoluteFill style={{backgroundColor: paper}}>
			<svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
				{/* Opening ink strokes, sweeping in from the left */}
				{new Array(5).fill(true).map((_, i) => {
					const grow = interpolate(frame, [i * 4, i * 4 + 22], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					});
					const y = 120 + i * 62;
					return (
						<rect
							key={`stroke-${i}`}
							x={-200}
							y={y}
							width={width * 1.4}
							height={16 + (i % 2) * 12}
							rx={10}
							fill={ink}
							opacity={0.86}
							transform={`rotate(-16 0 ${y}) scale(${grow} 1)`}
							style={{transformOrigin: `0px ${y}px`}}
						/>
					);
				})}

				{/* Smoke banks */}
				{new Array(3).fill(true).map((_, i) => (
					<ellipse
						key={`fog-${i}`}
						cx={interpolate(
							frame,
							[0, durationInFrames],
							[i * 520, i * 520 + 260],
						)}
						cy={height * 0.62 + i * 90}
						rx={520}
						ry={90}
						fill={smoke}
						opacity={0.24}
						style={{filter: 'blur(28px)'}}
					/>
				))}

				{/* Horizon */}
				<path
					d={`M 0 ${height * 0.72} q ${width * 0.34} -48 ${width * 0.66} -6 L ${width} ${height * 0.7} L ${width} ${height} L 0 ${height} Z`}
					fill={smoke}
					opacity={0.35}
				/>

				{/* Bamboo shadows sweeping across */}
				<g opacity={0.2}>
					{new Array(7).fill(true).map((_, i) => (
						<rect
							key={`bamboo-${i}`}
							x={interpolate(
								frame,
								[0, durationInFrames],
								[-400 + i * 300, -140 + i * 300],
							)}
							y={-300}
							width={54}
							height={height * 2}
							fill={ink}
							transform={`rotate(22 ${width / 2} ${height / 2})`}
						/>
					))}
				</g>

				<g
					transform={`translate(${width * samuraiX} ${height * 0.6})`}
					opacity={samuraiIn}
				>
					<Samurai ink={ink} stride={stride} scale={1.7} />
				</g>
			</svg>

			{/* ── Torn panel 1, from the left ── */}
			<AbsoluteFill
				style={{
					backgroundColor: paper,
					clipPath: tornClip({
						progress: tear1,
						teeth: 26,
						seed: 3,
						from: 'left',
					}),
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: 110,
						top: '50%',
						maxWidth: width * 0.4,
						transform: 'translateY(-50%)',
						fontFamily: DISPLAY_SERIF,
						fontSize: 118,
						letterSpacing: 14,
						color: ink,
						opacity: title1Opacity,
					}}
				>
					{title1}
				</div>
			</AbsoluteFill>

			{/* ── Torn panel 2, from the right ── */}
			<AbsoluteFill
				style={{
					backgroundColor: paper,
					clipPath: tornClip({
						progress: tear2,
						teeth: 22,
						seed: 11,
						from: 'right',
					}),
				}}
			>
				<div
					style={{
						position: 'absolute',
						right: 110,
						top: '50%',
						maxWidth: width * 0.4,
						transform: 'translateY(-50%)',
						fontFamily: DISPLAY_SERIF,
						fontSize: 104,
						lineHeight: 1.04,
						letterSpacing: 8,
						textAlign: 'right',
						color: ink,
						opacity: title2Opacity,
					}}
				>
					{title2}
				</div>
			</AbsoluteFill>

			{/* ── Closer ── */}
			<AbsoluteFill
				style={{
					alignItems: 'center',
					justifyContent: 'center',
					opacity: closerIn,
				}}
			>
				<div
					style={{
						fontFamily: DISPLAY_SERIF,
						fontSize: 52,
						letterSpacing: 34,
						color: ink,
					}}
				>
					{closer}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
