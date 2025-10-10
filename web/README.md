# Bill's Lua Obfuscator - Web Interface

A modern, production-ready client-side Lua code obfuscator built with Next.js 15, TypeScript, and Monaco Editor. Protect your Lua code with professional obfuscation techniques optimized for game modding and WoW addons.

## ✨ Features

### Core Functionality
- **🔒 Client-Side Processing**: All obfuscation happens in your browser - your code never leaves your machine
- **⚡ Real-Time Obfuscation**: Instant processing with visual feedback
- **📝 Monaco Editor**: Professional code editor with Lua syntax highlighting and IntelliSense
- **🎨 Modern UI**: Beautiful gradient interface with smooth transitions and responsive design

### Obfuscation Techniques
- **Name Mangling**: Replaces variable/function names with hexadecimal identifiers (_0x0000)
- **String Encoding**: Converts string literals to byte arrays using `string.char()`
- **Code Minification**: Removes comments, whitespace, and blank lines
- **Syntax Validation**: Validates Lua code before obfuscation using luaparse

### User Experience
- **⚙️ Configurable Settings**: Toggle name mangling, string encoding, and minification
- **✂️ Copy to Clipboard**: One-click copy with success feedback
- **💾 Download**: Export obfuscated code as `.lua` file
- **🚨 Error Handling**: Clear error messages with validation
- **🎯 Smart Defaults**: Pre-configured with example Lua code
- **📊 Analytics Integration**: Google Analytics, Vercel Analytics, and Speed Insights

