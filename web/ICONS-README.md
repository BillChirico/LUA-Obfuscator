# Icon & Image Assets Guide

This document outlines the required icons and images for optimal SEO and PWA functionality.

## Required Assets

### 1. Favicon (`public/favicon.ico`)
- **Size**: 16x16, 32x32, 48x48 (multi-size .ico file)
- **Purpose**: Browser tab icon
- **Design**: Lock icon with gradient (#007AFF to #5856D6)

### 2. Standard Icon (`public/icon.png`)
- **Size**: 32x32px
- **Format**: PNG with transparency
- **Purpose**: Modern favicon alternative

### 3. PWA Icons
Located in `public/` directory:

#### `icon-192.png`
- **Size**: 192x192px
- **Format**: PNG with transparency
- **Purpose**: Android home screen icon

#### `icon-512.png`
- **Size**: 512x512px
- **Format**: PNG with transparency
- **Purpose**: High-res Android icon, PWA install

### 4. Apple Touch Icon (`public/apple-icon.png`)
- **Size**: 180x180px
- **Format**: PNG (no transparency, use solid background)
- **Purpose**: iOS home screen icon
- **Background**: #007AFF or #0f172a

### 5. OpenGraph Image (`public/og-image.png`)
- **Size**: 1200x630px
- **Format**: PNG or JPEG
- **Purpose**: Social media sharing preview
- **Content Suggestions**:
  - App name: "Lua Obfuscator"
  - Tagline: "Professional Lua Code Protection"
  - Lock icon or code visualization
  - Gradient background matching brand (#007AFF to #5856D6)

### 6. PWA Screenshots

#### Desktop (`public/screenshot-wide.png`)
- **Size**: 1280x720px
- **Format**: PNG
- **Purpose**: PWA installation preview (desktop)
- **Content**: Full app interface screenshot

#### Mobile (`public/screenshot-mobile.png`)
- **Size**: 750x1334px (iPhone 8 dimensions)
- **Format**: PNG
- **Purpose**: PWA installation preview (mobile)
- **Content**: Mobile-optimized app view

## Design Guidelines

### Brand Colors
- **Primary**: `#007AFF` (Apple Blue)
- **Secondary**: `#5856D6` (Purple)
- **Background**: `#0f172a` (Dark slate)
- **Gradient**: Linear gradient from #007AFF to #5856D6

### Icon Design Principles
1. **Simple & Recognizable**: Lock icon symbolizes code protection
2. **High Contrast**: Icons should work on both light and dark backgrounds
3. **Consistent Branding**: Use brand gradient on all icons
4. **Safe Area**: Keep important elements within 80% of canvas for maskable icons

## Quick Generation with Figma/Design Tools

### Using Figma
1. Create 512x512 artboard
2. Add lock icon centered
3. Apply gradient background (#007AFF → #5856D6)
4. Export at required sizes

### Using Online Tools
- **Favicon Generator**: https://realfavicongenerator.net/
- **PWA Icon Generator**: https://www.pwabuilder.com/imageGenerator

### Using CLI Tools
```bash
# Install ImageMagick
brew install imagemagick

# Generate from master icon (icon-512.png)
convert icon-512.png -resize 192x192 icon-192.png
convert icon-512.png -resize 180x180 apple-icon.png
convert icon-512.png -resize 32x32 icon.png
```

## Next.js Icon File Route Handlers (Alternative)

Instead of static files, you can use Next.js file-based metadata routes:

### `app/icon.tsx` or `app/icon.png`
Next.js will automatically serve this as `/icon.png`

### `app/apple-icon.tsx` or `app/apple-icon.png`
Next.js will automatically serve this as `/apple-icon.png`

See: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons

## Verification Checklist

After generating all assets:

- [ ] `public/favicon.ico` exists
- [ ] `public/icon.png` (32x32) exists
- [ ] `public/icon-192.png` exists
- [ ] `public/icon-512.png` exists
- [ ] `public/apple-icon.png` (180x180) exists
- [ ] `public/og-image.png` (1200x630) exists
- [ ] `public/screenshot-wide.png` (1280x720) exists
- [ ] `public/screenshot-mobile.png` (750x1334) exists
- [ ] All icons use consistent branding
- [ ] OpenGraph image displays correctly on social media

## Testing

### Favicon
Visit your site and check browser tab icon

### PWA Icons
Use Chrome DevTools > Application > Manifest to verify icons load

### OpenGraph
Test with:
- https://www.opengraph.xyz/
- https://cards-dev.twitter.com/validator
- Facebook Sharing Debugger

### Lighthouse
Run Lighthouse audit in Chrome DevTools to verify PWA icon requirements
