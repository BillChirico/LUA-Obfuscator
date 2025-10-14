"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

const Editor = dynamic(() => import("@monaco-editor/react"), {
	ssr: false,
	loading: () => (
		<div className="flex items-center justify-center h-full bg-gray-900/50 backdrop-blur-sm">
			<div className="flex flex-col items-center gap-3 animate-pulse">
				<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center">
					<svg className="w-6 h-6 text-blue-300 animate-spin" fill="none" viewBox="0 0 24 24">
						<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
				</div>
				<p className="text-sm text-gray-400 font-medium">Loading editor...</p>
			</div>
		</div>
	),
});

interface CodeEditorProps {
	value: string;
	onChange?: (value: string) => void;
	language?: string;
	readOnly?: boolean;
	height?: string;
}

/**
 * CodeEditor component with Monaco editor integration.
 * Features custom theming, Lua syntax highlighting, and JetBrains Mono font with ligatures.
 *
 * @param value - The code content to display
 * @param onChange - Callback function when code changes
 * @param language - Programming language for syntax highlighting (default: lua)
 * @param readOnly - Whether the editor is read-only
 * @param height - Height of the editor (default: 100%)
 */
export function CodeEditor({ value, onChange, language = "lua", readOnly = false, height = "100%" }: CodeEditorProps) {
	const editorRef = useRef<any>(null);

	const handleEditorChange = (value: string | undefined) => {
		if (onChange && value !== undefined) {
			onChange(value);
		}
	};

	const handleEditorDidMount = (editor: any, monaco: any) => {
		editorRef.current = editor;

		// Define custom theme matching the app design
		monaco.editor.defineTheme("lua-obfuscator-dark", {
			base: "vs-dark",
			inherit: true,
			rules: [
				{ token: "comment", foreground: "6B7280", fontStyle: "italic" },
				{ token: "keyword", foreground: "8B5CF6", fontStyle: "bold" },
				{ token: "string", foreground: "10B981" },
				{ token: "number", foreground: "F59E0B" },
				{ token: "function", foreground: "3B82F6" },
				{ token: "variable", foreground: "E5E7EB" },
				{ token: "identifier", foreground: "D1D5DB" },
				{ token: "operator", foreground: "EC4899" },
				{ token: "delimiter", foreground: "9CA3AF" },
			],
			colors: {
				"editor.background": "#0F172A00", // Transparent to show gradient
				"editor.foreground": "#E5E7EB",
				"editor.lineHighlightBackground": "#1E293B40",
				"editor.selectionBackground": "#007AFF40",
				"editor.inactiveSelectionBackground": "#007AFF20",
				"editorCursor.foreground": "#007AFF",
				"editorLineNumber.foreground": "#475569",
				"editorLineNumber.activeForeground": "#94A3B8",
				"editorIndentGuide.background": "#1E293B",
				"editorIndentGuide.activeBackground": "#334155",
				"editorWhitespace.foreground": "#1E293B",
				"scrollbarSlider.background": "#1E293B80",
				"scrollbarSlider.hoverBackground": "#334155B0",
				"scrollbarSlider.activeBackground": "#475569E0",
			},
		});

		// Apply the custom theme
		monaco.editor.setTheme("lua-obfuscator-dark");

		// Focus animation effect
		editor.onDidFocusEditorText(() => {
			editor.updateOptions({ lineHighlightBackground: "#1E293B60" });
		});

		editor.onDidBlurEditorText(() => {
			editor.updateOptions({ lineHighlightBackground: "#1E293B40" });
		});
	};

	return (
		<Editor
			height={height}
			language={language}
			value={value}
			onChange={handleEditorChange}
			onMount={handleEditorDidMount}
			theme="lua-obfuscator-dark"
			options={{
				minimap: { enabled: false },
				readOnly,
				fontSize: 13,
				fontFamily: "'JetBrainsMono Nerd Font', 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
				fontLigatures: true,
				lineNumbers: "on",
				scrollBeyondLastLine: false,
				automaticLayout: true,
				tabSize: 2,
				wordWrap: "on",
				padding: { top: 16, bottom: 16 },
				scrollbar: {
					verticalScrollbarSize: 10,
					horizontalScrollbarSize: 10,
					useShadows: false,
				},
				renderLineHighlight: "all",
				cursorBlinking: "smooth",
				cursorSmoothCaretAnimation: "on",
				smoothScrolling: true,
				folding: true,
				foldingHighlight: true,
				matchBrackets: "always",
				bracketPairColorization: {
					enabled: true,
				},
				guides: {
					bracketPairs: true,
					indentation: true,
				},
				quickSuggestions: readOnly ? false : true,
				suggestOnTriggerCharacters: !readOnly,
				parameterHints: {
					enabled: !readOnly,
				},
			}}
		/>
	);
}
