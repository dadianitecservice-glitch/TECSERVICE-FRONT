const fs = require('fs');
const sharp = require('sharp');
const potrace = require('potrace');

const input = 'C:/Users/user/Desktop/TecService.png';
const output = 'C:/Users/user/Documents/ChatGPT/guka/work/logo-vector/TecService-vector.svg';
const preview = 'C:/Users/user/Documents/ChatGPT/guka/work/logo-vector/TecService-vector-preview.png';

function trace(buffer, color) {
  return new Promise((resolve, reject) => {
    potrace.trace(buffer, {
      color,
      background: 'transparent',
      threshold: 128,
      turdSize: 12,
      optCurve: true,
      optTolerance: 0.15,
    }, (error, svg) => error ? reject(error) : resolve(svg));
  });
}

function innerSvg(svg) {
  return svg.slice(svg.indexOf('>') + 1, svg.lastIndexOf('</svg>'));
}

async function makeMask(data, info, predicate) {
  const pixels = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    const j = i * info.channels;
    const k = i * 4;
    const r = data[j];
    const g = data[j + 1];
    const b = data[j + 2];
    const a = info.channels === 4 ? data[j + 3] : 255;
    const value = a > 20 && predicate(r, g, b) ? 0 : 255;
    pixels[k] = value;
    pixels[k + 1] = value;
    pixels[k + 2] = value;
    pixels[k + 3] = 255;
  }
  return sharp(pixels, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

async function main() {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const redMask = await makeMask(data, info, (r, g, b) => r > 145 && r > g * 1.35 && r > b * 1.25);
  const blueMask = await makeMask(data, info, (r, g, b) => b > 90 && b > r * 1.25 && b > g * 1.05);
  const [redSvg, blueSvg] = await Promise.all([
    trace(redMask, '#F51B27'),
    trace(blueMask, '#0B63B6'),
  ]);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="10528" height="2198" viewBox="0 0 10528 2198">${innerSvg(redSvg)}${innerSvg(blueSvg)}</svg>`;
  fs.writeFileSync(output, svg);
  await sharp(Buffer.from(svg)).resize({ width: 1200 }).png().toFile(preview);
  process.stdout.write(JSON.stringify({ output, preview, bytes: Buffer.byteLength(svg), width: info.width, height: info.height }));
}

main().catch((error) => {
  process.stderr.write(error.stack || String(error));
  process.exitCode = 1;
});
