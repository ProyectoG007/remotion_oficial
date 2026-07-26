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
import {SPRING} from './springs';

export const stickerLogoRevealSchema = z.object({
	line1: z.string(),
	line2: z.string(),
	lilac: zColor(),
	green: zColor(),
	yellow: zColor(),
	purple: zColor(),
	outline: zColor(),
});

export type StickerLogoRevealProps = z.infer<typeof stickerLogoRevealSchema>;

const HEAVY_SANS =
	'"Arial Black", "Helvetica Neue", Impact, system-ui, sans-serif';

/** A scalloped cloud with a flat bottom edge. */
const cloudPath = ({bumps, w, h}: {bumps: number; w: number; h: number}) => {
	const r = w / (bumps * 2);
	let d = `M 0 ${h}`;
	for (let i = 0; i < bumps; i++) {
		d += ` a ${r} ${r} 0 0 1 ${r * 2} 0`;
	}

	return `${d} L ${w} ${h + h} L 0 ${h + h} Z`;
};

const Star: React.FC<{size: number; color: string; outline: string}> = ({
	size,
	color,
	outline,
}) => (
	<path
		d={`M 0 ${-size} Q ${size * 0.2} ${-size * 0.2} ${size} 0
		    Q ${size * 0.2} ${size * 0.2} 0 ${size}
		    Q ${-size * 0.2} ${size * 0.2} ${-size} 0
		    Q ${-size * 0.2} ${-size * 0.2} 0 ${-size} Z`}
		fill={color}
		stroke={outline}
		strokeWidth={size * 0.14}
	/>
);

export const StickerLogoReveal: React.FC<StickerLogoRevealProps> = ({
	line1,
	line2,
	lilac,
	green,
	yellow,
	purple,
	outline,
}) => {
	const frame = useCurrentFrame();
	const {fps, width, height, durationInFrames} = useVideoConfig();

	const cloudsIn = [0, 1, 2, 3].map((i) =>
		spring({frame: frame - i * 3, fps, config: SPRING.soft}),
	);

	const disc = spring({frame: frame - 20, fps, config: SPRING.bouncy});
	const ring = spring({frame: frame - 26, fps, config: SPRING.soft});
	const orbit = interpolate(frame, [44, durationInFrames], [0, 190]);

	const topText = spring({frame: frame - 70, fps, config: SPRING.bouncy});
	const bottomText = spring({frame: frame - 76, fps, config: SPRING.bouncy});
	const sparkle = spring({frame: frame - 94, fps, config: SPRING.bouncy});

	// Everything bounces once at the end, as a single unit.
	const finalBounce = spring({
		frame: frame - (durationInFrames - 14),
		fps,
		config: SPRING.bouncy,
	});
	const groupScale = 1 + interpolate(finalBounce, [0, 1], [0, 0.06]);

	const cx = width / 2;
	const cy = height / 2;
	const cloudW = width * 1.15;

	return (
		<AbsoluteFill style={{backgroundColor: '#FFFFFF'}}>
			<AbsoluteFill style={{transform: `scale(${groupScale})`}}>
				<svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
					{/* Framing clouds: top and bottom */}
					<g
						transform={`translate(${-width * 0.075} ${interpolate(cloudsIn[0], [0, 1], [-height * 0.4, -height * 0.16])})`}
					>
						<path
							d={cloudPath({bumps: 6, w: cloudW, h: height * 0.22})}
							fill="#FFFFFF"
							stroke={outline}
							strokeWidth={7}
							transform={`translate(0 ${height * 0.44}) scale(1 -1)`}
						/>
					</g>
					<g
						transform={`translate(${-width * 0.075} ${interpolate(cloudsIn[1], [0, 1], [height, height * 0.78])})`}
					>
						<path
							d={cloudPath({bumps: 6, w: cloudW, h: height * 0.2})}
							fill="#FFFFFF"
							stroke={outline}
							strokeWidth={7}
						/>
					</g>

					{/* Side accents sliding in */}
					<g
						transform={`translate(${interpolate(cloudsIn[2], [0, 1], [-260, 0])} 0)`}
					>
						<path
							d={`M 0 ${cy - 220} q -120 220 0 440`}
							fill="none"
							stroke={green}
							strokeWidth={54}
							strokeLinecap="round"
						/>
					</g>
					<g
						transform={`translate(${interpolate(cloudsIn[3], [0, 1], [260, 0])} 0)`}
					>
						<path
							d={`M ${width} ${cy - 220} q 120 220 0 440`}
							fill="none"
							stroke={green}
							strokeWidth={54}
							strokeLinecap="round"
						/>
					</g>

					{/* Green ring, then the lilac disc on top */}
					<circle
						cx={cx}
						cy={cy}
						r={interpolate(ring, [0, 1], [0, 330])}
						fill="none"
						stroke={green}
						strokeWidth={34}
					/>
					<circle
						cx={cx}
						cy={cy}
						r={interpolate(disc, [0, 1], [0, 300])}
						fill="#FFFFFF"
						stroke={outline}
						strokeWidth={7}
					/>
					<circle
						cx={cx}
						cy={cy}
						r={interpolate(disc, [0, 1], [0, 278])}
						fill={lilac}
					/>

					{/* Orbiting capsules */}
					{[
						{color: yellow, angle: -46, len: 150},
						{color: purple, angle: 132, len: 130},
					].map(({color, angle, len}, i) => (
						<g
							key={`capsule-${i}`}
							transform={`rotate(${angle + orbit} ${cx} ${cy})`}
						>
							<rect
								x={cx + 250}
								y={cy - 36}
								width={len}
								height={72}
								rx={36}
								fill={color}
								stroke={outline}
								strokeWidth={6}
								opacity={interpolate(orbit, [0, 12], [0, 1], {
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								})}
							/>
							<circle cx={cx + 250 + len * 0.3} cy={cy} r={9} fill="#FFFFFF" />
							<circle cx={cx + 250 + len * 0.68} cy={cy} r={9} fill="#FFFFFF" />
						</g>
					))}

					{/* Sparkles */}
					<g transform={`translate(${cx - 210} ${cy - 190}) scale(${sparkle})`}>
						<Star size={34} color={yellow} outline={outline} />
					</g>
					<g
						transform={`translate(${cx - 258} ${cy - 132}) scale(${sparkle * 0.7})`}
					>
						<Star size={26} color={yellow} outline={outline} />
					</g>
				</svg>

				<AbsoluteFill
					style={{
						alignItems: 'center',
						justifyContent: 'center',
						flexDirection: 'column',
					}}
				>
					{[
						{text: line1, progress: topText, from: -320, shadow: green},
						{text: line2, progress: bottomText, from: 320, shadow: purple},
					].map(({text, progress, from, shadow}, i) => (
						<div
							key={`line-${i}`}
							style={{
								fontFamily: HEAVY_SANS,
								fontSize: 114,
								lineHeight: 1.14,
								letterSpacing: 4,
								color: '#FFFFFF',
								WebkitTextStroke: `9px ${outline}`,
								paintOrder: 'stroke fill',
								textShadow: `10px 12px 0 ${shadow}`,
								transform: `translateY(${interpolate(progress, [0, 1], [from, 0])}px)`,
								opacity: interpolate(progress, [0, 0.3], [0, 1], {
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								}),
							}}
						>
							{text}
						</div>
					))}
				</AbsoluteFill>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
