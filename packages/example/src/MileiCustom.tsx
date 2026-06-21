import React from 'react';
import {
	Composition,
	useCurrentFrame,
	interpolate,
	Easing,
	AbsoluteFill,
} from 'remotion';
import { z } from 'zod';

// 🎛️ ESQUEMA - Define qué puedes cambiar
export const mileiCustomSchema = z.object({
	// ✏️ TEXTOS
	titulo: z.string().default('JAVIER MILEI'),
	subtitulo: z.string().default('PRESIDENTE'),
	eslogan: z.string().default('¡Viva la Libertad Carajo! 🔥'),

	// 🎨 COLORES
	colorFondo: z.string().default('#1a1a2e'),
	colorPrincipal: z.string().default('#e74c3c'),
	colorSecundario: z.string().default('#3498db'),
	colorEslogan: z.string().default('#f39c12'),

	// 🔤 TIPOGRAFÍA
	fuente: z.enum(['Arial', 'Georgia', 'Helvetica', 'Verdana']).default('Arial'),
	tamanoTitulo: z.number().default(120),
	tamanoSubtitulo: z.number().default(50),
	tamanoEslogan: z.number().default(40),

	// 📊 DATOS
	replicas: z.number().default(298),
	votos: z.number().default(13000000),
	etiquetaReplicas: z.string().default('Réplicas'),
	etiquetaVotos: z.string().default('Votos'),

	// ⏱️ ANIMACIONES
	mostrarDatos: z.boolean().default(true),
	mostrarEslogan: z.boolean().default(true),
	duracionSegundos: z.number().default(20),
});

type MileiCustomProps = z.infer<typeof mileiCustomSchema>;

// 🎬 EL VIDEO PERSONALIZABLE
const MileiCustomVideo: React.FC<MileiCustomProps> = ({
	titulo,
	subtitulo,
	eslogan,
	colorFondo,
	colorPrincipal,
	colorSecundario,
	colorEslogan,
	fuente,
	tamanoTitulo,
	tamanoSubtitulo,
	tamanoEslogan,
	replicas,
	votos,
	etiquetaReplicas,
	etiquetaVotos,
	mostrarDatos,
	mostrarEslogan,
	duracionSegundos,
}) => {
	const frame = useCurrentFrame();
	const duracionFrames = duracionSegundos * 30; // 30 fps

	// 🎞️ ANIMACIONES BASADAS EN FOTOGRAMAS
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

	const replicasCount = interpolate(frame, [200, 350], [0, replicas], {
		easing: Easing.out(Easing.quad),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const votosCount = interpolate(frame, [250, 400], [0, votos], {
		easing: Easing.out(Easing.quad),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const dataScale = interpolate(frame, [180, 250], [0, 1], {
		easing: Easing.out(Easing.back(1)),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const esloganOpacity = interpolate(frame, [350, 420], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const exitOpacity = interpolate(
		frame,
		[duracionFrames - 100, duracionFrames],
		[1, 0],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		}
	);

	return (
		<AbsoluteFill
			style={{
				background: colorFondo,
				fontFamily: fuente,
				overflow: 'hidden',
				opacity: exitOpacity,
			}}
		>
			{/* Fondo decorativo */}
			<div
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					opacity: 0.1,
					backgroundImage: `radial-gradient(circle, ${colorPrincipal} 1px, transparent 1px)`,
					backgroundSize: '50px 50px',
				}}
			/>

			<div style={{ opacity: introOpacity, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
				{/* TÍTULO PRINCIPAL */}
				<div
					style={{
						transform: `scale(${titleScale})`,
						opacity: titleOpacity,
						marginBottom: 80,
						textAlign: 'center',
					}}
				>
					<h1
						style={{
							fontSize: tamanoTitulo,
							margin: 0,
							color: '#fff',
							textShadow: `0 10px 40px ${colorPrincipal}80`,
							fontWeight: 'bold',
							letterSpacing: 3,
						}}
					>
						{titulo}
					</h1>
					<p
						style={{
							fontSize: tamanoSubtitulo,
							margin: '10px 0 0 0',
							color: colorPrincipal,
							letterSpacing: 2,
							fontWeight: 'bold',
						}}
					>
						{subtitulo}
					</p>
				</div>

				{/* DATOS CON ANIMACIONES */}
				{mostrarDatos && (
					<div
						style={{
							transform: `scale(${dataScale})`,
							display: 'flex',
							gap: 80,
							justifyContent: 'center',
							opacity: dataScale > 0.1 ? 1 : 0,
						}}
					>
						{/* Réplicas */}
						<div
							style={{
								textAlign: 'center',
								background: `${colorPrincipal}1a`,
								padding: '30px 50px',
								borderRadius: 15,
								borderLeft: `5px solid ${colorPrincipal}`,
								backdropFilter: 'blur(10px)',
							}}
						>
							<div
								style={{
									fontSize: 70,
									color: colorPrincipal,
									fontWeight: 'bold',
									marginBottom: 10,
								}}
							>
								{Math.round(replicasCount).toLocaleString()}
							</div>
							<div style={{ fontSize: 28, color: '#fff', fontWeight: 'bold' }}>
								{etiquetaReplicas}
							</div>
						</div>

						{/* Votos */}
						<div
							style={{
								textAlign: 'center',
								background: `${colorSecundario}1a`,
								padding: '30px 50px',
								borderRadius: 15,
								borderLeft: `5px solid ${colorSecundario}`,
								backdropFilter: 'blur(10px)',
							}}
						>
							<div
								style={{
									fontSize: 60,
									color: colorSecundario,
									fontWeight: 'bold',
									marginBottom: 10,
								}}
							>
								{(Math.round(votosCount) / 1000000).toFixed(1)}M
							</div>
							<div style={{ fontSize: 28, color: '#fff', fontWeight: 'bold' }}>
								{etiquetaVotos}
							</div>
						</div>
					</div>
				)}

				{/* ESLOGAN */}
				{mostrarEslogan && (
					<div
						style={{
							marginTop: 100,
							fontSize: tamanoEslogan,
							color: colorEslogan,
							fontWeight: 'bold',
							opacity: esloganOpacity,
							textShadow: `0 5px 20px ${colorEslogan}4d`,
							textAlign: 'center',
							maxWidth: '80%',
						}}
					>
						{eslogan}
					</div>
				)}
			</div>
		</AbsoluteFill>
	);
};

// 📦 EXPORTAR LA COMPOSICIÓN
export const MileiCustomComposition = () => (
	<Composition
		id="MileiPersonalizable"
		component={MileiCustomVideo}
		durationInFrames={600}
		fps={30}
		width={1920}
		height={1080}
		schema={mileiCustomSchema}
		defaultProps={{
			titulo: 'JAVIER MILEI',
			subtitulo: 'PRESIDENTE',
			eslogan: '¡Viva la Libertad Carajo! 🔥',
			colorFondo: '#1a1a2e',
			colorPrincipal: '#e74c3c',
			colorSecundario: '#3498db',
			colorEslogan: '#f39c12',
			fuente: 'Arial',
			tamanoTitulo: 120,
			tamanoSubtitulo: 50,
			tamanoEslogan: 40,
			replicas: 298,
			votos: 13000000,
			etiquetaReplicas: 'Réplicas',
			etiquetaVotos: 'Votos',
			mostrarDatos: true,
			mostrarEslogan: true,
			duracionSegundos: 20,
		}}
	/>
);
