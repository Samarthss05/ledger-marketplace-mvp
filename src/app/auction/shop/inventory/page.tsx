"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Package, AlertTriangle, CheckCircle2, TrendingDown, RefreshCcw,
    Plus, Bell, Brain, Sparkles, Clock, Settings, BarChart3,
} from "lucide-react";
import { formatCurrency } from "../../lib/mock-data";
import { products } from "../../lib/products-db";

interface StockItem {
    id: string;
    name: string;
    category: string;
    currentStock: number;
    maxStock: number;
    unit: string;
    status: "healthy" | "low" | "critical" | "overstock";
    consumptionRate: number;
    daysLeft: number;
    autoReorder: boolean;
    reorderThreshold: number;
    reorderQty: number;
    lastOrdered: string;
}

const inventory: StockItem[] = products.slice(0, 30).map((p, i) => {
    const isCritical = i % 7 === 0;
    const isLow = i % 5 === 0 && !isCritical;
    const isOverstock = i % 11 === 0;

    let status: "critical" | "low" | "healthy" | "overstock" = "healthy";
    if (isCritical) status = "critical";
    else if (isLow) status = "low";
    else if (isOverstock) status = "overstock";

    const maxStock = 50 + (i * 10 % 200);
    let currentStock = maxStock * 0.7;
    if (status === "critical") currentStock = maxStock * 0.1;
    if (status === "low") currentStock = maxStock * 0.25;
    if (status === "overstock") currentStock = maxStock * 1.5;

    const consumptionRate = 2 + (i % 8);

    return {
        id: `s${i}`,
        name: p.name,
        category: p.category,
        currentStock: Math.round(currentStock),
        maxStock,
        unit: p.category && p.category.includes("Beverage") ? "cans" : "packs",
        status,
        consumptionRate,
        daysLeft: Math.round(currentStock / consumptionRate),
        autoReorder: i % 3 === 0,
        reorderThreshold: Math.round(maxStock * 0.3),
        reorderQty: Math.round(maxStock * 0.6),
        lastOrdered: `Feb ${20 - (i % 15)}`,
    };
});

