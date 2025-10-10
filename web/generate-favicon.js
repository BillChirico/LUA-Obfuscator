const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const publicDir = path.join(__dirname, 'public');
const sourceIcon = path.join(publicDir, 'icon-512.png');
const outputFavicon = path.join(publicDir, 'favicon.ico');

// ICO file format helper
function createICO(sizes) {
  // ICO header
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type: 1 = ICO
  header.writeUInt16LE(sizes.length, 4); // Number of images

  // Directory entries
  const directories = [];
  let imageOffset = 6 + (sizes.length * 16);

  sizes.forEach(size => {
    const dir = Buffer.alloc(16);
    dir.writeUInt8(size.width, 0); // Width
    dir.writeUInt8(size.height, 1); // Height
    dir.writeUInt8(0, 2); // Color palette
    dir.writeUInt8(0, 3); // Reserved
    dir.writeUInt16LE(1, 4); // Color planes
    dir.writeUInt16LE(32, 6); // Bits per pixel
    dir.writeUInt32LE(size.data.length, 8); // Image size
    dir.writeUInt32LE(imageOffset, 12); // Image offset
    directories.push(dir);
    imageOffset += size.data.length;
  });

  // Combine everything
  return Buffer.concat([header, ...directories, ...sizes.map(s => s.data)]);
}

// Generate PNG data for a specific size
async function generatePNGData(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Load the source image
  const img = await loadImage(sourceIcon);
  
  // Draw scaled image
  ctx.drawImage(img, 0, 0, size, size);
  
  return canvas.toBuffer('image/png');
}

// Generate favicon
async function generateFavicon() {
  console.log('Generating favicon.ico...\n');
  
  try {
    const sizes = [16, 32, 48];
    const imageData = [];

    for (const size of sizes) {
      console.log(`✓ Generating ${size}x${size} icon...`);
      const data = await generatePNGData(size);
      imageData.push({ width: size, height: size, data });
    }

    const icoBuffer = createICO(imageData);
    fs.writeFileSync(outputFavicon, icoBuffer);
    
    console.log(`\n✅ favicon.ico generated successfully!`);
    console.log(`   Location: ${outputFavicon}`);
    
  } catch (error) {
    console.error('❌ Error generating favicon:', error.message);
    process.exit(1);
  }
}

generateFavicon();
