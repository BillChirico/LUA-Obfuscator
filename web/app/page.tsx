"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
	Copy,
	Download,
	Settings,
	Code,
	Lock,
	Shuffle,
	CheckCircle,
	AlertCircle,
	Zap,
	Shield,
	Sparkles,
} from "lucide-react";
import { CodeEditor } from "@/components/CodeEditor";
import { obfuscateLua } from "@/lib/obfuscator-simple";
import { BackgroundGradientAnimation } from "@/components/BackgroundGradient";
import { trackObfuscation, trackCopy, trackDownload } from "@/lib/analytics-client";
import type { ParseError } from "@/lib/parser";

const DEFAULT_LUA_CODE = `-- Advanced Game Inventory System
-- Showcases: Tables, Metatables, Closures, Error Handling, Complex Logic

local Inventory = {}
Inventory.__index = Inventory

-- Create new inventory with maximum capacity
function Inventory.new(maxSlots, playerName)
	local self = setmetatable({}, Inventory)
	self.items = {}
	self.maxSlots = maxSlots or 20
	self.playerName = playerName or "Player"
	self.gold = 0
	self.locked = false
	return self
end

-- Add item with quantity validation
function Inventory:addItem(itemName, quantity, rarity)
	if self.locked then
		return false, "Inventory is locked"
	end
	
	local slot = #self.items + 1
	if slot > self.maxSlots then
		return false, "Inventory full"
	end
	
	-- Create item with metadata
	local item = {
		name = itemName,
		qty = quantity or 1,
		rarity = rarity or "common",
		timestamp = os.time(),
		id = math.random(1000, 9999)
	}
	
	-- Apply rarity multiplier
	local multiplier = 1.0
	if rarity == "rare" then
		multiplier = 1.5
	elseif rarity == "epic" then
		multiplier = 2.0
	elseif rarity == "legendary" then
		multiplier = 3.0
	end
	
	item.value = math.floor(quantity * 10 * multiplier)
	table.insert(self.items, item)
	
	return true, "Added " .. itemName
end

-- Calculate total inventory value
function Inventory:getTotalValue()
	local total = self.gold
	local count = 0
	
	for i = 1, #self.items do
		local item = self.items[i]
		total = total + (item.value or 0)
		count = count + 1
	end
	
	return total, count
end

-- Find items by rarity with filtering
function Inventory:findByRarity(targetRarity)
	local matches = {}
	local pattern = string.lower(targetRarity)
	
	for _, item in pairs(self.items) do
		if string.lower(item.rarity) == pattern then
			table.insert(matches, item.name)
		end
	end
	
	return matches
end

-- Sell item with price calculation
function Inventory:sellItem(index)
	if index < 1 or index > #self.items then
		return false
	end
	
	local item = table.remove(self.items, index)
	local salePrice = math.floor(item.value * 0.75)
	self.gold = self.gold + salePrice
	
	return true, salePrice
end

-- Protected transaction with error handling
function Inventory:safeTransaction(callback)
	self.locked = true
	
	local success, result = pcall(function()
		return callback(self)
	end)
	
	self.locked = false
	return success, result
end

-- Initialize player inventory
local playerInventory = Inventory.new(25, "Hero")

-- Add various items
playerInventory:addItem("Health Potion", 5, "common")
playerInventory:addItem("Mana Crystal", 3, "rare")
playerInventory:addItem("Dragon Scale", 1, "legendary")
playerInventory:addItem("Iron Sword", 1, "epic")
playerInventory:addItem("Gold Coins", 100, "common")

-- Calculate statistics
local totalValue, itemCount = playerInventory:getTotalValue()
print("Inventory Value: " .. totalValue .. " gold")
print("Total Items: " .. itemCount)

-- Find legendary items
local legendaries = playerInventory:findByRarity("legendary")
print("Legendary Items: " .. table.concat(legendaries, ", "))

-- Perform safe transaction
local success, price = playerInventory:safeTransaction(function(inv)
	return inv:sellItem(2)
end)

if success then
	print("Sold item for " .. price .. " gold")
	print("New Balance: " .. playerInventory.gold .. " gold")
end
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
	const [inputError, setInputError] = useState<ParseError | undefined>(undefined);
	const [copySuccess, setCopySuccess] = useState(false);
	const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

	const [settings, setSettings] = useState<ObfuscatorSettings>({
		mangleNames: false,
		encodeStrings: false,
		encodeNumbers: false,
		controlFlow: false,
		minify: false,
		compressionLevel: 0,
	});

	// Success animation effect
	useEffect(() => {
		if (outputCode && !error) {
			setShowSuccessAnimation(true);
			const timer = setTimeout(() => setShowSuccessAnimation(false), 1500);
			return () => clearTimeout(timer);
		}
	}, [outputCode, error]);

	// Clear input error when user starts typing to fix it
	const handleInputChange = (newCode: string) => {
		setInputCode(newCode);
		if (inputError) {
			setInputError(undefined);
		}
	};

	const obfuscateCode = () => {
		setIsProcessing(true);
		setError(null);
		setInputError(undefined);
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
				setInputError(undefined);

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
				setInputError(result.errorDetails);
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

	// Calculate protection strength for visual feedback
	const getProtectionStrength = () => {
		if (settings.compressionLevel === 0) return "none";
		if (settings.compressionLevel < 40) return "low";
		if (settings.compressionLevel < 70) return "medium";
		return "high";
	};

	const protectionStrength = getProtectionStrength();

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
			<main className="absolute inset-0 z-10 flex flex-col p-4 sm:p-6 gap-4 lg:gap-6">
				{/* Header with Enhanced Design */}
				<header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top duration-700">
					<div className="flex items-center gap-4">
						<div className="relative group">
							<div className="absolute inset-0 bg-gradient-to-br from-[#007AFF] via-[#0066FF] to-[#5856D6] rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
							<div
								className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#007AFF] via-[#0066FF] to-[#5856D6] flex items-center justify-center shadow-2xl shadow-blue-500/30 ring-2 ring-white/20 backdrop-blur-sm transform group-hover:scale-105 transition-all duration-300"
								aria-hidden="true"
							>
								<Lock className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-md group-hover:rotate-12 transition-transform duration-300" />
							</div>
						</div>
						<div>
							<h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-blue-200">
								Lua Obfuscator
							</h1>
							<p className="text-xs sm:text-sm text-gray-300/90 hidden sm:block font-medium">
								Professional code protection & security
							</p>
						</div>
					</div>
					<nav className="flex flex-wrap gap-3 w-full sm:w-auto" aria-label="Main actions">
						<Button
							onClick={copyToClipboard}
							disabled={!outputCode}
							className="group bg-white/10 hover:bg-white/20 active:bg-white/25 text-white border border-white/20 hover:border-white/40 flex-1 sm:flex-none transition-all duration-300 shadow-lg hover:shadow-2xl backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
							aria-label={copySuccess ? "Copied to clipboard" : "Copy obfuscated code to clipboard"}
						>
							{copySuccess ? (
								<>
									<CheckCircle className="w-4 h-4 mr-2 text-green-400 animate-in zoom-in duration-200" />
									<span className="animate-in fade-in duration-200">Copied!</span>
								</>
							) : (
								<>
									<Copy className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
									Copy
								</>
							)}
						</Button>
						<Button
							onClick={downloadCode}
							disabled={!outputCode}
							className="group bg-white/10 hover:bg-white/20 active:bg-white/25 text-white border border-white/20 hover:border-white/40 flex-1 sm:flex-none transition-all duration-300 shadow-lg hover:shadow-2xl backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
							aria-label="Download obfuscated code as .lua file"
						>
							<Download className="w-4 h-4 mr-2 group-hover:translate-y-0.5 transition-transform duration-200" />
							Download
						</Button>
						<Button
							onClick={obfuscateCode}
							disabled={!inputCode || isProcessing}
							className="group relative bg-gradient-to-r from-[#007AFF] via-[#0066FF] to-[#5856D6] hover:from-[#0088FF] hover:via-[#0077FF] hover:to-[#6867E7] active:scale-[0.98] text-white shadow-xl hover:shadow-2xl shadow-blue-500/40 flex-1 sm:flex-none transition-all duration-300 font-semibold hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 overflow-hidden"
							aria-label="Obfuscate Lua code"
						>
							<div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
							<Shuffle className="w-4 h-4 mr-2 relative z-10 group-hover:rotate-180 transition-transform duration-500" />
							<span className="relative z-10">{isProcessing ? "Processing..." : "Obfuscate"}</span>
						</Button>
					</nav>
				</header>

				{/* Success Animation Overlay */}
				{showSuccessAnimation && (
					<div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top fade-in duration-300">
						<div className="bg-gradient-to-r from-green-500/90 to-emerald-500/90 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-2xl border border-green-400/30 flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
								<Sparkles className="w-5 h-5 text-white animate-pulse" />
							</div>
							<div>
								<p className="text-white font-bold text-sm">Obfuscation Complete!</p>
								<p className="text-green-50 text-xs">Your code is now protected</p>
							</div>
						</div>
					</div>
				)}

				{/* Main Content */}
				<section
					className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-6 min-h-0 overflow-y-auto animate-in fade-in slide-in-from-bottom duration-700"
					aria-label="Code editor workspace"
				>
					{/* Code Editors - Side by Side on Desktop, Stacked on Mobile */}
					<div className="lg:col-span-8 flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:min-h-0">
						{/* Input Editor */}
						<section
							aria-labelledby="input-code-heading"
							className="flex flex-col h-[300px] lg:h-auto lg:min-h-0 group"
						>
							<Card className="flex-1 bg-gradient-to-br from-background/60 via-background/50 to-background/40 backdrop-blur-2xl border-white/20 shadow-2xl shadow-black/30 overflow-hidden flex flex-col h-full p-0 gap-0 ring-1 ring-white/10 hover:ring-white/20 transition-all duration-500 hover:shadow-blue-500/20">
								<div className="p-4 border-b border-white/20 bg-gradient-to-r from-white/10 to-transparent backdrop-blur-sm">
									<div className="flex items-center gap-3">
										<div className="relative">
											<div className="absolute inset-0 bg-gradient-to-br from-[#007AFF] to-[#0066FF] rounded-lg blur-md opacity-50"></div>
											<div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-[#007AFF] to-[#0066FF] flex items-center justify-center shadow-lg">
												<Code className="w-4.5 h-4.5 text-white" aria-hidden="true" />
											</div>
										</div>
										<div>
											<h2 id="input-code-heading" className="text-sm font-bold text-white tracking-wide">
												Original Lua Code
											</h2>
											<p className="text-xs text-gray-400 font-medium">Ready for obfuscation</p>
										</div>
									</div>
								</div>
								<div className="flex-1 min-h-0">
									<CodeEditor value={inputCode} onChange={handleInputChange} error={inputError} />
								</div>
							</Card>
						</section>

						{/* Output Editor */}
						<section
							aria-labelledby="output-code-heading"
							className="flex flex-col h-[300px] lg:h-auto lg:min-h-0 group"
						>
							<Card className="flex-1 bg-gradient-to-br from-background/60 via-background/50 to-background/40 backdrop-blur-2xl border-white/20 shadow-2xl shadow-black/30 overflow-hidden flex flex-col h-full p-0 gap-0 ring-1 ring-white/10 hover:ring-white/20 transition-all duration-500 hover:shadow-purple-500/20">
								<div className="p-4 border-b border-white/20 bg-gradient-to-r from-white/10 to-transparent backdrop-blur-sm">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="relative">
												<div className="absolute inset-0 bg-gradient-to-br from-[#5856D6] to-[#4644C7] rounded-lg blur-md opacity-50"></div>
												<div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-[#5856D6] to-[#4644C7] flex items-center justify-center shadow-lg">
													<Shield className="w-4.5 h-4.5 text-white" aria-hidden="true" />
												</div>
											</div>
											<div>
												<h2 id="output-code-heading" className="text-sm font-bold text-white tracking-wide">
													Obfuscated Output
												</h2>
												<p className="text-xs text-gray-400 font-medium">Protected & secured</p>
											</div>
										</div>
										{outputCode && (
											<div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 backdrop-blur-sm animate-in fade-in zoom-in duration-500">
												<Zap className="w-3.5 h-3.5 text-green-400" />
												<span className="text-xs font-bold text-green-300">Active</span>
											</div>
										)}
									</div>
								</div>
								<div className="flex-1 min-h-0">
									<CodeEditor value={outputCode} readOnly />
								</div>
							</Card>
						</section>
					</div>

					{/* Settings Panel */}
					<aside className="lg:col-span-4 lg:overflow-auto" aria-labelledby="settings-heading">
						<Card className="bg-gradient-to-br from-background/60 via-background/50 to-background/40 backdrop-blur-2xl border-white/20 shadow-2xl shadow-black/30 p-6 sm:p-7 ring-1 ring-white/10 hover:ring-white/20 transition-all duration-500">
							<div className="flex items-center gap-3 mb-6 sm:mb-8 pb-5 border-b border-white/20">
								<div className="relative">
									<div className="absolute inset-0 bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-xl blur-lg opacity-50"></div>
									<div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center shadow-lg">
										<Settings className="w-5.5 h-5.5 text-white" aria-hidden="true" />
									</div>
								</div>
								<div className="flex-1">
									<h2 id="settings-heading" className="text-lg sm:text-xl font-bold text-white tracking-tight">
										Obfuscation Settings
									</h2>
									<p className="text-xs text-gray-400 font-medium mt-0.5">Configure protection level</p>
								</div>
							</div>

							<div className="space-y-7">
								{/* Toggle Settings */}
								<div className="space-y-4">
									<div className="flex items-center justify-between group hover:bg-white/5 p-3.5 rounded-xl -mx-3.5 transition-all duration-200 cursor-pointer">
										<Label htmlFor="mangle-names" className="text-sm font-semibold text-gray-100 cursor-pointer flex-1">
											<div className="flex items-center gap-2">
												<span>Mangle Names</span>
												{settings.mangleNames && <Zap className="w-3.5 h-3.5 text-blue-400 animate-pulse" />}
											</div>
											<p className="text-xs text-gray-400/90 mt-1 font-normal leading-relaxed">
												Replace variable and function names with hexadecimal identifiers
											</p>
										</Label>
										<Switch
											id="mangle-names"
											checked={settings.mangleNames}
											onCheckedChange={checked => setSettings({ ...settings, mangleNames: checked })}
										/>
									</div>

									<div className="flex items-center justify-between group hover:bg-white/5 p-3.5 rounded-xl -mx-3.5 transition-all duration-200 cursor-pointer">
										<Label
											htmlFor="encode-strings"
											className="text-sm font-semibold text-gray-100 cursor-pointer flex-1"
										>
											<div className="flex items-center gap-2">
												<span>Encode Strings</span>
												{settings.encodeStrings && <Zap className="w-3.5 h-3.5 text-blue-400 animate-pulse" />}
											</div>
											<p className="text-xs text-gray-400/90 mt-1 font-normal leading-relaxed">
												Convert strings to byte arrays using string.char()
											</p>
										</Label>
										<Switch
											id="encode-strings"
											checked={settings.encodeStrings}
											onCheckedChange={checked => setSettings({ ...settings, encodeStrings: checked })}
										/>
									</div>

									<div className="flex items-center justify-between group hover:bg-white/5 p-3.5 rounded-xl -mx-3.5 transition-all duration-200 cursor-pointer">
										<Label htmlFor="minify" className="text-sm font-semibold text-gray-100 cursor-pointer flex-1">
											<div className="flex items-center gap-2">
												<span>Minify Code</span>
												{settings.minify && <Zap className="w-3.5 h-3.5 text-blue-400 animate-pulse" />}
											</div>
											<p className="text-xs text-gray-400/90 mt-1 font-normal leading-relaxed">
												Remove comments and whitespace
											</p>
										</Label>
										<Switch
											id="minify"
											checked={settings.minify}
											onCheckedChange={checked => setSettings({ ...settings, minify: checked })}
										/>
									</div>
								</div>

								{/* Advanced Obfuscation */}
								<div className="space-y-4 pt-6 border-t border-white/20">
									<Label className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2.5">
										<div className="w-1 h-5 bg-gradient-to-b from-[#007AFF] to-[#5856D6] rounded-full shadow-lg shadow-blue-500/50"></div>
										Advanced Techniques
									</Label>

									<div className="flex items-center justify-between group hover:bg-white/5 p-3.5 rounded-xl -mx-3.5 transition-all duration-200 cursor-pointer">
										<Label
											htmlFor="encode-numbers"
											className="text-sm font-semibold text-gray-100 cursor-pointer flex-1"
										>
											<div className="flex items-center gap-2">
												<span>Encode Numbers</span>
												{settings.encodeNumbers && <Zap className="w-3.5 h-3.5 text-purple-400 animate-pulse" />}
											</div>
											<p className="text-xs text-gray-400/90 mt-1 font-normal leading-relaxed">
												Transform numeric literals into mathematical expressions
											</p>
										</Label>
										<Switch
											id="encode-numbers"
											checked={settings.encodeNumbers}
											onCheckedChange={checked => setSettings({ ...settings, encodeNumbers: checked })}
										/>
									</div>

									<div className="flex items-center justify-between group hover:bg-white/5 p-3.5 rounded-xl -mx-3.5 transition-all duration-200 cursor-pointer">
										<Label htmlFor="control-flow" className="text-sm font-semibold text-gray-100 cursor-pointer flex-1">
											<div className="flex items-center gap-2">
												<span>Control Flow</span>
												{settings.controlFlow && <Zap className="w-3.5 h-3.5 text-purple-400 animate-pulse" />}
											</div>
											<p className="text-xs text-gray-400/90 mt-1 font-normal leading-relaxed">
												Add opaque predicates to complicate control flow analysis
											</p>
										</Label>
										<Switch
											id="control-flow"
											checked={settings.controlFlow}
											onCheckedChange={checked => setSettings({ ...settings, controlFlow: checked })}
										/>
									</div>
								</div>

								{/* Protection Level Slider */}
								<div className="space-y-5 pt-6 border-t border-white/20">
									<div className="flex items-center justify-between">
										<Label
											htmlFor="compression"
											className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2.5"
										>
											<div className="w-1 h-5 bg-gradient-to-b from-[#007AFF] to-[#5856D6] rounded-full shadow-lg shadow-blue-500/50"></div>
											Protection Level
										</Label>
										<div className="flex items-center gap-2">
											<div
												className={cn(
													"px-3 py-1.5 rounded-lg font-bold text-xs backdrop-blur-sm border transition-all duration-300",
													protectionStrength === "none" && "bg-gray-500/20 border-gray-500/30 text-gray-300",
													protectionStrength === "low" && "bg-blue-500/20 border-blue-500/30 text-blue-300",
													protectionStrength === "medium" && "bg-purple-500/20 border-purple-500/30 text-purple-300",
													protectionStrength === "high" &&
														"bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-300"
												)}
											>
												{settings.compressionLevel}%
											</div>
										</div>
									</div>
									<div className="relative">
										<Slider
											id="compression"
											value={[settings.compressionLevel]}
											onValueChange={value => {
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
									</div>
									<div
										className={cn(
											"text-xs rounded-xl p-4 backdrop-blur-sm border transition-all duration-300",
											protectionStrength === "none" && "bg-gray-500/10 border-gray-500/20 text-gray-300",
											protectionStrength === "low" && "bg-blue-500/10 border-blue-500/20 text-blue-200",
											protectionStrength === "medium" && "bg-purple-500/10 border-purple-500/20 text-purple-200",
											protectionStrength === "high" &&
												"bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20 text-orange-200"
										)}
									>
										{settings.compressionLevel === 0 && (
											<div className="flex items-center gap-2">
												<div className="w-2 h-2 rounded-full bg-gray-400"></div>
												<p>No automatic obfuscation enabled</p>
											</div>
										)}
										{settings.compressionLevel >= 10 && settings.compressionLevel < 20 && (
											<div className="flex items-center gap-2">
												<div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
												<p>
													<strong className="font-bold">Active:</strong> Minify
												</p>
											</div>
										)}
										{settings.compressionLevel >= 20 && settings.compressionLevel < 40 && (
											<div className="flex items-center gap-2">
												<div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
												<p>
													<strong className="font-bold">Active:</strong> Minify, Mangle Names
												</p>
											</div>
										)}
										{settings.compressionLevel >= 40 && settings.compressionLevel < 60 && (
											<div className="flex items-center gap-2">
												<div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
												<p>
													<strong className="font-bold">Active:</strong> Minify, Mangle Names, Encode Strings
												</p>
											</div>
										)}
										{settings.compressionLevel >= 60 && settings.compressionLevel < 80 && (
											<div className="flex items-center gap-2">
												<div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
												<p>
													<strong className="font-bold">Active:</strong> Minify, Mangle Names, Encode Strings, Encode
													Numbers
												</p>
											</div>
										)}
										{settings.compressionLevel >= 80 && (
											<div className="flex items-center gap-2">
												<div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
												<p>
													<strong className="font-bold">Maximum Protection:</strong> All techniques enabled
												</p>
											</div>
										)}
									</div>
								</div>

								{/* Enhanced Info Box */}
								<div className="pt-6 border-t border-white/20">
									<div className="relative overflow-hidden bg-gradient-to-br from-[#007AFF]/20 via-[#5856D6]/15 to-[#007AFF]/10 border border-[#007AFF]/40 rounded-2xl p-5 shadow-2xl backdrop-blur-sm">
										<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl"></div>
										<div className="relative flex items-start gap-3">
											<div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#007AFF]/30 to-[#5856D6]/30 flex items-center justify-center flex-shrink-0 shadow-lg backdrop-blur-sm border border-blue-400/30">
												<Sparkles className="w-4 h-4 text-blue-300" />
											</div>
											<div>
												<p className="text-xs text-blue-100 leading-relaxed">
													<strong className="font-bold text-sm block mb-1">💡 Pro Tip</strong>
													Use the Protection Level slider for quick presets, or manually toggle individual techniques
													for fine-grained control. Higher protection levels provide stronger obfuscation but may impact
													performance.
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</Card>
					</aside>
				</section>

				{/* Enhanced Error Display */}
				{error && (
					<aside
						role="alert"
						aria-live="assertive"
						className="relative overflow-hidden bg-gradient-to-r from-red-900/40 via-red-800/30 to-red-900/40 border-2 border-red-500/60 rounded-2xl p-6 flex items-start gap-4 shadow-2xl shadow-red-500/30 backdrop-blur-xl ring-1 ring-red-500/30 animate-in slide-in-from-bottom fade-in duration-500"
					>
						<div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-red-500/20 to-transparent rounded-full blur-3xl"></div>
						<div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/30 to-red-600/30 flex items-center justify-center flex-shrink-0 shadow-lg backdrop-blur-sm border border-red-500/40">
							<AlertCircle className="w-6 h-6 text-red-300 animate-pulse" aria-hidden="true" />
						</div>
						<div className="flex-1 relative">
							<h3 className="text-red-200 font-bold mb-2 text-base flex items-center gap-2">
								Obfuscation Error
								<span className="px-2 py-0.5 bg-red-500/20 rounded-md text-xs">Failed</span>
							</h3>
							<p className="text-red-100/90 text-sm leading-relaxed">{error}</p>
						</div>
					</aside>
				)}
			</main>
		</BackgroundGradientAnimation>
	);
}
