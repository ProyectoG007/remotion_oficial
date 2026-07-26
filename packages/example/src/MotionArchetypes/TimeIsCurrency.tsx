import {zColor} from '@remotion/zod-types';
import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	Sequence,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {z} from 'zod';
import {cubicBezierPoint, SPRING} from './springs';

export const timeIsCurrencySchema = z.object({
	line1: z.string(),
	line2: z.string(),
	closer: z.string(),
	paper: zColor(),
	accent: zColor(),
	ink: zColor(),
	coinCount: z.number().int().min(3).max(9),
});

export type TimeIsCurrencyProps = z.infer<typeof timeIsCurrencySchema>;

const SCENE_B_START = 104;
const CROSSFADE = 14;

const SERIF =
	'"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Times New Roman", serif';

const ClockCoin: React.FC<{
	r: number;
	accent: string;
	ink: string;
	turn: number;
}> = ({r, accent, ink, turn}) => {
	return (
		<g>
			<circle cx={0} cy={0} r={r} fill={accent} />
			<circle
				cx={0}
				cy={0}
				r={r * 0.78}
				fill="none"
				stroke={ink}
				strokeWidth={r * 0.06}
			/>
			{new Array(12).fill(true).map((_, i) => (
				<rect
					key={`tick-${i}`}
					x={-r * 0.035}
					y={-r * 0.72}
					width={r * 0.07}
					height={r * 0.16}
					fill={ink}
					transform={`rotate(${i * 30})`}
				/>
			))}
			{/* Hour and minute hand */}
			<rect
				x={-r * 0.05}
				y={-r * 0.46}
				width={r * 0.1}
				height={r * 0.5}
				rx={r * 0.05}
				fill={ink}
				transform={`rotate(${turn * 0.5})`}
			/>
			<rect
				x={-r * 0.04}
				y={-r * 0.62}
				width={r * 0.08}
				height={r * 0.66}
				rx={r * 0.04}
				fill={ink}
				transform={`rotate(${turn})`}
			/>
		</g>
	);
};

/**
 * Two crescents that close on the last coin. A flat geometric stand-in for a
 * hand, which is what the editorial-poster look calls for anyway.
 */
const Grip: React.FC<{close: number; ink: string; r: number}> = ({
	close,
	ink,
	r,
}) => {
	const open = interpolate(close, [0, 1], [46, 4]);

	return (
		<g>
			{[-1, 1].map((dir) => (
				<path
					key={`jaw-${dir}`}
					d={`M ${-r * 1.28} ${dir * r * 0.1}
					    a ${r * 1.3} ${r * 1.3} 0 0 ${dir > 0 ? 1 : 0} ${r * 2.56} 0`}
					fill="none"
					stroke={ink}
					strokeWidth={r * 0.42}
					strokeLinecap="round"
					transform={`rotate(${dir * open})`}
				/>
			))}
			{/* Wrist */}
			<rect
				x={r * 0.9}
				y={-r * 0.34}
				width={r * 2.6}
				height={r * 0.68}
				rx={r * 0.34}
				fill={ink}
			/>
		</g>
	);
};

const MaskedLine: React.FC<{
	text: string;
	progress: number;
	size: number;
	color: string;
}> = ({text, progress, size, color}) => {
	return (
		<div style={{overflow: 'hidden', height: size * 1.16}}>
			<div
				style={{
					fontFamily: SERIF,
					fontSize: size,
					lineHeight: 1.16,
					fontWeight: 700,
					letterSpacing: -size * 0.02,
					color,
					transform: `translateY(${interpolate(progress, [0, 1], [size * 1.2, 0])}px)`,
				}}
			>
				{text}
			</div>
		</div>
	);
};

