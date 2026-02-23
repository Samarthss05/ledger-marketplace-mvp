"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Brain, Calendar, TrendingUp, TrendingDown, Package, AlertTriangle,
    Bell, ShoppingCart, ArrowRight, Sparkles, Clock, CheckCircle2,
    ChevronRight, Eye, DollarSign,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "../../lib/mock-data";
import { products } from "../../lib/products-db";

type PlanView = "weekly" | "monthly";

const p_milo = products.find(p => p.name.includes("Milo") && p.name.includes("400G")) || products[0];
const p_rice = products.find(p => p.name.includes("Basmati Rice 1KG")) || products[1];
const p_oyster = products.find(p => p.name.includes("Oyster Sauce 770G")) || products[2];
const p_indomie = products.find(p => p.name.includes("Mi Goreng") && !p.name.includes("Carton")) || products[3];
const p_egg = products.find(p => p.name.includes("Egg 12 Pcs")) || products[4];
const p_pringles = products.find(p => p.name.includes("Pringles Original 149G")) || products[5];
const p_maggi = products.find(p => p.name.includes("Maggi Masala")) || products[6];
const p_downy = products.find(p => p.name.includes("Downy Expert")) || products[7];
const p_monster = products.find(p => p.name.includes("Monster Energy 355ML")) || products[8];
const p_luncheon = products.find(p => p.name.includes("Luncheon Meat")) || products[9];
const p_tabasco = products.find(p => p.name.includes("Tabasco Pepper Sauce")) || products[10];

const weeklyPlan = [
    {
        day: "Mon", items: [
            { name: p_milo.name, qty: 50, auction: "AUC-001", price: p_milo.price, action: "join", urgent: false },
            { name: p_indomie.name, qty: 100, auction: null, price: p_indomie.price, action: "wait", urgent: false },
        ]
    },
    {
        day: "Wed", items: [
            { name: p_rice.name, qty: 30, auction: "AUC-002", price: p_rice.price, action: "join", urgent: true },
            { name: p_maggi.name, qty: 80, auction: null, price: p_maggi.price, action: "request", urgent: false },
        ]
    },
    {
        day: "Thu", items: [
            { name: p_oyster.name, qty: 20, auction: "AUC-003", price: p_oyster.price, action: "join", urgent: false },
            { name: p_egg.name, qty: 40, auction: "AUC-006", price: p_egg.price, action: "join", urgent: true },
        ]
    },
    {
        day: "Sat", items: [
            { name: p_downy.name, qty: 15, auction: null, price: p_downy.price, action: "request", urgent: false },
            { name: p_monster.name, qty: 80, auction: null, price: p_monster.price, action: "wait", urgent: false },
        ]
    },
];

const monthlyPlan = [
    {
        week: "Week 1 (Feb 3–9)", items: [
            { name: p_milo.name, qty: 200, auction: "AUC-010", price: p_milo.price, action: "join", urgent: false },
            { name: p_rice.name, qty: 120, auction: "AUC-011", price: p_rice.price, action: "join", urgent: true },
            { name: p_indomie.name, qty: 400, auction: null, price: p_indomie.price, action: "wait", urgent: false },
        ]
    },
    {
        week: "Week 2 (Feb 10–16)", items: [
            { name: p_oyster.name, qty: 80, auction: "AUC-012", price: p_oyster.price, action: "join", urgent: false },
            { name: p_monster.name, qty: 320, auction: null, price: p_monster.price, action: "wait", urgent: false },
            { name: p_downy.name, qty: 60, auction: null, price: p_downy.price, action: "request", urgent: false },
        ]
    },
    {
        week: "Week 3 (Feb 17–23)", items: [
            { name: p_milo.name, qty: 200, auction: null, price: p_milo.price, action: "wait", urgent: false },
            { name: p_rice.name, qty: 100, auction: "AUC-015", price: p_rice.price - 0.02, action: "join", urgent: false },
            { name: p_luncheon.name, qty: 150, auction: null, price: p_luncheon.price, action: "request", urgent: false },
            { name: p_tabasco.name, qty: 50, auction: "AUC-016", price: p_tabasco.price, action: "join", urgent: false },
        ]
    },
    {
        week: "Week 4 (Feb 24–28)", items: [
            { name: p_indomie.name, qty: 400, auction: "AUC-018", price: p_indomie.price, action: "join", urgent: false },
            { name: p_oyster.name, qty: 80, auction: null, price: p_oyster.price, action: "wait", urgent: false },
            { name: p_pringles.name, qty: 120, auction: "AUC-019", price: p_pringles.price, action: "join", urgent: true },
        ]
    },
];

