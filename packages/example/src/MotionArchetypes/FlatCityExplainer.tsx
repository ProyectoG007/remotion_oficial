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
import {cubicBezierPoint, SPRING} from './springs';

export const flatCityExplainerSchema = z.object({
	headline: z.string(),
	subline: z.string(),
	navy: zColor(),
	mid: zColor(),
	light: zColor(),
	background: zColor(),
	buildingCount: z.number().int().min(4).max(12),
});

export type FlatCityExplainerProps = z.infer<typeof flatCityExplainerSchema>;

const BIRD_CURVE = {
	p0: [-200, 620] as [number, number],
	p1: [260, 240] as [number, number],
	p2: [780, 900] as [number, number],
	p3: [1280, 480] as [number, number],
};

const Bird: React.FC<{
	x: number;
	y: number;
	scale: number;
	flap: number;
	color: string;
	wingColor: string;
	mirrored: boolean;
}> = ({x, y, scale, flap, color, wingColor, mirrored}) => {
	return (
		<g
			transform={`translate(${x} ${y}) scale(${mirrored ? -scale : scale} ${scale})`}
		>
			{/* Far wing, drawn behind the body */}
			<path
				d="M -10 -6 L -78 -30 L -34 10 Z"
				fill={wingColor}
				transform={`rotate(${interpolate(flap, [0, 1], [-26, 8])})`}
			/>
			<ellipse cx="0" cy="0" rx="46" ry="24" fill={color} />
			<circle cx="38" cy="-10" r="15" fill={color} />
			<circle cx="44" cy="-13" r="2.6" fill="#0B1E2D" />
			<path d="M 52 -9 L 74 -6 L 52 -3 Z" fill="#F2A63B" />
			{/* Tail */}
			<path d="M -40 2 L -92 16 L -44 16 Z" fill={wingColor} />
			{/* Near wing */}
			<path
				d="M -4 -4 L -60 -44 L -18 8 Z"
				fill={wingColor}
				transform={`rotate(${interpolate(flap, [0, 1], [-8, 30])})`}
			/>
		</g>
	);
};

