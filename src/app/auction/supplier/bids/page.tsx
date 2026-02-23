"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Gavel, Trophy, XCircle, Clock, DollarSign } from "lucide-react";
import StatusBadge from "../../components/status-badge";
import { auctions, formatCurrency } from "../../lib/mock-data";

type Tab = "active" | "won" | "lost";

export default function SupplierBids() {
    const [tab, setTab] = useState<Tab>("active");
    const allBids = auctions.flatMap((a) => a.bids.filter((b) => b.supplierId === "SUP-001").map((b) => ({ ...b, auction: a })));
    const activeBids = allBids.filter((b) => b.status === "active");
    const wonBids = allBids.filter((b) => b.status === "won");
    const lostBids = allBids.filter((b) => b.status === "lost");

    const display = tab === "active" ? activeBids : tab === "won" ? wonBids : lostBids;
    const tabIcon = { active: Clock, won: Trophy, lost: XCircle };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-xl font-bold text-[#1A1A1A]">My Bids</h1>
                <p className="text-sm text-[#6B7265] mt-0.5">Track all your auction bids and outcomes</p>
            </motion.div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Active", count: activeBids.length, icon: Clock, color: "text-[#1565C0]", bg: "bg-[#E3F2FD]" },
                    { label: "Won", count: wonBids.length, icon: Trophy, color: "text-[#2E7D32]", bg: "bg-[#E8F5E9]" },
                    { label: "Lost", count: lostBids.length, icon: XCircle, color: "text-[#C62828]", bg: "bg-[#FFEBEE]" },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-white rounded-2xl border border-[#E5E5E0] p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                            <s.icon size={16} className={s.color} />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-[#1A1A1A]">{s.count}</p>
                            <p className="text-xs text-[#9CA38C]">{s.label} Bids</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                {(["active", "won", "lost"] as Tab[]).map((t) => {
                    const Icon = tabIcon[t];
                    return (
                        <button key={t} onClick={() => setTab(t)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t ? "bg-[#2C432D] text-white" : "bg-white text-[#6B7265] border border-[#E5E5E0]"}`}>
                            <Icon size={14} />
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    );
                })}
            </div>

            {/* Bid Cards */}
            <div className="space-y-3">
                {display.map((bid, i) => (
                    <motion.div key={bid.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
                        className="bg-white rounded-2xl border border-[#E5E5E0] p-5 hover:shadow-md transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bid.status === "won" ? "bg-[#E8F5E9]" : bid.status === "lost" ? "bg-[#FFEBEE]" : "bg-[#E3F2FD]"
                                    }`}>
                                    <Gavel size={16} className={bid.status === "won" ? "text-[#2E7D32]" : bid.status === "lost" ? "text-[#C62828]" : "text-[#1565C0]"} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-[#1A1A1A] truncate">{bid.auction.productName}</p>
                                        <StatusBadge status={bid.status} />
                                    </div>
                                    <p className="text-[10px] text-[#9CA38C] mt-0.5">
                                        {bid.auction.totalQuantity.toLocaleString()} units · {bid.auction.participatingShops} shops · {bid.auction.auctionType}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <p className="text-[10px] text-[#9CA38C]">Your Bid</p>
                                    <p className="text-sm font-bold text-[#1A1A1A]">${bid.pricePerUnit}/unit</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-[#9CA38C]">Total Value</p>
                                    <p className="text-sm font-bold text-[#2C432D]">{formatCurrency(bid.totalPrice)}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-[#9CA38C]">Terms</p>
                                    <p className="text-xs font-medium text-[#1A1A1A]">{bid.paymentTerms}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {display.length === 0 && (
                <div className="text-center py-12">
                    <Gavel size={32} className="text-[#9CA38C] mx-auto mb-2" />
                    <p className="text-sm text-[#6B7265]">No {tab} bids</p>
                </div>
            )}
        </div>
    );
}
