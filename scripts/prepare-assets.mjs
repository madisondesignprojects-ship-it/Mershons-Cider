// Prebuild: gold header texture -> webp, favicons from the Mershon's logo, 1200x630 Open Graph images.
import sharp from 'sharp';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
const P = (p) => new URL(`../${p}`, import.meta.url).pathname;
mkdirSync(P('public/og'), { recursive: true });
mkdirSync(P('public/textures'), { recursive: true });
await sharp(P('src/assets/images/brand/header_bg.png')).webp({ quality: 70 }).toFile(P('public/textures/gold.webp'));

// Favicons: logo lettering centred on the logo's own peach panel.
const logo = P('src/assets/images/brand/logo-lettering.png');
async function icon(size, out) {
  const inner = await sharp(logo).resize(Math.round(size * 0.92), Math.round(size * 0.92), { fit: 'inside' }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: '#0C0909' } }).composite([{ input: inner, gravity: 'center' }]).png().toFile(out);
}
await icon(180, P('public/apple-touch-icon.png'));
await icon(192, P('public/favicon-192.png'));
const png32 = await sharp(logo).resize(32, 32, { fit: 'contain', background: { r: 12, g: 9, b: 9, alpha: 1 } }).png().toBuffer();
const head = Buffer.alloc(22);
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(1, 4);
head.writeUInt8(32, 6); head.writeUInt8(32, 7); head.writeUInt16LE(1, 10); head.writeUInt16LE(32, 12);
head.writeUInt32LE(png32.length, 14); head.writeUInt32LE(22, 18);
writeFileSync(P('public/favicon.ico'), Buffer.concat([head, png32]));

async function og(src, out, pos = 'centre') {
  if (existsSync(P(out))) return;
  await sharp(P(`src/assets/images/${src}`)).resize(1200, 630, { fit: 'cover', position: pos }).jpeg({ quality: 82 }).toFile(P(out));
}
await og('photos/bottles-shelf.jpg', 'public/og/default.jpg');
await og('photos/flight-board.jpg', 'public/og/tasting-room.jpg');
await og('photos/event-crowd.jpg', 'public/og/private-events.jpg');
await og('photos/barrels-row.jpg', 'public/og/our-story.jpg');
console.log('assets ready');
