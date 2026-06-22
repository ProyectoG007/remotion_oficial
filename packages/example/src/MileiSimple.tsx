import React from 'react';
import {
	Composition,
	useCurrentFrame,
	interpolate,
	Easing,
	AbsoluteFill,
} from 'remotion';

const MileiSimple: React.FC = () => {
	const frame = useCurrentFrame();

	const introOpacity = interpolate(frame, [0, 50], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const titleScale = interpolate(frame, [100, 180], [0.3, 1], {
		easing: Easing.out(Easing.back(1.5)),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const titleOpacity = interpolate(frame, [80, 150], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const replicasCount = interpolate(frame, [200, 350], [0, 298], {
		easing: Easing.out(Easing.quad),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const votesCount = interpolate(frame, [250, 400], [0, 13000000], {
		easing: Easing.out(Easing.quad),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const dataScale = interpolate(frame, [180, 250], [0, 1], {
		easing: Easing.out(Easing.back(1)),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const exitOpacity = interpolate(frame, [500, 600], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill
			style={{
				background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
				fontFamily: 'Arial',
				overflow: 'hidden',
				opacity: exitOpacity,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<div style={{ opacity: introOpacity, textAlign: 'center' }}>
				{/* TÍTULO */}
				<div
					style={{
						transform: `scale(${titleScale})`,
						opacity: titleOpacity,
						marginBottom: 80,
					}}
				>
					<h1
						style={{
							fontSize: 120,
							margin: 0,
							color: '#fff',
							fontWeight: 'bold',
							letterSpacing: 3,
							textShadow: '0 10px 40px rgba(231, 76, 60, 0.5)',
						}}
					>
						JAVIER MILEI
					</h1>
					<p
						style={{
							fontSize: 50,
							margin: '20px 0 0 0',
							color: '#e74c3c',
							letterSpacing: 2,
							fontWeight: 'bold',
						}}
					>
						PRESIDENTE
					</p>
				</div>

				{/* DATOS */}
				<div
					style={{
						transform: `scale(${dataScale})`,
						display: 'flex',
						gap: 80,
						justifyContent: 'center',
						opacity: dataScale > 0.1 ? 1 : 0,
						marginBottom: 100,
					}}
				>
					<div
						style={{
							textAlign: 'center',
							background: 'rgba(231, 76, 60, 0.2)',
							padding: '30px 50px',
							borderRadius: 15,
							borderLeft: '5px solid #e74c3c',
						}}
					>
						<div
							style={{
								fontSize: 70,
								color: '#e74c3c',
								fontWeight: 'bold',
								marginBottom: 10,
							}}
						>
							{Math.round(replicasCount)}
						</div>
						<div style={{ fontSize: 28, color: '#fff', fontWeight: 'bold' }}>
							Réplicas
						</div>
					</div>

					<div
						style={{
							textAlign: 'center',
							background: 'rgba(52, 152, 219, 0.2)',
							padding: '30px 50px',
							borderRadius: 15,
							borderLeft: '5px solid #3498db',
						}}
					>
						<div
							style={{
								fontSize: 60,
								color: '#3498db',
								fontWeight: 'bold',
								marginBottom: 10,
							}}
						>
							{(Math.round(votesCount) / 1000000).toFixed(1)}M
						</div>
						<div style={{ fontSize: 28, color: '#fff', fontWeight: 'bold' }}>
							Votos
						</div>
					</div>
				</div>

				{/* ESLOGAN */}
				<div
					style={{
						fontSize: 40,
						color: '#f39c12',
						fontWeight: 'bold',
						opacity: interpolate(frame, [350, 420], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					¡Viva la Libertad Carajo! 🔥
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const MileiSimpleComposition = () => (
	<Composition
		id="MileiSimple"
		component={MileiSimple}
		durationInFrames={600}
		fps={30}
		width={1920}
		height={1080}
	/>
);
