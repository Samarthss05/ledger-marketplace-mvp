"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bot, Plus, Trash2, Settings, Sparkles, Brain, Target, TrendingUp,
    ToggleLeft, ToggleRight, Gavel, Zap, ArrowRight, AlertCircle,
    DollarSign, CheckCircle2, Play, Pause, ChevronRight, BarChart3, Clock,
} from "lucide-react";
import { formatCurrency, auctions } from "../../lib/mock-data";
import { products } from "../../lib/products-db";

interface AutoBidRule {
    id: string;
    name: string;
    category: string;
    maxPrice: number;
    minWinProb: number;
    maxQuantity: number;
    active: boolean;
    bidsPlaced: number;
    wins: number;
    totalSpent: number;
}

const p_milo = products.find(p => p.name.includes("Milo") && p.name.includes("400G")) || products[0];
const p_rice = products.find(p => p.name.includes("Basmati Rice 1KG")) || products[1];
const p_oyster = products.find(p => p.name.includes("Oyster Sauce 770G")) || products[2];
const p_beer = products.find(p => p.name.includes("Heineken")) || products[4];

const initialRules: AutoBidRule[] = [
    { id: "r1", name: "Beverages Hunter", category: "Beverages & Drinks", maxPrice: 4.00, minWinProb: 65, maxQuantity: 10000, active: true, bidsPlaced: 14, wins: 8, totalSpent: 425000 },
    { id: "r2", name: "Rice Bulk Buyer", category: "Rice & Grains", maxPrice: 5.00, minWinProb: 70, maxQuantity: 5000, active: true, bidsPlaced: 6, wins: 4, totalSpent: 280000 },
    { id: "r3", name: "Sauce Opportunist", category: "Sauces & Condiments", maxPrice: 4.20, minWinProb: 60, maxQuantity: 3000, active: false, bidsPlaced: 3, wins: 1, totalSpent: 42000 },
];

// Bid simulator data
const simAuction = auctions[0];
// Simulator start price
const SIM_BASE = simAuction.reservePrice - 0.40;
const simPriceRange = Array.from({ length: 7 }, (_, i) => {
    const price = SIM_BASE + i * 0.10;
    const winProb = Math.max(15, Math.min(97, 120 - (price / simAuction.reservePrice) * 100));
    const margin = ((simAuction.reservePrice - price) / simAuction.reservePrice * 100);
    return { price, winProb: Math.round(winProb), margin: margin.toFixed(1), revenue: price * simAuction.totalQuantity };
});

// Recommended auctions
const recommendations = [
    { id: "AUC-001", product: p_milo.name, category: p_milo.category, qty: 4800, match: 94, reason: "Top category, low competition", reserve: p_milo.price },
    { id: "AUC-003", product: p_oyster.name, category: p_oyster.category, qty: 2400, match: 87, reason: "High margin opportunity", reserve: p_oyster.price },
    { id: "AUC-005", product: p_beer.name, category: p_beer.category, qty: 6000, match: 82, reason: "Growing demand in your zone", reserve: p_beer.price },
];

