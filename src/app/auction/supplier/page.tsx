"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    DollarSign, Gavel, TrendingUp, Target, Clock, ArrowRight, Trophy, Package,
    Bell, BarChart3, Users, Zap, Calendar, Star, AlertCircle, Sparkles, Activity,
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

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Welcome Banner with AI Gradient */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl border border-[#E5E5E0] bg-gradient-to-r from-[#1A2E1B] via-[#2C432D] to-[#3D5A35] p-6">
                {/* Mesh gradient overlay */}
                <div className="absolute inset-0 opacity-20"
                    style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(107,143,97,0.4) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(74,103,65,0.3) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(61,90,53,0.3) 0%, transparent 50%)" }} />
                <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.04]"
                    style={{ background: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
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
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { icon: DollarSign, label: "Total Revenue", value: formatCurrency(me.totalRevenue), sub: "all time", accent: "from-[#2C432D] to-[#4A6741]" },
                    { icon: Trophy, label: "Auctions Won", value: me.totalAuctionsWon.toString(), sub: `Win rate: ${((me.totalAuctionsWon / (me.totalAuctionsWon + 20)) * 100).toFixed(0)}%`, accent: "from-[#3D5A35] to-[#5C7D53]" },
                    { icon: Gavel, label: "Active Bids", value: activeBids.length.toString(), sub: "awaiting results", accent: "from-[#4A6741] to-[#6B8F61]" },
                    { icon: Target, label: "Score", value: `${me.performanceScore}`, sub: me.preferredSupplierStatus ? "⭐ Preferred" : "Standard", accent: "from-[#2C432D] to-[#3D5A35]" },
                    { icon: Activity, label: "New Auctions", value: availableAuctions.length.toString(), sub: "ready to bid", accent: "from-[#3D5A35] to-[#4A6741]" },
                ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.05 }}
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

            {/* Revenue Chart + Demand Heatmap */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Revenue Trend */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                    className="lg:col-span-3 relative overflow-hidden bg-white rounded-2xl border border-[#E5E5E0] p-5">
                    {/* Subtle background mesh */}
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
                                            {/* Win rate dot */}
                                            <div className="absolute left-1/2 -translate-x-1/2 z-10"
                                                style={{ bottom: `${barHeightPct}%` }}>
                                                <div className="w-3 h-3 rounded-full border-2 border-[#6B8F61] bg-white relative translate-y-1/2 shadow-sm">
                                                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-bold text-[#4A6741] opacity-0 group-hover:opacity-100 whitespace-nowrap">{winRate.toFixed(0)}%</span>
                                                </div>
                                            </div>
                                            {/* Revenue bar */}
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

            {/* Available Auctions + Bids + Deliveries */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

            {/* Performance + Market Insight Banner */}
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
                    {/* AI-style mesh overlay */}
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
        </div>
    );
}
