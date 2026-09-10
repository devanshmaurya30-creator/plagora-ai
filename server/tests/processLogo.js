import fs from 'fs';
import zlib from 'zlib';

const inputPath = 'C:/Users/devan/.gemini/antigravity/brain/db93f10a-362e-4bd4-8f88-adf4f4dfd4a4/media__1789056685990.png';
const outputPath = 'd:/Plag Ai/public/logo.png';
const faviconPath = 'd:/Plag Ai/public/favicon.png';
const assetsPath = 'd:/Plag Ai/src/assets/logo.png';

console.log('Processing Plagora AI Logo Asset...');

const buf = fs.readFileSync(inputPath);

// Extract width, height
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);

// Extract IDAT chunks
const idatChunks = [];
let offset = 8; // skip PNG signature

while (offset < buf.length) {
  const length = buf.readUInt32BE(offset);
  const type = buf.toString('ascii', offset + 4, offset + 8);
  if (type === 'IDAT') {
    idatChunks.push(buf.slice(offset + 8, offset + 8 + length));
  }
  offset += 12 + length;
}

const compressed = Buffer.concat(idatChunks);
const decompressed = zlib.inflateSync(compressed);

const stroke = width * 4;
const raw = Buffer.alloc(width * height * 4);

// Unfilter PNG scanlines
let srcIdx = 0;
let prevRow = new Uint8Array(stroke);

for (let y = 0; y < height; y++) {
  const filterType = decompressed[srcIdx++];
  const row = new Uint8Array(stroke);

  for (let x = 0; x < stroke; x++) {
    const rawByte = decompressed[srcIdx++];
    let left = x >= 4 ? row[x - 4] : 0;
    let up = prevRow[x];
    let upperLeft = x >= 4 ? prevRow[x - 4] : 0;

    let val = rawByte;
    if (filterType === 1) {
      val = (rawByte + left) & 0xff;
    } else if (filterType === 2) {
      val = (rawByte + up) & 0xff;
    } else if (filterType === 3) {
      val = (rawByte + Math.floor((left + up) / 2)) & 0xff;
    } else if (filterType === 4) {
      const p = left + up - upperLeft;
      const pa = Math.abs(p - left);
      const pb = Math.abs(p - up);
      const pc = Math.abs(p - upperLeft);
      let pr = upperLeft;
      if (pa <= pb && pa <= pc) pr = left;
      else if (pb <= pc) pr = up;
      val = (rawByte + pr) & 0xff;
    }
    row[x] = val;
  }

  Buffer.from(row).copy(raw, y * stroke);
  prevRow = row;
}

// Inspect top-left pixel
const cornerR = raw[0];
const cornerG = raw[1];
const cornerB = raw[2];
const cornerA = raw[3];

console.log(`Image Size: ${width}x${height}`);
console.log(`Top-left pixel: R=${cornerR}, G=${cornerG}, B=${cornerB}, A=${cornerA}`);

// If background is white (R > 230, G > 230, B > 230), convert outer white pixels to transparent (Alpha = 0)
let pixelsChanged = 0;
if (cornerR > 200 && cornerG > 200 && cornerB > 200) {
  console.log('Detected solid white outer background. Removing white background for transparency...');
  
  for (let i = 0; i < raw.length; i += 4) {
    const r = raw[i];
    const g = raw[i + 1];
    const b = raw[i + 2];

    // High brightness threshold (pure white/off-white background)
    if (r > 240 && g > 240 && b > 240) {
      raw[i + 3] = 0; // Alpha = 0 (Transparent)
      pixelsChanged++;
    } else if (r > 210 && g > 210 && b > 210) {
      // Soft alpha edge feathering for smooth anti-aliased border
      const brightness = (r + g + b) / 3;
      const alpha = Math.max(0, Math.min(255, Math.round((255 - brightness) * 5.5)));
      raw[i + 3] = alpha;
      pixelsChanged++;
    }
  }
  console.log(`Updated ${pixelsChanged} background pixels to transparent.`);
}

// Re-encode scanlines with FilterType 0 (None)
const filteredOutput = Buffer.alloc(height * (1 + stroke));
for (let y = 0; y < height; y++) {
  filteredOutput[y * (1 + stroke)] = 0; // FilterType = 0
  raw.copy(filteredOutput, y * (1 + stroke) + 1, y * stroke, (y + 1) * stroke);
}

const recompressed = zlib.deflateSync(filteredOutput);

// Build valid PNG
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const typeAndData = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([lenBuf, typeAndData, crcBuf]);
}

const pngHeader = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const ihdrData = Buffer.alloc(13);
ihdrData.writeUInt32BE(width, 0);
ihdrData.writeUInt32BE(height, 4);
ihdrData[8] = 8; // bit depth
ihdrData[9] = 6; // color type 6 (RGBA)
ihdrData[10] = 0; // compression
ihdrData[11] = 0; // filter method
ihdrData[12] = 0; // interlace

const ihdrChunk = makeChunk('IHDR', ihdrData);
const idatChunk = makeChunk('IDAT', recompressed);
const iendChunk = makeChunk('IEND', Buffer.alloc(0));

const finalPng = Buffer.concat([pngHeader, ihdrChunk, idatChunk, iendChunk]);

// Save PNG to public and src/assets
fs.writeFileSync(outputPath, finalPng);
fs.writeFileSync(faviconPath, finalPng);
fs.writeFileSync(assetsPath, finalPng);

console.log(`Saved transparent logo PNG (${(finalPng.length / 1024).toFixed(1)} KB) to:`);
console.log(`- ${outputPath}`);
console.log(`- ${faviconPath}`);
console.log(`- ${assetsPath}`);