const priceAlerts = [
    { id: "pa1", product: p_rice.name, target: p_rice.price - 0.20, current: p_rice.price, status: "watching", direction: "below" },
    { id: "pa2", product: p_oyster.name, target: p_oyster.price - 0.15, current: p_oyster.price, status: "close", direction: "below" },
    { id: "pa3", product: p_indomie.name, target: p_indomie.price - 0.10, current: p_indomie.price, status: "watching", direction: "below" },
];

const seasonalPredictions = [
    { season: "Summer (Mar-May)", category: "Beverages & Drinks", change: "+35%", recommendation: "Stock up on Milo, Monster Energy, and Lipton Tea", confidence: 91 },
    { season: "Rainy (Jun-Aug)", category: "Instant Noodles", change: "+22%", recommendation: "Increase Indomie, Maggi & canned goods inventory", confidence: 84 },
    { season: "Holiday (Dec)", category: "All Categories", change: "+45%", recommendation: "Pre-order 2x regular volume across all items", confidence: 88 },
];

const competitorIntel = [
    { product: p_rice.name, yourPrice: p_rice.price + 1.80, areaAvg: p_rice.price + 1.10, auctionBest: p_rice.price - 0.02, savingsIfSwitch: 1.82 },
    { product: p_milo.name, yourPrice: p_milo.price + 1.70, areaAvg: p_milo.price + 0.70, auctionBest: p_milo.price, savingsIfSwitch: 1.70 },
    { product: p_oyster.name, yourPrice: p_oyster.price + 2.00, areaAvg: p_oyster.price + 0.70, auctionBest: p_oyster.price, savingsIfSwitch: 2.00 },
    { product: p_indomie.name, yourPrice: p_indomie.price + 1.00, areaAvg: p_indomie.price + 0.40, auctionBest: p_indomie.price, savingsIfSwitch: 1.00 },
];

