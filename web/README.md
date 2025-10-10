# Lua Obfuscator Web Interface

A modern, client-side Lua code obfuscator built with Next.js, TypeScript, and Monaco Editor.

## Features

- **Client-Side Processing**: All obfuscation happens in your browser - your code never leaves your machine
- **Monaco Editor**: Professional code editor with Lua syntax highlighting
- **Three Obfuscation Techniques**:
  - Variable/function name mangling
  - String encoding
  - Code minification
- **Lua 5.1 Support**: Optimized for game modding (WoW, FiveM, etc.)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## Project Structure

```
web/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main application page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   └── CodeEditor.tsx     # Monaco editor wrapper
├── lib/                   # Core libraries
│   ├── parser.ts          # Lua AST parser
│   ├── generator.ts       # AST to Lua code generator
│   └── obfuscator.ts      # Obfuscation engine
└── types/                 # TypeScript type definitions
```

## How It Works

1. **Parser**: Uses `luaparse` to convert Lua code into an Abstract Syntax Tree (AST)
2. **Transformation**: Applies obfuscation transformations to the AST:
   - Replaces variable/function names with obscure identifiers
   - Encodes string literals
   - Removes comments and whitespace
3. **Generation**: Converts the transformed AST back to valid Lua code

## Development

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Editor**: Monaco Editor
- **Parser**: luaparse
- **Icons**: Lucide React

### Key Dependencies

```json
{
  "@monaco-editor/react": "^4.7.0",
  "luaparse": "^0.3.1",
  "next": "^15.5.4",
  "react": "^19.2.0"
}
```

## Roadmap (Post-MVP)

### v1.1
- [ ] Real-time obfuscation preview
- [ ] Configuration panel (enable/disable techniques)
- [ ] Better string encoding algorithms
- [ ] Error highlighting in code editor

### v1.2
- [ ] Control flow obfuscation
- [ ] Dead code injection
- [ ] Share obfuscated code via URL
- [ ] Custom filename for downloads

### v1.3
- [ ] Lua 5.2/5.3/5.4 support
- [ ] Advanced control flow flattening
- [ ] Performance benchmarks
- [ ] Comprehensive test suite

## Deployment

This application can be deployed to:

- **Vercel** (recommended): `vercel --prod`
- **Netlify**: Connect your repo
- **GitHub Pages**: Export as static site
- **Any static hosting**: Run `npm run build` and deploy the `out` folder

## License

See parent repository LICENSE file.

## Contributing

This is an MVP release. Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Known Limitations (MVP)

- Lua 5.1 only (5.2+ support planned)
- Basic obfuscation techniques (advanced techniques in v1.2+)
- No real-time preview (planned for v1.1)
- Limited error messages (improved in v1.1)

## Support

For issues, questions, or feature requests, please open an issue on the main repository.
