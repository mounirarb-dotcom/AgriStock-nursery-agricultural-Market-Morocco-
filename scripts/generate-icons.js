import fs from 'fs';
import zlib from 'zlib';

function createSolidPNG(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 2; // Color type: 2 (RGB)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw image scanlines
  // Each scanline begins with filter type byte (0) followed by width * 3 bytes RGB
  const rawLineLength = 1 + width * 3;
  const rawData = Buffer.alloc(height * rawLineLength);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.42;

  for (let y = 0; y < height; y++) {
    const lineOffset = y * rawLineLength;
    rawData[lineOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pxOffset = lineOffset + 1 + x * 3;
      const dist = Math.hypot(x - cx, y - cy);
      if (dist < radius) {
        // Inner circle with gradient towards center
        const factor = Math.max(0, 1 - dist / radius);
        rawData[pxOffset] = Math.min(255, Math.floor(r + factor * 40));
        rawData[pxOffset + 1] = Math.min(255, Math.floor(g + factor * 30));
        rawData[pxOffset + 2] = Math.min(255, Math.floor(b + factor * 20));
      } else {
        // Background dark green
        rawData[pxOffset] = 20; // #14532d
        rawData[pxOffset + 1] = 83;
        rawData[pxOffset + 2] = 45;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);

  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function crc32(buf) {
  let c;
  let crcTable = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }

  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

const pwa192 = createSolidPNG(192, 192, 34, 197, 94);
fs.writeFileSync('public/pwa-192x192.png', pwa192);

const pwa512 = createSolidPNG(512, 512, 34, 197, 94);
fs.writeFileSync('public/pwa-512x512.png', pwa512);

const pwaMaskable = createSolidPNG(512, 512, 22, 101, 52);
fs.writeFileSync('public/pwa-maskable-512x512.png', pwaMaskable);

const appleTouch = createSolidPNG(180, 180, 34, 197, 94);
fs.writeFileSync('public/apple-touch-icon.png', appleTouch);

console.log('Successfully generated PWA PNG icon assets');
