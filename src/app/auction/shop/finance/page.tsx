"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Wallet, Target, CreditCard, ArrowRight, CheckCircle2, Clock, TrendingUp,
    Shield, Sparkles, DollarSign, Calendar, Info, BarChart3, Star,
} from "lucide-react";
import { formatCurrency } from "../../lib/mock-data";

const savingsGoal = {
    target: 50000,
    current: 27200,
    startDate: "Jan 1, 2026",
    endDate: "Mar 31, 2026",
    monthlyBreakdown: [
        { month: "Jan", saved: 4800, target: 4167 },
        { month: "Feb", saved: 5200, target: 4167 },
        { month: "Mar", saved: 0, target: 4167 },
    ],
};

const creditLine = {
    total: 100000,
    used: 35000,
    available: 65000,
    dueDate: "Mar 15, 2026",
    nextPayment: 12500,
    interestRate: 0,
    status: "active",
};

const bnplOrders = [
    { id: "bnpl-1", product: "India Gate Basmati Rice 1KG", amount: 28500, dueDate: "Mar 10", status: "active", daysLeft: 18 },
    { id: "bnpl-2", product: "Nestle Milo 400G", amount: 14800, dueDate: "Mar 15", status: "active", daysLeft: 23 },
    { id: "bnpl-3", product: "LKK Oyster Sauce 770G", amount: 8550, dueDate: "Feb 28", status: "due_soon", daysLeft: 8 },
    { id: "bnpl-4", product: "Indomie Mi Goreng", amount: 14040, dueDate: "Feb 10", status: "paid", daysLeft: 0 },
];

const benefits = [
    { icon: Clock, title: "0% Interest for 30 days", desc: "No extra cost on auction purchases" },
    { icon: Shield, title: "Flexible repayment", desc: "Pay weekly or monthly" },
    { icon: Star, title: "Build credit score", desc: "On-time payments increase your limit" },
    { icon: TrendingUp, title: "Higher limits over time", desc: "Start at $100K, grow to $500K" },
];

