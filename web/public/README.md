# Public Assets

This directory contains all public assets for the Lua Obfuscator web application.

## Icons & Images

All icons feature the **"LO"** initials (Lua Obfuscator) with a gradient design using the brand colors (#007AFF → #5856D6).

### Files

| File | Size | Purpose |
|------|------|---------|
| `favicon.ico` | 16×16, 32×32, 48×48 | Browser tab icon |
| `icon.png` | 32×32 | Modern favicon alternative |
| `icon-192.png` | 192×192 | Android home screen icon |
| `icon-512.png` | 512×512 | High-res Android icon, PWA install |
| `apple-icon.png` | 180×180 | iOS home screen icon |
| `og-image.png` | 1200×630 | Social media preview image |
| `screenshot-wide.png` | 1280×720 | PWA desktop preview (placeholder) |
| `screenshot-mobile.png` | 750×1334 | PWA mobile preview (placeholder) |

### Regenerating Icons

To regenerate all icons:

```bash
npm run generate:icons
```

See `../ICONS-GENERATED.md` for more details.

---

**Note**: These icons were programmatically generated. For production, consider creating custom designs with a lock symbol or code visualization.
