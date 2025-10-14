# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bill's Lua Obfuscator is a **production-ready** web-based Lua code obfuscation tool that protects Lua source code by transforming it into functionally equivalent but harder-to-read code. The application runs entirely in the browser using Next.js 15+ and React 19+.

**Live Features:**

- Real-time Lua code obfuscation in the browser
- Multiple obfuscation techniques with configurable strength levels
- Beautiful, responsive UI that works on mobile, tablet, and desktop
- Monaco code editor with Lua syntax highlighting
- Comprehensive test coverage (160+ unit tests, 37+ E2E tests)

## Architecture

### Implementation Status: ✅ **COMPLETE**

### Core Components

**Parser/Lexer Layer** (`lib/parser.ts`)

- Uses `luaparse` library to tokenize Lua source into AST
- Supports Lua 5.1, 5.2, 5.3 syntax
- Validates code and provides meaningful error messages
- Exports: `parseLua()`, `validateLua()`

**Transformation Engine** (`lib/obfuscator.ts`, `lib/obfuscator-simple.ts`)

- Applies multiple obfuscation techniques to the AST:
  - ✅ **Variable/function name mangling** - Hexadecimal identifier replacement
  - ✅ **String encoding** - Byte array transformation using string.char()
  - ✅ **Number encoding** - Mathematical expression obfuscation
  - ✅ **Control flow obfuscation** - Opaque predicates for complexity
  - ✅ **Code minification** - Whitespace and comment removal
- Configurable protection levels (0-100%)
- Preserves Lua standard library globals (print, pairs, math._, string._, etc.)
- Exports: `obfuscateLua()` with `ObfuscationOptions`

**Code Generator** (`lib/generator.ts`)

- Converts transformed AST back to valid Lua source
- Handles 20+ Lua node types (functions, tables, loops, expressions, etc.)
- Maintains functional equivalence with original code
- Supports minification mode
- Exports: `generateCode()`

### Key Design Considerations

**Lua Version Compatibility**

- Different Lua versions have syntax/semantic differences
- 5.1: Most common in game modding (WoW, FiveM, etc.)
- 5.2+: Added goto statements, different \_ENV handling
- Consider target runtime environment when implementing transformations

**Performance vs Security Trade-offs**

- Heavy obfuscation increases execution time
- Balance protection level with runtime performance
- Provide configurable obfuscation strength levels

**Reversibility Prevention**

- Avoid simple substitution ciphers (easily reversed)
- Layer multiple transformation techniques
- Consider anti-debugging measures for high-security scenarios

## Web Interface Design Standards

**Design Philosophy**

- Create beautiful, production-worthy interfaces (not cookie cutter designs)
- Fully featured and polished for production use
- Professional aesthetic with attention to detail

**Tech Stack**

- JSX syntax with Tailwind CSS (latest version)
- React hooks for state management
- Lucide React for all icons
- shadcn for UI components
- Primary brand color: `#007AFF`
- Primary code font: **JetBrains Mono Nerd Font** (with ligatures enabled)

**Component Guidelines**

- Use shadcn components as the foundation
- Avoid installing additional UI theme packages or icon libraries
- Leverage Lucide React icons exclusively (including for logos)
- Only install new packages when absolutely necessary or explicitly requested

**Design Principles & Patterns**

- **Glassmorphism**: Frosted glass effects with backdrop-blur for depth
- **Micro-interactions**: Smooth animations on hover, focus, and active states
- **Gradient Aesthetics**: Rich, animated gradients with blend modes
- **Visual Feedback**: Clear state indication through color, animation, and icons
- **Smooth Motion**: Cubic-bezier easing (0.4, 0, 0.2, 1) for professional feel
- **Accessibility First**: Focus states, reduced motion support, proper ARIA labels
- **Performance**: GPU acceleration with `will-change-transform` on animated elements
- **Color Coding**: Protection levels use gray/blue/purple/orange scale
- **Typography**: JetBrains Mono with ligatures, optimized text rendering
- **Spacing**: Consistent padding and gap scaling (0.75rem base radius)

**UI/UX Implementation** ✅

- ✅ Monaco code editor with Lua syntax highlighting
- ✅ Real-time obfuscation with 100ms debounce
- ✅ Configuration panel with 5 toggle switches + protection level slider
- ✅ Copy to clipboard and download functionality
- ✅ Processing states with disabled buttons and loading text
- ✅ Fully responsive design (mobile 390px+, tablet 768px+, desktop 1024px+)
- ✅ Error display with meaningful messages
- ✅ Beautiful animated gradient background
- ✅ Touch-friendly controls for mobile devices