export default function InventoryPage() {
    const [items, setItems] = useState(inventory);
    const [filter, setFilter] = useState<"all" | "critical" | "low" | "healthy" | "overstock">("all");

    const filtered = filter === "all" ? items : items.filter(i => i.status === filter);
    const critical = items.filter(i => i.status === "critical").length;
    const low = items.filter(i => i.status === "low").length;
    const autoReorderCount = items.filter(i => i.autoReorder).length;

    const statusConfig = {
        healthy: { color: "bg-[#E8F5E9] text-[#2E7D32]", bar: "bg-[#4A6741]", icon: CheckCircle2 },
        low: { color: "bg-[#FFF8E1] text-[#F57F17]", bar: "bg-[#F57F17]", icon: Clock },
        critical: { color: "bg-[#FFEBEE] text-[#C62828]", bar: "bg-[#C62828]", icon: AlertTriangle },
        overstock: { color: "bg-[#E3F2FD] text-[#1565C0]", bar: "bg-[#1565C0]", icon: Package },
    };

    const toggleAutoReorder = (id: string) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, autoReorder: !i.autoReorder } : i));
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#1A1A1A]">Inventory & Auto-Reorder</h1>
                    <p className="text-sm text-[#6B7265] mt-0.5">Track stock levels and set smart reorder rules</p>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { icon: AlertTriangle, label: "Critical Stock", value: critical.toString(), sub: "needs immediate reorder", color: "bg-[#C53030]" },
                    { icon: Clock, label: "Low Stock", value: low.toString(), sub: "running low soon", color: "bg-[#F57F17]" },
                    { icon: RefreshCcw, label: "Auto-Reorder Active", value: autoReorderCount.toString(), sub: "items with rules set", color: "bg-[#4A6741]" },
                    { icon: Package, label: "Total SKUs", value: items.length.toString(), sub: "tracked items", color: "bg-[#3B6B9B]" },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-white rounded-2xl border border-[#E5E5E0] p-4">
                        <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center text-white mb-2`}><s.icon size={14} /></div>
                        <p className="text-lg font-bold text-[#1A1A1A]">{s.value}</p>
                        <p className="text-[10px] text-[#9CA38C]">{s.sub}</p>
                    </motion.div>
                ))}
            </div>

            {/* AI Alert */}
            {critical > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="flex items-start gap-3 p-4 bg-gradient-to-r from-[#FFEBEE] to-[#FFF3E0] rounded-2xl border border-[#C62828]/10">
                    <Brain size={16} className="text-[#C62828] mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-[#1A1A1A]">⚠️ AI Alert: {critical} items critically low</p>
                        <p className="text-xs text-[#6B7265] mt-0.5">Auto-reorder has been triggered for items with active rules. Manual action required for others.</p>
                    </div>
                </motion.div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {(["all", "critical", "low", "healthy", "overstock"] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${filter === f ? "bg-[#1A1A1A] text-white" : "bg-white text-[#6B7265] border border-[#E5E5E0]"}`}>
                        {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)} ({f === "all" ? items.length : items.filter(i => i.status === f).length})
                    </button>
                ))}
            </div>

            {/* Inventory Cards */}
            <div className="space-y-3">
                {filtered.map((item, i) => {
                    const { color, bar, icon: StatusIcon } = statusConfig[item.status];
                    const fillPct = Math.min((item.currentStock / item.maxStock) * 100, 100);
                    return (
                        <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
                            className="bg-white rounded-2xl border border-[#E5E5E0] p-5 hover:shadow-md transition-all">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={`w-10 h-10 rounded-xl ${color.split(" ")[0]} flex items-center justify-center flex-shrink-0`}>
                                        <StatusIcon size={16} className={color.split(" ")[1]} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-[#1A1A1A]">{item.name}</p>
                                            <span className={`text-[8px] px-1.5 py-0.5 ${color} rounded font-bold uppercase`}>{item.status}</span>
                                        </div>
                                        <p className="text-[10px] text-[#9CA38C]">{item.category} · Last ordered: {item.lastOrdered}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 flex-shrink-0">
                                    <div className="w-32">
                                        <div className="flex justify-between text-[10px] text-[#9CA38C] mb-1">
                                            <span>{item.currentStock} {item.unit}</span>
                                            <span>/{item.maxStock}</span>
                                        </div>
                                        <div className="h-2 bg-[#F0F0EC] rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${bar}`} style={{ width: `${fillPct}%` }} />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-sm font-bold ${item.daysLeft <= 5 ? "text-[#C62828]" : "text-[#1A1A1A]"}`}>{item.daysLeft}d</p>
                                        <p className="text-[9px] text-[#9CA38C]">days left</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-bold text-[#1A1A1A]">{item.consumptionRate}/{item.unit.slice(0, -1)}</p>
                                        <p className="text-[9px] text-[#9CA38C]">per day</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] text-[#9CA38C]">Auto</span>
                                        <button onClick={() => toggleAutoReorder(item.id)}
                                            className={`w-9 h-5 rounded-full transition-colors relative ${item.autoReorder ? "bg-[#4A6741]" : "bg-[#E5E5E0]"}`}>
                                            <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-transform shadow-sm ${item.autoReorder ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {item.autoReorder && (
                                <div className="mt-3 pt-3 border-t border-[#F0F0EC] flex items-center gap-4 text-[10px] text-[#9CA38C]">
                                    <Sparkles size={10} className="text-[#4A6741]" />
                                    <span>Auto-reorder when below <strong className="text-[#1A1A1A]">{item.reorderThreshold} {item.unit}</strong></span>
                                    <span>·</span>
                                    <span>Order <strong className="text-[#1A1A1A]">{item.reorderQty} {item.unit}</strong> via best auction</span>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
