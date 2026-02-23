"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Wallet, TrendingUp, DollarSign, FileText, Clock, CheckCircle2,
    ArrowRight, AlertTriangle, Zap, BarChart3, Calendar, Download,
    CreditCard, Sparkles, Brain,
} from "lucide-react";
import { formatCurrency } from "../../lib/mock-data";
import { products } from "../../lib/products-db";

const revenueData = [
    { month: "Aug", actual: 180000 },
    { month: "Sep", actual: 245000 },
    { month: "Oct", actual: 210000 },
    { month: "Nov", actual: 320000 },
    { month: "Dec", actual: 290000 },
    { month: "Jan", actual: 380000 },
    { month: "Feb", predicted: 420000 },
    { month: "Mar", predicted: 450000 },
];

const p_milo = products.find(p => p.name.includes("Milo") && p.name.includes("400G")) || products[0];
const p_rice = products.find(p => p.name.includes("Basmati Rice 1KG")) || products[1];
const p_oyster = products.find(p => p.name.includes("Oyster Sauce 770G")) || products[2];
const p_indomie = products.find(p => p.name.includes("Mi Goreng") && !p.name.includes("Carton")) || products[3];

const margins = [
    { auction: p_milo.name, revenue: 148000, cogs: 110000, delivery: 8000, fee: 4440, netMargin: 17.3 },
    { auction: p_rice.name, revenue: 95000, cogs: 72000, delivery: 5000, fee: 2850, netMargin: 15.9 },
    { auction: p_oyster.name, revenue: 57000, cogs: 42000, delivery: 3500, fee: 1710, netMargin: 17.2 },
    { auction: p_indomie.name, revenue: 140400, cogs: 108000, delivery: 7200, fee: 4212, netMargin: 15.0 },
];

const invoices = [
    { id: "INV-2024-042", shop: "RK Minimart", amount: 29600, status: "paid", date: "Feb 10", paidDate: "Feb 15" },
    { id: "INV-2024-043", shop: "Kedai Muthu", amount: 18500, status: "pending", date: "Feb 15", dueDate: "Mar 15" },
    { id: "INV-2024-044", shop: "Lucky Express Mart", amount: 42000, status: "overdue", date: "Jan 28", dueDate: "Feb 28" },
    { id: "INV-2024-045", shop: "Ah Kow Store Sari-Sari", amount: 14800, status: "pending", date: "Feb 18", dueDate: "Mar 18" },
];

