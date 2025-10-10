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

const DEFAULT_LUA_CODE = `-- Example Lua code
local function greet(name)
  local message = "Hello, " .. name
  print(message)
  return message
end

local userName = "World"
local result = greet(userName)
`;

interface ObfuscatorSettings {
  mangleNames: boolean;
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
    mangleNames: true,
    minify: true,
    compressionLevel: 75,
  });

  const obfuscateCode = () => {
    setIsProcessing(true);
    setError(null);
    setCopySuccess(false);

    setTimeout(() => {
      const result = obfuscateLua(inputCode, {
        mangleNames: settings.mangleNames,
        encodeStrings: false, // Coming in v1.1
        minify: settings.minify,
      });

      if (result.success && result.code) {
        setOutputCode(result.code);
        setError(null);
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
          {/* Code Editors */}
          <div className="col-span-8 flex flex-col gap-4 min-h-0">
            {/* Input Editor */}
            <section aria-labelledby="input-code-heading">
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
            <section aria-labelledby="output-code-heading">
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

                {/* Compression Slider - Disabled until v1.1 */}
                <div className="space-y-3 pt-4 border-t border-white/10 opacity-50">
                  <Label htmlFor="compression" className="text-sm text-gray-400">
                    Protection Level: {settings.compressionLevel}%
                  </Label>
                  <Slider
                    id="compression"
                    value={[settings.compressionLevel]}
                    disabled
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-400">
                    Coming in v1.1 - adjustable protection strength
                  </p>
                </div>

                {/* Coming Soon */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <Label className="text-sm text-gray-400">Coming in v1.1+</Label>
                  <div className="space-y-3 opacity-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">String Encoding</span>
                      <Switch disabled checked={false} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Number Encoding</span>
                      <Switch disabled checked={false} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Control Flow</span>
                      <Switch disabled checked={false} />
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="pt-4 border-t border-white/10">
                  <div className="bg-[#007AFF]/10 border border-[#007AFF]/20 rounded-lg p-4">
                    <p className="text-xs text-blue-200">
                      <strong>💡 Tip:</strong> Higher protection levels and additional techniques provide better code security. Currently in MVP with basic obfuscation.
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
