"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, Search, Star, ArrowRight, MessageCircle, Package, Clock,
    DollarSign, Send, TrendingUp, RefreshCcw, ChevronRight, Eye, Sparkles, CheckCircle2,
} from "lucide-react";
import { formatCurrency } from "../../lib/mock-data";
import { products } from "../../lib/products-db";

interface Shop {
    id: string;
    name: string;
    location: string;
    totalOrders: number;
    totalSpent: number;
    lastOrder: string;
    reorderFreq: string;
    rating: number;
    preferredCategories: string[];
    trend: "up" | "down" | "stable";
}

const shops: Shop[] = [
    { id: "sh1", name: "RK Minimart", location: "Makati", totalOrders: 12, totalSpent: 185000, lastOrder: "Feb 18", reorderFreq: "Weekly", rating: 5, preferredCategories: ["Beverages", "Rice"], trend: "up" },
    { id: "sh2", name: "Kedai Muthu", location: "Makati", totalOrders: 8, totalSpent: 120000, lastOrder: "Feb 12", reorderFreq: "Bi-weekly", rating: 4, preferredCategories: ["Beverages", "Snacks"], trend: "stable" },
    { id: "sh3", name: "Lucky Express Mart", location: "BGC", totalOrders: 15, totalSpent: 280000, lastOrder: "Feb 15", reorderFreq: "Weekly", rating: 5, preferredCategories: ["Beverages", "Cooking Oil", "Rice"], trend: "up" },
    { id: "sh4", name: "Ah Kow Store Sari-Sari", location: "Makati", totalOrders: 6, totalSpent: 85000, lastOrder: "Jan 28", reorderFreq: "Monthly", rating: 4, preferredCategories: ["Rice", "Snacks"], trend: "down" },
    { id: "sh5", name: "Golden Mini Mart", location: "BGC", totalOrders: 3, totalSpent: 42000, lastOrder: "Feb 5", reorderFreq: "New customer", rating: 0, preferredCategories: ["Beverages"], trend: "up" },
];

const p_milo = products.find(p => p.name.includes("Milo") && p.name.includes("400G")) || products[0];
const p_rice = products.find(p => p.name.includes("Basmati Rice 1KG")) || products[1];

const directOffers = [
    { id: "do1", type: "outbound_offer", shop: "RK Minimart", product: p_milo.name, regularPrice: p_milo.price, offerPrice: p_milo.cost + 0.15, qty: 200, status: "sent", response: "pending", date: "Feb 20" },
    { id: "do2", type: "outbound_offer", shop: "Lucky Express Mart", product: p_rice.name, regularPrice: p_rice.price, offerPrice: p_rice.cost + 0.10, qty: 100, status: "accepted", response: "accepted", date: "Feb 15" },
    { id: "req1", type: "inbound_restock", shop: "RK Minimart", product: p_milo.name, targetPrice: p_milo.price - 0.05, qty: 50, status: "pending", response: "pending", date: "Today" },
];

const feedbackItems = [
    { shop: "RK Minimart", rating: 5, feedback: "Perfect delivery, on time and great quality. Will order again!", date: "Feb 18", responded: true },
    { shop: "Kedai Muthu", rating: 4, feedback: "Good products but delivery was delayed by half a day.", date: "Feb 12", responded: false },
    { shop: "Lucky Express Mart", rating: 5, feedback: "Best pricing we've seen! Highly recommended supplier.", date: "Feb 10", responded: true },
];

