# Bill's Lua Obfuscator

A production-ready, web-based Lua code obfuscation tool that protects Lua source code by transforming it into functionally equivalent but harder-to-read code. Built with Next.js 15, React 19, and TypeScript, featuring real-time obfuscation, Monaco code editor, and comprehensive test coverage.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-197%20passing-success)](web/__tests__)

## Overview

Bill's Lua Obfuscator is a **fully client-side** code protection tool designed for Lua developers working on game mods, addons, and scripts. All obfuscation happens in your browser—your code never leaves your machine, ensuring complete privacy and security.

**Live Demo**: [https://lua-obfuscator-sable.vercel.app/](https://lua-obfuscator-sable.vercel.app/)

### Key Highlights

- 🔒 **100% Client-Side Processing** - Your code stays on your machine
- ⚡ **Real-Time Obfuscation** - Instant feedback with Monaco editor
- 🎯 **Multiple Techniques** - Name mangling, string encoding, control flow, minification
- 📱 **Fully Responsive** - Works on mobile, tablet, and desktop
- ✅ **197 Passing Tests** - 160 unit tests + 37 E2E tests across 6 browsers
- 🚀 **Production Ready** - Deployed on Vercel with analytics and monitoring

## Features

### Core Obfuscation Capabilities

| Feature                      | Description                                                               | Strength Level |
| ---------------------------- | ------------------------------------------------------------------------- | -------------- |
| **Name Mangling**            | Replaces variable/function names with hexadecimal identifiers (`_0x0000`) | High           |
| **String Encoding**          | Converts strings to byte arrays using `string.char()`                     | Medium         |
| **Number Encoding**          | Transforms numeric literals into mathematical expressions                 | Medium         |
| **Control Flow Obfuscation** | Adds opaque predicates to complicate analysis                             | High           |
| **Code Minification**        | Removes comments, whitespace, and blank lines                             | Low            |

### User Experience

- **Monaco Code Editor** - Industry-standard editor with Lua syntax highlighting
- **Configurable Protection Levels** - Slider from 0-100% with automatic technique selection
- **Individual Technique Toggles** - Fine-grained control over each obfuscation method
- **Copy to Clipboard** - One-click copy with visual feedback
- **Download as .lua** - Export obfuscated code directly
- **Error Handling** - Clear error messages with validation
- **Smart Defaults** - Pre-configured with functional Lua example

### Lua Compatibility

| Version     | Status          | Target Use Cases                |
| ----------- | --------------- | ------------------------------- |
| **Lua 5.1** | ✅ Full Support | WoW, FiveM, Garry's Mod, Roblox |
| **Lua 5.2** | ✅ Supported    | General scripting               |
| **Lua 5.3** | ✅ Supported    | Modern applications             |
| **LuaJIT**  | ✅ Compatible   | High-performance scenarios      |

**Protected Elements**: All Lua keywords, standard library functions (`print`, `pairs`, `ipairs`, etc.), and global tables (`math`, `string`, `table`, etc.) are automatically preserved.

## Quick Start

### Prerequisites

- Node.js 18+ (20+ recommended)
- npm, yarn, or pnpm package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/LUA-Obfuscator.git
cd LUA-Obfuscator/web

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Building for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

## Usage Examples

### Web Interface

1. **Paste or type** your Lua code in the left editor
2. **Configure settings** using the right sidebar:
   - Toggle individual techniques (Name Mangling, String Encoding, etc.)
   - Adjust Protection Level slider (0-100%)
3. **Click Obfuscate** to generate protected code
4. **Copy or download** the obfuscated result

### Example Transformation

**Original Code:**

```lua
local function calculateScore(basePoints, multiplier)
  local maxScore = 1000
  local result = basePoints * multiplier

  if result > maxScore then
    result = maxScore
  end

  print("Score: " .. result)
  return result
end
```

**Obfuscated Code (Name Mangling + String Encoding + Minification):**

```lua
local function _0x0001(_0x0002,_0x0003)local _0x0004=1000;local _0x0005=_0x0002*_0x0003;if _0x0005>_0x0004 then _0x0005=_0x0004 end;print(string.char(83,99,111,114,101,58,32).._0x0005)return _0x0005 end
```

## Architecture

### Technology Stack

#### Frontend Framework

- **Next.js 15.5.4** - React framework with App Router
- **React 19.2.0** - UI library with concurrent features
- **TypeScript 5.9.3** - Type-safe development

#### UI Components

- **Tailwind CSS 4.1.14** - Utility-first styling
- **shadcn/ui** - Radix UI primitives
- **Lucide React 0.545.0** - Icon library
- **Monaco Editor 4.7.0** - VS Code's editor component

#### Obfuscation Engine

- **luaparse 0.3.1** - Lua AST parser and validator
- **Custom Transformation Engine** - AST-based obfuscation system

#### Testing & Quality

- **Jest 29.7.0** - Unit testing framework
- **Playwright 1.56.0** - E2E browser testing
- **ESLint 9.37.0** - Code linting
- **Prettier** - Code formatting

#### Analytics & Monitoring

- **Vercel Analytics 1.5.0** - User analytics
- **Vercel Speed Insights 1.2.0** - Performance monitoring
- **Google Analytics** - Comprehensive tracking

### Project Structure

```
LUA-Obfuscator/
├── web/                          # Next.js web application
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx             # Main obfuscator interface
│   │   ├── layout.tsx           # Root layout with metadata
│   │   └── api/analytics/       # Analytics tracking endpoints
│   ├── components/              # React components
│   │   ├── CodeEditor.tsx       # Monaco editor wrapper
│   │   ├── BackgroundGradient.tsx  # Animated background
│   │   └── ui/                  # shadcn components
│   ├── lib/                     # Core obfuscation logic
│   │   ├── parser.ts            # Lua AST parser wrapper
│   │   ├── obfuscator.ts        # Main obfuscation engine
│   │   ├── obfuscator-simple.ts # Simplified API
│   │   ├── generator.ts         # AST to Lua code generator
│   │   └── analytics-*.ts       # Analytics utilities
│   ├── __tests__/               # Test suites
│   │   ├── unit/               # Unit tests (160 tests)
│   │   ├── integration/        # Integration tests
│   │   ├── e2e/                # E2E tests (37 tests, 6 browsers)
│   │   └── fixtures/           # Test data and samples
│   ├── playwright.config.ts     # Playwright configuration
│   ├── jest.config.js          # Jest configuration
│   └── .prettierrc.json        # Code formatting rules
├── CLAUDE.md                     # AI assistant documentation
├── LICENSE                       # MIT license
└── README.md                     # This file
```

### Core Components

#### Parser/Lexer Layer (`lib/parser.ts`)

- Uses luaparse library for AST generation
- Supports Lua 5.1, 5.2, 5.3 syntax
- Validates code structure and provides error messages
- Exports: `parseLua()`, `validateLua()`

#### Transformation Engine (`lib/obfuscator.ts`)

- Applies multiple obfuscation techniques:
  - Variable/function name mangling (hexadecimal identifiers)
  - String encoding (byte array transformation)
  - Number encoding (mathematical expressions)
  - Control flow obfuscation (opaque predicates)
  - Code minification (whitespace removal)
- Configurable protection levels (0-100%)
- Preserves Lua standard library globals
- Exports: `obfuscateLua()` with `ObfuscationOptions`

#### Code Generator (`lib/generator.ts`)

- Converts transformed AST back to valid Lua source
- Handles 20+ Lua node types
- Maintains functional equivalence
- Supports minification mode
- Exports: `generateCode()`

## Testing

### Test Coverage

Bill's Lua Obfuscator includes comprehensive test coverage across multiple levels:

| Test Suite            | Tests                                 | Coverage                  | Framework  |
| --------------------- | ------------------------------------- | ------------------------- | ---------- |
| **Unit Tests**        | 160                                   | 90%+ lines, 85%+ branches | Jest       |
| **Integration Tests** | Included in unit suite                | Full pipeline             | Jest       |
| **E2E Tests**         | 37 tests × 6 browsers = 222 scenarios | Full UI workflows         | Playwright |

### Running Tests

```bash
# Run unit tests
npm test

# Run with coverage report
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run all tests (unit + E2E)
npm run test:all
```

### Test Categories

#### Unit Tests (`__tests__/unit/lib/`)

- Parser validation and error handling
- Obfuscation technique verification
- Code generation accuracy
- Edge case handling

#### Integration Tests (`__tests__/integration/`)

- End-to-end obfuscation pipeline
- Round-trip validation (obfuscate → parse → verify)
- Real-world Lua scripts (fibonacci, factorial, quicksort)
- Option combination testing

#### E2E Tests (`__tests__/e2e/`)

**Obfuscation Workflow** (13 tests)

- Application loading and initialization
- Code input and obfuscation
- Copy to clipboard functionality
- Download functionality
- Settings configuration

**Responsive Design** (21 tests)

- Mobile viewport (375px, 390px)
- Tablet viewport (768px, 1024px)
- Desktop viewport (1920px+)
- Orientation changes
- Touch interactions

**Error Handling** (10 tests)

- Invalid Lua code detection
- Syntax error display
- Recovery after errors
- Empty input handling

### Browser Testing Matrix

Tests run automatically on:

- ✅ Desktop Chrome
- ✅ Desktop Firefox
- ✅ Desktop Safari
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 12)
- ✅ iPad Pro

