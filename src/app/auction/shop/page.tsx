"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    TrendingDown, ShoppingBag, Package, Clock, ArrowRight, Layers, Zap, Sparkles,
    CheckCircle2, BarChart3, Bell, Star, RefreshCcw, Eye, Calendar,
} from "lucide-react";
import Link from "next/link";
import StatusBadge from "../components/status-badge";
import { AIInsightCard, DemandForecast } from "../components/ai-insights";
import { auctions, orders, demandItems, formatCurrency } from "../lib/mock-data";
import { products } from "../lib/products-db";

export default function ShopDashboard() {
    const myOrders = orders.filter((o) => o.shopName === "RK Minimart");
    const activeAuctions = auctions.filter((a) => a.status === "active");
    const myDemand = demandItems.filter((d) =>
        d.participatingShops.some((s) => s.name === "RK Minimart")
    );

    // Savings chart data
    const monthlySavings = [
        { month: "Aug", saved: 3200, spent: 18400 },
        { month: "Sep", saved: 4100, spent: 21000 },
        { month: "Oct", saved: 3800, spent: 19500 },
        { month: "Nov", saved: 5200, spent: 24800 },
        { month: "Dec", saved: 6100, spent: 28200 },
        { month: "Jan", saved: 4800, spent: 22100 },
    ];
    const maxSpent = Math.max(...monthlySavings.map((d) => d.spent + d.saved));

    // Live feed
    const [feedItems, setFeedItems] = useState([
        { id: 1, text: "Nestle Milo 400G auction: new bid at $3.80/unit", time: "just now", type: "bid" },
        { id: 2, text: "Your India Gate Basmati Rice order shipped by Metro Foods", time: "5 min ago", type: "ship" },
        { id: 3, text: "LKK Oyster Sauce 770G auction reaching target — 85% aggregated", time: "12 min ago", type: "demand" },
        { id: 4, text: "New auction: Indomie Mi Goreng — join now", time: "25 min ago", type: "new" },
        { id: 5, text: "You saved $32 on your last Beverages order!", time: "1 hr ago", type: "save" },
    ]);

    // Wishlist
    const [wishlist, setWishlist] = useState<Set<string>>(new Set(["AUC-003"]));

    // Price comparison data
    const priceComparisons = [
        { product: "Nestle Milo 400G", retail: 5.50, auction: 3.80, unit: "pack" },
        { product: "India Gate Basmati Rice 1KG", retail: 6.50, auction: 4.70, unit: "bag" },
        { product: "LKK Oyster Sauce 770G", retail: 5.80, auction: 3.80, unit: "bottle" },
        { product: "Indomie Mi Goreng", retail: 3.60, auction: 2.60, unit: "pack" },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Welcome Banner */}
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
                                <span className="text-[9px] font-medium text-[#A8C89A] uppercase tracking-wider">Smart Procurement</span>
                            </div>
                        </div>
                        <h1 className="text-xl font-bold text-white">Welcome back, RK Minimart</h1>
                        <p className="text-sm text-white/50 mt-0.5">Here&apos;s your auction activity at a glance</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/auction/shop/marketplace"
                            className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#2C432D] text-sm font-medium rounded-xl hover:bg-white/90 transition-colors shadow-sm">
                            <ShoppingBag size={14} /> Browse Auctions
                        </Link>
                        <Link href="/auction/shop/demand"
                            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm text-white text-sm font-medium rounded-xl border border-white/15 hover:bg-white/20 transition-colors">
                            <Layers size={14} /> Submit Demand
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { icon: TrendingDown, label: "Total Savings", value: "$24,800", sub: "vs retail prices", accent: "from-[#2C432D] to-[#4A6741]" },
                    { icon: ShoppingBag, label: "Active Auctions", value: activeAuctions.length.toString(), sub: "you can join now", accent: "from-[#3B6B9B] to-[#5A8DB8]" },
                    { icon: Layers, label: "Demand Requests", value: myDemand.length.toString(), sub: "being aggregated", accent: "from-[#B8860B] to-[#D4A017]" },
                    { icon: Package, label: "Orders This Month", value: myOrders.length.toString(), sub: `${myOrders.filter(o => o.status === "delivered").length} delivered`, accent: "from-[#7B1FA2] to-[#9C27B0]" },
                ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
                        className="relative overflow-hidden bg-white rounded-2xl border border-[#E5E5E0] p-4 hover:shadow-lg hover:shadow-[#4A6741]/8 transition-all duration-300 group">
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

            {/* Savings Chart + Price Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Savings Chart */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="lg:col-span-3 bg-white rounded-2xl border border-[#E5E5E0] p-5">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-sm font-bold text-[#1A1A1A]">Spending & Savings Trend</h2>
                            <p className="text-[10px] text-[#9CA38C]">Last 6 months</p>
                        </div>
                        <div className="flex items-center gap-4 text-[10px]">
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#4A6741]" />Spent</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#E8F5E9]" />Saved</span>
                        </div>
                    </div>
                    <div className="flex items-end gap-3 h-44">
                        {monthlySavings.map((item, i) => (
                            <div key={item.month} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end group">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#1A1A1A] text-white text-[9px] px-2 py-1 rounded-md whitespace-nowrap mb-1">
                                    Saved: {formatCurrency(item.saved)}
                                </div>
                                <motion.div className="w-full rounded-t-md bg-[#E8F5E9] border border-b-0 border-[#4A6741]/20"
                                    initial={{ height: 0 }} animate={{ height: `${(item.saved / maxSpent) * 100}% ` }}
                                    transition={{ duration: 0.6, delay: 0.4 + i * 0.06 }} />
                                <motion.div className="w-full rounded-t-md bg-gradient-to-t from-[#4A6741] to-[#6B8F71]"
                                    initial={{ height: 0 }} animate={{ height: `${(item.spent / maxSpent) * 100}% ` }}
                                    transition={{ duration: 0.6, delay: 0.35 + i * 0.06 }} />
                                <span className="text-[9px] text-[#9CA38C] mt-1.5">{item.month}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#F0F0EC] grid grid-cols-3 gap-4 text-center">
                        <div><p className="text-xs text-[#9CA38C]">Total Spent</p><p className="text-sm font-bold text-[#1A1A1A]">{formatCurrency(monthlySavings.reduce((s, d) => s + d.spent, 0))}</p></div>
                        <div><p className="text-xs text-[#9CA38C]">Total Saved</p><p className="text-sm font-bold text-[#4A6741]">{formatCurrency(monthlySavings.reduce((s, d) => s + d.saved, 0))}</p></div>
                        <div><p className="text-xs text-[#9CA38C]">Avg. Savings</p><p className="text-sm font-bold text-[#4A6741]">{((monthlySavings.reduce((s, d) => s + d.saved, 0) / monthlySavings.reduce((s, d) => s + d.spent + d.saved, 0)) * 100).toFixed(1)}%</p></div>
                    </div>
                </motion.div>

                {/* Price Comparison */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                    className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E5E0] p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 size={14} className="text-[#4A6741]" />
                        <h2 className="text-sm font-bold text-[#1A1A1A]">Price Comparison</h2>
                    </div>
                    <p className="text-[10px] text-[#9CA38C] mb-4">Auction price vs retail price per unit</p>
                    <div className="space-y-4">
                        {priceComparisons.map((item, i) => {
                            const savingsPct = ((item.retail - item.auction) / item.retail * 100).toFixed(0);
                            return (
                                <motion.div key={item.product} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + i * 0.07 }} className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-[#1A1A1A] truncate pr-2">{item.product}</span>
                                        <span className="text-xs font-bold text-[#4A6741] flex-shrink-0">-{savingsPct}%</span>
                                    </div>
                                    <div className="flex gap-1.5 h-3">
                                        <motion.div className="bg-[#C53030]/15 rounded-sm relative" style={{ flex: item.retail }}
                                            initial={{ width: 0 }} animate={{ width: "100%" }}
                                            transition={{ duration: 0.5, delay: 0.5 + i * 0.07 }}>
                                            <span className="absolute right-1 top-0 text-[8px] font-bold text-[#C53030]">${item.retail}</span>
                                        </motion.div>
                                        <motion.div className="bg-[#4A6741] rounded-sm relative" style={{ flex: item.auction }}
                                            initial={{ width: 0 }} animate={{ width: "100%" }}
                                            transition={{ duration: 0.5, delay: 0.55 + i * 0.07 }}>
                                            <span className="absolute right-1 top-0 text-[8px] font-bold text-white">${item.auction}</span>
                                        </motion.div>
                                    </div>
                                    <div className="flex gap-3 text-[8px] text-[#9CA38C]">
                                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-sm bg-[#C53030]/20" />Retail</span>
                                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-sm bg-[#4A6741]" />Auction</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>

            {/* AI Predictions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2C432D] to-[#4A6741] flex items-center justify-center text-white shadow-sm">
                        <Sparkles size={14} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-[#1A1A1A]">AI Insights & Predictions</h2>
                        <p className="text-[10px] text-[#9CA38C]">Powered by Ledger Intelligence Engine</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {(() => {
                        const p_milo = products.find(p => p.name.includes("Milo") && p.name.includes("400G")) || products[0];
                        const p_rice = products.find(p => p.name.includes("Basmati Rice 1KG")) || products[1];
                        const p_oyster = products.find(p => p.name.includes("Oyster Sauce 770G")) || products[2];
                        const p_darlie = products.find(p => p.name.includes("Darlie") && p.name.includes("260G")) || products[7];

                        return (
                            <>
                                <AIInsightCard delay={0.45} prediction={{
                                    id: "ai-1", type: "demand", title: "Beverage demand rising fast",
                                    description: `Based on seasonal patterns and your order history, we predict a 23 % increase in beverage demand next month.Consider joining the ${p_milo.name} auction early.`,
                                    confidence: 87, impact: "high",
                                    metric: { label: "Predicted increase", value: "+23%", trend: "up" },
                                    actionLabel: `Join ${p_milo.name} auction`,
                                }} />
                                <AIInsightCard delay={0.5} prediction={{
                                    id: "ai-2", type: "price", title: "Rice prices expected to drop",
                                    description: `Market analysis suggests ${p_rice.name} auction prices will decrease by ~8 % in the next 2 weeks as new supply enters the market.`,
                                    confidence: 74, impact: "medium",
                                    metric: { label: "Expected drop", value: "-8%", trend: "down" },
                                    actionLabel: "Set price alert",
                                }} />
                                <AIInsightCard delay={0.55} prediction={{
                                    id: "ai-3", type: "reorder", title: `Reorder ${p_oyster.name.split(" ")[0]} soon`,
                                    description: `Based on your consumption rate(avg. 12 bottles / week), you'll run out in approximately 3 days. An active Dutch auction is available now at 34% below retail.`,
                                    confidence: 92, impact: "high",
                                    actionLabel: "View auction",
                                }} />
                                < AIInsightCard delay={0.6} prediction={{
                                    id: "ai-4", type: "opportunity", title: "New category: Oral Care",
                                    description: `Stores similar to yours are ordering ${p_darlie.name} through auctions. You could save $120/mo by switching from retail to auction buying.`,
                                    confidence: 68, impact: "medium",
                                    metric: { label: "Potential savings", value: "$120/mo", trend: "up" },
                                    actionLabel: "Explore category",
                                }} />
                            </>
                        );
                    })()}
                </div >
                <DemandForecast category="Beverages & Drinks (Your #1 category)" delay={0.65} />
            </motion.div >

            {/* Live Auctions with Countdown + Live Feed */}
            < div className="grid grid-cols-1 lg:grid-cols-3 gap-6" >
                {/* Live Auctions */}
                < motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                    className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E5E0] p-5" >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#C53030] animate-pulse" />
                            <h2 className="text-sm font-bold text-[#1A1A1A]">Live Auctions</h2>
                        </div>
                        <Link href="/auction/shop/marketplace" className="flex items-center gap-1 text-xs font-medium text-[#4A6741] hover:text-[#3D5A35]">
                            View All <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {activeAuctions.slice(0, 4).map((auction, i) => {
                            const lowestBid = auction.bids.length > 0 ? Math.min(...auction.bids.map(b => b.pricePerUnit)) : null;
                            const isFav = wishlist.has(auction.id);
                            return (
                                <motion.div key={auction.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + i * 0.05 }}
                                    className="flex items-center gap-4 p-3.5 rounded-xl bg-[#F7F7F5] hover:bg-[#F2F5F0] transition-all group">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4A6741] to-[#6B8F71] flex items-center justify-center text-white flex-shrink-0">
                                        <ShoppingBag size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-[#1A1A1A] truncate">{auction.productName}</p>
                                            <StatusBadge status={auction.auctionType} />
                                        </div>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <span className="text-[10px] text-[#9CA38C]">{auction.totalQuantity.toLocaleString()} units</span>
                                            <span className="text-[10px] text-[#9CA38C]">{auction.participatingShops} shops</span>
                                            <span className="text-[10px] text-[#9CA38C]">{auction.bids.length} bids</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <CountdownTimer endTime={auction.endTime} />
                                        <div className="text-right">
                                            {lowestBid ? (
                                                <p className="text-sm font-bold text-[#4A6741]">${lowestBid}/unit</p>
                                            ) : (
                                                <p className="text-sm font-bold text-[#1A1A1A]">${auction.reservePrice}/unit</p>
                                            )}
                                        </div>
                                        <button onClick={() => setWishlist(prev => { const n = new Set(prev); isFav ? n.delete(auction.id) : n.add(auction.id); return n; })}
                                            className="p-1.5 rounded-lg hover:bg-white transition-colors">
                                            <Star size={14} className={isFav ? "fill-[#B8860B] text-[#B8860B]" : "text-[#9CA38C]"} />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div >

                {/* Live Activity Feed */}
                < motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
                    className="bg-white rounded-2xl border border-[#E5E5E0] p-5" >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Bell size={14} className="text-[#4A6741]" />
                            <h2 className="text-sm font-bold text-[#1A1A1A]">Activity Feed</h2>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 bg-[#C53030] text-white rounded-full font-bold">{feedItems.length}</span>
                    </div>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {feedItems.map((item, i) => (
                            <motion.div key={item.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + i * 0.05 }}
                                className="flex gap-2.5 p-2.5 rounded-xl hover:bg-[#F7F7F5] transition-colors">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] ${item.type === "bid" ? "bg-[#E3F2FD]" :
                                    item.type === "ship" ? "bg-[#F3E5F5]" :
                                        item.type === "demand" ? "bg-[#FFF8E1]" :
                                            item.type === "save" ? "bg-[#E8F5E9]" : "bg-[#E8F5E9]"
                                    }`}>
                                    {item.type === "bid" ? "💰" : item.type === "ship" ? "📦" : item.type === "demand" ? "📊" : item.type === "save" ? "💚" : "🆕"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] text-[#1A1A1A] leading-relaxed">{item.text}</p>
                                    <p className="text-[9px] text-[#9CA38C] mt-0.5">{item.time}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div >
            </div >

            {/* Demand Status + Recent Orders */}
            < div className="grid grid-cols-1 lg:grid-cols-2 gap-6" >
                {/* Demand Status */}
                < motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
                    className="bg-white rounded-2xl border border-[#E5E5E0] p-5" >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-[#1A1A1A]">My Demand Requests</h2>
                        <Link href="/auction/shop/demand" className="text-xs text-[#4A6741] font-medium hover:text-[#3D5A35]">Manage</Link>
                    </div>
                    <div className="space-y-3">
                        {myDemand.map((demand) => {
                            const progress = (demand.totalQuantity / demand.targetQuantity) * 100;
                            return (
                                <div key={demand.id} className="p-3 bg-[#F7F7F5] rounded-xl space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-medium text-[#1A1A1A] truncate pr-2">{demand.productName}</p>
                                        <StatusBadge status={demand.status} />
                                    </div>
                                    <div className="h-1.5 bg-[#E5E5E0] rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-[#4A6741] to-[#6B8F71] rounded-full transition-all duration-1000"
                                            style={{ width: `${Math.min(progress, 100)}%` }} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] text-[#9CA38C]">{demand.totalQuantity.toLocaleString()}/{demand.targetQuantity.toLocaleString()} units</p>
                                        <p className="text-[10px] font-bold text-[#4A6741]">{progress.toFixed(0)}%</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div >

                {/* Recent Orders */}
                < motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                    className="bg-white rounded-2xl border border-[#E5E5E0] overflow-hidden" >
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5E0]">
                        <h2 className="text-sm font-bold text-[#1A1A1A]">Recent Orders</h2>
                        <Link href="/auction/shop/orders" className="flex items-center gap-1 text-xs font-medium text-[#4A6741]">
                            All Orders <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="divide-y divide-[#F0F0EC]">
                        {myOrders.slice(0, 4).map((order) => (
                            <div key={order.id} className="flex items-center gap-4 px-5 py-3 hover:bg-[#F7F7F5] transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-[#F2F5F0] flex items-center justify-center">
                                    {order.status === "delivered" ? <CheckCircle2 size={14} className="text-[#4A6741]" /> : <Clock size={14} className="text-[#B8860B]" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[#1A1A1A] truncate">{order.productName}</p>
                                    <p className="text-[10px] text-[#9CA38C]">{order.supplierName} · {order.quantity} units</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-bold text-[#1A1A1A]">{formatCurrency(order.totalPrice)}</p>
                                    <StatusBadge status={order.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div >
            </div >

            {/* Savings Tip Banner */}
            < motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                className="bg-gradient-to-r from-[#4A6741] to-[#6B8F71] rounded-2xl p-5 text-white flex items-center gap-4" >
                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <Zap size={20} />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-bold">💡 Pro Tip: Join auctions early for better prices</p>
                    <p className="text-xs text-white/70 mt-0.5">Auctions with more participating shops tend to attract 12% lower bids from suppliers</p>
                </div>
                <Link href="/auction/shop/marketplace" className="flex items-center gap-1.5 px-4 py-2 bg-white text-[#4A6741] text-xs font-bold rounded-xl hover:bg-white/90 transition-colors flex-shrink-0">
                    Browse Now <ArrowRight size={12} />
                </Link>
            </motion.div >
        </div >
    );
}

// Live countdown timer component
function CountdownTimer({ endTime }: { endTime: string }) {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const update = () => {
            const diff = new Date(endTime).getTime() - Date.now();
            if (diff <= 0) { setTimeLeft("Ended"); return; }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            setTimeLeft(h > 24 ? `${Math.floor(h / 24)}d ${h % 24}h` : `${h}h ${m}m`);
        };
        update();
        const interval = setInterval(update, 60000);
        return () => clearInterval(interval);
    }, [endTime]);

    return (
        <div className="flex items-center gap-1 px-2 py-1 bg-[#FFF8E1] rounded-lg">
            <Clock size={10} className="text-[#B8860B]" />
            <span className="text-[10px] font-bold text-[#B8860B]">{timeLeft}</span>
        </div>
    );
}
