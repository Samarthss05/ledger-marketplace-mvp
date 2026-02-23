"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Layers, Users, CheckCircle2, X, Package } from "lucide-react";
import StatusBadge from "../../components/status-badge";
import { demandItems, formatCurrency } from "../../lib/mock-data";

export default function ShopDemand() {
    const [showForm, setShowForm] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const myDemand = demandItems.filter((d) =>
        d.participatingShops.some((s) => s.name === "RK Minimart")
    );

    const handleSubmit = () => {
        setSubmitted(true);
        setTimeout(() => { setShowForm(false); setSubmitted(false); }, 1500);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#1A1A1A]">My Demand Requests</h1>
                    <p className="text-sm text-[#6B7265] mt-0.5">Submit product needs and track aggregation progress</p>
                </div>
                <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#4A6741] text-white text-sm font-medium rounded-xl hover:bg-[#3D5A35] transition-colors shadow-sm">
                    <Plus size={14} /> New Demand Request
                </button>
            </motion.div>

            <div className="grid grid-cols-3 gap-4">
                {[
                    { v: myDemand.length, l: "Active Requests", c: "text-[#1A1A1A]" },
                    { v: myDemand.filter(d => d.status === "bidding").length, l: "In Auction", c: "text-[#4A6741]" },
                    { v: formatCurrency(myDemand.reduce((s, d) => s + d.estimatedValue, 0)), l: "Total Value", c: "text-[#1A1A1A]" },
                ].map((s) => (
                    <div key={s.l} className="bg-white rounded-2xl border border-[#E5E5E0] p-4 text-center">
                        <p className={`text-xl font-bold ${s.c}`}>{s.v}</p>
                        <p className="text-xs text-[#9CA38C]">{s.l}</p>
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                {myDemand.map((demand, i) => {
                    const progress = Math.min((demand.totalQuantity / demand.targetQuantity) * 100, 100);
                    const myContrib = demand.participatingShops.find(s => s.name === "RK Minimart");
                    return (
                        <motion.div key={demand.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                            className="bg-white rounded-2xl border border-[#E5E5E0] p-5 hover:shadow-lg hover:shadow-[#4A6741]/5 transition-all">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4A6741] to-[#6B8F71] flex items-center justify-center text-white flex-shrink-0"><Package size={18} /></div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-sm font-bold text-[#1A1A1A]">{demand.productName}</h3>
                                                <StatusBadge status={demand.status} />
                                            </div>
                                            <p className="text-[10px] text-[#9CA38C] mt-0.5">{demand.category} · Delivery by {new Date(demand.deliveryDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-[#6B7265]">Aggregation: {demand.totalQuantity.toLocaleString()} / {demand.targetQuantity.toLocaleString()} units</span>
                                            <span className={`text-xs font-bold ${progress >= 80 ? "text-[#4A6741]" : "text-[#F57F17]"}`}>{progress.toFixed(0)}%</span>
                                        </div>
                                        <div className="h-2 bg-[#F0F0EC] rounded-full overflow-hidden">
                                            <motion.div className={`h-full rounded-full ${progress >= 80 ? "bg-gradient-to-r from-[#4A6741] to-[#6B8F71]" : "bg-gradient-to-r from-[#F57F17] to-[#FFC107]"}`}
                                                initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }} />
                                        </div>
                                    </div>
                                    {myContrib && (
                                        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#4A6741]">
                                            <CheckCircle2 size={10} />
                                            <span>Your order: <strong>{myContrib.quantity} units</strong></span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 lg:flex-col lg:items-end">
                                    <div className="text-center lg:text-right"><p className="text-[10px] text-[#9CA38C]">Est. Value</p><p className="text-sm font-bold text-[#4A6741]">{formatCurrency(demand.estimatedValue)}</p></div>
                                    <div className="text-center lg:text-right"><p className="text-[10px] text-[#9CA38C]">Shops</p><div className="flex items-center gap-1"><Users size={10} className="text-[#9CA38C]" /><p className="text-sm font-bold text-[#1A1A1A]">{demand.participatingShops.length}</p></div></div>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-[#F0F0EC]">
                                <div className="flex flex-wrap gap-1.5">
                                    {demand.participatingShops.map((shop) => (
                                        <span key={shop.name} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] ${shop.name === "RK Minimart" ? "bg-[#E8F5E9] text-[#2E7D32] font-semibold" : "bg-[#F7F7F5] text-[#9CA38C]"}`}>
                                            <span className={`w-1 h-1 rounded-full ${shop.name === "RK Minimart" ? "bg-[#4A6741]" : "bg-[#9CA38C]"}`} />
                                            {shop.name} ({shop.quantity})
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowForm(false)}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        {submitted ? (
                            <div className="text-center py-8">
                                <CheckCircle2 size={48} className="text-[#4A6741] mx-auto mb-3" />
                                <h3 className="text-base font-bold text-[#1A1A1A]">Demand Request Submitted!</h3>
                                <p className="text-xs text-[#9CA38C] mt-1">We&apos;ll notify you when an auction starts.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-start justify-between mb-5">
                                    <div><h3 className="text-base font-bold text-[#1A1A1A]">New Demand Request</h3><p className="text-xs text-[#9CA38C] mt-0.5">Tell us what you need</p></div>
                                    <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-[#F7F7F5]"><X size={16} className="text-[#9CA38C]" /></button>
                                </div>
                                <div className="space-y-4">
                                    <div><label className="text-xs font-medium text-[#1A1A1A] block mb-1.5">Product Name</label><input type="text" placeholder="e.g. Nestle Milo 400G" className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none focus:border-[#4A6741]" /></div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div><label className="text-xs font-medium text-[#1A1A1A] block mb-1.5">Category</label><select className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none"><option>Beverages</option><option>Rice</option><option>Cooking Oil</option><option>Snacks</option></select></div>
                                        <div><label className="text-xs font-medium text-[#1A1A1A] block mb-1.5">Quantity</label><input type="number" placeholder="e.g. 200" className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none focus:border-[#4A6741]" /></div>
                                    </div>
                                    <div><label className="text-xs font-medium text-[#1A1A1A] block mb-1.5">Delivery Date</label><input type="date" className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none focus:border-[#4A6741]" /></div>
                                </div>
                                <div className="flex gap-3 mt-5">
                                    <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-[#E5E5E0] text-sm font-medium text-[#6B7265] rounded-xl hover:bg-[#F7F7F5]">Cancel</button>
                                    <button onClick={handleSubmit} className="flex-1 px-4 py-2.5 bg-[#4A6741] text-white text-sm font-medium rounded-xl hover:bg-[#3D5A35] shadow-sm">Submit</button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
}
