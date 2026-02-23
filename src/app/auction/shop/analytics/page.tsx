"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    BarChart3, TrendingDown, DollarSign, Star, Download, Calendar,
    Award, Package, Users, ThumbsUp, ThumbsDown, MessageCircle, RefreshCcw, X
} from "lucide-react";
import { formatCurrency } from "../../lib/mock-data";
import { AnimatePresence } from "framer-motion";

const monthlySavings = [
    { month: "Aug", retail: 21600, auction: 18400, saved: 3200 },
    { month: "Sep", retail: 25100, auction: 21000, saved: 4100 },
    { month: "Oct", retail: 23300, auction: 19500, saved: 3800 },
    { month: "Nov", retail: 30000, auction: 24800, saved: 5200 },
    { month: "Dec", retail: 34300, auction: 28200, saved: 6100 },
    { month: "Jan", retail: 26900, auction: 22100, saved: 4800 },
];

const categorySavings = [
    { category: "Beverages", retail: 42000, auction: 34800, pct: 17 },
    { category: "Rice & Grains", retail: 33000, auction: 28500, pct: 14 },
    { category: "Cooking Oil", retail: 18000, auction: 14250, pct: 21 },
    { category: "Snacks", retail: 26000, auction: 22400, pct: 14 },
    { category: "Personal Care", retail: 12000, auction: 10800, pct: 10 },
];

const supplierRatings = [
    { id: "r1", name: "Metro Foods Inc.", score: 4.8, reviews: 42, delivery: 97, quality: 95, pricing: "Great", topProduct: "Nestle Milo" },
    { id: "r2", name: "Golden Harvest Grains", score: 4.5, reviews: 38, delivery: 94, quality: 98, pricing: "Good", topProduct: "India Gate Basmati Rice" },
    { id: "r3", name: "Pacific Oil Corp.", score: 4.2, reviews: 25, delivery: 88, quality: 92, pricing: "Fair", topProduct: "Cooking Oil" },
    { id: "r4", name: "Noodle King Supply", score: 4.6, reviews: 31, delivery: 96, quality: 90, pricing: "Great", topProduct: "Indomie Mi Goreng" },
];