export const FlatCityExplainer: React.FC<FlatCityExplainerProps> = ({
	headline,
	subline,
	navy,
	mid,
	light,
	background,
	buildingCount,
}) => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();

	// Wings flap on a fixed cycle so the motion reads as continuous.
	const flap = (Math.sin((frame / fps) * 2 * Math.PI * 3) + 1) / 2;

	const firstBirdProgress = interpolate(frame, [0, 90], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const [birdX, birdY] = cubicBezierPoint({
		t: firstBirdProgress,
		...BIRD_CURVE,
	});

	const secondBirdProgress = interpolate(frame, [190, 265], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const [bird2X, bird2Y] = cubicBezierPoint({
		t: secondBirdProgress,
		p0: [1280, 760],
		p1: [820, 1020],
		p2: [300, 560],
		p3: [-200, 800],
	});

	const sun = spring({frame: frame - 90, fps, config: SPRING.heavy});
	// Settles low enough that even a three-line headline clears it.
	const sunY = interpolate(sun, [0, 1], [-520, height * 0.45]);
	const sunR = 180;

	const tower = spring({frame: frame - 140, fps, config: SPRING.precise});

	const bridgeDraw = interpolate(frame, [160, 200], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const textIn = spring({frame: frame - 240, fps, config: SPRING.soft});

	const skyline = new Array(buildingCount).fill(true).map((_, i) => {
		// Deterministic but varied silhouette.
		const w = 130 + ((i * 47) % 90);
		const h = 260 + ((i * 131) % 420);
		const x = (i * (width + 120)) / buildingCount - 40;
		const enter = spring({
			frame: frame - 40 - i * 6,
			fps,
			config: SPRING.precise,
		});
		const isLight = i % 3 === 1;

		return {w, h, x, enter, isLight, key: `building-${i}`};
	});

	return (
		<AbsoluteFill style={{backgroundColor: background}}>
			<svg
				viewBox={`0 0 ${width} ${height}`}
				width={width}
				height={height}
				style={{position: 'absolute'}}
			>
				{/* Sun, behind everything */}
				<circle cx={width * 0.42} cy={sunY} r={sunR} fill={navy} />
				<circle
					cx={width * 0.42 + 92}
					cy={sunY - 66}
					r={44}
					fill={background}
				/>

				{/* Soft cloud accents */}
				<g stroke={navy} strokeWidth={4} fill="none" opacity={0.55}>
					<path
						d={`M ${240 + interpolate(frame, [0, 270], [0, 60])} 800
						    q 26 -46 78 -30 q 16 -44 74 -30 q 46 6 44 60 z`}
					/>
				</g>
				<circle
					cx={width * 0.76}
					cy={800}
					r={16}
					fill="none"
					stroke={navy}
					strokeWidth={4}
					opacity={0.55}
				/>

				{/* Skyline */}
				{skyline.map(({w, h, x, enter, isLight, key}) => (
					<g
						key={key}
						transform={`translate(0 ${interpolate(enter, [0, 1], [h + 60, 0])})`}
					>
						<rect
							x={x}
							y={height - h - 120}
							width={w}
							height={h + 120}
							rx={w / 2.6}
							fill={isLight ? light : navy}
						/>
						<rect
							x={x + w * 0.3}
							y={height - h - 60}
							width={12}
							height={46}
							rx={6}
							fill={background}
							opacity={0.85}
						/>
						<rect
							x={x + w * 0.62}
							y={height - h - 60}
							width={12}
							height={46}
							rx={6}
							fill={background}
							opacity={0.85}
						/>
					</g>
				))}

				{/* The hero tower grows from its base */}
				<g
					transform={`translate(${width * 0.34} ${height - 120}) scale(1 ${tower}) translate(0 ${-(height - 120)})`}
				>
					<rect
						x={0}
						y={height - 900}
						width={150}
						height={780}
						rx={70}
						fill={mid}
					/>
					<rect
						x={62}
						y={height - 880}
						width={46}
						height={760}
						fill={light}
						opacity={0.7}
					/>
					<rect
						x={20}
						y={height - 820}
						width={44}
						height={12}
						rx={6}
						fill={background}
					/>
					<rect
						x={96}
						y={height - 860}
						width={12}
						height={30}
						rx={6}
						fill={background}
					/>
				</g>

				{/* Bridge, drawn on top of the skyline so the stroke reads */}
				<path
					d={`M ${width * 0.06} ${height - 330} q ${width * 0.22} -210 ${width * 0.48} 0`}
					fill="none"
					stroke={background}
					strokeWidth={16}
					strokeLinecap="round"
					pathLength={1}
					strokeDasharray={1}
					strokeDashoffset={bridgeDraw}
				/>
				<path
					d={`M ${width * 0.06} ${height - 330} q ${width * 0.22} -210 ${width * 0.48} 0`}
					fill="none"
					stroke={navy}
					strokeWidth={7}
					strokeLinecap="round"
					pathLength={1}
					strokeDasharray={1}
					strokeDashoffset={bridgeDraw}
				/>

				{/* Ground */}
				<path
					d={`M 0 ${height - 96} q ${width * 0.3} -54 ${width * 0.62} -10 q ${width * 0.24} 36 ${width * 0.38} -14 L ${width} ${height} L 0 ${height} Z`}
					fill={background}
					stroke={navy}
					strokeWidth={4}
				/>

				{firstBirdProgress > 0 && firstBirdProgress < 1 ? (
					<Bird
						x={birdX}
						y={birdY}
						scale={1}
						flap={flap}
						color={mid}
						wingColor={navy}
						mirrored={false}
					/>
				) : null}

				{secondBirdProgress > 0 && secondBirdProgress < 1 ? (
					<Bird
						x={bird2X}
						y={bird2Y}
						scale={0.68}
						flap={1 - flap}
						color={light}
						wingColor={mid}
						mirrored
					/>
				) : null}
			</svg>

			<div
				style={{
					position: 'absolute',
					left: 90,
					right: 90,
					top: height * 0.12,
					opacity: textIn,
					transform: `translateY(${interpolate(textIn, [0, 1], [40, 0])}px)`,
					fontFamily: 'system-ui, -apple-system, Helvetica, Arial, sans-serif',
					color: navy,
				}}
			>
				<div style={{fontSize: 96, fontWeight: 700, lineHeight: 1.05}}>
					{headline}
				</div>
				<div style={{fontSize: 44, marginTop: 18, opacity: 0.72}}>
					{subline}
				</div>
			</div>
		</AbsoluteFill>
	);
};