export default function AIPlannerPage() {
    const [planView, setPlanView] = useState<PlanView>("weekly");
    const [showAlertForm, setShowAlertForm] = useState(false);

    const totalWeeklyCost = weeklyPlan.reduce((s, d) => s + d.items.reduce((ss, item) => ss + item.price * item.qty, 0), 0);
    const totalMonthlyCost = monthlyPlan.reduce((s, w) => s + w.items.reduce((ss, item) => ss + item.price * item.qty, 0), 0);
    const totalPlannedCost = planView === "weekly" ? totalWeeklyCost : totalMonthlyCost;
    const totalPlannedOrders = planView === "weekly"
        ? weeklyPlan.reduce((s, d) => s + d.items.length, 0)
        : monthlyPlan.reduce((s, w) => s + w.items.length, 0);
    const totalUrgent = planView === "weekly"
        ? weeklyPlan.reduce((s, d) => s + d.items.filter(i => i.urgent).length, 0)
        : monthlyPlan.reduce((s, w) => s + w.items.filter(i => i.urgent).length, 0);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-[#1A1A1A]">AI Procurement Planner</h1>
                        <span className="px-2 py-0.5 bg-gradient-to-r from-[#7B1FA2] to-[#CE93D8] text-white text-[9px] font-bold rounded-full flex items-center gap-1"><Brain size={8} /> SMART</span>
                    </div>
                    <p className="text-sm text-[#6B7265] mt-0.5">AI-powered procurement plan based on your sales history and market trends</p>
                </div>
                <div className="flex bg-white border border-[#E5E5E0] rounded-xl overflow-hidden">
                    <button onClick={() => setPlanView("weekly")} className={`px-4 py-2 text-xs font-medium ${planView === "weekly" ? "bg-[#4A6741] text-white" : "text-[#6B7265]"}`}>Weekly</button>
                    <button onClick={() => setPlanView("monthly")} className={`px-4 py-2 text-xs font-medium ${planView === "monthly" ? "bg-[#4A6741] text-white" : "text-[#6B7265]"}`}>Monthly</button>
                </div>
            </motion.div>

            {/* Plan Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { icon: Calendar, label: "Planned Orders", value: totalPlannedOrders.toString(), sub: planView === "weekly" ? "this week" : "this month", color: "bg-[#4A6741]" },
                    { icon: DollarSign, label: "Est. Cost", value: formatCurrency(totalPlannedCost), sub: "at auction prices", color: "bg-[#3B6B9B]" },
                    { icon: TrendingDown, label: "vs Retail", value: formatCurrency(totalPlannedCost * 0.18), sub: "estimated savings", color: "bg-[#2E7D32]" },
                    { icon: AlertTriangle, label: "Urgent", value: totalUrgent.toString(), sub: "restock soon", color: "bg-[#C53030]" },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-white rounded-2xl border border-[#E5E5E0] p-4">
                        <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center text-white mb-2`}><s.icon size={14} /></div>
                        <p className="text-lg font-bold text-[#1A1A1A]">{s.value}</p>
                        <p className="text-[10px] text-[#9CA38C]">{s.sub}</p>
                    </motion.div>
                ))}
            </div>

            {/* Plan Content */}
            <motion.div key={planView} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="bg-white rounded-2xl border border-[#E5E5E0] p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Calendar size={14} className="text-[#4A6741]" />
                    <h2 className="text-sm font-bold text-[#1A1A1A]">{planView === "weekly" ? "This Week's Plan" : "This Month's Plan"}</h2>
                    <span className="px-2 py-0.5 bg-[#E8F5E9] text-[#2E7D32] text-[9px] font-bold rounded-full">AI Generated</span>
                </div>

                {planView === "weekly" ? (
                    /* Weekly View */
                    <div className="space-y-4">
                        {weeklyPlan.map((day, di) => (
                            <motion.div key={day.day} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + di * 0.05 }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-10 text-xs font-bold text-[#4A6741] bg-[#E8F5E9] px-2 py-1 rounded-lg text-center">{day.day}</span>
                                    <div className="flex-1 h-px bg-[#F0F0EC]" />
                                </div>
                                <div className="space-y-2 pl-4 border-l-2 border-[#E8F5E9] ml-4">
                                    {day.items.map((item, ii) => (
                                        <div key={ii} className={`flex items-center gap-4 p-3 rounded-xl ${item.urgent ? "bg-[#FFF3E0] border border-[#E65100]/20" : "bg-[#F7F7F5]"} hover:shadow-sm transition-all`}>
                                            <Package size={14} className={item.urgent ? "text-[#E65100]" : "text-[#9CA38C]"} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs font-bold text-[#1A1A1A]">{item.name}</p>
                                                    {item.urgent && <span className="text-[8px] px-1.5 py-0.5 bg-[#E65100] text-white rounded font-bold">URGENT</span>}
                                                </div>
                                                <p className="text-[10px] text-[#9CA38C]">{item.qty} units · ${item.price}/unit</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-[#1A1A1A]">{formatCurrency(item.price * item.qty)}</span>
                                                {item.action === "join" && (
                                                    <Link href="/auction/shop/marketplace">
                                                        <span className="flex items-center gap-1 px-2.5 py-1 bg-[#4A6741] text-white text-[10px] font-bold rounded-lg">Join <ArrowRight size={8} /></span>
                                                    </Link>
                                                )}
                                                {item.action === "wait" && <span className="text-[10px] text-[#B8860B] font-bold px-2 py-1 bg-[#FFF8E1] rounded-lg">Waiting</span>}
                                                {item.action === "request" && <span className="text-[10px] text-[#1565C0] font-bold px-2 py-1 bg-[#E3F2FD] rounded-lg">Request</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    /* Monthly View */
                    <div className="space-y-5">
                        {monthlyPlan.map((week, wi) => {
                            const weekTotal = week.items.reduce((s, item) => s + item.price * item.qty, 0);
                            return (
                                <motion.div key={week.week} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + wi * 0.08 }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-bold text-[#4A6741] bg-[#E8F5E9] px-2.5 py-1 rounded-lg whitespace-nowrap">{week.week}</span>
                                        <div className="flex-1 h-px bg-[#F0F0EC]" />
                                        <span className="text-[10px] font-bold text-[#6B7265] whitespace-nowrap">{formatCurrency(weekTotal)}</span>
                                    </div>
                                    <div className="space-y-2 pl-4 border-l-2 border-[#E8F5E9] ml-4">
                                        {week.items.map((item, ii) => (
                                            <div key={ii} className={`flex items-center gap-4 p-3 rounded-xl ${item.urgent ? "bg-[#FFF3E0] border border-[#E65100]/20" : "bg-[#F7F7F5]"} hover:shadow-sm transition-all`}>
                                                <Package size={14} className={item.urgent ? "text-[#E65100]" : "text-[#9CA38C]"} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs font-bold text-[#1A1A1A]">{item.name}</p>
                                                        {item.urgent && <span className="text-[8px] px-1.5 py-0.5 bg-[#E65100] text-white rounded font-bold">URGENT</span>}
                                                    </div>
                                                    <p className="text-[10px] text-[#9CA38C]">{item.qty} units · ${item.price}/unit</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-[#1A1A1A]">{formatCurrency(item.price * item.qty)}</span>
                                                    {item.action === "join" && (
                                                        <Link href="/auction/shop/marketplace">
                                                            <span className="flex items-center gap-1 px-2.5 py-1 bg-[#4A6741] text-white text-[10px] font-bold rounded-lg">Join <ArrowRight size={8} /></span>
                                                        </Link>
                                                    )}
                                                    {item.action === "wait" && <span className="text-[10px] text-[#B8860B] font-bold px-2 py-1 bg-[#FFF8E1] rounded-lg">Waiting</span>}
                                                    {item.action === "request" && <span className="text-[10px] text-[#1565C0] font-bold px-2 py-1 bg-[#E3F2FD] rounded-lg">Request</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                <button className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#4A6741] to-[#6B8F71] text-white text-sm font-bold rounded-xl">
                    <ShoppingCart size={14} /> Add All to Smart Cart
                </button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Price Watch */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl border border-[#E5E5E0] p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Eye size={14} className="text-[#4A6741]" />
                            <h2 className="text-sm font-bold text-[#1A1A1A]">Price Watch</h2>
                        </div>
                        <button onClick={() => setShowAlertForm(!showAlertForm)} className="text-xs text-[#4A6741] font-bold flex items-center gap-1">
                            + Add Alert
                        </button>
                    </div>
                    <div className="space-y-3">
                        {priceAlerts.map((alert) => {
                            const closeness = ((alert.current - alert.target) / alert.target * 100);
                            return (
                                <div key={alert.id} className={`p-3 rounded-xl ${alert.status === "close" ? "bg-[#FFF8E1] border border-[#F57F17]/20" : "bg-[#F7F7F5]"}`}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <p className="text-xs font-bold text-[#1A1A1A]">{alert.product}</p>
                                        {alert.status === "close" && <span className="text-[8px] px-1.5 py-0.5 bg-[#F57F17] text-white rounded font-bold">ALMOST!</span>}
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px]">
                                        <span className="text-[#9CA38C]">Target: <strong className="text-[#2E7D32]">${alert.target}</strong></span>
                                        <span className="text-[#9CA38C]">Current: <strong>${alert.current}</strong></span>
                                        <span className="text-[#9CA38C]">{closeness.toFixed(0)}% away</span>
                                    </div>
                                    <div className="mt-1.5 h-1.5 bg-[#E5E5E0] rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${alert.status === "close" ? "bg-[#F57F17]" : "bg-[#4A6741]"}`}
                                            style={{ width: `${Math.min(100 - closeness, 100)}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Seasonal Predictions */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                    className="bg-white rounded-2xl border border-[#E5E5E0] p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={14} className="text-[#7B1FA2]" />
                        <h2 className="text-sm font-bold text-[#1A1A1A]">Seasonal Demand Predictions</h2>
                        <span className="px-1.5 py-0.5 bg-[#F3E5F5] text-[#7B1FA2] text-[8px] font-bold rounded">AI</span>
                    </div>
                    <div className="space-y-3">
                        {seasonalPredictions.map((pred, i) => (
                            <div key={i} className="p-3 bg-[#F7F7F5] rounded-xl">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-[#1A1A1A]">{pred.season}</span>
                                    <span className={`text-xs font-bold ${pred.change.startsWith("+") ? "text-[#C53030]" : "text-[#2E7D32]"}`}>{pred.change} demand</span>
                                </div>
                                <p className="text-[10px] text-[#6B7265]">{pred.category}: {pred.recommendation}</p>
                                <div className="flex items-center gap-1 mt-1.5">
                                    <Brain size={8} className="text-[#7B1FA2]" />
                                    <span className="text-[9px] text-[#9CA38C]">{pred.confidence}% confidence</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Competitor Intel */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl border border-[#E5E5E0] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E5E0] flex items-center gap-2">
                    <Sparkles size={14} className="text-[#7B1FA2]" />
                    <h2 className="text-sm font-bold text-[#1A1A1A]">Competitor Pricing Intelligence</h2>
                    <span className="px-1.5 py-0.5 bg-[#F3E5F5] text-[#7B1FA2] text-[8px] font-bold rounded">AI</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="bg-[#F7F7F5]">
                            <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#9CA38C] uppercase">Product</th>
                            <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#9CA38C] uppercase">Your Price</th>
                            <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#9CA38C] uppercase">Area Avg</th>
                            <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#9CA38C] uppercase">Best Auction</th>
                            <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#9CA38C] uppercase">You Could Save</th>
                        </tr></thead>
                        <tbody>
                            {competitorIntel.map((item) => (
                                <tr key={item.product} className="border-b border-[#F0F0EC] hover:bg-[#F7F7F5]">
                                    <td className="px-5 py-3 text-xs font-medium text-[#1A1A1A]">{item.product}</td>
                                    <td className="px-5 py-3 text-xs text-[#C53030] font-bold">${item.yourPrice}</td>
                                    <td className="px-5 py-3 text-xs text-[#6B7265]">${item.areaAvg}</td>
                                    <td className="px-5 py-3 text-xs text-[#2E7D32] font-bold">${item.auctionBest}</td>
                                    <td className="px-5 py-3"><span className="text-xs font-bold text-[#4A6741] px-2 py-0.5 bg-[#E8F5E9] rounded-full">${item.savingsIfSwitch}/unit</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-5 py-3 border-t border-[#E5E5E0] bg-[#F7F7F5] text-center">
                    <p className="text-xs text-[#6B7265]">
                        Switch all items to auction buying and save <strong className="text-[#4A6741]">${competitorIntel.reduce((s, i) => s + i.savingsIfSwitch, 0)}/unit</strong> on average
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
