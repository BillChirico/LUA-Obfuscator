# Developer Guide

Comprehensive guide for developers contributing to or extending the Lua Obfuscator.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Project Structure](#project-structure)
- [Architecture Deep Dive](#architecture-deep-dive)
- [Adding Features](#adding-features)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Getting Started

### Prerequisites

**Required:**
- Node.js 20.x or later
- npm 10.x or later
- Git

**Recommended:**
- VS Code with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense

### Clone Repository

```bash
git clone https://github.com/BillChirico/LUA-Obfuscator.git
cd LUA-Obfuscator/web
```

### Install Dependencies

```bash
npm install
```

This installs:
- Next.js 15.5.4
- React 19.2.0
- TypeScript 5.9.3
- Tailwind CSS 4.1.14
- Testing frameworks (Jest, Playwright)
- And 30+ other dependencies

### Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to see the application.

---

## Development Environment

### Environment Variables

Create `.env.local` for local development:

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm test` | Run Jest unit tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Run E2E tests with UI |
| `npm run test:all` | Run all tests |

---

## Project Structure

```
web/
├── app/                          # Next.js App Router
│   ├── api/
│   │   └── analytics/
│   │       └── route.ts         # Analytics tracking endpoint
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Main obfuscator interface
│   ├── globals.css              # Global styles + animations
│   └── manifest.ts              # PWA manifest
│
├── components/                   # React components
│   ├── BackgroundGradient.tsx   # Animated gradient background
│   ├── CodeEditor.tsx           # Monaco editor wrapper
│   ├── GoogleAnalytics.tsx      # GA4 integration
│   └── ui/                      # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── label.tsx
│       ├── slider.tsx
│       └── switch.tsx
│
├── lib/                         # Core obfuscation logic
│   ├── parser.ts                # Lua AST parser wrapper
│   ├── obfuscator.ts            # AST-based obfuscation (complex)
│   ├── obfuscator-simple.ts     # Regex-based obfuscation (production)
│   ├── generator.ts             # AST to Lua code generator
│   ├── analytics-client.ts      # Client-side analytics tracking
│   ├── analytics-server.ts      # Server-side analytics helpers
│   └── utils.ts                 # Utility functions (cn, etc.)
│
├── __tests__/                   # Test suites
│   ├── unit/
│   │   └── lib/
│   │       ├── parser.test.ts
│   │       ├── obfuscator-simple.test.ts
│   │       └── obfuscator-advanced.test.ts
│   ├── integration/
│   │   └── lib/
│   │       └── obfuscation-workflow.test.ts
│   ├── e2e/
│   │   ├── obfuscation-workflow.spec.ts
│   │   ├── responsive.spec.ts
│   │   ├── error-handling.spec.ts
│   │   ├── accessibility.spec.ts
│   │   ├── analytics-tracking.spec.ts
│   │   └── advanced-workflow.spec.ts
│   └── fixtures/
│       └── lua-samples.ts       # Test Lua code samples
│
├── types/                       # TypeScript type definitions
├── public/                      # Static assets
├── docs/                        # Documentation (this file!)
│
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── playwright.config.ts         # Playwright E2E configuration
├── jest.config.js              # Jest unit test configuration
├── jest.setup.js               # Jest setup + browser mocks
├── .prettierrc.json            # Prettier code formatting
├── .eslintrc.json              # ESLint configuration
└── package.json                # Dependencies and scripts
```

---

## Architecture Deep Dive

### Obfuscation Pipeline

The obfuscation process follows this pipeline:

```
Input Lua Code
    ↓
[1] Syntax Validation (parser.ts)
    - Parse with luaparse
    - Extract error details (line, column)
    - Return AST or error
    ↓
[2] Transformation (obfuscator-simple.ts)
    - Apply techniques in order:
      1. Number encoding (first)
      2. Control flow obfuscation
      3. String encoding
      4. Name mangling
      5. Minification (last)
    ↓
[3] Code Generation (generator.ts)
    - Convert AST back to Lua
    - Handle 20+ node types
    ↓
Output Obfuscated Code
```

### Two Obfuscation Implementations

**1. AST-Based (`obfuscator.ts`)** - Complex but powerful
- Parses code to AST
- Transforms AST nodes
- Generates code from modified AST
- More robust but harder to maintain

**2. Regex-Based (`obfuscator-simple.ts`)** - **Production version**
- Uses pattern matching on source text
- Simpler logic, easier to debug
- Validates with AST but transforms with regex
- Currently used in production

### Key Design Decisions

**Why regex-based over AST-based?**
1. Simpler to implement and maintain
2. Easier to debug transformation issues
3. Better error messages
4. Still validates syntax with AST
5. Performance is adequate for browser use

**Transformation Order:**
```
Numbers → Control Flow → Strings → Names → Minify
```

**Why this order?**
- Numbers first: Avoid encoding mangled variable names
- Strings before names: Prevent encoding `_0x0000` identifiers
- Minification last: Clean up after all transformations

---

## Adding Features

### Adding a New Obfuscation Technique

Let's add "Dead Code Injection" as an example.

#### Step 1: Update Types

`lib/obfuscator-simple.ts`:
```typescript
export interface ObfuscationOptions {
  mangleNames?: boolean;
  encodeStrings?: boolean;
  encodeNumbers?: boolean;
  controlFlow?: boolean;
  minify?: boolean;
  deadCodeInjection?: boolean;  // NEW
  protectionLevel?: number;
}
```

#### Step 2: Implement Transformation

`lib/obfuscator-simple.ts`:
```typescript
class LuaObfuscator {
  // ... existing methods ...

  private injectDeadCode(code: string, protectionLevel: number): string {
    const shouldInject = Math.random() * 100 < protectionLevel;
    if (!shouldInject) return code;

    // Generate dead code snippets
    const deadCodeSnippets = [
      'if false then print("unreachable") end',
      'local _unused = 1 + 1',
      'do local _ = nil end'
    ];

    // Insert dead code at random positions
    const lines = code.split('\n');
    const randomIndex = Math.floor(Math.random() * lines.length);
    const deadCode = deadCodeSnippets[Math.floor(Math.random() * deadCodeSnippets.length)];

    lines.splice(randomIndex, 0, deadCode);
    return lines.join('\n');
  }
}
```

#### Step 3: Add to Pipeline

`lib/obfuscator-simple.ts`:
```typescript
obfuscate(code: string, options: ObfuscationOptions): ObfuscationResult {
  // ... existing code ...

  // Add dead code injection
  if (options.deadCodeInjection) {
    obfuscatedCode = this.injectDeadCode(obfuscatedCode, protectionLevel);
  }

  // ... rest of pipeline ...
}
```

#### Step 4: Update Protection Level Mapping

`lib/obfuscator-simple.ts`:
```typescript
export function obfuscateLua(code: string, options?: ObfuscationOptions): ObfuscationResult {
  const defaultOptions: ObfuscationOptions = {
    mangleNames: protectionLevel >= 20,
    encodeStrings: protectionLevel >= 40,
    encodeNumbers: protectionLevel >= 60,
    controlFlow: protectionLevel >= 80,
    deadCodeInjection: protectionLevel >= 90,  // NEW
    minify: protectionLevel >= 10,
    protectionLevel: protectionLevel,
  };
  // ...
}
```

#### Step 5: Add UI Toggle

`app/page.tsx`:
```typescript
interface ObfuscatorSettings {
  // ... existing settings ...
  deadCodeInjection: boolean;  // NEW
}

// In JSX:
<div className="flex items-center justify-between">
  <Label htmlFor="dead-code">
    <div className="flex items-center gap-2">
      <span>Dead Code Injection</span>
      {settings.deadCodeInjection && <Zap className="w-3.5 h-3.5 text-purple-400" />}
    </div>
    <p className="text-xs text-gray-400">
      Insert unreachable code to confuse analysis
    </p>
  </Label>
  <Switch
    id="dead-code"
    checked={settings.deadCodeInjection}
    onCheckedChange={checked => setSettings({ ...settings, deadCodeInjection: checked })}
  />
</div>
```

#### Step 6: Write Tests

`__tests__/unit/lib/obfuscator-simple.test.ts`:
```typescript
describe('Dead Code Injection', () => {
  it('should inject dead code when enabled', () => {
    const code = 'local x = 5\nprint(x)';
    const result = obfuscateLua(code, {
      deadCodeInjection: true,
      protectionLevel: 100
    });

    expect(result.success).toBe(true);
    expect(result.code).toContain('if false then');
  });

  it('should not inject when disabled', () => {
    const code = 'local x = 5\nprint(x)';
    const result = obfuscateLua(code, {
      deadCodeInjection: false,
      protectionLevel: 0
    });

    expect(result.success).toBe(true);
    expect(result.code).not.toContain('if false then');
  });
});
```

#### Step 7: Update Documentation

Add to `docs/API_REFERENCE.md` and `docs/USER_GUIDE.md`.

---

### Adding a New UI Component

Example: Add a "History" feature that tracks previous obfuscations.

#### Step 1: Create Component

`components/ObfuscationHistory.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

interface HistoryEntry {
  id: string;
  timestamp: Date;
  inputCode: string;
  outputCode: string;
  settings: any;
}

export function ObfuscationHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const addToHistory = (entry: HistoryEntry) => {
    setHistory(prev => [entry, ...prev].slice(0, 10)); // Keep last 10
  };

  return (
    <Card className="p-4">
      <h3 className="font-bold flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Recent Obfuscations
      </h3>
      {history.length === 0 ? (
        <p className="text-gray-400 text-sm mt-2">No history yet</p>
      ) : (
        <ul className="space-y-2 mt-2">
          {history.map(entry => (
            <li key={entry.id} className="border-b pb-2">
              <p className="text-xs text-gray-400">
                {entry.timestamp.toLocaleTimeString()}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadFromHistory(entry)}
              >
                Load
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
```

#### Step 2: Integrate into Main Page

`app/page.tsx`:
```typescript
import { ObfuscationHistory } from '@/components/ObfuscationHistory';

export default function Home() {
  // ... existing code ...

  return (
    <main>
      {/* ... existing layout ... */}
      <ObfuscationHistory />
    </main>
  );
}
```

---

## Testing

### Unit Testing Strategy

**Test File Organization:**
```
__tests__/unit/lib/
  ├── parser.test.ts           # Parser tests
  ├── obfuscator-simple.test.ts  # Simple obfuscator
  └── obfuscator-advanced.test.ts # Advanced techniques
```

**Example Test Structure:**
```typescript
import { obfuscateLua } from '@/lib/obfuscator-simple';

describe('Name Mangling', () => {
  it('should mangle variable names', () => {
    const code = 'local playerName = "Hero"';
    const result = obfuscateLua(code, { mangleNames: true });

    expect(result.success).toBe(true);
    expect(result.code).toContain('_0x');
    expect(result.code).not.toContain('playerName');
  });

  it('should preserve Lua keywords', () => {
    const code = 'if true then print("test") end';
    const result = obfuscateLua(code, { mangleNames: true });

    expect(result.code).toContain('if');
    expect(result.code).toContain('then');
    expect(result.code).toContain('end');
  });
});
```

### Integration Testing

Test complete workflows:

```typescript
describe('Full Obfuscation Workflow', () => {
  it('should obfuscate and validate round-trip', () => {
    const originalCode = `
      local function fibonacci(n)
        if n <= 1 then return n end
        return fibonacci(n - 1) + fibonacci(n - 2)
      end
      print(fibonacci(10))
    `;

    const result = obfuscateLua(originalCode, {
      mangleNames: true,
      encodeStrings: true,
      minify: true,
      protectionLevel: 50
    });

    expect(result.success).toBe(true);

    // Validate obfuscated code is still valid Lua
    const parseResult = parseLua(result.code!);
    expect(parseResult.success).toBe(true);
  });
});
```

### E2E Testing with Playwright

**Test User Workflows:**
```typescript
test('complete obfuscation workflow', async ({ page }) => {
  await page.goto('/');

  // Enter code
  await page.locator('.monaco-editor').click();
  await page.keyboard.type('local x = 5\nprint(x)');

  // Configure settings
  await page.getByLabel('Mangle Names').click();
  await page.getByLabel('Minify Code').click();

  // Obfuscate
  await page.getByRole('button', { name: 'Obfuscate' }).click();

  // Verify output
  await expect(page.locator('.output-editor')).toContainText('_0x');
});
```

### Running Tests

```bash
# Unit tests only
npm test

# With coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E with UI (debugging)
npm run test:e2e:ui

# All tests
npm run test:all
```

### Coverage Goals

| Component | Target Coverage |
|-----------|----------------|
| Parser | > 90% |
| Obfuscator | > 90% |
| Generator | > 85% |
| UI Components | > 70% |
| Overall | > 85% |

---

## Code Quality

### ESLint Configuration

`.eslintrc.json`:
```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "no-console": "warn",
    "prefer-const": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

### Prettier Configuration

`.prettierrc.json`:
```json
{
  "useTabs": true,
  "tabWidth": 2,
  "printWidth": 120,
  "singleQuote": false,
  "semi": true,
  "trailingComma": "es5",
  "arrowParens": "avoid"
}
```

### Pre-commit Checklist

Before committing:
1. ✅ Run `npm run lint` - Fix all errors
2. ✅ Run `npm run format` - Format all code
3. ✅ Run `npm run test` - All tests pass
4. ✅ Run `npm run build` - Build succeeds
5. ✅ Manual testing - Verify functionality

### Code Review Standards

**Required for PR Approval:**
- All tests passing
- Code coverage maintained or improved
- No linting errors
- Documentation updated
- Responsive design verified

---

## Deployment

### Building for Production

```bash
npm run build
```

Output in `.next/` directory.

### Environment Variables

**Vercel Deployment:**
1. Go to Project Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_SITE_URL` (e.g., `https://lua-obfuscator.vercel.app`)
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID` (optional, Google Analytics)

### Deployment Checklist

- [ ] All tests passing
- [ ] Build completes without warnings
- [ ] Environment variables configured
- [ ] Analytics verified (optional)
- [ ] Performance metrics reviewed
- [ ] Lighthouse score > 90 (Performance, Accessibility, Best Practices, SEO)

---

## Contributing

### Contribution Workflow

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make changes and commit:**
   ```bash
   git add .
   git commit -m "feat: Add amazing feature"
   ```
4. **Write tests**
5. **Run quality checks:**
   ```bash
   npm run lint
   npm run format
   npm run test:all
   ```
6. **Push to your fork:**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Add dead code injection technique
fix: Resolve string encoding escape issue
docs: Update API reference with new examples
test: Add E2E tests for mobile responsive design
refactor: Simplify name mangling logic
perf: Optimize AST traversal performance
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests pass locally
- [ ] No breaking changes (or documented)
```

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

---

## Advanced Topics

### Custom Monaco Themes

Edit `components/CodeEditor.tsx`:
```typescript
editor.defineTheme('custom-theme', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: 'C678DD' },
    { token: 'string', foreground: '98C379' },
    { token: 'number', foreground: 'D19A66' },
  ],
  colors: {
    'editor.background': '#1E1E1E00', // Transparent
    'editor.lineHighlightBackground': '#2A2A2A',
  }
});
```

### Adding Analytics Events

`lib/analytics-client.ts`:
```typescript
export async function trackCustomEvent(eventName: string, params: any) {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName,
        timestamp: new Date().toISOString(),
        ...params
      })
    });
  } catch (error) {
    console.error('Analytics error:', error);
  }
}
```

### Performance Optimization

**Code Splitting:**
```typescript
// Lazy load Monaco editor
const CodeEditor = dynamic(() => import('@/components/CodeEditor'), {
  ssr: false,
  loading: () => <div>Loading editor...</div>
});
```

**Memoization:**
```typescript
const MemoizedEditor = React.memo(CodeEditor, (prev, next) => {
  return prev.value === next.value && prev.readOnly === next.readOnly;
});
```

---

## Troubleshooting Development Issues

### Monaco Editor Not Loading

**Issue:** Editor doesn't appear or throws errors

**Solutions:**
1. Clear `.next` cache: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check browser console for errors
4. Verify Monaco version compatibility

### Tests Failing Locally

**Issue:** Tests pass in CI but fail locally

**Solutions:**
1. Update Node.js to version 20.x
2. Clear test cache: `npm test -- --clearCache`
3. Check for environment-specific issues
4. Verify test dependencies are installed

### Build Errors

**Issue:** `npm run build` fails

**Solutions:**
1. Check TypeScript errors: `npx tsc --noEmit`
2. Verify all imports are correct
3. Check for circular dependencies
4. Review Next.js build output for specific errors

---

## Resources

**Official Documentation:**
- [Next.js 15 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

**Testing:**
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

**Lua Resources:**
- [Lua 5.3 Reference Manual](https://www.lua.org/manual/5.3/)
- [luaparse Documentation](https://oxyc.github.io/luaparse/)

**Project-Specific:**
- [API Reference](./API_REFERENCE.md)
- [Architecture Documentation](./ARCHITECTURE.md)
- [User Guide](./USER_GUIDE.md)

---

## Getting Help

**Questions?**
- Open a [GitHub Discussion](https://github.com/BillChirico/LUA-Obfuscator/discussions)
- Check existing [Issues](https://github.com/BillChirico/LUA-Obfuscator/issues)

**Found a Bug?**
- Create a detailed [Bug Report](https://github.com/BillChirico/LUA-Obfuscator/issues/new)

**Want to Contribute?**
- Read this guide thoroughly
- Start with ["good first issue"](https://github.com/BillChirico/LUA-Obfuscator/labels/good%20first%20issue) labels
- Ask questions before starting major work

---

**Happy Coding! 🚀**
