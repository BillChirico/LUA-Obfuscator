const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Configuration
const publicDir = path.join(__dirname, 'public');
const brandColors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  background: '#0f172a'
};

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Function to create gradient
function createGradient(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, brandColors.primary);
  gradient.addColorStop(1, brandColors.secondary);
  return gradient;
}

// Function to generate icon with initials
function generateIcon(size, filename, options = {}) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  if (options.solidBackground) {
    ctx.fillStyle = brandColors.background;
    ctx.fillRect(0, 0, size, size);
  }
  
  // Gradient circle/square
  const padding = size * 0.1;
  const innerSize = size - (padding * 2);
  
  ctx.fillStyle = createGradient(ctx, size, size);
  
  if (options.rounded) {
    // Rounded rectangle
    const radius = innerSize * 0.2;
    ctx.beginPath();
    ctx.roundRect(padding, padding, innerSize, innerSize, radius);
    ctx.fill();
  } else {
    // Circle
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, innerSize / 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Text "LO"
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.4}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('LO', size / 2, size / 2);
  
  // Save file
  const buffer = canvas.toBuffer('image/png');
  const filepath = path.join(publicDir, filename);
  fs.writeFileSync(filepath, buffer);
  console.log(`✓ Generated: ${filename} (${size}x${size})`);
}

// Function to generate OG image
function generateOGImage() {
  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  ctx.fillStyle = createGradient(ctx, width, height);
  ctx.fillRect(0, 0, width, height);
  
  // Icon circle
  const iconSize = 200;
  const iconX = width / 2 - iconSize / 2;
  const iconY = 100;
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.beginPath();
  ctx.arc(width / 2, iconY + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Icon text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 100px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('LO', width / 2, iconY + iconSize / 2);
  
  // App name
  ctx.font = 'bold 80px Arial, sans-serif';
  ctx.fillText('Lua Obfuscator', width / 2, 380);
  
  // Tagline
  ctx.font = '40px Arial, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillText('Professional Lua Code Protection', width / 2, 460);
  
  // Save file
  const buffer = canvas.toBuffer('image/png');
  const filepath = path.join(publicDir, 'og-image.png');
  fs.writeFileSync(filepath, buffer);
  console.log(`✓ Generated: og-image.png (${width}x${height})`);
}

// Function to generate screenshot placeholder
function generateScreenshot(width, height, filename, text) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = brandColors.background;
  ctx.fillRect(0, 0, width, height);
  
  // Gradient overlay
  ctx.fillStyle = createGradient(ctx, width, height);
  ctx.globalAlpha = 0.1;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 1.0;
  
  // Center text
  ctx.fillStyle = '#ffffff';
  ctx.font = `${Math.floor(height * 0.08)}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
  
  // Save file
  const buffer = canvas.toBuffer('image/png');
  const filepath = path.join(publicDir, filename);
  fs.writeFileSync(filepath, buffer);
  console.log(`✓ Generated: ${filename} (${width}x${height})`);
}

// Generate all icons
console.log('Generating icons...\n');

try {
  // Standard icons
  generateIcon(512, 'icon-512.png');
  generateIcon(192, 'icon-192.png');
  generateIcon(32, 'icon.png');
  
  // Apple icon (with solid background)
  generateIcon(180, 'apple-icon.png', { solidBackground: true });
  
  // OpenGraph image
  generateOGImage();
  
  // Screenshots (placeholders)
  generateScreenshot(1280, 720, 'screenshot-wide.png', 'Lua Obfuscator - Desktop View');
  generateScreenshot(750, 1334, 'screenshot-mobile.png', 'Lua Obfuscator - Mobile View');
  
  console.log('\n✅ All icons generated successfully!');
  console.log('\nNote: favicon.ico should be generated from icon.png using a tool like:');
  console.log('  - https://realfavicongenerator.net/');
  console.log('  - Or: convert icon-512.png -define icon:auto-resize=48,32,16 favicon.ico');
  
} catch (error) {
  console.error('❌ Error generating icons:', error.message);
  console.error('\nMake sure canvas is installed:');
  console.error('  npm install canvas');
  process.exit(1);
}
