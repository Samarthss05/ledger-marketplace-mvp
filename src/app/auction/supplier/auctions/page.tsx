"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Gavel, Users, Package, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import StatusBadge from "../../components/status-badge";
import { auctions, formatCurrency } from "../../lib/mock-data";

export default function SupplierAuctions() {
    const [search, setSearch] = useState("");
    const [cat, setCat] = useState("all");

    const available = auctions.filter((a) => a.status === "active" || a.status === "pending");
    const categories = ["all", ...new Set(available.map((a) => a.productCategory))];
    const filtered = available.filter((a) => {
        if (cat !== "all" && a.productCategory !== cat) return false;
        if (search && !a.productName.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-xl font-bold text-[#1A1A1A]">Available Auctions</h1>
                <p className="text-sm text-[#6B7265] mt-0.5">Browse and bid on aggregated demand from shops</p>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-[#E5E5E0]">
                    <Search size={16} className="text-[#9CA38C]" />
                    <input type="text" placeholder="Search auctions..." value={search} onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent text-sm text-[#1A1A1A] placeholder:text-[#9CA38C] outline-none w-full" />
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                    <button key={c} onClick={() => setCat(c)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${cat === c ? "bg-[#2C432D] text-white" : "bg-white text-[#6B7265] border border-[#E5E5E0] hover:bg-[#F7F7F5]"}`}>
                        {c === "all" ? "All Categories" : c}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((auction, i) => (
                    <motion.div key={auction.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                        <Link href={`/auction/supplier/auctions/${auction.id}`}>
                            <div className="bg-white rounded-2xl border border-[#E5E5E0] overflow-hidden hover:shadow-xl hover:shadow-[#2C432D]/8 hover:border-[#2C432D]/20 transition-all duration-300 group cursor-pointer">
                                <div className={`h-1 w-full ${auction.status === "active" ? "bg-gradient-to-r from-[#2C432D] to-[#4A6741]" : "bg-[#E5E5E0]"}`} />
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 min-w-0 pr-2">
                                            <h3 className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#2C432D] transition-colors">{auction.productName}</h3>
                                            <p className="text-[10px] text-[#9CA38C] mt-0.5">{auction.productCategory} · {auction.id}</p>
                                        </div>
                                        <StatusBadge status={auction.status} />
                                    </div>

                                    <div className="flex items-center gap-1.5 mb-3"><StatusBadge status={auction.auctionType} /></div>

                                    <div className="grid grid-cols-3 gap-3 mb-4 py-3 border-y border-[#F0F0EC]">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-[10px] text-[#9CA38C] mb-0.5"><Package size={9} /><span>Qty</span></div>
                                            <p className="text-sm font-bold text-[#1A1A1A]">{auction.totalQuantity.toLocaleString()}</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-[10px] text-[#9CA38C] mb-0.5"><Users size={9} /><span>Shops</span></div>
                                            <p className="text-sm font-bold text-[#1A1A1A]">{auction.participatingShops}</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-[10px] text-[#9CA38C] mb-0.5"><Gavel size={9} /><span>Bids</span></div>
                                            <p className="text-sm font-bold text-[#1A1A1A]">{auction.bids.length}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-[10px] text-[#9CA38C] uppercase mb-0.5">Reserve Price</p>
                                            <span className="text-xl font-bold text-[#1A1A1A]">${auction.reservePrice.toLocaleString()}</span>
                                            <span className="text-xs text-[#9CA38C]">/unit</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm font-semibold text-[#2C432D] group-hover:gap-2 transition-all">
                                            Place Bid <ArrowRight size={14} />
                                        </div>
                                    </div>

                                    <p className="text-[10px] text-[#9CA38C] mt-2">Est. value: {formatCurrency(auction.estimatedValue)}</p>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-16">
                    <Search size={32} className="text-[#9CA38C] mx-auto mb-3" />
                    <p className="text-sm font-medium text-[#6B7265]">No auctions found</p>
                </div>
            )}
        </div>
    );
}
