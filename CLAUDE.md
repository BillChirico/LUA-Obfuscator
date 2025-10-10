# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bill's Lua Obfuscator is a Lua code obfuscation tool designed to protect Lua source code by transforming it into functionally equivalent but harder-to-read code.

## Architecture

### Core Components (When Implemented)

**Parser/Lexer Layer**
- Tokenizes Lua source code into an abstract syntax tree (AST)
- Handles Lua 5.1, 5.2, 5.3, and/or 5.4 syntax variations
- Preserves semantic meaning while enabling transformations

**Transformation Engine**
- Applies obfuscation techniques to the AST
- Common transformations include:
  - Variable/function name mangling
  - String encoding/encryption
  - Control flow obfuscation (opaque predicates, control flow flattening)
  - Dead code injection
  - Constant folding/unfolding
  - Number encoding schemes

**Code Generator**
- Converts transformed AST back to valid Lua source code
- Maintains functional equivalence with original code
- Optional minification for size reduction

### Key Design Considerations

**Lua Version Compatibility**
- Different Lua versions have syntax/semantic differences
- 5.1: Most common in game modding (WoW, FiveM, etc.)
- 5.2+: Added goto statements, different _ENV handling
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

**UI/UX Requirements**
- Code editor with syntax highlighting for Lua input/output
- Real-time obfuscation preview
- Configuration panel for obfuscation strength and techniques
- Download/copy obfuscated code functionality
- Clear visual feedback for processing states
- Responsive design for desktop and tablet use

## Development Workflow

### Testing Strategy
- Unit tests for individual transformation passes
- Integration tests with real Lua scripts
- Benchmark tests to measure performance impact
- Round-trip testing: obfuscate → deobfuscate → verify equivalence

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

## Recommended Libraries

**Lua AST/Parser Libraries**
- LuaMinify: Existing Lua parser and minifier
- Metalua: Compile-time metaprogramming framework with AST support
- LuaJIT's parser (if targeting LuaJIT)

**Testing**
- busted: Lua unit testing framework
- luacheck: Static analyzer for catching errors

## Related Projects for Reference

- Prometheus Obfuscator
- LuaSrcDiet (minifier with some obfuscation)
- IronBrew2 (Lua 5.1 obfuscator)
