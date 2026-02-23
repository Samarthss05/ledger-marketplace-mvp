"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Clock, CheckCircle2, Truck, Package, RefreshCcw, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import StatusBadge from "../../components/status-badge";
import { orders, formatCurrency } from "../../lib/mock-data";

type StatusFilter = "all" | "pending" | "confirmed" | "shipped" | "delivered";

const statusSteps = ["pending", "confirmed", "shipped", "delivered"];

export default function ShopOrders() {
    const [filter, setFilter] = useState<StatusFilter>("all");
    const [expandedOrd, setExpandedOrd] = useState<string | null>(null);
    const myOrders = orders.filter((o) => o.shopName === "RK Minimart");
    const filtered = filter === "all" ? myOrders : myOrders.filter((o) => o.status === filter);

    const stepIcons: Record<string, React.ReactNode> = {
        pending: <Clock size={14} className="text-[#E65100]" />,
        confirmed: <CheckCircle2 size={14} className="text-[#1565C0]" />,
        shipped: <Truck size={14} className="text-[#7B1FA2]" />,
        delivered: <Package size={14} className="text-[#2E7D32]" />,
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-xl font-bold text-[#1A1A1A]">My Orders</h1>
                <p className="text-sm text-[#6B7265] mt-0.5">Track deliveries and reorder from previous auctions</p>
            </motion.div>

            {/* Pipeline */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="bg-white rounded-2xl border border-[#E5E5E0] p-5">
                <div className="flex items-center justify-between gap-2">
                    {statusSteps.map((step, i) => {
                        const count = myOrders.filter(o => o.status === step).length;
                        return (
                            <div key={step} className="flex items-center gap-2 flex-1">
                                <div className="flex-1 text-center">
                                    <div className="w-10 h-10 rounded-xl mx-auto mb-1.5 flex items-center justify-center text-base font-bold bg-[#F7F7F5]">
                                        {count}
                                    </div>
                                    <p className="text-[10px] font-medium text-[#6B7265] capitalize">{step}</p>
                                </div>
                                {i < statusSteps.length - 1 && <ArrowRight size={12} className="text-[#E5E5E0] flex-shrink-0 mb-4" />}
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {(["all", ...statusSteps] as StatusFilter[]).map((s) => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === s ? "bg-[#1A1A1A] text-white" : "bg-white text-[#9CA38C] border border-[#E5E5E0]"}`}>
                        {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)} ({s === "all" ? myOrders.length : myOrders.filter(o => o.status === s).length})
                    </button>
                ))}
            </div>

            {/* Order Cards */}
            <div className="space-y-3">
                {filtered.map((order, i) => {
                    const currentStep = statusSteps.indexOf(order.status);
                    return (
                        <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
                            className="bg-white rounded-2xl border border-[#E5E5E0] p-5 hover:shadow-md transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-[#F2F5F0] flex items-center justify-center flex-shrink-0">
                                        {stepIcons[order.status]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-[#1A1A1A] truncate">{order.productName}</p>
                                            <StatusBadge status={order.status} />
                                        </div>
                                        <p className="text-[10px] text-[#9CA38C] mt-0.5">{order.supplierName} · {order.quantity} units · {order.id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-[#1A1A1A]">{formatCurrency(order.totalPrice)}</p>
                                        <p className="text-[10px] text-[#9CA38C]">${order.unitPrice}/unit</p>
                                    </div>
                                    {order.status === "delivered" && (
                                        <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#4A6741] border border-[#4A6741]/30 rounded-lg hover:bg-[#E8F5E9] transition-colors">
                                            <RefreshCcw size={10} /> Reorder
                                        </button>
                                    )}
                                </div>
                            </div>
                            {/* Progress steps */}
                            <div
                                className="mt-3 pt-3 border-t border-[#F0F0EC] cursor-pointer group"
                                onClick={() => setExpandedOrd(expandedOrd === order.id ? null : order.id)}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-[#1A1A1A] group-hover:text-[#4A6741] transition-colors">
                                        {expandedOrd === order.id ? "Hide Timeline" : "View Timeline"}
                                    </span>
                                    {expandedOrd === order.id ? <ChevronUp size={12} className="text-[#9CA38C]" /> : <ChevronDown size={12} className="text-[#9CA38C]" />}
                                </div>
                                {expandedOrd !== order.id ? (
                                    <>
                                        <div className="flex items-center gap-1">
                                            {statusSteps.map((step, si) => (
                                                <div key={step} className="flex items-center gap-1 flex-1">
                                                    <div className={`w-2 h-2 rounded-full ${si <= currentStep ? "bg-[#4A6741]" : "bg-[#E5E5E0]"}`} />
                                                    {si < statusSteps.length - 1 && <div className={`flex-1 h-0.5 ${si < currentStep ? "bg-[#4A6741]" : "bg-[#E5E5E0]"}`} />}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            {statusSteps.map((step) => (
                                                <span key={step} className="text-[8px] text-[#9CA38C] capitalize">{step}</span>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="py-2 pl-2">
                                        <div className="relative border-l border-[#E5E5E0] space-y-4">
                                            {statusSteps.map((step, si) => {
                                                const isCompleted = si <= currentStep;
                                                const isCurrent = si === currentStep;

                                                // Generate mock dates for the timeline based on the order's delivery date
                                                const deliveryDate = new Date(order.deliveryDate);
                                                const stepDate = new Date(deliveryDate);
                                                stepDate.setDate(deliveryDate.getDate() - (statusSteps.length - 1 - si) * 2);
                                                const dateStr = stepDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                                const timeStr = "09:00 AM"; // Mock time

                                                return (
                                                    <div key={step} className="relative pl-6">
                                                        <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${isCompleted ? "bg-[#4A6741]" : "bg-[#E5E5E0]"}`} />
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                            <div>
                                                                <p className={`text-xs font-bold capitalize ${isCompleted ? "text-[#1A1A1A]" : "text-[#9CA38C]"}`}>
                                                                    Order {step}
                                                                </p>
                                                                {isCompleted && (
                                                                    <p className="text-[10px] text-[#6B7265] mt-0.5">
                                                                        {step === "pending" ? "Order submitted to supplier" :
                                                                            step === "confirmed" ? "Supplier has accepted the order" :
                                                                                step === "shipped" ? "Order is out for delivery" :
                                                                                    "Order has been delivered"}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            {isCompleted && (
                                                                <div className="text-left sm:text-right">
                                                                    <p className="text-[10px] font-medium text-[#1A1A1A]">{dateStr}</p>
                                                                    <p className="text-[9px] text-[#9CA38C]">{timeStr}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-12">
                    <Package size={32} className="text-[#9CA38C] mx-auto mb-2" />
                    <p className="text-sm text-[#6B7265]">No orders found</p>
                </div>
            )}
        </div>
    );
}
