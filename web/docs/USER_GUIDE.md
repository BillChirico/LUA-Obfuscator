# User Guide

Complete guide to using the Lua Obfuscator web application.

## Table of Contents

- [Getting Started](#getting-started)
- [Basic Usage](#basic-usage)
- [Obfuscation Techniques](#obfuscation-techniques)
- [Protection Levels](#protection-levels)
- [Common Workflows](#common-workflows)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [FAQ](#faq)

---

## Getting Started

### Accessing the Application

Visit the Lua Obfuscator at: **[Your deployment URL]**

**System Requirements:**

- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript enabled
- Minimum 50MB free RAM

**No Installation Required:** The application runs entirely in your browser.

---

### Interface Overview

The interface consists of four main areas:

1. **Header** (Top)
   - Logo and title
   - Action buttons: Copy, Download, Obfuscate

2. **Input Editor** (Left)
   - Enter your Lua code here
   - Syntax highlighting
   - Error indicators

3. **Output Editor** (Right)
   - View obfuscated code
   - Read-only display
   - Automatic updates

4. **Settings Panel** (Right Side)
   - Configure obfuscation techniques
   - Adjust protection level
   - View active techniques

---

## Basic Usage

### Step 1: Enter Lua Code

1. Click in the **Original Lua Code** editor (left side)
2. Type or paste your Lua code
3. The editor provides:
   - Syntax highlighting
   - Auto-completion
   - Error detection

**Example:**

```lua
local function greet(name)
    print("Hello, " .. name)
end

greet("World")
```

---

### Step 2: Configure Settings

**Quick Start:** Use the Protection Level slider

| Level   | What It Does                                      |
| ------- | ------------------------------------------------- |
| 0%      | No automatic obfuscation                          |
| 10-20%  | Minification only                                 |
| 20-40%  | Minify + Mangle Names                             |
| 40-60%  | Minify + Mangle + Encode Strings                  |
| 60-80%  | Minify + Mangle + Encode Strings + Encode Numbers |
| 80-100% | Maximum protection (all techniques)               |

**Advanced:** Manually toggle individual techniques:

- ☐ Mangle Names
- ☐ Encode Strings
- ☐ Minify Code
- ☐ Encode Numbers (Advanced)
- ☐ Control Flow (Advanced)

---

### Step 3: Obfuscate

1. Click the **"Obfuscate"** button
2. Wait for processing (usually < 1 second)
3. View result in the **Obfuscated Output** editor

**Success Indicators:**

- ✓ Green "Active" badge on output editor
- ✓ Success notification (top right)
- ✓ Obfuscated code visible

---

### Step 4: Use Obfuscated Code

**Copy to Clipboard:**

1. Click the **"Copy"** button
2. Wait for "Copied!" confirmation
3. Paste into your project

**Download as File:**

1. Click the **"Download"** button
2. Save `obfuscated.lua` to your computer
3. Integrate into your application

---

## Obfuscation Techniques

### 1. Mangle Names

**What it does:** Replaces variable and function names with hexadecimal identifiers.

**Before:**

```lua
local playerHealth = 100
function healPlayer(amount)
    playerHealth = playerHealth + amount
end
```

**After:**

```lua
local _0x0000 = 100
function _0x0001(_0x0002)
    _0x0000 = _0x0000 + _0x0002
end
```

**Use when:**

- You want to hide variable/function purpose
- Code will be distributed publicly
- Reverse engineering is a concern

**Performance:** Minimal impact

---

### 2. Encode Strings

**What it does:** Converts string literals to byte arrays.

**Before:**

```lua
print("Hello, World!")
local message = "Secret message"
```

**After:**

```lua
print(string.char(72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33))
local message = string.char(83, 101, 99, 114, 101, 116, 32, 109, 101, 115, 115, 97, 103, 101)
```

**Use when:**

- Strings contain sensitive text
- You want to hide game dialogue
- API keys or URLs are embedded (⚠️ not recommended for real secrets)

**Performance:** Low impact (runtime decoding overhead)

---

### 3. Minify Code

**What it does:** Removes comments and unnecessary whitespace.

**Before:**

```lua
-- Calculate total
local x = 5  -- initial value

-- Print result
print(x)
```

**After:**

```lua
local x = 5
print(x)
```

**Use when:**

- You want to reduce file size
- Comments contain implementation details
- Always recommended (no downsides)

**Performance:** **Improves** execution speed (smaller file = faster loading)

---

### 4. Encode Numbers (Advanced)

**What it does:** Transforms numbers into mathematical expressions.

**Before:**

```lua
local health = 100
local damage = 25
local critical = 3.5
```

**After:**

```lua
local health = (50 + 50)
local damage = (50 / 2)
local critical = (35 / 10)
```

**Use when:**

- Numbers represent game balancing values
- You want to obscure magic numbers
- High security is needed

**Performance:** Low impact (runtime calculations are fast)

---

### 5. Control Flow (Advanced)

**What it does:** Adds always-true conditions to confuse analysis.

**Before:**

```lua
if score > 100 then
    print("High score!")
end
```

**After:**

```lua
if (1 + 1 == 2) and score > 100 then
    print("High score!")
end
```

**Use when:**

- You need maximum protection
- Static analysis is a concern
- Performance impact is acceptable

**Performance:** Moderate impact (additional condition checks)

---

## Protection Levels

### Level 0: None

**Enabled:** Nothing (manual control only)

**Use Case:** Development and debugging

**Example:**

```lua
-- Original code unchanged
local x = 5
print(x)
```

---

### Level 20: Light Protection

**Enabled:** Minify + Mangle Names

**Use Case:** Public distribution with readability concerns

**Example:**

```lua
local _0x0000=5
print(_0x0000)
```

---

### Level 50: Balanced Protection

**Enabled:** Minify + Mangle Names + Encode Strings

**Use Case:** Standard game scripts, mods

**Example:**

```lua
local _0x0000=5
print(_0x0000)
local _0x0001=string.char(84,101,115,116)
```

---

### Level 80: High Protection

**Enabled:** All techniques (Minify + Mangle + Encode Strings + Encode Numbers + Control Flow)

**Use Case:** Premium content, anti-cheat systems

**Example:**

```lua
local _0x0000=(50+50)
if(1+1==2)and _0x0000>(45+5)then
print(string.char(72,105,103,104))
end
```

---

### Level 100: Maximum Protection

**Enabled:** All techniques at maximum probability

**Use Case:** Critical business logic, high-value intellectual property

**Example:**

```lua
local _0x0000=(200/2)
if(2*3>5)and _0x0000>((150-50))then
print(string.char(77,97,120,105,109,117,109))
end
```

---

## Common Workflows

### Workflow 1: Quick Obfuscation

**Goal:** Quickly protect a script with default settings

**Steps:**

1. Paste code into input editor
2. Set Protection Level to **50%**
3. Click **"Obfuscate"**
4. Click **"Copy"** or **"Download"**

**Time:** < 30 seconds

---

### Workflow 2: Custom Configuration

**Goal:** Fine-tune obfuscation for specific needs

**Steps:**

1. Enter code
2. Set Protection Level to **0%** (disable auto-settings)
3. Manually enable desired techniques:
   - ✓ Mangle Names
   - ✓ Encode Strings
   - ✓ Minify Code
   - ☐ Encode Numbers (optional)
   - ☐ Control Flow (optional)
4. Click **"Obfuscate"**
5. Review output
6. Adjust settings if needed and re-obfuscate

**Time:** 1-2 minutes

---

### Workflow 3: Testing and Validation

**Goal:** Ensure obfuscated code works correctly

**Steps:**

1. Obfuscate code
2. Copy obfuscated output
3. Test in your Lua runtime:

   ```bash
   # For standalone Lua
   lua obfuscated.lua

   # For game runtime
   # Load script in game and test functionality
   ```

4. Verify all features work as expected
5. If issues arise, reduce protection level
6. Re-test until stable

**Time:** 5-15 minutes depending on code complexity

---

### Workflow 4: Batch Processing

**Goal:** Obfuscate multiple scripts with consistent settings

**Steps:**

1. Configure desired settings once
2. For each script:
   a. Paste code
   b. Click "Obfuscate"
   c. Click "Download"
3. Save all `obfuscated.lua` files with meaningful names
4. Integrate into project

**Time:** ~1 minute per script

---

## Troubleshooting

### Error: "Invalid Lua syntax"

**Cause:** Your code has syntax errors

**Solution:**

1. Check the error message for line/column numbers
2. Look for:
   - Missing `end` keywords
   - Unclosed strings (`"` or `'`)
   - Misspelled keywords
   - Invalid operators
3. Fix the error in input editor
4. Try obfuscating again

**Example:**

```lua
-- ERROR: Missing 'end'
if x > 5 then
    print("High")
-- Missing: end

-- FIXED:
if x > 5 then
    print("High")
end
```

---

### Error: "Obfuscation failed"

**Cause:** Internal error during transformation

**Solution:**

1. Try reducing protection level
2. Disable advanced techniques (Numbers, Control Flow)
3. Check for very large numbers or complex expressions
4. Simplify code structure
5. Report bug if issue persists

---

### Issue: Obfuscated code doesn't work

**Common Causes:**

**1. Global variable collision:**

```lua
-- If you're using _0x0000 manually, mangling may conflict
local _0x0000 = 5  -- Avoid using _0x#### names
```

**Solution:** Rename your variables

**2. String encoding breaks escapes:**

```lua
-- Complex escape sequences may not encode properly
local path = "C:\\Users\\Name\\File.txt"
```

**Solution:** Disable string encoding for problematic strings

**3. Number encoding precision loss:**

```lua
-- Very large or precise numbers
local big = 999999999999999
local precise = 3.141592653589793
```

**Solution:** Disable number encoding or reduce protection level

---

### Issue: Copy button doesn't work

**Cause:** Browser clipboard permissions

**Solution:**

1. Check if browser allows clipboard access
2. Try manually selecting and copying:
   - Click in output editor
   - Press `Ctrl+A` (Windows) or `Cmd+A` (Mac)
   - Press `Ctrl+C` (Windows) or `Cmd+C` (Mac)
3. Use Download button instead

---

### Issue: Code is too slow after obfuscation

**Cause:** High protection level impacts performance

**Solution:**

1. Reduce protection level from 100% to 50-70%
2. Disable Control Flow obfuscation
3. Disable Number Encoding
4. Keep only Mangle Names and Minify

**Performance Comparison:**
| Level | Speed Impact |
|-------|-------------|
| 20% | 0-2% slower |
| 50% | 2-5% slower |
| 80% | 5-10% slower |
| 100% | 10-20% slower |

---

## Best Practices

### DO:

✅ **Test obfuscated code thoroughly**

- Always test in target runtime before deploying

✅ **Start with low protection levels**

- Gradually increase if more security needed

✅ **Keep original source code**

- Never lose your readable source!

✅ **Use version control**

- Commit both original and obfuscated versions

✅ **Document obfuscation settings**

- Record which settings were used for each release

✅ **Backup before obfuscating**

- Save original code separately

✅ **Use minification always**

- No downsides, only benefits

---

### DON'T:

❌ **Don't obfuscate development code**

- Obfuscation makes debugging impossible

❌ **Don't rely on obfuscation for security**

- It provides obscurity, not encryption
- Never use for protecting real secrets (API keys, passwords)

❌ **Don't obfuscate third-party libraries**

- May break functionality or violate licenses

❌ **Don't use maximum protection everywhere**

- Performance impact may be unacceptable

❌ **Don't obfuscate debugging code**

- Remove debug code before obfuscating

❌ **Don't lose source code**

- Reverse-engineering obfuscated code is extremely difficult

---

### For Game Development:

**Recommended Protection Levels:**

| Script Type | Recommended Level | Reasoning                    |
| ----------- | ----------------- | ---------------------------- |
| UI Scripts  | 20-40%            | Readability for modding      |
| Game Logic  | 50-70%            | Balance security/performance |
| Anti-Cheat  | 80-100%           | Maximum protection needed    |
| Server-Side | 0%                | Not distributed to players   |

---

### For Mod Distribution:

**Recommended Settings:**

- Mangle Names: ✓ (hide implementation)
- Encode Strings: ☐ (allow language modifications)
- Minify: ✓ (reduce size)
- Advanced: ☐ (maintain compatibility)

---

## FAQ

### Q: Is obfuscation secure?

**A:** No, obfuscation provides **obscurity**, not security. It makes code harder to read but can be reversed with effort. Never use it to protect passwords, API keys, or other secrets.

---

### Q: Will obfuscation break my code?

**A:** Properly obfuscated code should work identically to the original. However:

- Always test thoroughly
- Some edge cases may cause issues
- Report bugs if you find functional differences

---

### Q: Can I reverse obfuscated code?

**A:** Yes, with sufficient effort. Obfuscation:

- Makes code harder to understand
- Removes meaningful names
- Obscures constants
- But doesn't change the underlying logic

---

### Q: How long does obfuscation take?

**A:** Typically < 1 second for most scripts. Very large files (> 100KB) may take 1-5 seconds.

---

### Q: What Lua versions are supported?

**A:** The obfuscator supports Lua 5.1, 5.2, and 5.3 syntax. Output works on all Lua 5.x runtimes.

---

### Q: Can I obfuscate LuaJIT code?

**A:** Yes, LuaJIT is compatible with Lua 5.1 syntax. Obfuscated code will work with LuaJIT.

---

### Q: Does obfuscation work offline?

**A:** After initial page load, yes. The application caches all resources and works without internet.

---

### Q: Can I automate obfuscation?

**A:** Currently, the tool is web-based only. CLI version planned for future release.

---

### Q: Will minification reduce file size?

**A:** Yes, typically 30-50% smaller. String encoding increases size by 100-300%.

---

### Q: How do I report bugs?

**A:** Visit [GitHub Issues](https://github.com/BillChirico/LUA-Obfuscator/issues) and create a new issue with:

- Sample input code
- Obfuscation settings used
- Expected vs actual behavior
- Error messages (if any)

---

### Q: Can I use this for commercial projects?

**A:** Yes, the tool is free to use for any purpose. Check the LICENSE file for details.

---

## Getting Help

**Documentation:**

- [API Reference](./API_REFERENCE.md) - Technical API documentation
- [Architecture](./ARCHITECTURE.md) - System design and components
- [Developer Guide](./DEVELOPER_GUIDE.md) - Contributing and extending

**Support:**

- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: Questions and community support

**Updates:**

- Follow the project on GitHub for updates
- Check CHANGELOG for new features and fixes

---

## Tips and Tricks

### Tip 1: Hybrid Protection

Combine obfuscation with other protection methods:

- Obfuscate client-side code
- Keep sensitive logic server-side
- Use checksums to detect tampering
- Implement license verification separately

---

### Tip 2: Staged Obfuscation

Obfuscate in stages during development:

1. **Alpha:** No obfuscation (full debugging)
2. **Beta:** Light obfuscation (20-40%)
3. **Release:** Full obfuscation (50-80%)

---

### Tip 3: Selective Obfuscation

Obfuscate only critical parts:

- Protect proprietary algorithms
- Hide game balancing formulas
- Secure anti-cheat logic
- Leave UI code readable for modding

---

### Tip 4: Performance Testing

Always benchmark obfuscated code:

```lua
local start = os.clock()
-- Your obfuscated code
local elapsed = os.clock() - start
print("Execution time: " .. elapsed .. "s")
```

If performance degrades significantly, reduce protection level.

---

### Tip 5: Documentation

Document obfuscation in your project:

```
/src/original/        # Original readable source
/src/obfuscated/      # Obfuscated distribution versions
README.md             # Note which files are obfuscated
BUILD.md              # Document obfuscation process
```

---

## Quick Reference Card

### Protection Level Guide

| Level | Techniques               | Use Case            |
| ----- | ------------------------ | ------------------- |
| 0%    | None                     | Development         |
| 20%   | Minify + Mangle          | Light protection    |
| 50%   | + Strings                | Standard protection |
| 80%   | + Numbers + Control Flow | High protection     |
| 100%  | Maximum                  | Critical protection |

### Technique Impact

| Technique      | Speed | Size | Security |
| -------------- | ----- | ---- | -------- |
| Minify         | ++    | --   | +        |
| Mangle         | =     | =    | +++      |
| Encode Strings | -     | +++  | ++       |
| Encode Numbers | -     | ++   | ++       |
| Control Flow   | --    | +    | +++      |

Legend: `++` Major benefit, `+` Benefit, `=` No change, `-` Minor cost, `--` Major cost

---

**Happy Obfuscating! 🔒**