### Lua Compatibility
- **Lua 5.1**: Full support (WoW, FiveM, Garry's Mod, etc.)
- **Protected Built-ins**: Preserves Lua keywords and standard library functions

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** (20+ recommended)
- **npm**, **yarn**, or **pnpm** package manager

### Installation

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd LUA-Obfuscator/web

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start

# Or export as static site
npm run build && npx next export
```

## 📁 Project Structure

```
web/
├── app/                        # Next.js App Router
│   ├── page.tsx               # Main obfuscator interface
│   ├── layout.tsx             # Root layout with metadata
│   └── globals.css            # Global styles with Tailwind
├── components/                # React components
│   └── CodeEditor.tsx         # Monaco editor wrapper with custom config
├── lib/                       # Core obfuscation engine
│   ├── parser.ts              # Lua syntax validator (luaparse)
│   ├── generator.ts           # AST to Lua code converter
│   ├── obfuscator.ts          # Advanced AST-based obfuscator (future)
│   ├── obfuscator-simple.ts   # Current regex-based obfuscator
│   ├── analytics-client.ts    # Client-side analytics tracking
│   └── analytics-server.ts    # Server-side GA4 Measurement Protocol
├── types/                     # TypeScript type definitions
├── public/                    # Static assets
└── package.json               # Dependencies and scripts
```

## 🛠️ Tech Stack

### Framework & Language
- **Next.js 15.5.4**: React framework with App Router
- **React 19.2.0**: UI library
- **TypeScript 5.9.3**: Type-safe development

### Styling & UI
- **Tailwind CSS 4.1.14**: Utility-first CSS framework
- **Lucide React 0.545.0**: Icon library
- **CVA (Class Variance Authority)**: Component variant management

### Code Editor
- **Monaco Editor 4.7.0**: VS Code's editor component
- **JetBrains Mono Nerd Font**: Professional coding font with ligatures
- **Lua Language Support**: Syntax highlighting and IntelliSense

### Obfuscation
- **luaparse 0.3.1**: Lua AST parser for syntax validation
- **Custom Regex Engine**: Efficient name mangling and minification

## 🔧 How It Works

### Obfuscation Pipeline

```
1. Input Validation
   ├─ Parse Lua code with luaparse
   └─ Return syntax errors if invalid

2. String Encoding (if enabled)
   ├─ Match all string literals (single and double quoted)
   ├─ Convert to byte arrays
   ├─ Handle escape sequences (\n, \t, etc.)
   └─ Generate string.char() calls

3. Name Mapping (if enabled)
   ├─ Identify all user-defined variables/functions
   ├─ Exclude Lua keywords and built-ins
   └─ Generate hexadecimal identifiers (_0x0000, _0x0001, etc.)

4. Code Transformation
   ├─ Replace identifiers using word boundaries
   └─ Apply minification (remove comments, whitespace) if enabled

5. Output Generation
   ├─ Return obfuscated code
   ├─ Track analytics event
   └─ Display in Monaco editor
```

### Protected Names
The obfuscator preserves:
- **Lua 5.1 Keywords**: `and`, `break`, `do`, `else`, `elseif`, `end`, `false`, `for`, `function`, `if`, `in`, `local`, `nil`, `not`, `or`, `repeat`, `return`, `then`, `true`, `until`, `while`
- **Standard Library**: `print`, `require`, `pairs`, `ipairs`, `tonumber`, `tostring`, `type`, `next`, `select`, `assert`, `error`, `pcall`, `xpcall`
- **Metatables**: `setmetatable`, `getmetatable`, `rawget`, `rawset`, `rawequal`
- **Global Tables**: `math`, `string`, `table`, `io`, `os`, `debug`, `coroutine`

## 🎯 Development

### Design Philosophy
- **Production-Worthy**: Beautiful, polished interface built with shadcn principles
- **User-Centric**: Intuitive workflows with clear feedback
- **Performance**: Client-side processing for speed and privacy
- **Maintainability**: Type-safe, modular architecture

### Key Dependencies

```json
{
  "@monaco-editor/react": "^4.7.0",
  "luaparse": "^0.3.1",
  "next": "^15.5.4",
  "react": "^19.2.0",
  "tailwindcss": "^4.1.14",
  "lucide-react": "^0.545.0"
}
```

### Code Style
- **TypeScript**: Strict mode enabled
- **Components**: Functional components with hooks
- **Styling**: Tailwind utility classes with `clsx` and `tailwind-merge`
- **Fonts**: JetBrains Mono Nerd Font with ligatures for code editor

## 🗺️ Roadmap

### v1.0 - Current Release ✅
- [x] String encoding using `string.char()` byte arrays
- [x] Configurable settings (name mangling, string encoding, minification)
- [x] Configuration panel with toggle controls
- [x] Analytics integration (GA4, Vercel Analytics, Speed Insights)
- [x] Professional UI with gradient background

### v1.1 - Enhanced Obfuscation
- [ ] Advanced string encryption (Base64, XOR, custom algorithms)
- [ ] Number encoding schemes
- [ ] Configurable obfuscation strength slider (Low, Medium, High)
- [ ] Constant folding/unfolding

### v1.2 - Advanced Protection
- [ ] Control flow obfuscation (opaque predicates)
- [ ] Control flow flattening
- [ ] Dead code injection
- [ ] Anti-debugging measures
- [ ] Custom output filename

### v1.3 - Extended Support
- [ ] Lua 5.2/5.3/5.4 compatibility
- [ ] Performance benchmarks and metrics
- [ ] Before/after code size comparison
- [ ] Share obfuscated code via URL (optional)

### v2.0 - Enterprise Features
- [ ] Batch file processing
- [ ] API integration
- [ ] Custom obfuscation profiles
- [ ] Deobfuscation resistance testing
- [ ] CLI version for automation

## 📦 Deployment

### Recommended Platforms

**Vercel** (Optimal for Next.js)
```bash
vercel --prod
```

**Netlify**
```bash
# Connect your Git repository
# Auto-deploy on push to main
```

**Static Export**
```bash
npm run build
# Deploy the `out/` folder to any static host
```

**Docker**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Environment Variables

Create a `.env.local` file with:

```bash
# Google Analytics (required for analytics)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
GA_MEASUREMENT_PROTOCOL_API_SECRET=your_api_secret

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## ⚙️ Configuration

### Monaco Editor Settings
- **Font**: JetBrains Mono Nerd Font with ligatures
- **Theme**: VS Dark
- **Font Size**: 14px
- **Tab Size**: 2 spaces
- **Word Wrap**: Enabled
- **Minimap**: Disabled for cleaner interface

### Tailwind Configuration
- **Primary Color**: `#007AFF` (Apple blue)
- **Background**: Gradient from `gray-900` to `gray-800`
- **Fonts**: System fonts + JetBrains Mono for code

## 🐛 Known Limitations

- **Lua 5.1 Only**: 5.2+ features (goto, _ENV) not fully tested
- **Regex-Based**: Uses regex instead of full AST transformation (faster, less sophisticated)
- **Basic Protection**: Advanced techniques (control flow flattening, dead code injection) planned for v1.2+

### What's NOT Obfuscated
- Lua keywords and reserved words
- Standard library functions
- Global table names (`math`, `string`, etc.)
- Numeric constants (encoding coming in v1.1)

## 📄 License

See parent repository [LICENSE](../LICENSE) file.

## 🤝 Contributing

Contributions welcome! This is an MVP with planned improvements.

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style (TypeScript strict mode)
- Use Tailwind CSS for styling (no custom CSS)
- Maintain component modularity
- Add comments for complex logic
- Test with various Lua code samples

## 💡 Use Cases

- **WoW Addon Development**: Protect addon code from theft
- **FiveM Scripts**: Obfuscate server-side resources
- **Garry's Mod**: Secure Lua gamemodes and addons
- **Roblox**: Protect game scripts (with Lua 5.1 compatibility)
- **Educational**: Learn obfuscation techniques and AST manipulation

## 🆘 Support

**Issues**: [GitHub Issues](../../issues)
**Documentation**: See [CLAUDE.md](../CLAUDE.md) for architecture details
**Questions**: Open a discussion or issue

## 🙏 Acknowledgments

- **luaparse**: Lua AST parser by Oskar Schöldström
- **Monaco Editor**: Microsoft's VS Code editor component
- **Next.js**: Vercel's React framework
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn**: Design philosophy and patterns

---

**Built with ❤️ for the Lua community**