**Visual Refinements & Micro-interactions** ✅

- ✅ Animated logo with glow effects and hover rotation
- ✅ Button micro-interactions (scale, hover, press states)
- ✅ Shimmer effect on primary action button
- ✅ Icon animations (rotate, scale, translate)
- ✅ Success notification overlay with auto-dismiss
- ✅ Card hover effects with colored shadows
- ✅ Active technique indicators with animated icons
- ✅ Color-coded protection level badges
- ✅ Custom Monaco theme matching app design
- ✅ Enhanced loading states with gradient spinners
- ✅ Smooth page load animations (fade-in, slide-in)
- ✅ Glassmorphism effects throughout UI
- ✅ Custom scrollbar styling
- ✅ Enhanced focus and selection states
- ✅ Reduced motion accessibility support

## Testing & Quality Assurance

### Test Coverage ✅

**Unit Tests** (`__tests__/unit/lib/`)

- 160 passing tests across 4 test suites
- Coverage: 90%+ lines, functions, statements; 85%+ branches
- Tests: parser.ts, obfuscator.ts, generator.ts
- Framework: Jest + @testing-library/react

**E2E Tests** (`__tests__/e2e/`)

- 37 tests across 6 browser configurations
- Browsers: Chrome, Firefox, Safari (Desktop + Mobile), iPad
- Test files:
  - `obfuscation-workflow.spec.ts` - Full user workflow
  - `responsive.spec.ts` - Mobile/tablet/desktop layouts
  - `error-handling.spec.ts` - Error states and recovery
- Framework: Playwright

**Running Tests:**

```bash
npm test                 # Jest unit tests
npm run test:coverage    # Unit tests with coverage report
npm run test:e2e         # Playwright E2E tests
npm run test:e2e:ui      # Playwright with UI mode
npm run test:all         # Run both Jest and Playwright
```

### Code Formatting

**Prettier Configuration** (`.prettierrc.json`)

- Tab width: 2 spaces (using tabs)
- Print width: 120 characters
- Single quotes: false (use double quotes)
- Semicolons: always
- Trailing commas: ES5
- Arrow parens: avoid

**Commands:**

```bash
npm run format           # Format all files
npm run format:check     # Check formatting without changes
```

## Development Workflow

### File Creation Guidelines

**IMPORTANT: Minimize file creation**

- **NEVER** create markdown (.md) files unless absolutely necessary
- **NEVER** create documentation files proactively
- Only create files when explicitly requested by the user
- Prefer editing existing files over creating new ones
- Exception: Core implementation files (code, tests, configs) that are required for functionality

**When documenting work:**

- Provide documentation inline in responses to the user
- Use code comments for implementation notes
- Update existing README.md if documentation is truly needed
- Ask user first before creating any new documentation files

### Testing Strategy ✅ **IMPLEMENTED**

- ✅ Unit tests for parser, obfuscator, and generator
- ✅ Integration tests with real Lua scripts (fibonacci, factorial, quicksort)
- ✅ E2E tests for complete user workflows
- ✅ Responsive design tests across multiple viewports
- ✅ Error handling and recovery tests
- ✅ Round-trip validation: obfuscate → parse → verify validity

### Common Pitfalls to Avoid

**Lua-Specific Challenges**

- Table constructor syntax variations
- Upvalue handling in closures
- Metatables and metamethods
- Vararg handling (`...`)
- Environment manipulation (`_G`, `_ENV`)

**Obfuscation Errors**

- Breaking closure semantics
- Corrupting string escape sequences
- Invalid identifier generation (Lua keywords, syntax rules)
- Scope pollution with generated names
- Breaking require/module patterns

## Technology Stack

**Frontend Framework**

- Next.js 15.5.4 (App Router)
- React 19.2.0
- TypeScript 5.9.3

**UI Libraries**

- Tailwind CSS 4.1.14
- shadcn/ui components (Radix UI primitives)
- Lucide React 0.545.0 (icons)
- Monaco Editor 4.7.0 (code editor)

**Obfuscation**

- luaparse 0.3.1 (Lua parser)

**Testing**

- Jest 29.7.0 + @testing-library/react 16.1.0
- Playwright 1.56.0

**Code Quality**

- ESLint 9.37.0
- Prettier (latest)

**Analytics**

- Vercel Analytics 1.5.0
- Vercel Speed Insights 1.2.0
- Google Analytics (gtag)

## Project Structure

