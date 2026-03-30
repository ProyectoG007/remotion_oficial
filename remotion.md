# Remotion: Guía de trabajo y flujo de desarrollo

Este documento incluye una descripción completa del flujo de trabajo y conceptos clave de Remotion a modo de "skill" para desarrolladores.

## 1. ¿Qué es Remotion?
Remotion es un framework para crear video programáticamente usando React. Permite generar videos cuadro a cuadro (frame-by-frame) y exportarlos a MP4, GIF, WebM, PNG, etc.

- Composiciones React (`<Composition />`) con `props` y `durationInFrames`.
- Animaciones deterministas mediante `useCurrentFrame()`, `interpolate()`, `spring()`, `Sequence`, etc.
- Rendering de assets (video/audio) vía un motor headless (Chromium/Puppeteer, Skia, etc.).

## 2. Estructura de repositorio (Monorepo)

- `packages/core`: API de React, componentes, hooks, validaciones, manager de composiciones.
- `packages/renderer`: motor que produce imagenes y media, coordina navegador + ffmpeg.
- `packages/cli`: comandos `remotion render`, `still`, `compositions`.
- `packages/studio`: editor web.
- `packages/example`: proyecto de ejemplo.
- `packages/docs`: documentación en Docusaurus.

## 3. Flujo de renderizado (conceptual)

1. `Composition` se define en React.
2. CLI obtiene composiciones: `remotion compositions`.
3. Se elige `compositionId` y se llama `renderMedia()`.
4. `renderMedia()` -> `renderFrames()` -> `internalRenderFrames()`.
5. `Puppeteer` abre páginas, cada frame:
   - `seekToFrame(frame)` (en el browser)
   - `takeFrame()` screenshot al tamaño requerido
   - recoge assets de audio/video usando `collectAssets()`.
6. Se escriben archivos o buffer.
7. ffmpeg los combina con audio (`stitchFramesToVideo`).

## 4. Componentes clave en `packages/core`

- `Composition` / `Sequence` / `Video` / `Audio` / `Still`
- Hooks: `useCurrentFrame`, `useVideoConfig`, `useDelayRender`, `useVideo`.
- `CompositionManager` (registro y select).

### `Composition`
- Registra metadatos: `id`, `fps`, `width`, `height`, `durationInFrames`.
- Permite `defaultProps`, `schema`, y `calculateMetadata` asíncrono.
- Controla render de preview/estudio/render.

### `useCurrentFrame()`
- Devuelve frame actual; se actualiza por cada búsqueda de frame.

## 5. Spray de archivos en `packages/renderer`

- `render-frames.ts`: pipeline de frames, concurrencia, pool de tabs.
- `render-media.ts`: valida y orquesta `renderFrames` + `stitchFramesToVideo`.
- `render-frame-and-retry-target-close.ts`: reintentos on crash.
- `render-frame-with-option-to-reject.ts`: seek + takeFrame + collectAssets.
- `take-frame.ts`: captura screenshot de la página.

## 6. Modo de desarrollo

1. Instalar y build
   - `bun install`
   - `bun run build`

2. Ejecutar ejemplo
   - `cd packages/example && bun run dev`

3. Ejecutar render
   - `cd packages/example`
   - `bunx remotion compositions`
   - `bunx remotion render <id> --output ../../out/video.mp4` 

## 7. Depuración

- Usar `--verbose` en CLI para ver logs.
- En `packages/renderer`, ver `logger` y `handle-javascript-exception`.
- `delayRender()` y `continueRender()` para recursos async.

## 8. Añadir nueva funcionalidad paso a paso

1. Escribir componente en `packages/core/src` (ej., nuevo hook / componente).
2. Añadir typing a `packages/core/src/index.ts` si exporta.
3. Añadir pruebas en `packages/core/test`.
4. Ejecutar build específico: `bunx turbo make --filter="@remotion/core"`.
5. Repetir con `packages/renderer` si tocas pipeline.
6. Documentar en `packages/docs/docs` y actualizar `packages/docs/sidebars.ts`.

## 9. Licenciamiento y versión

- Verificar `LICENSE.md`; existe dual license.
- `packages/core/src/version.ts` contiene versión actual.
- Para release, actualizar patch en `version.ts`.

## 10. Qué mirar para entender el “motor”

- `packages/renderer/src/internalRenderFrames` (orquestador).
- `packages/renderer/src/make-page.ts` (setup de Puppeteer page). 
- `packages/core/src/ResolveCompositionConfig.tsx` (evaluación config + props).
- `packages/core/src/CompositionManager.tsx` (registro + selección).

---

### Ejemplo de comando rápido para renderizar local

```bash
cd packages/example
bunx remotion render "MyComposition" --codec h264 --output ../../out/video.mp4 --verbose
```

### Ejemplo básico de componente Remotion

```tsx
import {Composition, useCurrentFrame, interpolate} from 'remotion';

export const MyComp = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 30], [0, 800]);
  return <div style={{width: 1920, height: 1080, background: 'black'}}><div style={{position:'absolute', left: x}}>Hola</div></div>;
};

export const RemotionVideo = () => (
  <Composition id="Comp" width={1920} height={1080} fps={30} durationInFrames={150} component={MyComp} />
);
```

---

Este archivo `remotion.md` debe servir como referencia completa y acción inmediata para trabajar con el código fuente de Remotion, como un skills / playbook.
