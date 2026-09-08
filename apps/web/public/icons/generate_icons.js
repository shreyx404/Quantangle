const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcPayload = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcPayload);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createPng(width, height, getPixel) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrChunk = writeChunk('IHDR', ihdrData);

  // Scanlines: filter byte (0) + 4 * width bytes
  const scanlineSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * scanlineSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineSize;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = writeChunk('IDAT', compressed);
  const iendChunk = writeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

// Quantum Icon Generator
function renderQuantumIcon(x, y, w, h, isMaskable = false) {
  // Normalize coords to [-1, 1]
  const nx = (x / w) * 2 - 1;
  const ny = (y / h) * 2 - 1;
  const dist = Math.sqrt(nx * nx + ny * ny);

  // Base background: #060912
  let r = 6, g = 9, b = 18, a = 255;

  if (!isMaskable) {
    // Rounded squircle mask for non-maskable icons
    const squircle = Math.pow(Math.abs(nx), 3.5) + Math.pow(Math.abs(ny), 3.5);
    if (squircle > 0.95) {
      return [0, 0, 0, 0]; // Transparent outside icon plate
    }
  }

  // Radial gradient in center: #0f172a
  const centerGrad = Math.max(0, 1 - dist * 1.2);
  r = Math.round(r + (15 - r) * centerGrad);
  g = Math.round(g + (23 - g) * centerGrad);
  b = Math.round(b + (42 - b) * centerGrad);

  // Concentric coordinate grid rings
  const ring1 = Math.abs(dist - 0.7);
  if (ring1 < 0.008) {
    return [30, 41, 59, 255];
  }
  const ring2 = Math.abs(dist - 0.45);
  if (ring2 < 0.006) {
    return [30, 41, 59, 255];
  }

  // Ring 1: Cyan-Blue Ellipse rotated by -30 deg
  const angle1 = -Math.PI / 6;
  const rx1 = nx * Math.cos(angle1) + ny * Math.sin(angle1);
  const ry1 = -nx * Math.sin(angle1) + ny * Math.cos(angle1);
  const ellipseDist1 = Math.abs((rx1 * rx1) / (0.74 * 0.74) + (ry1 * ry1) / (0.28 * 0.28) - 1);
  if (ellipseDist1 < 0.05) {
    const intensity = Math.max(0, 1 - ellipseDist1 / 0.05);
    // Cyan glow
    r = Math.min(255, Math.round(r + 6 * intensity * 30));
    g = Math.min(255, Math.round(g + 182 * intensity));
    b = Math.min(255, Math.round(b + 212 * intensity));
  }

  // Ring 2: Amber-Magenta Ellipse rotated by +30 deg
  const angle2 = Math.PI / 6;
  const rx2 = nx * Math.cos(angle2) + ny * Math.sin(angle2);
  const ry2 = -nx * Math.sin(angle2) + ny * Math.cos(angle2);
  const ellipseDist2 = Math.abs((rx2 * rx2) / (0.74 * 0.74) + (ry2 * ry2) / (0.28 * 0.28) - 1);
  if (ellipseDist2 < 0.04) {
    const intensity = Math.max(0, 1 - ellipseDist2 / 0.04);
    // Amber glow
    r = Math.min(255, Math.round(r + 245 * intensity));
    g = Math.min(255, Math.round(g + 158 * intensity));
    b = Math.min(255, Math.round(b + 11 * intensity));
  }

  // Qubit Node 1 on Cyan ring: near (0.6, 0.15)
  const dNode1 = Math.sqrt((nx - 0.55) * (nx - 0.55) + (ny - 0.18) * (ny - 0.18));
  if (dNode1 < 0.045) {
    if (dNode1 < 0.02) return [255, 255, 255, 255];
    return [56, 189, 248, 255];
  }

  // Qubit Node 2 on Amber ring: near (-0.52, 0.2)
  const dNode2 = Math.sqrt((nx + 0.52) * (nx + 0.52) + (ny - 0.2) * (ny - 0.2));
  if (dNode2 < 0.04) {
    if (dNode2 < 0.018) return [255, 255, 255, 255];
    return [251, 191, 36, 255];
  }

  // Quantum Core at Center (dist < 0.12)
  if (dist < 0.12) {
    if (dist < 0.025) return [255, 255, 255, 255];
    if (dist < 0.05) return [56, 189, 248, 255];
    if (dist < 0.08) return [8, 47, 73, 255];
    return [3, 105, 161, 255];
  }

  return [r, g, b, a];
}

const iconsDir = path.join(__dirname);

// 1. Generate 192x192
console.log('Generating icon-192.png...');
const png192 = createPng(192, 192, (x, y, w, h) => renderQuantumIcon(x, y, w, h, false));
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), png192);

// 2. Generate 512x512
console.log('Generating icon-512.png...');
const png512 = createPng(512, 512, (x, y, w, h) => renderQuantumIcon(x, y, w, h, false));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), png512);

// 3. Generate 512x512 Maskable
console.log('Generating icon-maskable.png...');
const pngMaskable = createPng(512, 512, (x, y, w, h) => renderQuantumIcon(x, y, w, h, true));
fs.writeFileSync(path.join(iconsDir, 'icon-maskable.png'), pngMaskable);

// 4. Also copy apple-touch-icon to public/
const publicDir = path.join(__dirname, '..');
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png192);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), png192);

console.log('PWA icons successfully generated!');