export default function AnalyticsPage() {
    const [period, setPeriod] = useState<"6m" | "1y" | "all">("6m");
    const [showRestockModal, setShowRestockModal] = useState<string | null>(null);

    const totalRetail = monthlySavings.reduce((s, d) => s + d.retail, 0);
    const totalAuction = monthlySavings.reduce((s, d) => s + d.auction, 0);
    const totalSaved = monthlySavings.reduce((s, d) => s + d.saved, 0);
    const maxVal = Math.max(...monthlySavings.map(d => d.retail));

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#1A1A1A]">Procurement Analytics</h1>
                    <p className="text-sm text-[#6B7265] mt-0.5">Savings reports, supplier ratings, and procurement insights</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex bg-white border border-[#E5E5E0] rounded-xl overflow-hidden">
                        {(["6m", "1y", "all"] as const).map(p => (
                            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 text-xs font-medium ${period === p ? "bg-[#4A6741] text-white" : "text-[#6B7265]"}`}>
                                {p === "6m" ? "6 Months" : p === "1y" ? "1 Year" : "All Time"}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#E5E5E0] text-sm font-medium text-[#6B7265] rounded-xl hover:bg-[#F7F7F5]">
                        <Download size={14} /> Export PDF
                    </button>
                </div>
            </motion.div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { icon: DollarSign, label: "Retail Would Cost", value: formatCurrency(totalRetail), sub: "if bought at retail prices", color: "bg-[#C53030]" },
                    { icon: BarChart3, label: "Auction Cost", value: formatCurrency(totalAuction), sub: "actual spend via auctions", color: "bg-[#3B6B9B]" },
                    { icon: TrendingDown, label: "Total Saved", value: formatCurrency(totalSaved), sub: `${((totalSaved / totalRetail) * 100).toFixed(1)}% average savings`, color: "bg-[#2E7D32]" },
                    { icon: Package, label: "Orders Placed", value: "47", sub: "across all categories", color: "bg-[#4A6741]" },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-white rounded-2xl border border-[#E5E5E0] p-4">
                        <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center text-white mb-2`}><s.icon size={14} /></div>
                        <p className="text-lg font-bold text-[#1A1A1A]">{s.value}</p>
                        <p className="text-xs text-[#6B7265]">{s.label}</p>
                        <p className="text-[10px] text-[#9CA38C]">{s.sub}</p>
                    </motion.div>
                ))}
            </div>

            {/* Savings Trend Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="bg-white rounded-2xl border border-[#E5E5E0] p-5">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-sm font-bold text-[#1A1A1A]">Savings Report</h2>
                        <p className="text-[10px] text-[#9CA38C]">Retail vs auction spending comparison</p>
                    </div>
                    <div className="flex items-center gap-4 text-[10px]">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#C53030]/20" />Retail Price</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#4A6741]" />Auction Price</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#E8F5E9] border border-[#4A6741]/30" />You Saved</span>
                    </div>
                </div>
                <div className="flex items-end gap-4 h-48">
                    {monthlySavings.map((item, i) => (
                        <div key={item.month} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end group">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#1A1A1A] text-white text-[9px] px-2 py-1 rounded-md whitespace-nowrap mb-1">
                                Saved: {formatCurrency(item.saved)} ({((item.saved / item.retail) * 100).toFixed(0)}%)
                            </div>
                            <div className="w-full flex gap-1.5 h-full items-end">
                                <motion.div className="flex-1 rounded-t bg-[#C53030]/15 border border-b-0 border-[#C53030]/20 relative"
                                    initial={{ height: 0 }} animate={{ height: `${(item.retail / maxVal) * 100}%` }}
                                    transition={{ duration: 0.5, delay: 0.3 + i * 0.06 }}>
                                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[7px] text-[#C53030] font-bold opacity-0 group-hover:opacity-100">${(item.retail / 1000).toFixed(0)}k</span>
                                </motion.div>
                                <motion.div className="flex-1 rounded-t bg-gradient-to-t from-[#4A6741] to-[#6B8F71] relative"
                                    initial={{ height: 0 }} animate={{ height: `${(item.auction / maxVal) * 100}%` }}
                                    transition={{ duration: 0.5, delay: 0.35 + i * 0.06 }}>
                                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[7px] text-[#4A6741] font-bold opacity-0 group-hover:opacity-100">${(item.auction / 1000).toFixed(0)}k</span>
                                </motion.div>
                            </div>
                            <span className="text-[9px] text-[#9CA38C] mt-1.5">{item.month}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Category Savings + Supplier Ratings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl border border-[#E5E5E0] p-5">
                    <h2 className="text-sm font-bold text-[#1A1A1A] mb-4">Savings by Category</h2>
                    <div className="space-y-4">
                        {categorySavings.map((cat, i) => (
                            <motion.div key={cat.category} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.45 + i * 0.05 }}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-medium text-[#1A1A1A]">{cat.category}</span>
                                    <div className="flex items-center gap-3 text-[10px]">
                                        <span className="text-[#9CA38C]">{formatCurrency(cat.retail - cat.auction)} saved</span>
                                        <span className="font-bold text-[#4A6741]">-{cat.pct}%</span>
                                    </div>
                                </div>
                                <div className="flex gap-1 h-3">
                                    <div className="bg-[#C53030]/15 rounded-sm" style={{ flex: cat.retail }}>
                                        <span className="text-[7px] font-bold text-[#C53030] px-1">{formatCurrency(cat.retail)}</span>
                                    </div>
                                    <div className="bg-[#4A6741] rounded-sm" style={{ flex: cat.auction }}>
                                        <span className="text-[7px] font-bold text-white px-1">{formatCurrency(cat.auction)}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Supplier Ratings */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                    className="bg-white rounded-2xl border border-[#E5E5E0] p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Star size={14} className="text-[#B8860B]" />
                        <h2 className="text-sm font-bold text-[#1A1A1A]">Supplier Ratings</h2>
                    </div>
                    <div className="space-y-3">
                        {supplierRatings.map((sup) => (
                            <div key={sup.id} className="group p-3 bg-[#F7F7F5] rounded-xl hover:bg-white border border-transparent hover:border-[#E5E5E0] hover:shadow-sm transition-all relative overflow-hidden">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-bold text-[#1A1A1A]">{sup.name}</p>
                                    <div className="flex items-center gap-1">
                                        <div className="flex gap-0.5">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star key={i} size={10} className={i < Math.round(sup.score) ? "fill-[#B8860B] text-[#B8860B]" : "text-[#E5E5E0] fill-[#E5E5E0]"} />
                                            ))}
                                        </div>
                                        <span className="text-xs font-bold text-[#1A1A1A] ml-1">{sup.score}</span>
                                        <span className="text-[9px] text-[#9CA38C]">({sup.reviews})</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-[#9CA38C] mb-3 mt-1">
                                    <span>Delivery: <strong className={sup.delivery >= 95 ? "text-[#2E7D32]" : "text-[#F57F17]"}>{sup.delivery}%</strong></span>
                                    <span>Quality: <strong className={sup.quality >= 95 ? "text-[#2E7D32]" : "text-[#F57F17]"}>{sup.quality}%</strong></span>
                                    <span>Pricing: <strong className="text-[#1A1A1A]">{sup.pricing}</strong></span>
                                </div>
                                <div className="pt-3 border-t border-[#E5E5E0]/50 flex items-center justify-between">
                                    <span className="text-[10px] text-[#6B7265] truncate mr-2">Top: <strong className="text-[#1A1A1A]">{sup.topProduct}</strong></span>
                                    <button onClick={() => setShowRestockModal(sup.id)} className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-[#F0F4EE] text-[10px] font-bold text-[#4A6741] rounded-lg hover:bg-[#E2EBE0] transition-colors">
                                        <RefreshCcw size={10} /> Request Restock
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Restock Modal */}
            <AnimatePresence>
                {showRestockModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                        onClick={() => setShowRestockModal(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-[#1A1A1A]">Direct Restock Request</h3>
                                    <p className="text-xs text-[#9CA38C] mt-0.5">
                                        To {supplierRatings.find(s => s.id === showRestockModal)?.name}
                                    </p>
                                </div>
                                <button onClick={() => setShowRestockModal(null)} className="p-1.5 rounded-lg hover:bg-[#F7F7F5]">
                                    <X size={16} className="text-[#9CA38C]" />
                                </button>
                            </div>

                            <div className="mb-4">
                                <label className="text-xs font-medium text-[#1A1A1A] block mb-1.5">Product</label>
                                <select className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none focus:border-[#4A6741]">
                                    <option>{supplierRatings.find(s => s.id === showRestockModal)?.topProduct}</option>
                                    <option>Other recent purchases...</option>
                                </select>
                            </div>

                            <div className="flex gap-4 mb-5">
                                <div className="flex-1">
                                    <label className="text-xs font-medium text-[#1A1A1A] block mb-1.5">Quantity needed</label>
                                    <input type="number" placeholder="e.g. 50" className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none focus:border-[#4A6741]" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-medium text-[#1A1A1A] block mb-1.5">Target Price</label>
                                    <input type="text" placeholder="Previous: $3.80" className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none focus:border-[#4A6741] placeholder:text-[#9CA38C]" />
                                </div>
                            </div>

                            <div className="p-3 bg-[#E8F5E9] border border-[#4A6741]/20 rounded-xl mb-6">
                                <div className="flex gap-2">
                                    <Award size={14} className="text-[#4A6741] flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-[#2E7D32]">Preferred Supplier Benefit</p>
                                        <p className="text-[10px] text-[#4A6741] mt-0.5 leading-relaxed">
                                            As a loyal buyer, requests sent to {supplierRatings.find(s => s.id === showRestockModal)?.name} bypass the auction marketplace for faster fulfillment.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setShowRestockModal(null)} className="flex-1 px-4 py-2.5 border border-[#E5E5E0] text-sm font-medium text-[#6B7265] rounded-xl hover:bg-[#F7F7F5]">Cancel</button>
                                <button onClick={() => setShowRestockModal(null)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4A6741] text-white text-sm font-medium rounded-xl hover:bg-[#3D5A35] shadow-sm">
                                    <RefreshCcw size={14} /> Send Request
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