export default function SupplierFinancePage() {
    const [tab, setTab] = useState<"revenue" | "margins" | "invoices" | "early">("revenue");
    const maxRev = Math.max(...revenueData.map(d => d.actual || d.predicted || 0));
    const totalOutstanding = invoices.filter(i => i.status !== "paid").reduce((s, i) => s + i.amount, 0);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#1A1A1A]">Finance & Revenue</h1>
                    <p className="text-sm text-[#6B7265] mt-0.5">Revenue forecasts, margin analysis, invoices, and cash flow</p>
                </div>
                <div className="flex bg-white border border-[#E5E5E0] rounded-xl overflow-hidden">
                    {(["revenue", "margins", "invoices", "early"] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)} className={`px-3 py-2 text-xs font-medium ${tab === t ? "bg-[#2C432D] text-white" : "text-[#6B7265]"}`}>
                            {t === "revenue" ? "Revenue" : t === "margins" ? "Margins" : t === "invoices" ? "Invoices" : "Early Pay"}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { icon: DollarSign, label: "Total Revenue", value: formatCurrency(1625000), sub: "last 6 months", color: "bg-[#2C432D]" },
                    { icon: TrendingUp, label: "Projected Next Month", value: formatCurrency(450000), sub: "+22% growth", color: "bg-[#4A6741]" },
                    { icon: FileText, label: "Outstanding", value: formatCurrency(totalOutstanding), sub: `${invoices.filter(i => i.status !== "paid").length} invoices`, color: "bg-[#3B6B9B]" },
                    { icon: AlertTriangle, label: "Overdue", value: formatCurrency(invoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.amount, 0)), sub: `${invoices.filter(i => i.status === "overdue").length} invoice(s)`, color: "bg-[#C53030]" },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-white rounded-2xl border border-[#E5E5E0] p-4">
                        <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center text-white mb-2`}><s.icon size={14} /></div>
                        <p className="text-lg font-bold text-[#1A1A1A]">{s.value}</p>
                        <p className="text-[10px] text-[#9CA38C]">{s.sub}</p>
                    </motion.div>
                ))}
            </div>

            {tab === "revenue" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-white rounded-2xl border border-[#E5E5E0] p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={14} className="text-[#4A6741]" />
                        <h2 className="text-sm font-bold text-[#1A1A1A]">Revenue Forecast</h2>
                        <span className="px-1.5 py-0.5 bg-[#F3E5F5] text-[#7B1FA2] text-[8px] font-bold rounded">AI</span>
                    </div>
                    <div className="flex items-end gap-3 h-48">
                        {revenueData.map((item, i) => {
                            const val = item.actual || item.predicted || 0;
                            const isPredicted = !!item.predicted;
                            return (
                                <div key={item.month} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end group">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#1A1A1A] text-white text-[8px] px-1.5 py-0.5 rounded whitespace-nowrap">
                                        {formatCurrency(val)} {isPredicted ? "(AI)" : ""}
                                    </div>
                                    <motion.div className={`w-full rounded-t ${isPredicted ? "bg-gradient-to-t from-[#7B1FA2]/30 to-[#CE93D8]/30 border-2 border-dashed border-[#7B1FA2]/40" : "bg-gradient-to-t from-[#2C432D] to-[#4A6741]"}`}
                                        initial={{ height: 0 }} animate={{ height: `${(val / maxRev) * 100}%` }}
                                        transition={{ duration: 0.5, delay: i * 0.05 }} />
                                    <span className={`text-[9px] mt-1 ${isPredicted ? "text-[#7B1FA2] font-bold" : "text-[#9CA38C]"}`}>{item.month}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-3 pt-3 border-t border-[#F0F0EC] flex items-center gap-4 text-[9px] text-[#9CA38C]">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#4A6741]" />Actual</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded border-2 border-dashed border-[#7B1FA2]/40" />AI Predicted</span>
                    </div>
                </motion.div>
            )}

            {tab === "margins" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-white rounded-2xl border border-[#E5E5E0] overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#E5E5E0]"><h2 className="text-sm font-bold text-[#1A1A1A]">Margin Calculator</h2></div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="bg-[#F7F7F5]">
                                <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#9CA38C] uppercase">Auction</th>
                                <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#9CA38C] uppercase">Revenue</th>
                                <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#9CA38C] uppercase">COGS</th>
                                <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#9CA38C] uppercase">Delivery</th>
                                <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#9CA38C] uppercase">Fee (3%)</th>
                                <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#9CA38C] uppercase">Net Margin</th>
                            </tr></thead>
                            <tbody>
                                {margins.map(m => (
                                    <tr key={m.auction} className="border-b border-[#F0F0EC] hover:bg-[#F7F7F5]">
                                        <td className="px-5 py-3 text-xs font-bold text-[#1A1A1A]">{m.auction}</td>
                                        <td className="px-5 py-3 text-xs text-[#1A1A1A]">{formatCurrency(m.revenue)}</td>
                                        <td className="px-5 py-3 text-xs text-[#C53030]">-{formatCurrency(m.cogs)}</td>
                                        <td className="px-5 py-3 text-xs text-[#C53030]">-{formatCurrency(m.delivery)}</td>
                                        <td className="px-5 py-3 text-xs text-[#C53030]">-{formatCurrency(m.fee)}</td>
                                        <td className="px-5 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded ${m.netMargin >= 15 ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#FFF8E1] text-[#F57F17]"}`}>{m.netMargin}%</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {tab === "invoices" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    {invoices.map((inv, i) => (
                        <motion.div key={inv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-2xl border border-[#E5E5E0] p-5 hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${inv.status === "paid" ? "bg-[#E8F5E9]" : inv.status === "overdue" ? "bg-[#FFEBEE]" : "bg-[#E3F2FD]"
                                    }`}>
                                    {inv.status === "paid" ? <CheckCircle2 size={18} className="text-[#2E7D32]" /> : inv.status === "overdue" ? <AlertTriangle size={18} className="text-[#C62828]" /> : <FileText size={18} className="text-[#1565C0]" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2"><p className="text-sm font-bold text-[#1A1A1A]">{inv.id}</p>
                                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${inv.status === "paid" ? "bg-[#E8F5E9] text-[#2E7D32]" : inv.status === "overdue" ? "bg-[#FFEBEE] text-[#C62828]" : "bg-[#E3F2FD] text-[#1565C0]"}`}>{inv.status.toUpperCase()}</span>
                                    </div>
                                    <p className="text-[10px] text-[#9CA38C]">{inv.shop} · Issued: {inv.date} · {inv.status === "paid" ? `Paid: ${inv.paidDate}` : `Due: ${inv.dueDate}`}</p>
                                </div>
                                <p className="text-sm font-bold text-[#1A1A1A]">{formatCurrency(inv.amount)}</p>
                                <button className="px-3 py-1.5 border border-[#E5E5E0] text-xs font-medium text-[#6B7265] rounded-lg hover:bg-[#F7F7F5]"><Download size={10} /></button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {tab === "early" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="bg-gradient-to-br from-[#2C432D] to-[#4A6741] rounded-2xl p-6 text-white">
                        <div className="flex items-center gap-2 mb-3"><Zap size={16} /><h2 className="text-sm font-bold">Early Payment Accelerator</h2></div>
                        <p className="text-xs text-white/70 mb-4">Get paid in 3 days instead of 30 for a small 2% fee. Improve your cash flow instantly.</p>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-white/10 rounded-xl p-3"><p className="text-[10px] text-white/60">Eligible Amount</p><p className="text-xl font-bold">{formatCurrency(totalOutstanding)}</p></div>
                            <div className="bg-white/10 rounded-xl p-3"><p className="text-[10px] text-white/60">Fee (2%)</p><p className="text-xl font-bold">{formatCurrency(totalOutstanding * 0.02)}</p></div>
                        </div>
                        <button className="w-full py-3 bg-white text-[#2C432D] text-sm font-bold rounded-xl hover:bg-white/90 flex items-center justify-center gap-2">
                            <Zap size={14} /> Request Early Payment
                        </button>
                    </div>
                    <div className="bg-white rounded-2xl border border-[#E5E5E0] p-5">
                        <h3 className="text-sm font-bold text-[#1A1A1A] mb-3">How It Works</h3>
                        <div className="space-y-3">
                            {[
                                { step: "1", title: "Select invoices", desc: "Choose which pending invoices you want early" },
                                { step: "2", title: "Accept 2% fee", desc: "Small fee deducted from payment amount" },
                                { step: "3", title: "Get paid in 3 days", desc: "Funds transferred to your bank account" },
                            ].map(s => (
                                <div key={s.step} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center text-xs font-bold text-[#4A6741]">{s.step}</div>
                                    <div><p className="text-xs font-bold text-[#1A1A1A]">{s.title}</p><p className="text-[10px] text-[#9CA38C]">{s.desc}</p></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
