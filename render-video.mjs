import { renderMedia } from '@remotion/renderer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

await renderMedia({
  serveUrl: 'http://localhost:3000',
  composition: 'MileiSimple',
  fps: 30,
  numberOfFrames: 600,
  outputLocation: '/tmp/milei_video.mp4',
  codec: 'h264',
  crf: 23,
});

console.log('✅ Video renderizado correctamente en /tmp/milei_video.mp4');