export default function AutoBidderPage() {
    const [rules, setRules] = useState(initialRules);
    const [showCreate, setShowCreate] = useState(false);
    const [simPrice, setSimPrice] = useState(145);
    const [activeTab, setActiveTab] = useState<"rules" | "simulator" | "recommendations">("rules");

    const toggleRule = (id: string) => setRules(p => p.map(r => r.id === id ? { ...r, active: !r.active } : r));
    const deleteRule = (id: string) => setRules(p => p.filter(r => r.id !== id));

    const activeRules = rules.filter(r => r.active);
    const totalWins = rules.reduce((s, r) => s + r.wins, 0);
    const totalBids = rules.reduce((s, r) => s + r.bidsPlaced, 0);

    // Sim calcs
    const simWinProb = Math.max(15, Math.min(97, 120 - simPrice * 0.5));
    const simMargin = ((simAuction.reservePrice - simPrice) / simAuction.reservePrice * 100);
    const simRevenue = simPrice * simAuction.totalQuantity;
    const simFee = simRevenue * 0.03;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-[#1A1A1A]">AI Auto-Bidder</h1>
                        <span className="px-2 py-0.5 bg-gradient-to-r from-[#7B1FA2] to-[#CE93D8] text-white text-[9px] font-bold rounded-full flex items-center gap-1"><Bot size={8} /> AI</span>
                    </div>
                    <p className="text-sm text-[#6B7265] mt-0.5">Set rules and let AI bid for you automatically</p>
                </div>
                <div className="flex bg-white border border-[#E5E5E0] rounded-xl overflow-hidden">
                    {(["rules", "simulator", "recommendations"] as const).map(t => (
                        <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 text-xs font-medium ${activeTab === t ? "bg-[#2C432D] text-white" : "text-[#6B7265]"}`}>
                            {t === "rules" ? "Auto-Bid Rules" : t === "simulator" ? "Bid Simulator" : "Recommended"}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { icon: Bot, label: "Active Rules", value: activeRules.length.toString(), sub: `of ${rules.length} total`, color: "bg-[#7B1FA2]" },
                    { icon: Gavel, label: "Auto-Bids Placed", value: totalBids.toString(), sub: "by AI", color: "bg-[#2C432D]" },
                    { icon: CheckCircle2, label: "Wins", value: totalWins.toString(), sub: `${totalBids > 0 ? ((totalWins / totalBids) * 100).toFixed(0) : 0}% win rate`, color: "bg-[#4A6741]" },
                    { icon: DollarSign, label: "Revenue from AI", value: formatCurrency(rules.reduce((s, r) => s + r.totalSpent, 0)), sub: "total earnings", color: "bg-[#B8860B]" },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-white rounded-2xl border border-[#E5E5E0] p-4">
                        <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center text-white mb-2`}><s.icon size={14} /></div>
                        <p className="text-lg font-bold text-[#1A1A1A]">{s.value}</p>
                        <p className="text-[10px] text-[#9CA38C]">{s.sub}</p>
                    </motion.div>
                ))}
            </div>

            {activeTab === "rules" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-[#1A1A1A]">Bidding Rules</h2>
                        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2 bg-[#2C432D] text-white text-xs font-medium rounded-xl hover:bg-[#1A2E1B]"><Plus size={12} /> New Rule</button>
                    </div>
                    {rules.map((rule, i) => (
                        <motion.div key={rule.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className={`bg-white rounded-2xl border ${rule.active ? "border-[#4A6741]/30" : "border-[#E5E5E0]"} p-5 hover:shadow-md transition-all`}>
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${rule.active ? "bg-[#E8F5E9]" : "bg-[#F7F7F5]"}`}>
                                        <Bot size={18} className={rule.active ? "text-[#4A6741]" : "text-[#9CA38C]"} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-[#1A1A1A]">{rule.name}</p>
                                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${rule.active ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#F7F7F5] text-[#9CA38C]"}`}>
                                                {rule.active ? "RUNNING" : "PAUSED"}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-[#9CA38C]">{rule.category} · Max ${rule.maxPrice}/unit · Min {rule.minWinProb}% win prob · Max {rule.maxQuantity.toLocaleString()} units</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 flex-shrink-0">
                                    <div className="text-center"><p className="text-sm font-bold text-[#1A1A1A]">{rule.bidsPlaced}</p><p className="text-[9px] text-[#9CA38C]">bids</p></div>
                                    <div className="text-center"><p className="text-sm font-bold text-[#4A6741]">{rule.wins}</p><p className="text-[9px] text-[#9CA38C]">wins</p></div>
                                    <div className="text-center"><p className="text-sm font-bold text-[#1A1A1A]">{formatCurrency(rule.totalSpent)}</p><p className="text-[9px] text-[#9CA38C]">revenue</p></div>
                                    <button onClick={() => toggleRule(rule.id)} className="p-2 rounded-lg hover:bg-[#F7F7F5]">
                                        {rule.active ? <Pause size={14} className="text-[#F57F17]" /> : <Play size={14} className="text-[#4A6741]" />}
                                    </button>
                                    <button onClick={() => deleteRule(rule.id)} className="p-2 rounded-lg hover:bg-[#FFEBEE] text-[#9CA38C] hover:text-[#C53030]"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-[#F3E5F5] to-[#E8F5E9] rounded-2xl border border-[#7B1FA2]/10">
                        <Brain size={14} className="text-[#7B1FA2] mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-[#1A1A1A]">AI Insight: Your Beverages rule has the best ROI</p>
                            <p className="text-[10px] text-[#6B7265] mt-0.5">57% win rate with $425K revenue. Consider tightening the max price to $150 for +12% margin improvement.</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {activeTab === "simulator" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="bg-white rounded-2xl border border-[#E5E5E0] p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles size={14} className="text-[#7B1FA2]" />
                            <h2 className="text-sm font-bold text-[#1A1A1A]">Bid Simulator</h2>
                            <span className="text-[10px] text-[#9CA38C]">— {simAuction.productName}</span>
                        </div>
                        <div className="mb-6">
                            <label className="text-xs font-medium text-[#1A1A1A] block mb-2">Your Bid Price: <strong className="text-[#2C432D] text-lg">${simPrice}</strong>/unit</label>
                            <input type="range" min={100} max={180} value={simPrice} onChange={(e) => setSimPrice(Number(e.target.value))}
                                className="w-full h-2 bg-[#F0F0EC] rounded-full appearance-none cursor-pointer accent-[#4A6741]" />
                            <div className="flex justify-between text-[9px] text-[#9CA38C] mt-1"><span>$100 (Aggressive)</span><span>Reserve: ${simAuction.reservePrice}</span><span>$180 (Safe)</span></div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: "Win Probability", value: `${simWinProb.toFixed(0)}%`, color: simWinProb >= 70 ? "text-[#2E7D32]" : simWinProb >= 40 ? "text-[#F57F17]" : "text-[#C53030]" },
                                { label: "Your Margin", value: `${simMargin.toFixed(1)}%`, color: simMargin >= 10 ? "text-[#2E7D32]" : "text-[#F57F17]" },
                                { label: "Gross Revenue", value: formatCurrency(simRevenue), color: "text-[#1A1A1A]" },
                                { label: "Net Revenue", value: formatCurrency(simRevenue - simFee), color: "text-[#2C432D]" },
                            ].map(s => (
                                <div key={s.label} className="bg-[#F7F7F5] rounded-xl p-4 text-center">
                                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                                    <p className="text-[10px] text-[#9CA38C] mt-1">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-[#E5E5E0] p-5">
                        <h3 className="text-sm font-bold text-[#1A1A1A] mb-3">Price vs Win Probability</h3>
                        <div className="flex items-end gap-3 h-40">
                            {simPriceRange.map((item, i) => {
                                const isSelected = item.price === simPrice;
                                return (
                                    <button key={item.price} onClick={() => setSimPrice(item.price)}
                                        className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end group cursor-pointer">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#1A1A1A] text-white text-[8px] px-1.5 py-0.5 rounded whitespace-nowrap">
                                            Win: {item.winProb}% · Margin: {item.margin}%
                                        </div>
                                        <motion.div className={`w-full rounded-t ${isSelected ? "bg-gradient-to-t from-[#2C432D] to-[#4A6741] ring-2 ring-[#4A6741]/30" : "bg-[#E5E5E0] hover:bg-[#9CA38C]"}`}
                                            initial={{ height: 0 }} animate={{ height: `${item.winProb}%` }}
                                            transition={{ duration: 0.5, delay: i * 0.05 }} />
                                        <span className={`text-[9px] mt-1 ${isSelected ? "text-[#2C432D] font-bold" : "text-[#9CA38C]"}`}>${item.price}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            )}

            {activeTab === "recommendations" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap size={14} className="text-[#7B1FA2]" />
                        <h2 className="text-sm font-bold text-[#1A1A1A]">AI-Recommended Auctions</h2>
                        <span className="text-[9px] px-1.5 py-0.5 bg-[#F3E5F5] text-[#7B1FA2] rounded font-bold">PERSONALIZED</span>
                    </div>
                    {recommendations.map((rec, i) => (
                        <motion.div key={rec.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                            className="bg-white rounded-2xl border border-[#E5E5E0] p-5 hover:shadow-lg hover:shadow-[#4A6741]/5 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <p className="text-sm font-bold text-[#1A1A1A]">{rec.product}</p>
                                        <span className="text-[9px] px-1.5 py-0.5 bg-[#F7F7F5] text-[#6B7265] rounded">{rec.category}</span>
                                    </div>
                                    <p className="text-[10px] text-[#9CA38C]">{rec.qty.toLocaleString()} units · Reserve: ${rec.reserve}/unit</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-center">
                                        <div className={`text-xl font-bold ${rec.match >= 90 ? "text-[#2E7D32]" : rec.match >= 80 ? "text-[#4A6741]" : "text-[#F57F17]"}`}>{rec.match}%</div>
                                        <p className="text-[8px] text-[#9CA38C]">match</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <Brain size={10} className="text-[#7B1FA2]" />
                                    <span className="text-[10px] text-[#6B7265]">{rec.reason}</span>
                                </div>
                                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2C432D] text-white text-[10px] font-bold rounded-lg hover:bg-[#1A2E1B]">
                                    <Gavel size={10} /> Bid Now <ArrowRight size={8} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Create Rule Modal */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowCreate(false)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-base font-bold text-[#1A1A1A] mb-4">Create Auto-Bid Rule</h3>
                            <div className="space-y-3">
                                <div><label className="text-xs font-medium block mb-1">Rule Name</label><input type="text" placeholder="e.g. Beverages Hunter" className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none focus:border-[#2C432D]" /></div>
                                <div><label className="text-xs font-medium block mb-1">Category</label>
                                    <select className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none">
                                        <option>Beverages</option><option>Rice & Grains</option><option>Cooking Oil</option><option>Snacks</option><option>Personal Care</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="text-xs font-medium block mb-1">Max Price/Unit ($)</label><input type="number" placeholder="150" className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none focus:border-[#2C432D]" /></div>
                                    <div><label className="text-xs font-medium block mb-1">Min Win Probability (%)</label><input type="number" placeholder="65" className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none focus:border-[#2C432D]" /></div>
                                </div>
                                <div><label className="text-xs font-medium block mb-1">Max Quantity (units)</label><input type="number" placeholder="10000" className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none focus:border-[#2C432D]" /></div>
                            </div>
                            <div className="flex gap-3 mt-5">
                                <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 border border-[#E5E5E0] text-sm font-medium text-[#6B7265] rounded-xl">Cancel</button>
                                <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 bg-[#2C432D] text-white text-sm font-medium rounded-xl">Create Rule</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