export default function FinancePage() {
    const [activeTab, setActiveTab] = useState<"overview" | "bnpl" | "goals">("overview");
    const savingsPct = (savingsGoal.current / savingsGoal.target) * 100;
    const creditPct = (creditLine.used / creditLine.total) * 100;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#1A1A1A]">Finance Center</h1>
                    <p className="text-sm text-[#6B7265] mt-0.5">Buy Now Pay Later, credit line, and savings goals</p>
                </div>
                <div className="flex bg-white border border-[#E5E5E0] rounded-xl overflow-hidden">
                    {(["overview", "bnpl", "goals"] as const).map(t => (
                        <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 text-xs font-medium ${activeTab === t ? "bg-[#4A6741] text-white" : "text-[#6B7265]"}`}>
                            {t === "overview" ? "Overview" : t === "bnpl" ? "Buy Now Pay Later" : "Savings Goals"}
                        </button>
                    ))}
                </div>
            </motion.div>

            {activeTab === "overview" && (
                <>
                    {/* Credit + Savings quick stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Credit Line */}
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="bg-gradient-to-br from-[#2C432D] to-[#4A6741] rounded-2xl p-6 text-white">
                            <div className="flex items-center gap-2 mb-4">
                                <CreditCard size={16} />
                                <h2 className="text-sm font-bold">Ledger Credit Line</h2>
                                <span className="text-[8px] px-1.5 py-0.5 bg-white/20 rounded font-bold">ACTIVE</span>
                            </div>
                            <p className="text-3xl font-bold">{formatCurrency(creditLine.available)}</p>
                            <p className="text-xs text-white/60 mt-0.5">available of {formatCurrency(creditLine.total)}</p>
                            <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white rounded-full" style={{ width: `${creditPct}%` }} />
                            </div>
                            <div className="flex justify-between mt-1.5 text-[10px] text-white/60">
                                <span>Used: {formatCurrency(creditLine.used)}</span>
                                <span>{creditPct.toFixed(0)}% utilized</span>
                            </div>
                            <div className="mt-4 pt-3 border-t border-white/15 grid grid-cols-2 gap-3">
                                <div><p className="text-[10px] text-white/50">Next payment</p><p className="text-sm font-bold">{formatCurrency(creditLine.nextPayment)}</p></div>
                                <div><p className="text-[10px] text-white/50">Due date</p><p className="text-sm font-bold">{creditLine.dueDate}</p></div>
                            </div>
                        </motion.div>

                        {/* Savings Goal */}
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                            className="bg-white rounded-2xl border border-[#E5E5E0] p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Target size={16} className="text-[#4A6741]" />
                                <h2 className="text-sm font-bold text-[#1A1A1A]">Quarterly Savings Goal</h2>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative w-24 h-24 flex-shrink-0">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                                        <circle cx="48" cy="48" r="42" stroke="#F0F0EC" strokeWidth="6" fill="none" />
                                        <motion.circle cx="48" cy="48" r="42" stroke="#4A6741" strokeWidth="6" fill="none" strokeLinecap="round"
                                            strokeDasharray={2 * Math.PI * 42} initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                                            animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - savingsPct / 100) }}
                                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }} />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-lg font-bold text-[#1A1A1A]">{savingsPct.toFixed(0)}%</span>
                                        <span className="text-[8px] text-[#9CA38C]">of goal</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-2xl font-bold text-[#4A6741]">{formatCurrency(savingsGoal.current)}</p>
                                    <p className="text-xs text-[#9CA38C]">of {formatCurrency(savingsGoal.target)} target</p>
                                    <p className="text-[10px] text-[#6B7265] mt-2">{savingsGoal.startDate} — {savingsGoal.endDate}</p>
                                    <div className="mt-2 flex gap-2">
                                        {savingsGoal.monthlyBreakdown.map(m => (
                                            <div key={m.month} className="flex-1 text-center">
                                                <div className="h-8 bg-[#F0F0EC] rounded relative overflow-hidden">
                                                    <div className={`absolute bottom-0 w-full rounded ${m.saved > 0 ? (m.saved >= m.target ? "bg-[#4A6741]" : "bg-[#F57F17]") : "bg-[#E5E5E0]"}`}
                                                        style={{ height: `${m.saved > 0 ? Math.min((m.saved / m.target) * 100, 100) : 5}%` }} />
                                                </div>
                                                <span className="text-[8px] text-[#9CA38C] mt-0.5">{m.month}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Benefits */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                        className="bg-gradient-to-r from-[#F3E5F5] to-[#E8F5E9] rounded-2xl p-5 border border-[#7B1FA2]/10">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles size={14} className="text-[#7B1FA2]" />
                            <h2 className="text-sm font-bold text-[#1A1A1A]">Credit Line Benefits</h2>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {benefits.map(b => (
                                <div key={b.title} className="bg-white/70 backdrop-blur-sm rounded-xl p-3">
                                    <b.icon size={14} className="text-[#4A6741] mb-2" />
                                    <p className="text-xs font-bold text-[#1A1A1A]">{b.title}</p>
                                    <p className="text-[10px] text-[#6B7265] mt-0.5">{b.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}

            {activeTab === "bnpl" && (
                <>
                    {/* BNPL Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { icon: CreditCard, label: "Active BNPL", value: bnplOrders.filter(o => o.status !== "paid").length.toString(), sub: "unpaid orders", color: "bg-[#3B6B9B]" },
                            { icon: DollarSign, label: "Outstanding", value: formatCurrency(bnplOrders.filter(o => o.status !== "paid").reduce((s, o) => s + o.amount, 0)), sub: "total due", color: "bg-[#C53030]" },
                            { icon: CheckCircle2, label: "Paid", value: bnplOrders.filter(o => o.status === "paid").length.toString(), sub: "completed", color: "bg-[#2E7D32]" },
                            { icon: Clock, label: "Due Soon", value: bnplOrders.filter(o => o.status === "due_soon").length.toString(), sub: "within 10 days", color: "bg-[#F57F17]" },
                        ].map((s, i) => (
                            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="bg-white rounded-2xl border border-[#E5E5E0] p-4">
                                <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center text-white mb-2`}><s.icon size={14} /></div>
                                <p className="text-lg font-bold text-[#1A1A1A]">{s.value}</p>
                                <p className="text-[10px] text-[#9CA38C]">{s.sub}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* BNPL Orders */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl border border-[#E5E5E0] overflow-hidden">
                        <div className="px-5 py-4 border-b border-[#E5E5E0]">
                            <h2 className="text-sm font-bold text-[#1A1A1A]">BNPL Orders</h2>
                        </div>
                        <div className="divide-y divide-[#F0F0EC]">
                            {bnplOrders.map((order) => (
                                <div key={order.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F7F7F5] transition-colors">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${order.status === "paid" ? "bg-[#E8F5E9]" : order.status === "due_soon" ? "bg-[#FFF3E0]" : "bg-[#E3F2FD]"
                                        }`}>
                                        {order.status === "paid" ? <CheckCircle2 size={16} className="text-[#2E7D32]" />
                                            : order.status === "due_soon" ? <Clock size={16} className="text-[#E65100]" />
                                                : <CreditCard size={16} className="text-[#1565C0]" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-[#1A1A1A]">{order.product}</p>
                                        <p className="text-[10px] text-[#9CA38C]">Due: {order.dueDate}{order.daysLeft > 0 ? ` · ${order.daysLeft} days left` : ""}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-[#1A1A1A]">{formatCurrency(order.amount)}</p>
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${order.status === "paid" ? "bg-[#E8F5E9] text-[#2E7D32]" :
                                                order.status === "due_soon" ? "bg-[#FFF3E0] text-[#E65100]" : "bg-[#E3F2FD] text-[#1565C0]"
                                            }`}>{order.status === "paid" ? "Paid" : order.status === "due_soon" ? "Due Soon" : "Active"}</span>
                                    </div>
                                    {order.status !== "paid" && (
                                        <button className="px-3 py-1.5 text-xs font-bold text-[#4A6741] border border-[#4A6741]/30 rounded-lg hover:bg-[#E8F5E9]">
                                            Pay Now
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}

            {activeTab === "goals" && (
                <>
                    {/* Savings Goal Detail */}
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl border border-[#E5E5E0] p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Target size={16} className="text-[#4A6741]" />
                            <h2 className="text-sm font-bold text-[#1A1A1A]">Q1 2026 Savings Goal</h2>
                        </div>
                        <div className="mb-4">
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-[#6B7265]">{formatCurrency(savingsGoal.current)} saved</span>
                                <span className="font-bold text-[#4A6741]">{formatCurrency(savingsGoal.target)} target</span>
                            </div>
                            <div className="h-4 bg-[#F0F0EC] rounded-full overflow-hidden">
                                <motion.div className="h-full bg-gradient-to-r from-[#4A6741] to-[#6B8F71] rounded-full"
                                    initial={{ width: 0 }} animate={{ width: `${savingsPct}%` }}
                                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }} />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {savingsGoal.monthlyBreakdown.map(m => (
                                <div key={m.month} className="bg-[#F7F7F5] rounded-xl p-3 text-center">
                                    <p className="text-xs font-bold text-[#1A1A1A]">{m.month}</p>
                                    <p className={`text-lg font-bold mt-1 ${m.saved > 0 ? (m.saved >= m.target ? "text-[#2E7D32]" : "text-[#F57F17]") : "text-[#9CA38C]"}`}>
                                        {m.saved > 0 ? formatCurrency(m.saved) : "—"}
                                    </p>
                                    <p className="text-[9px] text-[#9CA38C]">Target: {formatCurrency(m.target)}</p>
                                    {m.saved >= m.target && m.saved > 0 && <span className="text-[8px] font-bold text-[#2E7D32]">✓ On track!</span>}
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-[#F0F0EC] flex items-start gap-3 p-3 bg-gradient-to-r from-[#F3E5F5] to-[#E8F5E9] rounded-xl">
                            <Sparkles size={14} className="text-[#7B1FA2] mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-[#1A1A1A]">AI Tip: You&apos;re ahead of schedule!</p>
                                <p className="text-[10px] text-[#6B7265] mt-0.5">At this pace, you&apos;ll hit your $50,000 goal by mid-March. Consider raising your target to $60,000 for maximum impact.</p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
}
