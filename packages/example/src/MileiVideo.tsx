import React from 'react';
import {
	Composition,
	useCurrentFrame,
	interpolate,
	Easing,
	AbsoluteFill,
	staticFile,
} from 'remotion';

export const MileiContent: React.FC = () => {
	const frame = useCurrentFrame();

	// Fases del video (en 600 frames = 20 segundos a 30fps)
	// 0-100: Intro fade in
	// 100-300: Nombre aparece
	// 300-450: Datos con animaciones
	// 450-600: Cierre

	// Opacidad de entrada
	const introOpacity = interpolate(frame, [0, 50], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// Escala del título
	const titleScale = interpolate(frame, [100, 180], [0.3, 1], {
		easing: Easing.out(Easing.back(1.5)),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// Opacidad del título
	const titleOpacity = interpolate(frame, [80, 150], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// Contador de réplicas
	const replicasCount = interpolate(frame, [200, 350], [0, 298], {
		easing: Easing.out(Easing.quad),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// Contador de votos
	const votesCount = interpolate(frame, [250, 400], [0, 13000000], {
		easing: Easing.out(Easing.quad),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// Escala de elementos de datos
	const dataScale = interpolate(frame, [180, 250], [0, 1], {
		easing: Easing.out(Easing.back(1)),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// Fade out final
	const exitOpacity = interpolate(frame, [500, 600], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const containerStyle: React.CSSProperties = {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
		fontFamily: "'Arial', sans-serif",
		overflow: 'hidden',
		position: 'relative',
		opacity: exitOpacity,
	};

	return (
		<AbsoluteFill style={containerStyle}>
			{/* Fondo decorativo */}
			<div
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					opacity: 0.1,
					backgroundImage: `radial-gradient(circle, #e74c3c 1px, transparent 1px)`,
					backgroundSize: '50px 50px',
				}}
			/>

			{/* INTRO - Fade in general */}
			<div style={{ opacity: introOpacity }}>
				{/* TÍTULO PRINCIPAL */}
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
							textShadow: '0 10px 40px rgba(231, 76, 60, 0.5)',
							fontWeight: 'bold',
							letterSpacing: 3,
						}}
					>
						JAVIER MILEI
					</h1>
					<p
						style={{
							fontSize: 40,
							margin: '10px 0 0 0',
							color: '#e74c3c',
							letterSpacing: 2,
							fontWeight: 'bold',
						}}
					>
						PRESIDENTE
					</p>
				</div>

				{/* DATOS CON ANIMACIONES */}
				<div
					style={{
						transform: `scale(${dataScale})`,
						display: 'flex',
						gap: 80,
						justifyContent: 'center',
						opacity: dataScale > 0.1 ? 1 : 0,
					}}
				>
					{/* Réplicas en redes */}
					<div
						style={{
							textAlign: 'center',
							background: 'rgba(231, 76, 60, 0.1)',
							padding: '30px 50px',
							borderRadius: 15,
							borderLeft: '5px solid #e74c3c',
							backdropFilter: 'blur(10px)',
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
							{Math.round(replicasCount).toLocaleString()}
						</div>
						<div style={{ fontSize: 28, color: '#fff', fontWeight: 'bold' }}>
							Réplicas
						</div>
					</div>

					{/* Votos obtenidos */}
					<div
						style={{
							textAlign: 'center',
							background: 'rgba(52, 152, 219, 0.1)',
							padding: '30px 50px',
							borderRadius: 15,
							borderLeft: '5px solid #3498db',
							backdropFilter: 'blur(10px)',
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
						marginTop: 100,
						fontSize: 40,
						color: '#f39c12',
						fontWeight: 'bold',
						opacity: interpolate(frame, [350, 420], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						textShadow: '0 5px 20px rgba(243, 156, 18, 0.3)',
					}}
				>
					¡Viva la Libertad Carajo! 🔥
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const MileiComposition = () => (
	<Composition
		id="Milei"
		component={MileiContent}
		durationInFrames={600}
		fps={30}
		width={1920}
		height={1080}
	/>
);