export default function ShopCRMPage() {
    const [search, setSearch] = useState("");
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    const [tab, setTab] = useState<"customers" | "contracts" | "feedback">("customers");
    const [showOffer, setShowOffer] = useState(false);

    const filtered = shops.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#1A1A1A]">Shop CRM</h1>
                    <p className="text-sm text-[#6B7265] mt-0.5">Manage customer relationships, send offers, and track feedback</p>
                </div>
                <div className="flex bg-white border border-[#E5E5E0] rounded-xl overflow-hidden shadow-sm">
                    {(["customers", "contracts", "feedback"] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 text-xs font-bold transition-colors ${tab === t ? "bg-[#2C432D] text-white" : "text-[#6B7265] hover:bg-[#F7F7F5] hover:text-[#1A1A1A]"}`}>
                            {t === "contracts" ? "Contracts & Restocks" : t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { icon: Users, label: "Total Customers", value: shops.length.toString(), sub: "shop accounts", color: "bg-[#4A6741]" },
                    { icon: DollarSign, label: "Lifetime Revenue", value: formatCurrency(shops.reduce((s, sh) => s + sh.totalSpent, 0)), sub: "from all shops", color: "bg-[#2C432D]" },
                    { icon: RefreshCcw, label: "Repeat Rate", value: "76%", sub: "returning customers", color: "bg-[#3B6B9B]" },
                    { icon: Star, label: "Avg Rating", value: "4.6", sub: "from shop reviews", color: "bg-[#B8860B]" },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-white rounded-2xl border border-[#E5E5E0] p-4">
                        <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center text-white mb-2`}><s.icon size={14} /></div>
                        <p className="text-lg font-bold text-[#1A1A1A]">{s.value}</p>
                        <p className="text-[10px] text-[#9CA38C]">{s.sub}</p>
                    </motion.div>
                ))}
            </div>

            {tab === "customers" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="relative"><Search size={14} className="absolute left-3.5 top-2.5 text-[#9CA38C]" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search shops..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E5E0] rounded-xl text-sm outline-none focus:border-[#2C432D]" />
                    </div>
                    {filtered.map((shop, i) => (
                        <motion.div key={shop.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-2xl border border-[#E5E5E0] p-5 hover:shadow-md transition-all cursor-pointer"
                            onClick={() => setSelectedShop(selectedShop?.id === shop.id ? null : shop)}>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4A6741] to-[#6B8F71] flex items-center justify-center text-white text-xs font-bold">{shop.name.charAt(0)}{shop.name.split(" ")[1]?.charAt(0)}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-[#1A1A1A]">{shop.name}</p>
                                        {shop.trend === "up" && <TrendingUp size={10} className="text-[#2E7D32]" />}
                                        {shop.trend === "down" && <TrendingUp size={10} className="text-[#C53030] rotate-180" />}
                                    </div>
                                    <p className="text-[10px] text-[#9CA38C]">{shop.location} · {shop.reorderFreq} · Last order: {shop.lastOrder}</p>
                                </div>
                                <div className="flex items-center gap-4 flex-shrink-0">
                                    <div className="text-center"><p className="text-sm font-bold text-[#1A1A1A]">{shop.totalOrders}</p><p className="text-[9px] text-[#9CA38C]">orders</p></div>
                                    <div className="text-center"><p className="text-sm font-bold text-[#4A6741]">{formatCurrency(shop.totalSpent)}</p><p className="text-[9px] text-[#9CA38C]">lifetime</p></div>
                                    {shop.rating > 0 && (
                                        <div className="flex items-center gap-0.5">
                                            <Star size={10} className="fill-[#B8860B] text-[#B8860B]" />
                                            <span className="text-xs font-bold">{shop.rating}</span>
                                        </div>
                                    )}
                                    <ChevronRight size={14} className="text-[#9CA38C]" />
                                </div>
                            </div>
                            <AnimatePresence>
                                {selectedShop?.id === shop.id && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden">
                                        <div className="mt-4 pt-4 border-t border-[#F0F0EC] grid grid-cols-2 lg:grid-cols-4 gap-3">
                                            <div className="bg-[#F7F7F5] rounded-xl p-3">
                                                <p className="text-[9px] text-[#9CA38C]">Preferred Categories</p>
                                                <div className="flex flex-wrap gap-1 mt-1">{shop.preferredCategories.map(c => <span key={c} className="text-[8px] px-1.5 py-0.5 bg-[#E8F5E9] text-[#4A6741] rounded">{c}</span>)}</div>
                                            </div>
                                            <div className="bg-[#F7F7F5] rounded-xl p-3">
                                                <p className="text-[9px] text-[#9CA38C]">Avg Order Value</p>
                                                <p className="text-sm font-bold text-[#1A1A1A] mt-0.5">{formatCurrency(Math.round(shop.totalSpent / shop.totalOrders))}</p>
                                            </div>
                                            <div className="bg-[#F7F7F5] rounded-xl p-3">
                                                <p className="text-[9px] text-[#9CA38C]">Reorder Frequency</p>
                                                <p className="text-sm font-bold text-[#1A1A1A] mt-0.5">{shop.reorderFreq}</p>
                                            </div>
                                            <div className="bg-[#F7F7F5] rounded-xl p-3 flex items-center justify-center">
                                                <button onClick={(e) => { e.stopPropagation(); setShowOffer(true); }} className="flex items-center gap-1 px-3 py-1.5 bg-[#4A6741] text-white text-[10px] font-bold rounded-lg">
                                                    <Send size={8} /> Send Offer
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {tab === "contracts" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                            <h2 className="text-sm font-bold text-[#1A1A1A]">Contracts & Direct Restocks</h2>
                            <p className="text-[10px] text-[#9CA38C] mt-1 text-balance">View incoming restock requests from shops or send proactive direct offers.</p>
                        </div>
                        <button onClick={() => setShowOffer(true)} className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#2C432D] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#1A2E1B] transition-colors">
                            <Send size={12} /> New Direct Offer
                        </button>
                    </div>

                    {/* Pending Requests Section */}
                    {directOffers.some(o => o.type === "inbound_restock") && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-[#6B7265] uppercase tracking-wide flex items-center gap-2">
                                <Clock size={12} /> Incoming Restock Requests
                            </h3>
                            {directOffers.filter(o => o.type === "inbound_restock").map((req, i) => (
                                <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                    className="bg-white rounded-2xl border-l-[3px] border-l-[#F57F17] border border-[#E5E5E0] p-5 shadow-sm">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-[#FFF8E1] flex items-center justify-center flex-shrink-0">
                                                <RefreshCcw size={18} className="text-[#F57F17]" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-sm font-bold text-[#1A1A1A]">{req.shop}</p>
                                                    <span className="text-[10px] text-[#9CA38C]">• Requesting Restock</span>
                                                </div>
                                                <p className="text-xs text-[#1A1A1A] font-medium">{req.qty}x {req.product}</p>
                                                <div className="flex items-center gap-3 mt-2 text-[10px]">
                                                    <span className="text-[#9CA38C]">Target Price: <strong className="text-[#1A1A1A]">${req.targetPrice}</strong></span>
                                                    <span className="text-[#9CA38C]">Received: {req.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 min-w-[120px]">
                                            <button className="px-4 py-2 bg-[#2C432D] text-white text-[10px] font-bold rounded-lg hover:bg-[#1A2E1B] transition-colors w-full">Accept Order</button>
                                            <button className="px-4 py-2 border border-[#E5E5E0] text-[#6B7265] text-[10px] font-bold rounded-lg hover:bg-[#F7F7F5] transition-colors w-full">Counter Offer</button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Proactive Offers Section */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-[#6B7265] uppercase tracking-wide flex items-center gap-2">
                            <Send size={12} /> Your Outbound Offers
                        </h3>
                        {directOffers.filter(o => o.type === "outbound_offer").map((offer, i) => (
                            <motion.div key={offer.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="bg-white rounded-2xl border border-[#E5E5E0] p-5">
                                <div className="flex items-start sm:items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${offer.response === "accepted" ? "bg-[#E8F5E9]" : "bg-[#F7F7F5]"}`}>
                                        {offer.response === "accepted" ? <CheckCircle2 size={18} className="text-[#2E7D32]" /> : <Send size={18} className="text-[#9CA38C]" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-bold text-[#1A1A1A]">{offer.shop}</p>
                                            <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wide ${offer.response === "accepted" ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#F7F7F5] text-[#9CA38C]"}`}>
                                                {offer.response === "accepted" ? "Accepted" : "Sent"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-[#1A1A1A] font-medium">{offer.qty}x {offer.product}</p>
                                        <div className="flex items-center gap-3 mt-2 text-[10px]">
                                            <span className="text-[#9CA38C] line-through">${offer.regularPrice}</span>
                                            <span className="font-bold text-[#4A6741]">Offered: ${offer.offerPrice}</span>
                                            <span className="text-[#9CA38C]">· {offer.date}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {tab === "feedback" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    {feedbackItems.map((fb, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-2xl border border-[#E5E5E0] p-5">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[#F7F7F5] flex items-center justify-center text-[10px] font-bold text-[#6B7265]">{fb.shop.charAt(0)}</div>
                                    <div><p className="text-xs font-bold text-[#1A1A1A]">{fb.shop}</p><p className="text-[9px] text-[#9CA38C]">{fb.date}</p></div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }, (_, s) => <Star key={s} size={10} className={s < fb.rating ? "fill-[#B8860B] text-[#B8860B]" : "text-[#E5E5E0]"} />)}
                                </div>
                            </div>
                            <p className="text-xs text-[#6B7265] leading-relaxed">{fb.feedback}</p>
                            {fb.responded ? (
                                <p className="mt-2 text-[9px] text-[#4A6741] font-bold flex items-center gap-1"><CheckCircle2 size={8} /> You responded</p>
                            ) : (
                                <button className="mt-2 flex items-center gap-1 text-[10px] font-bold text-[#4A6741] px-3 py-1 border border-[#4A6741]/30 rounded-lg hover:bg-[#E8F5E9]">
                                    <MessageCircle size={8} /> Reply
                                </button>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Send Offer Modal */}
            <AnimatePresence>
                {showOffer && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowOffer(false)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-base font-bold text-[#1A1A1A] mb-4">Send Direct Offer</h3>
                            <div className="space-y-3">
                                <div><label className="text-xs font-medium block mb-1">Shop</label>
                                    <select className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none">
                                        {shops.map(s => <option key={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div><label className="text-xs font-medium block mb-1">Product</label><input type="text" placeholder="e.g. Nestle Milo 400G" className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none focus:border-[#2C432D]" /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="text-xs font-medium block mb-1">Offer Price ($)</label><input type="number" placeholder="140" className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none focus:border-[#2C432D]" /></div>
                                    <div><label className="text-xs font-medium block mb-1">Quantity</label><input type="number" placeholder="200" className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none focus:border-[#2C432D]" /></div>
                                </div>
                                <div><label className="text-xs font-medium block mb-1">Message</label><textarea placeholder="Exclusive pricing for your next order..." rows={2} className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none resize-none focus:border-[#2C432D]" /></div>
                            </div>
                            <div className="flex gap-3 mt-5">
                                <button onClick={() => setShowOffer(false)} className="flex-1 px-4 py-2.5 border border-[#E5E5E0] text-sm font-medium text-[#6B7265] rounded-xl">Cancel</button>
                                <button onClick={() => setShowOffer(false)} className="flex-1 px-4 py-2.5 bg-[#2C432D] text-white text-sm font-medium rounded-xl flex items-center justify-center gap-1"><Send size={12} /> Send</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