```
web/
├── app/                          # Next.js App Router
│   ├── api/analytics/           # Analytics tracking endpoint
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Main obfuscator interface
│   ├── globals.css              # Global styles
│   └── manifest.ts              # PWA manifest
├── components/                   # React components
│   ├── BackgroundGradient.tsx   # Animated gradient background
│   ├── CodeEditor.tsx           # Monaco editor wrapper
│   ├── GoogleAnalytics.tsx      # GA integration
│   └── ui/                      # shadcn components
├── lib/                         # Core obfuscation logic
│   ├── parser.ts                # Lua AST parser wrapper
│   ├── obfuscator.ts            # Main obfuscation engine
│   ├── obfuscator-simple.ts     # Simplified API
│   ├── generator.ts             # AST to Lua code generator
│   ├── analytics-client.ts      # Client-side analytics
│   ├── analytics-server.ts      # Server-side analytics
│   └── utils.ts                 # Utility functions
├── __tests__/                   # Test suites
│   ├── unit/lib/               # Unit tests
│   ├── integration/            # Integration tests
│   ├── e2e/                    # Playwright E2E tests
│   └── fixtures/               # Test data
├── types/                       # TypeScript definitions
├── public/                      # Static assets
├── playwright.config.ts         # Playwright configuration
├── jest.config.js              # Jest configuration
├── jest.setup.js               # Jest setup with browser mocks
├── .prettierrc.json            # Prettier configuration
└── package.json                # Dependencies and scripts
```

## Deployment

**Platform:** Vercel
**Build Command:** `npm run build`
**Output Directory:** `.next`
**Node Version:** 20.x

**Environment Variables:**

- `NEXT_PUBLIC_SITE_URL` - Base URL for metadata
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics ID

## Related Projects for Reference

- Prometheus Obfuscator
- LuaSrcDiet (minifier with some obfuscation)
- IronBrew2 (Lua 5.1 obfuscator)

## Maintenance Notes

### When Adding New Features

1. **Write tests first** (TDD approach)
2. **Update TypeScript types** if needed
3. **Add JSDoc documentation** to all functions and components
4. **Include micro-interactions** (hover, focus, active states)
5. **Apply design principles** (glassmorphism, smooth motion, visual feedback)
6. **Ensure accessibility** (ARIA labels, focus states, reduced motion)
7. **Run Prettier** before committing (`npm run format`)
8. **Verify all tests pass** (`npm run test:all`)
9. **Test responsive behavior** on mobile, tablet, desktop
10. **Update CLAUDE.md** if architecture changes

### Design Consistency Checklist

When creating or modifying UI components:

- ✅ Use cubic-bezier(0.4, 0, 0.2, 1) for smooth transitions
- ✅ Add hover effects with scale transformations (1.02x)
- ✅ Include active states with scale down (0.98x)
- ✅ Apply backdrop-blur for glassmorphism effects
- ✅ Use gradient backgrounds with proper opacity
- ✅ Add icon animations (rotate, scale, translate)
- ✅ Implement color-coded visual feedback
- ✅ Include loading states with gradient spinners
- ✅ Support reduced motion preference
- ✅ Test focus states with keyboard navigation

### Performance Considerations

- Obfuscation runs client-side with 100ms timeout to prevent UI blocking
- Monaco editor uses dynamic import to reduce initial bundle size
- Code is processed in chunks to maintain responsiveness
- Analytics calls are fire-and-forget to avoid blocking UI
- GPU-accelerated animations with `will-change-transform`
- Smooth 60fps animations using cubic-bezier easing
- Reduced motion support for accessibility

### Custom Theming

**Monaco Editor Theme** (`components/CodeEditor.tsx`)

- Custom "lua-obfuscator-dark" theme matching app design
- Transparent background to show gradient
- Color palette: Purple keywords, green strings, amber numbers, blue functions
- Custom cursor color (#007AFF - brand blue)
- Enhanced line highlighting with focus/blur states
- Bracket pair colorization enabled
- Smooth cursor animations and scrolling

**Animation System** (`app/globals.css`)

- 5 gradient blobs with scale + rotation animations (25-40s duration)
- Keyframes with midpoint scale transformations for breathing effect
- Cubic-bezier easing for smooth, professional motion
- Custom scrollbar styling matching dark theme
- Global focus outlines and selection colors
- Reduced motion media query for accessibility

**Color System**

- Protection levels: None (gray) → Low (blue) → Medium (purple) → High (orange/red)
- Active states: Blue/purple Zap icons with pulse animation
- Status indicators: Animated dots matching protection strength
- Error states: Red gradients with glow effects
- Success states: Green gradients with sparkle icons
