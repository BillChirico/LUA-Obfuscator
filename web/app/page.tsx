"use client";

import { useState } from "react";
import { Copy, Download, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { CodeEditor } from "@/components/CodeEditor";
import { obfuscateLua } from "@/lib/obfuscator-simple";

const DEFAULT_LUA_CODE = `-- Example Lua code
local function greet(name)
  local message = "Hello, " .. name
  print(message)
  return message
end

local userName = "World"
local result = greet(userName)
`;

export default function Home() {
  const [inputCode, setInputCode] = useState(DEFAULT_LUA_CODE);
  const [outputCode, setOutputCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleObfuscate = () => {
    setIsProcessing(true);
    setError(null);
    setCopySuccess(false);

    // Run obfuscation asynchronously to avoid blocking UI
    setTimeout(() => {
      const result = obfuscateLua(inputCode);

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([outputCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "obfuscated.lua";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Lock className="w-10 h-10 text-[#007AFF]" />
            <h1 className="text-4xl font-bold text-white">Lua Obfuscator</h1>
          </div>
          <p className="text-gray-400">
            Protect your Lua code with advanced obfuscation techniques
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Input Panel */}
          <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
              <h2 className="text-white font-semibold">Original Code</h2>
            </div>
            <div className="h-[500px]">
              <CodeEditor value={inputCode} onChange={setInputCode} />
            </div>
          </div>

          {/* Output Panel */}
          <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <div className="bg-gray-700 px-4 py-3 border-b border-gray-600 flex items-center justify-between">
              <h2 className="text-white font-semibold">Obfuscated Code</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!outputCode}
                  className="p-2 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:text-white transition-colors flex items-center gap-1"
                  title="Copy to clipboard"
                >
                  {copySuccess ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!outputCode}
                  className="p-2 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:text-white transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="h-[500px]">
              <CodeEditor value={outputCode} readOnly />
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-red-300 font-semibold mb-1">Error</h3>
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="text-center">
          <button
            onClick={handleObfuscate}
            disabled={!inputCode || isProcessing}
            className="px-8 py-3 bg-[#007AFF] text-white font-semibold rounded-lg hover:bg-[#0066CC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
          >
            {isProcessing ? "Processing..." : "Obfuscate Code"}
          </button>
        </div>
      </div>
    </main>
  );
}