## Code Quality

### Formatting

The project uses Prettier for consistent code formatting:

```bash
# Format all files
npm run format

# Check formatting without changes
npm run format:check
```

**Prettier Configuration:**

- Tab width: 2 spaces (using tabs)
- Print width: 120 characters
- Single quotes: false (double quotes)
- Semicolons: always
- Trailing commas: ES5
- Arrow parens: avoid

### Linting

```bash
# Run ESLint
npm run lint
```

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

### Environment Variables

Create a `.env.local` file:

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Google Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Docker Deployment

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# Build and run
docker build -t lua-obfuscator .
docker run -p 3000:3000 lua-obfuscator
```

### Static Export

```bash
# Build static site
npm run build

# Deploy the .next folder to any static hosting
# (Vercel, Netlify, Cloudflare Pages, etc.)
```

## Use Cases

### Game Development

- **World of Warcraft Addons** - Protect addon code from theft and modification
- **FiveM/RedM Scripts** - Secure server-side resources and client scripts
- **Garry's Mod** - Protect Lua gamemodes and addons
- **Roblox** - Obfuscate game scripts (Lua 5.1 compatible)

### Development & Education

- **Code Protection** - Secure proprietary Lua implementations
- **Anti-Piracy** - Make code harder to copy and redistribute
- **Learning Tool** - Study obfuscation techniques and AST manipulation
- **Security Research** - Test deobfuscation resistance

## Roadmap

### ✅ v1.0 - Current Release

- [x] Real-time obfuscation with Monaco editor
- [x] Name mangling with hexadecimal identifiers
- [x] String encoding using byte arrays
- [x] Number encoding with mathematical expressions
- [x] Control flow obfuscation with opaque predicates
- [x] Code minification
- [x] Configurable protection levels (0-100%)
- [x] Responsive design (mobile, tablet, desktop)
- [x] Comprehensive test coverage (197 tests)
- [x] Production deployment with analytics

### 🚧 v1.1 - Advanced Obfuscation

- [ ] Custom encryption algorithms for strings
- [ ] Advanced control flow flattening
- [ ] Dead code injection
- [ ] Anti-debugging measures
- [ ] Configurable output formatting
- [ ] Before/after code size metrics

### 🔮 v1.2 - Extended Features

- [ ] Batch file processing
- [ ] CLI version for automation
- [ ] API endpoints for integration
- [ ] Custom obfuscation profiles
- [ ] Deobfuscation resistance testing
- [ ] Lua 5.4 full support

### 🎯 v2.0 - Enterprise

- [ ] Team collaboration features
- [ ] Version history and rollback
- [ ] Advanced analytics dashboard
- [ ] Premium obfuscation techniques
- [ ] Self-hosted deployment options

## Performance

### Obfuscation Speed

- **Small Files** (<100 lines): <100ms
- **Medium Files** (100-1000 lines): 100-500ms
- **Large Files** (1000+ lines): 500ms-2s

### Bundle Size

- **Initial Load**: ~500KB (gzipped)
- **Monaco Editor**: Lazy loaded on demand
- **Runtime**: 100% client-side, no server dependencies

### Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

Contributions are welcome! This project follows standard open-source practices.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** (follow code style guidelines)
4. **Write tests** for new functionality
5. **Run all tests** (`npm run test:all`)
6. **Format code** (`npm run format`)
7. **Commit changes** (`git commit -m 'Add amazing feature'`)
8. **Push to branch** (`git push origin feature/amazing-feature`)
9. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript strict mode conventions
- Use Tailwind CSS for all styling (no custom CSS)
- Maintain component modularity
- Add JSDoc comments for complex functions
- Include unit tests for new obfuscation techniques
- Add E2E tests for UI changes
- Run Prettier before committing
- Ensure all tests pass locally

### Testing Requirements

- Unit test coverage: Maintain 85%+ branch coverage
- Add E2E tests for new user-facing features
- Test across multiple Lua code samples
- Verify responsive behavior on mobile

## Troubleshooting

### Common Issues

| Issue                         | Solution                                 |
| ----------------------------- | ---------------------------------------- |
| Monaco editor not loading     | Clear browser cache, check network tab   |
| Obfuscation fails silently    | Check browser console for errors         |
| Tests failing locally         | Run `npm install` to update dependencies |
| Prettier formatting conflicts | Run `npm run format` to auto-fix         |

### Browser Compatibility

If experiencing issues:

1. Update to the latest browser version
2. Disable browser extensions that modify JavaScript
3. Check browser console for error messages
4. Try incognito/private mode to rule out extensions

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

### Core Technologies

- **[luaparse](https://github.com/fstirlitz/luaparse)** - Lua AST parser by Oskar Schöldström
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - Microsoft's VS Code editor component
- **[Next.js](https://nextjs.org/)** - Vercel's React framework
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework

### Design & UI

- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful component library
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide](https://lucide.dev/)** - Icon library

### Inspiration

- Prometheus Obfuscator
- LuaSrcDiet
- IronBrew2

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/LUA-Obfuscator/issues)
- **Documentation**: See [CLAUDE.md](CLAUDE.md) for development details
- **Web Interface Docs**: See [web/README.md](web/README.md) for specific implementation details

## Security

This tool is designed for **legitimate code protection** purposes. Please use responsibly and in accordance with applicable laws and platform terms of service.

### Privacy

- **100% Client-Side**: All code processing happens in your browser
- **No Server Storage**: Code is never uploaded or stored
- **Optional Analytics**: Google Analytics can be disabled
- **Open Source**: Full transparency - review the code yourself

---

**Built with ❤️ for the Lua community by Bill Chirico**

_Star ⭐ this repository if you find it helpful!_
