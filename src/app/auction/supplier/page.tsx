"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    DollarSign, Gavel, TrendingUp, Target, Clock, ArrowRight, Trophy, Package, FileText,
    Bell, BarChart3, Users, Zap, Calendar, Star, AlertCircle, Sparkles, Activity,
    Flame, ShieldCheck, Lock, TrendingDown, AlertTriangle, ChevronRight, Award, CheckCircle2, X,
} from "lucide-react";
import Link from "next/link";
import StatusBadge from "../components/status-badge";
import { auctions, suppliers, orders, formatCurrency } from "../lib/mock-data";
import { products } from "../lib/products-db";

export default function SupplierDashboard() {
    const me = suppliers.find((s) => s.id === "SUP-001")!;
    const myBids = auctions.flatMap((a) => a.bids.filter((b) => b.supplierId === "SUP-001"));
    const wonBids = myBids.filter((b) => b.status === "won");
    const activeBids = myBids.filter((b) => b.status === "active");
    const availableAuctions = auctions.filter((a) => a.status === "active" || a.status === "pending");

    // Revenue trend data
    const revenueData = [
        { month: "Aug", revenue: 180000, bids: 5, wins: 2 },
        { month: "Sep", revenue: 245000, bids: 7, wins: 3 },
        { month: "Oct", revenue: 210000, bids: 6, wins: 2 },
        { month: "Nov", revenue: 320000, bids: 8, wins: 4 },
        { month: "Dec", revenue: 290000, bids: 9, wins: 3 },
        { month: "Jan", revenue: 380000, bids: 11, wins: 5 },
    ];
    const maxRevenue = Math.max(...revenueData.map((d) => d.revenue));

    // Demand heatmap by category
    const demandHeatmap = [
        { category: "Beverages & Drinks", demand: 92, auctions: 12, trend: "+15%" },
        { category: "Rice & Grains", demand: 78, auctions: 8, trend: "+8%" },
        { category: "Sauces & Condiments", demand: 65, auctions: 6, trend: "+22%" },
        { category: "Instant Noodles & Pasta", demand: 55, auctions: 5, trend: "+12%" },
        { category: "Chips & Snacks", demand: 45, auctions: 5, trend: "+5%" },
        { category: "Household Cleaning", demand: 35, auctions: 3, trend: "-2%" },
    ];

    // Upcoming deliveries
    const p_milo = products.find(p => p.name.includes("Milo")) || products[0];
    const p_rice = products.find(p => p.name.includes("Basmati Rice 1KG")) || products[1];
    const p_indomie = products.find(p => p.name.includes("Mi Goreng") && !p.name.includes("Carton")) || products[2];

    const upcomingDeliveries = [
        { product: p_milo.name, shop: "12 shops", date: "Feb 22", status: "preparing", qty: "4,800 units" },
        { product: p_rice.name, shop: "8 shops", date: "Feb 24", status: "ready", qty: "2,400 bags" },
        { product: p_indomie.name, shop: "15 shops", date: "Feb 26", status: "scheduled", qty: "7,200 packs" },
    ];

    // Smart Overstock data
    const overstockItems = [
        { product: "Tiger Large Beer 490ML", stock: 1200, unit: "cans", daysInWarehouse: 18, matchedShops: 14, suggestedDiscount: 12 },
        { product: "LKK Oyster Sauce 770G", stock: 850, unit: "bottles", daysInWarehouse: 24, matchedShops: 9, suggestedDiscount: 15 },
    ];

    // Competitor intel data
    const competitorInsights = [
        { product: "India Gate Basmati Rice 1KG", yourAvgQuote: 6.50, winningAvg: 6.35, bidsLost: 3, lastResult: "lost" as const },
        { product: "Nestle Milo 400G", yourAvgQuote: 3.80, winningAvg: 3.90, bidsLost: 0, lastResult: "won" as const },
        { product: "Indomie Mi Goreng (5-Pack)", yourAvgQuote: 2.65, winningAvg: 2.55, bidsLost: 2, lastResult: "lost" as const },
    ];

    // Preferred status progression
    const currentLevel = me.preferredSupplierStatus ? "preferred" : "standard";
    const onTimeTarget = 95;
    const ratingTarget = 4.8;
    const currentOnTime = me.onTimeDeliveryRate;
    const currentRating = 4.6;
    const deliveriesNeeded = 3;
    const progressPct = currentLevel === "preferred" ? 100 : Math.min(95, ((currentOnTime / onTimeTarget) * 50 + (currentRating / ratingTarget) * 50));

    // Pulsing FOMO counter
    const [fomoValue] = useState(42500);
    const [claimedValue] = useState(12000);

    // Flash sale state
    const [flashSaleModal, setFlashSaleModal] = useState<typeof overstockItems[0] | null>(null);
    const [flashSaleSuccess, setFlashSaleSuccess] = useState<Set<string>>(new Set());

    const handleFlashSale = (item: typeof overstockItems[0]) => {
        setFlashSaleModal(item);
    };

    const confirmFlashSale = () => {
        if (flashSaleModal) {
            setFlashSaleSuccess(prev => new Set(prev).add(flashSaleModal.product));
            setFlashSaleModal(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

            {/* ========== 1. FOMO "Money on the Table" Banner ========== */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl border border-[#E5E5E0]">
                {/* Dark gradient background */}
                <div className="bg-gradient-to-r from-[#1A2E1B] via-[#2C432D] to-[#3D5A35] p-6">
                    <div className="absolute inset-0 opacity-20"
                        style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(107,143,97,0.4) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(74,103,65,0.3) 0%, transparent 50%)" }} />
                    <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.04]"
                        style={{ background: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/10">
                                    <Sparkles size={10} className="text-[#A8C89A]" />
                                    <span className="text-[9px] font-medium text-[#A8C89A] uppercase tracking-wider">AI-Powered Dashboard</span>
                                </div>
                            </div>
                            <h1 className="text-xl font-bold text-white">Welcome back, {me.companyName}</h1>
                            <p className="text-sm text-white/50 mt-0.5">Your supplier intelligence overview</p>
                        </div>
                        <div className="flex gap-2">
                            <Link href="/auction/supplier/auctions"
                                className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#2C432D] text-sm font-medium rounded-xl hover:bg-white/90 transition-colors shadow-sm">
                                <Gavel size={14} /> Browse Auctions
                            </Link>
                            <Link href="/auction/supplier/bids"
                                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm text-white text-sm font-medium rounded-xl border border-white/15 hover:bg-white/20 transition-colors">
                                <BarChart3 size={14} /> My Bids
                            </Link>
                            <Link href="/auction/supplier/crm"
                                className="flex items-center gap-2 px-4 py-2.5 bg-[#F57F17] text-[#1A1A1A] text-sm font-bold rounded-xl hover:bg-[#F2AE1C] transition-colors shadow-sm cursor-pointer">
                                <FileText size={14} /> Respond to RFQs
                            </Link>
                        </div>
                    </div>
                </div>

                {/* FOMO Strip — Unfulfilled Demand */}
                <div className="bg-gradient-to-r from-[#FFF8E1] via-[#FFF3CD] to-[#FFF8E1] px-6 py-3 border-t border-[#F57F17]/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <Flame size={16} className="text-[#F57F17] animate-pulse" />
                                <span className="text-xs font-bold text-[#1A1A1A]">Active unfulfilled demand in your categories:</span>
                            </div>
                            <span className="text-lg font-black text-[#F57F17]">{formatCurrency(fomoValue)}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-[10px]">
                                <span className="text-[#9CA38C]">Competitors already claimed</span>
                                <span className="font-bold text-[#C53030]">{formatCurrency(claimedValue)}</span>
                            </div>
                            <Link href="/auction/supplier/auctions"
                                className="flex items-center gap-1 px-3 py-1.5 bg-[#F57F17] text-white text-[10px] font-bold rounded-lg hover:bg-[#E65100] transition-colors shadow-sm">
                                <Zap size={10} /> Claim Now <ArrowRight size={10} />
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ========== 4. Gamified "Preferred Status" Progression ========== */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="relative overflow-hidden bg-white rounded-2xl border border-[#E5E5E0] p-4">
                <div className="flex items-center gap-6">
                    {/* Level Badge */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${currentLevel === "preferred"
                            ? "bg-gradient-to-br from-[#B8860B] to-[#D4A017]"
                            : "bg-gradient-to-br from-[#6B7265] to-[#9CA38C]"}`}>
                            {currentLevel === "preferred"
                                ? <Award size={22} className="text-white" />
                                : <Star size={22} className="text-white" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-[#1A1A1A]">
                                    {currentLevel === "preferred" ? "⭐ Preferred Supplier" : "Standard Supplier"}
                                </p>
                                {currentLevel !== "preferred" && (
                                    <span className="text-[9px] font-bold text-[#B8860B] bg-[#FFF8E1] px-1.5 py-0.5 rounded border border-[#B8860B]/20">
                                        {(100 - progressPct).toFixed(0)}% to Preferred
                                    </span>
                                )}
                            </div>
                            {currentLevel !== "preferred" ? (
                                <p className="text-[10px] text-[#9CA38C] mt-0.5">
                                    <strong className="text-[#1A1A1A]">{deliveriesNeeded}</strong> on-time deliveries and <strong className="text-[#1A1A1A]">{ratingTarget}+</strong> rating away from unlocking Preferred
                                </p>
                            ) : (
                                <p className="text-[10px] text-[#4A6741] mt-0.5 font-medium">6-hour head start on all new RFQs · Priority placement · Exclusive deals</p>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex-1 min-w-0">
                        <div className="h-3 bg-[#F0F0EC] rounded-full overflow-hidden relative">
                            <motion.div className="h-full rounded-full bg-gradient-to-r from-[#6B7265] via-[#B8860B] to-[#D4A017]"
                                initial={{ width: 0 }} animate={{ width: `${progressPct}%` }}
                                transition={{ duration: 1, delay: 0.3 }} />
                            {/* Milestone markers */}
                            <div className="absolute top-0 bottom-0 left-[50%] w-px bg-white/60" />
                            <div className="absolute top-0 bottom-0 left-[75%] w-px bg-white/60" />
                        </div>
                        <div className="flex justify-between mt-1 text-[8px] text-[#9CA38C]">
                            <span>Standard</span>
                            <span>On-Time: {currentOnTime}%/{onTimeTarget}%</span>
                            <span>Rating: {currentRating}/{ratingTarget}</span>
                            <span className="font-bold text-[#B8860B]">⭐ Preferred</span>
                        </div>
                    </div>

                    {/* Perk Preview */}
                    <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
                        {[
                            { icon: Clock, label: "6h head start", unlocked: currentLevel === "preferred" },
                            { icon: ShieldCheck, label: "Priority rank", unlocked: currentLevel === "preferred" },
                            { icon: DollarSign, label: "Exclusive RFQs", unlocked: false },
                        ].map(perk => (
                            <div key={perk.label} className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[9px] font-medium ${perk.unlocked
                                ? "bg-[#E8F5E9] text-[#2C432D] border-[#2C432D]/20"
                                : "bg-[#F7F7F5] text-[#9CA38C] border-[#E5E5E0]"}`}>
                                {perk.unlocked ? <perk.icon size={10} /> : <Lock size={8} />}
                                {perk.label}
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                {[
                    { icon: DollarSign, label: "Total Revenue", value: formatCurrency(me.totalRevenue), sub: "all time", accent: "from-[#2C432D] to-[#4A6741]" },
                    { icon: Trophy, label: "Auctions Won", value: me.totalAuctionsWon.toString(), sub: `Win rate: ${((me.totalAuctionsWon / (me.totalAuctionsWon + 20)) * 100).toFixed(0)}%`, accent: "from-[#3D5A35] to-[#5C7D53]" },
                    { icon: FileText, label: "Incoming RFQs", value: "3", sub: "awaiting quotes", accent: "from-[#F57F17] to-[#FFA000]" },
                    { icon: Gavel, label: "Active Bids", value: activeBids.length.toString(), sub: "awaiting results", accent: "from-[#4A6741] to-[#6B8F61]" },
                    { icon: Target, label: "Score", value: `${me.performanceScore}`, sub: me.preferredSupplierStatus ? "⭐ Preferred" : "Standard", accent: "from-[#2C432D] to-[#3D5A35]" },
                    { icon: Activity, label: "New Auctions", value: availableAuctions.length.toString(), sub: "ready to bid", accent: "from-[#3D5A35] to-[#4A6741]" },
                ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                        className="relative overflow-hidden bg-white rounded-2xl border border-[#E5E5E0] p-4 hover:shadow-lg hover:shadow-[#4A6741]/8 transition-all group">
                        <div className="absolute top-0 right-0 w-20 h-20 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity"
                            style={{ background: "radial-gradient(circle at top right, #4A6741, transparent 70%)" }} />
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.accent} flex items-center justify-center text-white mb-3 shadow-sm`}>
                            <stat.icon size={16} />
                        </div>
                        <p className="text-xl font-bold text-[#1A1A1A]">{stat.value}</p>
                        <p className="text-xs text-[#6B7265] mt-0.5">{stat.label}</p>
                        <p className="text-[10px] text-[#9CA38C]">{stat.sub}</p>
                    </motion.div>
                ))}
            </div>

            {/* ========== 2. Smart Overstock Clearance + 3. Competitor Intel ========== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Smart Overstock Clearance */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    className="relative overflow-hidden bg-white rounded-2xl border border-[#E5E5E0] p-5">
                    <div className="absolute inset-0 opacity-[0.015]"
                        style={{ background: "radial-gradient(ellipse at 30% 0%, #F57F17, transparent 60%)" }} />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F57F17] to-[#FFA000] flex items-center justify-center text-white shadow-sm">
                                    <Zap size={14} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <h2 className="text-sm font-bold text-[#1A1A1A]">Smart Overstock Clearance</h2>
                                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-[#FFF8E1] rounded-full border border-[#F57F17]/20">
                                            <Sparkles size={8} className="text-[#F57F17]" />
                                            <span className="text-[8px] font-medium text-[#F57F17]">AI</span>
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-[#9CA38C]">AI-detected slow-moving inventory with matched demand</p>
                                </div>
                            </div>
                            <Link href="/auction/supplier/inventory" className="text-xs text-[#F57F17] font-medium hover:underline">Inventory</Link>
                        </div>
                        <div className="space-y-3">
                            {overstockItems.map((item, i) => (
                                <motion.div key={item.product} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
                                    className="rounded-xl border border-[#F57F17]/15 bg-gradient-to-r from-[#FFF8E1]/50 to-white p-4 hover:shadow-md transition-all">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <AlertTriangle size={12} className="text-[#F57F17]" />
                                                <p className="text-xs font-bold text-[#1A1A1A]">{item.stock.toLocaleString()} {item.unit} of {item.product}</p>
                                            </div>
                                            <p className="text-[10px] text-[#9CA38C] mb-2">
                                                Sitting in warehouse for <strong className="text-[#F57F17]">{item.daysInWarehouse} days</strong>
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="flex items-center gap-1 text-[10px] font-medium text-[#2C432D] bg-[#E8F5E9] px-2 py-0.5 rounded-full border border-[#2C432D]/10">
                                                    <Users size={9} /> {item.matchedShops} shops matched
                                                </span>
                                                <span className="text-[10px] text-[#9CA38C]">
                                                    Suggested discount: <strong className="text-[#F57F17]">-{item.suggestedDiscount}%</strong>
                                                </span>
                                            </div>
                                        </div>
                                        {flashSaleSuccess.has(item.product) ? (
                                            <span className="flex items-center gap-1.5 px-3 py-2 bg-[#E8F5E9] text-[#2C432D] text-[10px] font-bold rounded-lg flex-shrink-0 whitespace-nowrap border border-[#2C432D]/20">
                                                <CheckCircle2 size={10} /> Sale Live!
                                            </span>
                                        ) : (
                                            <button onClick={() => handleFlashSale(item)} className="flex items-center gap-1.5 px-3 py-2 bg-[#F57F17] text-white text-[10px] font-bold rounded-lg hover:bg-[#E65100] transition-colors shadow-sm flex-shrink-0 whitespace-nowrap cursor-pointer">
                                                <Zap size={10} /> 1-Click Flash Sale
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Competitor Intel — Win/Loss Analysis */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="relative overflow-hidden bg-white rounded-2xl border border-[#E5E5E0] p-5">
                    <div className="absolute inset-0 opacity-[0.015]"
                        style={{ background: "radial-gradient(ellipse at 70% 0%, #3B6B9B, transparent 60%)" }} />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3B6B9B] to-[#5A8DB8] flex items-center justify-center text-white shadow-sm">
                                    <TrendingDown size={14} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <h2 className="text-sm font-bold text-[#1A1A1A]">Win/Loss Analysis</h2>
                                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-[#EBF2FA] rounded-full border border-[#3B6B9B]/20">
                                            <Sparkles size={8} className="text-[#3B6B9B]" />
                                            <span className="text-[8px] font-medium text-[#3B6B9B]">AI</span>
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-[#9CA38C]">Why you&apos;re winning or losing bids</p>
                                </div>
                            </div>
                            <Link href="/auction/supplier/intelligence" className="text-xs text-[#3B6B9B] font-medium hover:underline">Full Intel</Link>
                        </div>
                        <div className="space-y-3">
                            {competitorInsights.map((item, i) => {
                                const diff = item.yourAvgQuote - item.winningAvg;
                                const diffPct = ((diff / item.winningAvg) * 100).toFixed(1);
                                const isWinning = item.lastResult === "won";
                                return (
                                    <motion.div key={item.product} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.08 }}
                                        className={`rounded-xl p-4 border transition-all hover:shadow-md ${isWinning
                                            ? "bg-[#F2F5F0] border-[#4A6741]/15"
                                            : "bg-[#FFF5F5]/50 border-[#C53030]/10"}`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <p className="text-xs font-bold text-[#1A1A1A]">{item.product}</p>
                                                    {isWinning ? (
                                                        <span className="text-[8px] font-bold text-[#2C432D] bg-[#E8F5E9] px-1.5 py-0.5 rounded border border-[#2C432D]/20">✓ WINNING</span>
                                                    ) : (
                                                        <span className="text-[8px] font-bold text-[#C53030] bg-[#FFF5F5] px-1.5 py-0.5 rounded border border-[#C53030]/20">✗ LOSING</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-[10px]">
                                                    <div>
                                                        <span className="text-[#9CA38C]">Your avg: </span>
                                                        <span className="font-bold text-[#1A1A1A]">${item.yourAvgQuote.toFixed(2)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[#9CA38C]">Market avg: </span>
                                                        <span className="font-bold text-[#1A1A1A]">${item.winningAvg.toFixed(2)}</span>
                                                    </div>
                                                    <div className={`font-bold ${isWinning ? "text-[#2C432D]" : "text-[#C53030]"}`}>
                                                        {isWinning ? `${Math.abs(Number(diffPct))}% below market` : `${diffPct}% above market`}
                                                    </div>
                                                </div>
                                                {!isWinning && item.bidsLost > 0 && (
                                                    <p className="text-[9px] text-[#C53030]/70 mt-1.5">
                                                        Lost last {item.bidsLost} bids. Lower by <strong>${diff.toFixed(2)}/unit</strong> to match the market.
                                                    </p>
                                                )}
                                            </div>
                                            {!isWinning && (
                                                <Link href="/auction/supplier/auto-bidder"
                                                    className="flex items-center gap-1 px-2.5 py-1.5 bg-[#2C432D] text-white text-[9px] font-bold rounded-lg hover:bg-[#1A2E1B] transition-colors flex-shrink-0 whitespace-nowrap">
                                                    <Target size={9} /> Adjust Bidder
                                                </Link>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Revenue Chart + Demand Heatmap */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Revenue Trend */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                    className="lg:col-span-3 relative overflow-hidden bg-white rounded-2xl border border-[#E5E5E0] p-5">
                    <div className="absolute inset-0 opacity-[0.015]"
                        style={{ background: "radial-gradient(ellipse at 30% 0%, #4A6741, transparent 60%)" }} />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-sm font-bold text-[#1A1A1A]">Revenue & Win Rate Trend</h2>
                                    <span className="flex items-center gap-1 px-1.5 py-0.5 bg-[#F2F5F0] rounded-full border border-[#E5E5E0]">
                                        <Sparkles size={8} className="text-[#4A6741]" />
                                        <span className="text-[8px] font-medium text-[#4A6741]">AI</span>
                                    </span>
                                </div>
                                <p className="text-[10px] text-[#9CA38C]">Last 6 months</p>
                            </div>
                            <div className="flex items-center gap-4 text-[10px]">
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-gradient-to-t from-[#2C432D] to-[#4A6741]" />Revenue</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border-2 border-[#6B8F61] bg-white" />Win Rate</span>
                            </div>
                        </div>
                        <div className="flex items-end gap-3" style={{ height: '176px' }}>
                            {revenueData.map((item, i) => {
                                const winRate = (item.wins / item.bids) * 100;
                                const barHeightPct = (item.revenue / maxRevenue) * 100;
                                return (
                                    <div key={item.month} className="flex-1 flex flex-col items-center h-full group">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#1A2E1B] text-white text-[9px] px-2 py-1 rounded-md whitespace-nowrap z-10 mb-1 shadow-lg">
                                            {formatCurrency(item.revenue)} · {item.wins}/{item.bids} wins
                                        </div>
                                        <div className="w-full flex-1 relative">
                                            <div className="absolute left-1/2 -translate-x-1/2 z-10"
                                                style={{ bottom: `${barHeightPct}%` }}>
                                                <div className="w-3 h-3 rounded-full border-2 border-[#6B8F61] bg-white relative translate-y-1/2 shadow-sm">
                                                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-bold text-[#4A6741] opacity-0 group-hover:opacity-100 whitespace-nowrap">{winRate.toFixed(0)}%</span>
                                                </div>
                                            </div>
                                            <motion.div className="absolute bottom-0 left-1 right-1 rounded-t-lg bg-gradient-to-t from-[#2C432D] via-[#3D5A35] to-[#6B8F61] hover:from-[#1A2E1B] hover:via-[#2C432D] hover:to-[#4A6741] cursor-pointer transition-all"
                                                initial={{ height: 0 }} animate={{ height: `${barHeightPct}%` }}
                                                transition={{ duration: 0.6, delay: 0.4 + i * 0.06 }}
                                                style={{ boxShadow: "0 -4px 12px rgba(74,103,65,0.15)" }} />
                                        </div>
                                        <span className="text-[9px] text-[#9CA38C] mt-1 font-medium">{item.month}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-4 pt-3 border-t border-[#F0F0EC] grid grid-cols-3 gap-4 text-center">
                            <div><p className="text-xs text-[#9CA38C]">Total Revenue</p><p className="text-sm font-bold text-[#1A1A1A]">{formatCurrency(revenueData.reduce((s, d) => s + d.revenue, 0))}</p></div>
                            <div><p className="text-xs text-[#9CA38C]">Total Wins</p><p className="text-sm font-bold text-[#2C432D]">{revenueData.reduce((s, d) => s + d.wins, 0)}</p></div>
                            <div><p className="text-xs text-[#9CA38C]">Avg Win Rate</p><p className="text-sm font-bold text-[#4A6741]">{(revenueData.reduce((s, d) => s + d.wins, 0) / revenueData.reduce((s, d) => s + d.bids, 0) * 100).toFixed(0)}%</p></div>
                        </div>
                    </div>
                </motion.div>

                {/* Demand Heatmap */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="lg:col-span-2 relative overflow-hidden bg-white rounded-2xl border border-[#E5E5E0] p-5">
                    <div className="absolute inset-0 opacity-[0.015]"
                        style={{ background: "radial-gradient(ellipse at 70% 0%, #4A6741, transparent 60%)" }} />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-1">
                            <BarChart3 size={14} className="text-[#4A6741]" />
                            <h2 className="text-sm font-bold text-[#1A1A1A]">Demand Heatmap</h2>
                            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-[#F2F5F0] rounded-full border border-[#E5E5E0]">
                                <Sparkles size={8} className="text-[#4A6741]" />
                                <span className="text-[8px] font-medium text-[#4A6741]">AI</span>
                            </span>
                        </div>
                        <p className="text-[10px] text-[#9CA38C] mb-4">Category demand levels & your eligibility</p>
                        <div className="space-y-3">
                            {demandHeatmap.map((item, i) => {
                                const isEligible = me.productCategories.includes(item.category);
                                const opacity = item.demand >= 80 ? 1 : item.demand >= 50 ? 0.7 : 0.45;
                                return (
                                    <motion.div key={item.category} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.45 + i * 0.05 }} className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-[#1A1A1A]">{item.category}</span>
                                                {isEligible && <span className="w-1.5 h-1.5 bg-[#4A6741] rounded-full" title="You can bid" />}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-[#9CA38C]">{item.auctions} auctions</span>
                                                <span className={`text-[10px] font-bold ${item.trend.startsWith("+") ? "text-[#4A6741]" : "text-[#9CA38C]"}`}>{item.trend}</span>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-[#F0F0EC] rounded-full overflow-hidden">
                                            <motion.div className="h-full rounded-full"
                                                style={{ background: `linear-gradient(to right, #2C432D, #4A6741, #6B8F61)`, opacity }}
                                                initial={{ width: 0 }} animate={{ width: `${item.demand}%` }}
                                                transition={{ duration: 0.6, delay: 0.5 + i * 0.05 }} />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                        <div className="mt-4 pt-3 border-t border-[#F0F0EC] flex items-center gap-3 text-[9px] text-[#9CA38C]">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#2C432D]" />High</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#4A6741] opacity-70" />Medium</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#6B8F61] opacity-45" />Low</span>
                            <span className="flex items-center gap-1 ml-auto"><span className="w-1.5 h-1.5 rounded-full bg-[#4A6741]" />You&apos;re eligible</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Available Auctions + RFQs + Bids + Deliveries */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Available Auctions */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="relative overflow-hidden bg-white rounded-2xl border border-[#E5E5E0] p-5">
                    <div className="absolute inset-0 opacity-[0.01]"
                        style={{ background: "radial-gradient(ellipse at 50% 0%, #4A6741, transparent 60%)" }} />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#4A6741] animate-pulse" />
                                <h2 className="text-sm font-bold text-[#1A1A1A]">New Auctions</h2>
                                <span className="px-2 py-0.5 bg-[#F2F5F0] text-[#2C432D] text-[10px] font-bold rounded-full border border-[#E5E5E0]">{availableAuctions.length}</span>
                            </div>
                            <Link href="/auction/supplier/auctions" className="text-xs text-[#4A6741] font-medium hover:underline">View All</Link>
                        </div>
                        <div className="space-y-3">
                            {availableAuctions.slice(0, 4).map((auction, i) => (
                                <Link key={auction.id} href={`/auction/supplier/auctions/${auction.id}`}>
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + i * 0.05 }}
                                        className="p-3 rounded-xl bg-[#F7F7F5] hover:bg-[#F2F5F0] transition-all cursor-pointer group border border-transparent hover:border-[#E5E5E0]">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-xs font-bold text-[#1A1A1A] truncate pr-2 group-hover:text-[#2C432D]">{auction.productName}</p>
                                            <ArrowRight size={12} className="text-[#9CA38C] group-hover:text-[#2C432D] flex-shrink-0 transition-colors" />
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-[#9CA38C]">
                                            <span>{auction.totalQuantity.toLocaleString()} units</span>
                                            <span>·</span>
                                            <span>${auction.reservePrice}/unit</span>
                                            <span>·</span>
                                            <StatusBadge status={auction.auctionType} />
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Direct RFQs */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52 }}
                    className="relative overflow-hidden bg-white rounded-2xl border border-[#E5E5E0] p-5">
                    <div className="absolute inset-0 opacity-[0.01]"
                        style={{ background: "radial-gradient(ellipse at 50% 0%, #F57F17, transparent 60%)" }} />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#F57F17] animate-pulse shadow-sm" />
                                <h2 className="text-sm font-bold text-[#1A1A1A]">Direct RFQs</h2>
                                <span className="px-2 py-0.5 bg-[#FFF8E1] text-[#F57F17] text-[10px] font-bold rounded-full border border-[#FFF8E1]">3</span>
                            </div>
                            <Link href="/auction/supplier/crm" className="text-xs text-[#F57F17] font-medium hover:underline">View All</Link>
                        </div>
                        <div className="space-y-3">
                            {[
                                { product: "Sprite 1.5L Carton", qty: "50 Cartons", expires: "2h" },
                                { product: "Milo Refill Pack 2KG", qty: "100 Packs", expires: "5h" },
                                { product: "Indomie Mi Goreng (Carton)", qty: "200 Cartons", expires: "10h" },
                            ].map((rfq, i) => (
                                <Link key={rfq.product} href="/auction/supplier/crm">
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + i * 0.05 }}
                                        className="p-3 rounded-xl bg-[#F7F7F5] hover:bg-[#F2F5F0] transition-all cursor-pointer group border border-transparent hover:border-[#E5E5E0]">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-xs font-bold text-[#1A1A1A] truncate pr-2 group-hover:text-[#2C432D]">{rfq.product}</p>
                                            <ArrowRight size={12} className="text-[#9CA38C] group-hover:text-[#2C432D] flex-shrink-0 transition-colors" />
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-[#9CA38C]">
                                            <span>Req: {rfq.qty}</span>
                                            <span>·</span>
                                            <span className="text-[#F57F17] font-bold">Expires in {rfq.expires}</span>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Active Bids */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
                    className="relative overflow-hidden bg-white rounded-2xl border border-[#E5E5E0] p-5">
                    <div className="absolute inset-0 opacity-[0.01]"
                        style={{ background: "radial-gradient(ellipse at 50% 0%, #4A6741, transparent 60%)" }} />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-[#1A1A1A]">Active Bids</h2>
                            <Link href="/auction/supplier/bids" className="text-xs text-[#4A6741] font-medium hover:underline">View All</Link>
                        </div>
                        <div className="space-y-3">
                            {activeBids.length > 0 ? activeBids.map((bid) => {
                                const auction = auctions.find(a => a.id === bid.auctionId);
                                const isLeading = auction ? Math.min(...auction.bids.map(b => b.pricePerUnit)) === bid.pricePerUnit : false;
                                return (
                                    <div key={bid.id} className="p-3 bg-[#F7F7F5] rounded-xl space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-medium text-[#1A1A1A] truncate pr-2">{auction?.productName}</p>
                                            {isLeading ? (
                                                <span className="text-[9px] font-bold text-[#2C432D] bg-[#F2F5F0] border border-[#E5E5E0] px-1.5 py-0.5 rounded">🏆 Leading</span>
                                            ) : (
                                                <span className="text-[9px] font-bold text-[#6B7265] bg-[#F0F0EC] border border-[#E5E5E0] px-1.5 py-0.5 rounded">Outbid</span>
                                            )}
                                        </div>
                                        <div className="flex justify-between text-[10px] text-[#9CA38C]">
                                            <span>Your bid: ${bid.pricePerUnit}/unit</span>
                                            <span>{formatCurrency(bid.totalPrice)}</span>
                                        </div>
                                    </div>
                                );
                            }) : <p className="text-xs text-[#9CA38C] text-center py-4">No active bids</p>}
                        </div>
                    </div>
                </motion.div>

                {/* Upcoming Deliveries */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                    className="relative overflow-hidden bg-white rounded-2xl border border-[#E5E5E0] p-5">
                    <div className="absolute inset-0 opacity-[0.01]"
                        style={{ background: "radial-gradient(ellipse at 50% 0%, #4A6741, transparent 60%)" }} />
                    <div className="relative">
                        <h2 className="text-sm font-bold text-[#1A1A1A] mb-4">Upcoming Deliveries</h2>
                        <div className="space-y-3">
                            {upcomingDeliveries.map((del, i) => (
                                <motion.div key={del.product} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.65 + i * 0.05 }} className="p-3 bg-[#F7F7F5] rounded-xl">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs font-bold text-[#1A1A1A]">{del.product}</p>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${del.status === "ready"
                                            ? "bg-[#F2F5F0] text-[#2C432D] border-[#E5E5E0]"
                                            : del.status === "preparing"
                                                ? "bg-[#F7F7F5] text-[#6B7265] border-[#E5E5E0]"
                                                : "bg-[#F7F7F5] text-[#9CA38C] border-[#E5E5E0]"
                                            }`}>{del.status}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-[#9CA38C]">
                                        <Calendar size={9} /> <span>{del.date}</span>
                                        <span>·</span><span>{del.shop}</span>
                                        <span>·</span><span>{del.qty}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Performance + AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                    className="relative overflow-hidden bg-white rounded-2xl border border-[#E5E5E0] p-5">
                    <div className="absolute inset-0 opacity-[0.015]"
                        style={{ background: "radial-gradient(ellipse at 0% 100%, #4A6741, transparent 60%)" }} />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-[#1A1A1A]">Performance Snapshot</h3>
                            <Link href="/auction/supplier/performance" className="text-xs text-[#4A6741] font-medium hover:underline">Details</Link>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: "On-Time Delivery", value: `${me.onTimeDeliveryRate}%`, good: me.onTimeDeliveryRate >= 90 },
                                { label: "Quality Score", value: `${me.qualityScore}%`, good: me.qualityScore >= 90 },
                                { label: "Avg. Bid Price", value: `$${me.averageBidPrice}`, good: true },
                                { label: "Categories", value: me.productCategories.length.toString(), good: true },
                            ].map(s => (
                                <div key={s.label} className="bg-[#F7F7F5] rounded-xl p-3 text-center border border-transparent hover:border-[#E5E5E0] transition-colors">
                                    <p className={`text-lg font-bold ${s.good ? "text-[#2C432D]" : "text-[#6B7265]"}`}>{s.value}</p>
                                    <p className="text-[10px] text-[#9CA38C]">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}
                    className="relative overflow-hidden bg-gradient-to-br from-[#1A2E1B] via-[#2C432D] to-[#3D5A35] rounded-2xl p-5 text-white">
                    <div className="absolute inset-0 opacity-10"
                        style={{ background: "radial-gradient(ellipse at 20% 80%, rgba(107,143,97,0.5) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(92,125,83,0.4) 0%, transparent 50%)" }} />
                    <div className="absolute top-0 right-0 w-48 h-48 opacity-[0.03]"
                        style={{ background: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "12px 12px" }} />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/10">
                                <Sparkles size={10} className="text-[#A8C89A]" />
                                <span className="text-[9px] font-medium text-[#A8C89A] uppercase tracking-wider">AI Insights</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {[
                                { title: "Beverage demand up 15%", desc: "High volume auctions expected this week. Prepare competitive bids.", icon: "📈" },
                                { title: "Competitive pricing wins", desc: "Bids within 5% of lowest price have 3x higher win rate.", icon: "🎯" },
                                { title: "Bulk delivery bonus", desc: "Deliver to 10+ shops in one run to earn a preferred supplier badge.", icon: "📦" },
                            ].map(insight => (
                                <div key={insight.title} className="bg-white/[0.06] rounded-xl p-3 backdrop-blur-sm border border-white/[0.06] hover:bg-white/10 transition-colors">
                                    <p className="text-xs font-bold flex items-center gap-1.5"><span>{insight.icon}</span>{insight.title}</p>
                                    <p className="text-[10px] text-white/50 mt-0.5">{insight.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Flash Sale Confirmation Modal */}
            <AnimatePresence>
                {flashSaleModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setFlashSaleModal(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-[#1A1A1A]">⚡ Create Flash Sale</h3>
                                <button onClick={() => setFlashSaleModal(null)} className="w-8 h-8 rounded-lg bg-[#F7F7F5] flex items-center justify-center hover:bg-[#E5E5E0] transition-colors cursor-pointer">
                                    <X size={14} className="text-[#9CA38C]" />
                                </button>
                            </div>

                            <div className="bg-gradient-to-r from-[#FFF8E1]/50 to-[#FFF3CD]/30 rounded-xl p-4 border border-[#F57F17]/15 mb-4">
                                <p className="text-sm font-bold text-[#1A1A1A] mb-1">{flashSaleModal.product}</p>
                                <div className="grid grid-cols-2 gap-2 mt-3">
                                    <div className="bg-white rounded-lg p-2.5 border border-[#E5E5E0]">
                                        <p className="text-[10px] text-[#9CA38C]">Stock to clear</p>
                                        <p className="text-sm font-bold text-[#1A1A1A]">{flashSaleModal.stock.toLocaleString()} {flashSaleModal.unit}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-2.5 border border-[#E5E5E0]">
                                        <p className="text-[10px] text-[#9CA38C]">AI discount</p>
                                        <p className="text-sm font-bold text-[#F57F17]">-{flashSaleModal.suggestedDiscount}%</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-2.5 border border-[#E5E5E0]">
                                        <p className="text-[10px] text-[#9CA38C]">Matched shops</p>
                                        <p className="text-sm font-bold text-[#2C432D]">{flashSaleModal.matchedShops} shops</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-2.5 border border-[#E5E5E0]">
                                        <p className="text-[10px] text-[#9CA38C]">Days in warehouse</p>
                                        <p className="text-sm font-bold text-[#F57F17]">{flashSaleModal.daysInWarehouse} days</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#F2F5F0] rounded-xl p-3 border border-[#E5E5E0] mb-4">
                                <p className="text-[10px] text-[#4A6741] leading-relaxed">
                                    <strong>How it works:</strong> Ledger will send this offer to all {flashSaleModal.matchedShops} matched shops in your region.
                                    Orders are placed through Ledger with escrow protection. You&apos;ll be notified of each order.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setFlashSaleModal(null)}
                                    className="flex-1 px-4 py-2.5 bg-[#F7F7F5] text-[#6B7265] text-sm font-medium rounded-xl border border-[#E5E5E0] hover:bg-[#E5E5E0] transition-colors cursor-pointer">
                                    Cancel
                                </button>
                                <button onClick={confirmFlashSale}
                                    className="flex-1 px-4 py-2.5 bg-[#F57F17] text-white text-sm font-bold rounded-xl hover:bg-[#E65100] transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer">
                                    <Zap size={14} /> Launch Flash Sale
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
