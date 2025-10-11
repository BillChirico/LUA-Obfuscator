"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Copy, Download, Settings, Code, Lock, Shuffle, CheckCircle, AlertCircle } from "lucide-react";
import { CodeEditor } from "@/components/CodeEditor";
import { obfuscateLua } from "@/lib/obfuscator-simple";
import { BackgroundGradientAnimation } from "@/components/BackgroundGradient";
import { trackObfuscation, trackCopy, trackDownload } from "@/lib/analytics-client";

const DEFAULT_LUA_CODE = `-- Advanced Lua Example
-- Demonstrates all obfuscation features

local function calculateScore(basePoints, multiplier, bonus)
  -- Number encoding will transform these literals
  local maxScore = 1000
  local minScore = 100

  -- Control flow obfuscation adds complexity
  if basePoints > 50 then
    basePoints = basePoints * multiplier
  else
    basePoints = basePoints + bonus
  end

  -- String encoding protects text
  local message = "Score calculated: "
  local result = basePoints

  -- Loop demonstrates control flow
  local i = 0
  while i < 3 do
    result = result + 10
    i = i + 1
  end

  -- Clamp result
  if result > maxScore then
    result = maxScore
  elseif result < minScore then
    result = minScore
  end

  print(message .. result)
  return result
end

-- Variables and function calls show name mangling
local playerScore = 75
local scoreMultiplier = 2
local bonusPoints = 25

local finalScore = calculateScore(playerScore, scoreMultiplier, bonusPoints)
print("Final score: " .. finalScore)
`;

interface ObfuscatorSettings {
  mangleNames: boolean;
  encodeStrings: boolean;
  encodeNumbers: boolean;
  controlFlow: boolean;
  minify: boolean;
  compressionLevel: number;
}