export const TimeIsCurrency: React.FC<TimeIsCurrencyProps> = ({
	line1,
	line2,
	closer,
	paper,
	accent,
	ink,
	coinCount,
}) => {
	const frame = useCurrentFrame();
	const {fps, width, height, durationInFrames} = useVideoConfig();

	const sceneAOut = interpolate(
		frame,
		[SCENE_B_START, SCENE_B_START + CROSSFADE],
		[1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);
	const sceneBIn = interpolate(
		frame,
		[SCENE_B_START, SCENE_B_START + CROSSFADE],
		[0, 1],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

	// The whole poster collapses at the very end.
	const collapse = spring({
		frame: frame - (durationInFrames - 26),
		fps,
		config: SPRING.precise,
	});
	const collapseScale = interpolate(collapse, [0, 1], [1, 0.02]);

	const gripClose = spring({frame: frame - 30, fps, config: SPRING.soft});
	const raysPulse = (Math.sin((frame / fps) * 2 * Math.PI * 1.4) + 1) / 2;

	const coinR = 74;
	const gripX = width * 0.66;
	const gripY = height * 0.4;

	return (
		<AbsoluteFill style={{backgroundColor: paper}}>
			<AbsoluteFill style={{transform: `scale(${collapseScale})`}}>
				{/* ── Scene A ── */}
				<AbsoluteFill style={{opacity: sceneAOut}}>
					<svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
						{/* The trail of dots the coins came from */}
						{new Array(5).fill(true).map((_, i) => (
							<circle
								key={`dot-${i}`}
								cx={60 + i * 62}
								cy={height * 0.42}
								r={interpolate(i, [0, 4], [12, 26])}
								fill={accent}
								opacity={interpolate(frame, [i * 3, i * 3 + 12], [0, 1], {
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								})}
							/>
						))}

						{new Array(coinCount).fill(true).map((_, i) => {
							const isCaught = i === coinCount - 1;
							const start = 6 + i * 9;
							const t = interpolate(frame, [start, start + 46], [0, 1], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							});
							if (t <= 0) {
								return null;
							}

							// The last coin lands in the grip, the others arc past it.
							const [cx, cy] = cubicBezierPoint({
								t,
								p0: [300, height * 0.42],
								p1: [520, height * 0.06 - i * 26],
								p2: [gripX - 220, height * 0.2 + i * 30],
								p3: isCaught
									? [gripX - coinR * 1.1, gripY]
									: [gripX - 340 + i * 34, height * 0.62 + i * 12],
							});

							return (
								<g key={`coin-${i}`} transform={`translate(${cx} ${cy})`}>
									<ClockCoin
										r={isCaught ? coinR : coinR * 0.72}
										accent={accent}
										ink={ink}
										turn={interpolate(t, [0, 1], [0, 220 + i * 40])}
									/>
								</g>
							);
						})}

						<g transform={`translate(${gripX} ${gripY})`}>
							<Grip close={gripClose} ink={ink} r={coinR} />
						</g>
					</svg>

					<div
						style={{
							position: 'absolute',
							left: 96,
							bottom: 110,
							width: width * 0.5,
						}}
					>
						<MaskedLine
							text={line1}
							size={96}
							color={ink}
							progress={spring({
								frame: frame - 46,
								fps,
								config: SPRING.precise,
							})}
						/>
						<MaskedLine
							text={line2}
							size={96}
							color={ink}
							progress={spring({
								frame: frame - 56,
								fps,
								config: SPRING.precise,
							})}
						/>
					</div>
				</AbsoluteFill>

				{/* ── Scene B ── */}
				<AbsoluteFill style={{opacity: sceneBIn}}>
					<svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
						<g transform={`translate(${width * 0.58} ${height * 0.44})`}>
							{/* Rays behind the head */}
							{new Array(30).fill(true).map((_, i) => {
								const len = interpolate((i % 3) + raysPulse, [0, 3], [54, 128]);
								return (
									<rect
										key={`ray-${i}`}
										x={-5}
										y={-300 - len}
										width={10}
										height={len}
										rx={5}
										fill={accent}
										transform={`rotate(${i * 12})`}
									/>
								);
							})}
							<circle
								cx={0}
								cy={0}
								r={290}
								fill={ink}
								transform={`scale(${spring({
									frame: frame - SCENE_B_START,
									fps,
									config: SPRING.soft,
								})})`}
							/>
							{/* Nose notch keeps it reading as a profile */}
							<path d={`M 286 -18 L 372 26 L 284 62 Z`} fill={ink} />
							<g transform="translate(-18 -10)">
								<circle cx={0} cy={0} r={168} fill={paper} />
								<circle
									cx={0}
									cy={0}
									r={168}
									fill="none"
									stroke={accent}
									strokeWidth={16}
								/>
								{new Array(12).fill(true).map((_, i) => (
									<rect
										key={`btick-${i}`}
										x={-4}
										y={-146}
										width={8}
										height={26}
										fill={ink}
										transform={`rotate(${i * 30})`}
									/>
								))}
								<rect
									x={-7}
									y={-92}
									width={14}
									height={100}
									rx={7}
									fill={ink}
									transform={`rotate(${interpolate(frame, [SCENE_B_START, durationInFrames], [20, 200])})`}
								/>
								<rect
									x={-5}
									y={-126}
									width={10}
									height={134}
									rx={5}
									fill={ink}
									transform={`rotate(${interpolate(frame, [SCENE_B_START, durationInFrames], [140, 900])})`}
								/>
							</g>
						</g>
					</svg>

					<Sequence from={SCENE_B_START + 16}>
						<div
							style={{
								position: 'absolute',
								left: 96,
								bottom: 140,
								width: width * 0.4,
							}}
						>
							<MaskedLine
								text={closer}
								size={110}
								color={ink}
								progress={spring({
									frame: frame - SCENE_B_START - 16,
									fps,
									config: SPRING.precise,
								})}
							/>
						</div>
					</Sequence>
				</AbsoluteFill>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