export default function Home() {
  const [inputCode, setInputCode] = useState(DEFAULT_LUA_CODE);
  const [outputCode, setOutputCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const [settings, setSettings] = useState<ObfuscatorSettings>({
    mangleNames: false,
    encodeStrings: false,
    encodeNumbers: false,
    controlFlow: false,
    minify: false,
    compressionLevel: 0,
  });

  const obfuscateCode = () => {
    setIsProcessing(true);
    setError(null);
    setCopySuccess(false);

    setTimeout(() => {
      const result = obfuscateLua(inputCode, {
        mangleNames: settings.mangleNames,
        encodeStrings: settings.encodeStrings,
        encodeNumbers: settings.encodeNumbers,
        controlFlow: settings.controlFlow,
        minify: settings.minify,
        protectionLevel: settings.compressionLevel,
      });

      if (result.success && result.code) {
        setOutputCode(result.code);
        setError(null);

        // Track obfuscation event
        const obfuscationType =
          settings.mangleNames && settings.encodeStrings && settings.minify
            ? "full"
            : settings.mangleNames && settings.encodeStrings
            ? "mangle_encode"
            : settings.mangleNames
            ? "mangle"
            : settings.encodeStrings
            ? "encode"
            : "minify";

        trackObfuscation({
          obfuscationType,
          codeSize: inputCode.length,
          protectionLevel: settings.compressionLevel,
        }).catch(err => console.error("Analytics tracking failed:", err));
      } else {
        setError(result.error || "Failed to obfuscate code");
        setOutputCode("");
      }

      setIsProcessing(false);
    }, 100);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(outputCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);

      // Track copy event
      trackCopy(outputCode.length).catch(err => console.error("Analytics tracking failed:", err));
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const downloadCode = () => {
    const blob = new Blob([outputCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "obfuscated.lua";
    a.click();
    URL.revokeObjectURL(url);

    // Track download event
    trackDownload(outputCode.length).catch(err => console.error("Analytics tracking failed:", err));
  };

  return (
    <BackgroundGradientAnimation
      gradientBackgroundStart="rgb(15, 23, 42)"
      gradientBackgroundEnd="rgb(30, 41, 59)"
      firstColor="0, 122, 255"
      secondColor="88, 86, 214"
      thirdColor="0, 122, 255"
      fourthColor="88, 86, 214"
      fifthColor="59, 130, 246"
      pointerColor="0, 122, 255"
      containerClassName="h-screen dark"
    >
      <main className="absolute inset-0 z-10 flex flex-col p-6 gap-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center shadow-lg" aria-hidden="true">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Lua Obfuscator</h1>
              <p className="text-sm text-gray-300">Professional Lua code protection</p>
            </div>
          </div>
          <nav className="flex gap-2" aria-label="Main actions">
            <Button
              onClick={copyToClipboard}
              disabled={!outputCode}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
              aria-label={copySuccess ? "Copied to clipboard" : "Copy obfuscated code to clipboard"}
            >
              {copySuccess ? (
                <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              Copy
            </Button>
            <Button
              onClick={downloadCode}
              disabled={!outputCode}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
              aria-label="Download obfuscated code as .lua file"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={obfuscateCode}
              disabled={!inputCode || isProcessing}
              className="bg-gradient-to-r from-[#007AFF] to-[#5856D6] hover:from-[#0066CC] hover:to-[#4644C7] text-white shadow-lg"
              aria-label="Obfuscate Lua code"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              {isProcessing ? "Processing..." : "Obfuscate"}
            </Button>
          </nav>
        </header>

        {/* Main Content */}
        <section className="flex-1 grid grid-cols-12 gap-6 min-h-0" aria-label="Code editor workspace">
          {/* Code Editors - Side by Side */}
          <div className="col-span-8 grid grid-cols-2 gap-4 min-h-0">
            {/* Input Editor */}
            <section aria-labelledby="input-code-heading" className="flex flex-col min-h-0">
              <Card className="flex-1 bg-background/40 backdrop-blur-xl border-white/10 overflow-hidden flex flex-col min-h-0 p-0 gap-0">
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-[#007AFF]" aria-hidden="true" />
                    <h2 id="input-code-heading" className="text-sm font-semibold text-white">Original Lua Code</h2>
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                  <CodeEditor value={inputCode} onChange={setInputCode} />
                </div>
              </Card>
            </section>

            {/* Output Editor */}
            <section aria-labelledby="output-code-heading" className="flex flex-col min-h-0">
              <Card className="flex-1 bg-background/40 backdrop-blur-xl border-white/10 overflow-hidden flex flex-col min-h-0 p-0 gap-0">
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#5856D6]" aria-hidden="true" />
                    <h2 id="output-code-heading" className="text-sm font-semibold text-white">Obfuscated Output</h2>
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                  <CodeEditor value={outputCode} readOnly />
                </div>
              </Card>
            </section>
          </div>

          {/* Settings Panel */}
          <aside className="col-span-4 min-h-0 overflow-auto" aria-labelledby="settings-heading">
            <Card className="bg-background/40 backdrop-blur-xl border-white/10 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-[#007AFF]" aria-hidden="true" />
                <h2 id="settings-heading" className="text-lg font-semibold text-white">Obfuscation Settings</h2>
              </div>

              <div className="space-y-6">
                {/* Toggle Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mangle-names" className="text-sm text-gray-200">
                      Mangle Names
                    </Label>
                    <Switch
                      id="mangle-names"
                      checked={settings.mangleNames}
                      onCheckedChange={(checked) => setSettings({ ...settings, mangleNames: checked })}
                    />
                  </div>
                  <p className="text-xs text-gray-400 -mt-2">
                    Replace variable and function names with hexadecimal identifiers
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <Label htmlFor="encode-strings" className="text-sm text-gray-200">
                      Encode Strings
                    </Label>
                    <Switch
                      id="encode-strings"
                      checked={settings.encodeStrings}
                      onCheckedChange={(checked) => setSettings({ ...settings, encodeStrings: checked })}
                    />
                  </div>
                  <p className="text-xs text-gray-400 -mt-2">
                    Convert strings to byte arrays using string.char()
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <Label htmlFor="minify" className="text-sm text-gray-200">
                      Minify Code
                    </Label>
                    <Switch
                      id="minify"
                      checked={settings.minify}
                      onCheckedChange={(checked) => setSettings({ ...settings, minify: checked })}
                    />
                  </div>
                  <p className="text-xs text-gray-400 -mt-2">
                    Remove comments and whitespace
                  </p>
                </div>

                {/* Advanced Obfuscation */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <Label className="text-sm text-gray-200">Advanced Techniques</Label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="encode-numbers" className="text-sm text-gray-200">
                        Encode Numbers
                      </Label>
                      <Switch
                        id="encode-numbers"
                        checked={settings.encodeNumbers}
                        onCheckedChange={(checked) => setSettings({ ...settings, encodeNumbers: checked })}
                      />
                    </div>
                    <p className="text-xs text-gray-400 -mt-2">
                      Transform numeric literals into mathematical expressions
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <Label htmlFor="control-flow" className="text-sm text-gray-200">
                        Control Flow
                      </Label>
                      <Switch
                        id="control-flow"
                        checked={settings.controlFlow}
                        onCheckedChange={(checked) => setSettings({ ...settings, controlFlow: checked })}
                      />
                    </div>
                    <p className="text-xs text-gray-400 -mt-2">
                      Add opaque predicates to complicate control flow analysis
                    </p>
                  </div>
                </div>

                {/* Protection Level Slider */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <Label htmlFor="compression" className="text-sm text-gray-200">
                    Protection Level: {settings.compressionLevel}%
                  </Label>
                  <Slider
                    id="compression"
                    value={[settings.compressionLevel]}
                    onValueChange={(value) => {
                      const level = value[0];
                      setSettings({
                        ...settings,
                        compressionLevel: level,
                        minify: level >= 10,
                        mangleNames: level >= 20,
                        encodeStrings: level >= 40,
                        encodeNumbers: level >= 60,
                        controlFlow: level >= 80,
                      });
                    }}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-400">
                    {settings.compressionLevel === 0 && (
                      <p>No automatic obfuscation enabled</p>
                    )}
                    {settings.compressionLevel >= 10 && settings.compressionLevel < 20 && (
                      <p><strong className="text-blue-300">Active:</strong> Minify</p>
                    )}
                    {settings.compressionLevel >= 20 && settings.compressionLevel < 40 && (
                      <p><strong className="text-blue-300">Active:</strong> Minify, Mangle Names</p>
                    )}
                    {settings.compressionLevel >= 40 && settings.compressionLevel < 60 && (
                      <p><strong className="text-blue-300">Active:</strong> Minify, Mangle Names, Encode Strings</p>
                    )}
                    {settings.compressionLevel >= 60 && settings.compressionLevel < 80 && (
                      <p><strong className="text-blue-300">Active:</strong> Minify, Mangle Names, Encode Strings, Encode Numbers ({settings.compressionLevel}%)</p>
                    )}
                    {settings.compressionLevel >= 80 && (
                      <p><strong className="text-blue-300">Active:</strong> All techniques enabled ({settings.compressionLevel}% intensity)</p>
                    )}
                  </div>
                </div>

                {/* Info Box */}
                <div className="pt-4 border-t border-white/10">
                  <div className="bg-[#007AFF]/10 border border-[#007AFF]/20 rounded-lg p-4">
                    <p className="text-xs text-blue-200">
                      <strong>💡 Tip:</strong> Use the Protection Level slider for quick presets, or manually toggle individual techniques for fine-grained control. Higher protection levels provide stronger obfuscation but may impact performance.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </aside>
        </section>

        {/* Error Display */}
        {error && (
          <aside role="alert" aria-live="assertive" className="bg-red-900/20 border border-red-500 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <h3 className="text-red-300 font-semibold mb-1">Error</h3>
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          </aside>
        )}
      </main>
    </BackgroundGradientAnimation>
  );
}
