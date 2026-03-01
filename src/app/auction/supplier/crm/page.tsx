"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText, Search, Star, ArrowRight, MessageCircle, Package, Clock, Shield,
    DollarSign, Send, TrendingUp, RefreshCcw, ChevronRight, Eye, Sparkles, CheckCircle2,
    AlertTriangle, Timer, ShoppingBag, Zap, Lock, X,
} from "lucide-react";
import { formatCurrency } from "../../lib/mock-data";
import { products } from "../../lib/products-db";

// Anonymized RFQ data — shops are identified by region code only
interface RFQ {
    id: string;
    regionCode: string;
    product: string;
    category: string;
    quantity: number;
    unit: string;
    targetPrice: number;
    marketPrice: number;
    urgency: "standard" | "urgent" | "critical";
    receivedAt: string;
    expiresIn: string;
    status: "open" | "quoted" | "won" | "lost" | "expired";
    yourQuote?: number;
    competingQuotes: number;
}

const p_sprite = products.find(p => p.name.includes("Sprite") && p.name.includes("1.5L")) || products[0];
const p_milo = products.find(p => p.name.includes("Milo") && p.name.includes("2KG")) || products[1];
const p_indomie = products.find(p => p.name.includes("Mi Goreng") && p.name.includes("Carton")) || products[2];
const p_rice = products.find(p => p.name.includes("Basmati Rice 1KG")) || products[3];
const p_maggi = products.find(p => p.name.includes("Maggi")) || products[4];
const p_coke = products.find(p => p.name.includes("Coca-Cola")) || products[5];

const rfqs: RFQ[] = [
    { id: "RFQ-4821", regionCode: "Central", product: p_sprite.name, category: "Beverages", quantity: 50, unit: "Cartons", targetPrice: p_sprite.price * 0.9, marketPrice: p_sprite.price, urgency: "urgent", receivedAt: "2h ago", expiresIn: "4h left", status: "open", competingQuotes: 2 },
    { id: "RFQ-4819", regionCode: "East", product: p_milo.name, category: "Beverages", quantity: 100, unit: "Packs", targetPrice: p_milo.price * 0.88, marketPrice: p_milo.price, urgency: "standard", receivedAt: "5h ago", expiresIn: "19h left", status: "open", competingQuotes: 1 },
    { id: "RFQ-4815", regionCode: "Central", product: p_indomie.name, category: "Instant Noodles", quantity: 200, unit: "Cartons", targetPrice: p_indomie.price * 0.92, marketPrice: p_indomie.price, urgency: "critical", receivedAt: "30m ago", expiresIn: "1h left", status: "open", competingQuotes: 0 },
    { id: "RFQ-4810", regionCode: "West", product: p_rice.name, category: "Rice & Grains", quantity: 300, unit: "Bags", targetPrice: p_rice.price * 0.95, marketPrice: p_rice.price, urgency: "standard", receivedAt: "1d ago", expiresIn: "23h left", status: "quoted", yourQuote: p_rice.price * 0.93, competingQuotes: 3 },
    { id: "RFQ-4802", regionCode: "North", product: p_maggi.name, category: "Sauces & Condiments", quantity: 150, unit: "Units", targetPrice: p_maggi.price * 0.9, marketPrice: p_maggi.price, urgency: "standard", receivedAt: "2d ago", expiresIn: "Closed", status: "won", yourQuote: p_maggi.price * 0.91, competingQuotes: 4 },
    { id: "RFQ-4798", regionCode: "East", product: p_coke.name, category: "Beverages", quantity: 80, unit: "Cartons", targetPrice: p_coke.price * 0.88, marketPrice: p_coke.price, urgency: "urgent", receivedAt: "3d ago", expiresIn: "Closed", status: "lost", yourQuote: p_coke.price * 0.92, competingQuotes: 5 },
];

const feedbackItems = [
    { rfqId: "RFQ-4790", rating: 5, feedback: "Fast delivery and fair pricing. Order fulfilled perfectly.", date: "Feb 18", responded: true },
    { rfqId: "RFQ-4775", rating: 4, feedback: "Good quality products. Delivery was half a day late.", date: "Feb 12", responded: false },
    { rfqId: "RFQ-4760", rating: 5, feedback: "Excellent supplier — competitive pricing and reliable.", date: "Feb 10", responded: true },
];

export default function SupplierRFQCenter() {
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState<"rfqs" | "history" | "feedback">("rfqs");
    const [statusFilter, setStatusFilter] = useState<"all" | "open" | "quoted" | "won" | "lost">("all");
    const [quoteModal, setQuoteModal] = useState<RFQ | null>(null);

    const filtered = rfqs.filter(r => {
        const matchesSearch = r.product.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || r.status === statusFilter;
        const matchesTab = tab === "rfqs" ? (r.status === "open" || r.status === "quoted") : (r.status === "won" || r.status === "lost" || r.status === "expired");
        return matchesSearch && (tab === "feedback" || matchesStatus === true) && (tab === "feedback" || matchesTab);
    });

    const openCount = rfqs.filter(r => r.status === "open").length;
    const quotedCount = rfqs.filter(r => r.status === "quoted").length;
    const wonCount = rfqs.filter(r => r.status === "won").length;
    const avgWinRate = rfqs.filter(r => r.status === "won" || r.status === "lost").length > 0
        ? Math.round(wonCount / rfqs.filter(r => r.status === "won" || r.status === "lost").length * 100) : 0;

    const urgencyConfig = {
        standard: { color: "text-[#6B7265]", bg: "bg-[#F7F7F5]", border: "border-[#E5E5E0]", label: "Standard", icon: Clock },
        urgent: { color: "text-[#F57F17]", bg: "bg-[#FFF8E1]", border: "border-[#F57F17]/20", label: "Urgent", icon: Timer },
        critical: { color: "text-[#C53030]", bg: "bg-[#FFF5F5]", border: "border-[#C53030]/20", label: "Critical", icon: AlertTriangle },
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-xl font-bold text-[#1A1A1A]">RFQ Response Center</h1>
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-[#F2F5F0] rounded-full border border-[#E5E5E0]">
                            <Shield size={10} className="text-[#4A6741]" />
                            <span className="text-[8px] font-bold text-[#4A6741] uppercase tracking-wider">Ledger Protected</span>
                        </span>
                    </div>
                    <p className="text-sm text-[#6B7265] mt-0.5">Respond to purchase requests from verified shops. All transactions are routed through Ledger.</p>
                </div>
                <div className="flex bg-white border border-[#E5E5E0] rounded-xl overflow-hidden shadow-sm">
                    {(["rfqs", "history", "feedback"] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 text-xs font-bold transition-colors ${tab === t ? "bg-[#2C432D] text-white" : "text-[#6B7265] hover:bg-[#F7F7F5] hover:text-[#1A1A1A]"}`}>
                            {t === "rfqs" ? "Active RFQs" : t === "history" ? "Past Quotes" : "Feedback"}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Platform Trust Banner */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="bg-gradient-to-r from-[#F2F5F0] to-[#F7F7F5] rounded-xl border border-[#E5E5E0] p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#4A6741] flex items-center justify-center flex-shrink-0">
                    <Lock size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#1A1A1A]">All shop identities are protected</p>
                    <p className="text-[10px] text-[#9CA38C] mt-0.5">Shop details are anonymized until an order is confirmed. All payments, deliveries, and communications are managed through Ledger to ensure trust and security for both parties.</p>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { icon: FileText, label: "Open RFQs", value: openCount.toString(), sub: "awaiting your quote", color: "bg-[#F57F17]" },
                    { icon: Send, label: "Quotes Sent", value: quotedCount.toString(), sub: "pending decision", color: "bg-[#4A6741]" },
                    { icon: CheckCircle2, label: "RFQs Won", value: wonCount.toString(), sub: "orders confirmed", color: "bg-[#2C432D]" },
                    { icon: TrendingUp, label: "Win Rate", value: `${avgWinRate}%`, sub: "vs all submitted", color: "bg-[#3B6B9B]" },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-white rounded-2xl border border-[#E5E5E0] p-4">
                        <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center text-white mb-2`}><s.icon size={14} /></div>
                        <p className="text-lg font-bold text-[#1A1A1A]">{s.value}</p>
                        <p className="text-[10px] text-[#9CA38C]">{s.sub}</p>
                    </motion.div>
                ))}
            </div>

            {/* RFQs Tab */}
            {(tab === "rfqs" || tab === "history") && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search size={14} className="absolute left-3.5 top-2.5 text-[#9CA38C]" />
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by product or RFQ ID..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E5E0] rounded-xl text-sm outline-none focus:border-[#2C432D]" />
                        </div>
                        <div className="flex bg-white border border-[#E5E5E0] rounded-xl overflow-hidden">
                            {(["all", "open", "quoted", "won", "lost"] as const).map(s => (
                                <button key={s} onClick={() => setStatusFilter(s)}
                                    className={`px-3 py-2 text-[10px] font-bold transition-colors ${statusFilter === s ? "bg-[#2C432D] text-white" : "text-[#9CA38C] hover:text-[#1A1A1A]"}`}>
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RFQ Cards */}
                    {filtered.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText size={32} className="text-[#E5E5E0] mx-auto mb-3" />
                            <p className="text-sm text-[#9CA38C]">No RFQs match your filters</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((rfq, i) => {
                                const uc = urgencyConfig[rfq.urgency];
                                const UrgencyIcon = uc.icon;
                                const margin = rfq.yourQuote ? ((rfq.yourQuote - rfq.targetPrice) / rfq.targetPrice * 100).toFixed(1) : null;
                                return (
                                    <motion.div key={rfq.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                        className={`bg-white rounded-2xl border ${rfq.urgency === "critical" ? "border-l-[3px] border-l-[#C53030]" : rfq.urgency === "urgent" ? "border-l-[3px] border-l-[#F57F17]" : ""} border-[#E5E5E0] p-5 hover:shadow-md transition-all`}>
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                            {/* Left: RFQ Info */}
                                            <div className="flex items-start gap-4 flex-1 min-w-0">
                                                <div className={`w-10 h-10 rounded-xl ${uc.bg} flex items-center justify-center flex-shrink-0`}>
                                                    <Package size={18} className={uc.color} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <span className="text-[10px] font-bold text-[#9CA38C]">{rfq.id}</span>
                                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${uc.bg} ${uc.color} border ${uc.border} flex items-center gap-1`}>
                                                            <UrgencyIcon size={8} /> {uc.label}
                                                        </span>
                                                        <span className="text-[9px] text-[#9CA38C] bg-[#F7F7F5] px-1.5 py-0.5 rounded">📍 {rfq.regionCode} Region</span>
                                                        {rfq.status === "open" && rfq.competingQuotes === 0 && (
                                                            <span className="text-[9px] font-bold text-[#2E7D32] bg-[#E8F5E9] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                                <Zap size={8} /> No quotes yet — be first!
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-bold text-[#1A1A1A] mb-1">{rfq.quantity}x {rfq.product}</p>
                                                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#9CA38C]">
                                                        <span>{rfq.category}</span>
                                                        <span>·</span>
                                                        <span>Target: <strong className="text-[#1A1A1A]">{formatCurrency(rfq.targetPrice)}</strong>/unit</span>
                                                        <span>·</span>
                                                        <span>Market: <span className="text-[#6B7265]">{formatCurrency(rfq.marketPrice)}</span>/unit</span>
                                                        <span>·</span>
                                                        <span>{rfq.competingQuotes} quote{rfq.competingQuotes !== 1 ? "s" : ""} submitted</span>
                                                    </div>
                                                    {rfq.yourQuote && (
                                                        <div className="mt-2 inline-flex items-center gap-2 bg-[#F2F5F0] px-2.5 py-1 rounded-lg border border-[#E5E5E0]">
                                                            <span className="text-[10px] text-[#9CA38C]">Your Quote:</span>
                                                            <span className="text-xs font-bold text-[#2C432D]">{formatCurrency(rfq.yourQuote)}/unit</span>
                                                            {margin && <span className="text-[9px] text-[#4A6741]">+{margin}% vs target</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right: Actions + Timing */}
                                            <div className="flex flex-col items-end gap-2 flex-shrink-0 min-w-[140px]">
                                                <div className="text-right">
                                                    <p className="text-[10px] text-[#9CA38C]">Received {rfq.receivedAt}</p>
                                                    <p className={`text-xs font-bold mt-0.5 ${rfq.urgency === "critical" ? "text-[#C53030]" : rfq.urgency === "urgent" ? "text-[#F57F17]" : "text-[#6B7265]"}`}>
                                                        ⏱ {rfq.expiresIn}
                                                    </p>
                                                </div>
                                                {rfq.status === "open" ? (
                                                    <button onClick={() => setQuoteModal(rfq)}
                                                        className="w-full px-4 py-2.5 bg-[#2C432D] text-white text-xs font-bold rounded-xl hover:bg-[#1A2E1B] transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                                                        <Send size={12} /> Submit Quote
                                                    </button>
                                                ) : rfq.status === "quoted" ? (
                                                    <span className="w-full px-4 py-2 bg-[#F2F5F0] text-[#4A6741] text-[10px] font-bold rounded-xl text-center border border-[#E5E5E0]">
                                                        ✓ Quote Submitted
                                                    </span>
                                                ) : rfq.status === "won" ? (
                                                    <span className="w-full px-4 py-2 bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-bold rounded-xl text-center border border-[#2E7D32]/20">
                                                        🏆 You Won
                                                    </span>
                                                ) : (
                                                    <span className="w-full px-4 py-2 bg-[#F7F7F5] text-[#9CA38C] text-[10px] font-bold rounded-xl text-center border border-[#E5E5E0]">
                                                        Not Selected
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Feedback Tab */}
            {tab === "feedback" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    <p className="text-xs text-[#9CA38C]">Anonymized feedback from completed RFQ orders. Shops can rate your performance after delivery.</p>
                    {feedbackItems.map((fb, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-2xl border border-[#E5E5E0] p-5">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[#F2F5F0] flex items-center justify-center">
                                        <Shield size={12} className="text-[#4A6741]" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#1A1A1A]">{fb.rfqId}</p>
                                        <p className="text-[9px] text-[#9CA38C]">{fb.date}</p>
                                    </div>
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
                                    <MessageCircle size={8} /> Reply via Ledger
                                </button>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Submit Quote Modal */}
            <AnimatePresence>
                {quoteModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setQuoteModal(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-bold text-[#1A1A1A]">Submit Quote</h3>
                                <button onClick={() => setQuoteModal(null)} className="p-1 rounded-lg hover:bg-[#F7F7F5]"><X size={16} className="text-[#9CA38C]" /></button>
                            </div>

                            {/* RFQ Summary */}
                            <div className="bg-[#F7F7F5] rounded-xl p-4 mb-4 border border-[#E5E5E0]">
                                <p className="text-[10px] font-bold text-[#9CA38C] mb-1">{quoteModal.id} · {quoteModal.regionCode} Region</p>
                                <p className="text-sm font-bold text-[#1A1A1A]">{quoteModal.quantity}x {quoteModal.product}</p>
                                <div className="flex items-center gap-3 mt-2 text-[10px]">
                                    <span className="text-[#9CA38C]">Target: <strong className="text-[#1A1A1A]">{formatCurrency(quoteModal.targetPrice)}</strong>/unit</span>
                                    <span className="text-[#9CA38C]">Market: <strong className="text-[#6B7265]">{formatCurrency(quoteModal.marketPrice)}</strong>/unit</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium block mb-1">Your Price ($/unit)</label>
                                        <input type="number" placeholder={quoteModal.targetPrice.toFixed(2)} className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none focus:border-[#2C432D]" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium block mb-1">Delivery Time</label>
                                        <select className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none">
                                            <option>Tomorrow</option>
                                            <option>2 Days</option>
                                            <option>3 Days</option>
                                            <option>1 Week</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium block mb-1">Notes (optional)</label>
                                    <textarea placeholder="Additional details about your offer..." rows={2}
                                        className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none resize-none focus:border-[#2C432D]" />
                                </div>
                            </div>

                            {/* Trust Notice */}
                            <div className="flex items-start gap-2 mt-4 p-3 bg-[#F2F5F0] rounded-xl border border-[#E5E5E0]">
                                <Shield size={14} className="text-[#4A6741] mt-0.5 flex-shrink-0" />
                                <p className="text-[9px] text-[#6B7265] leading-relaxed">
                                    Your quote will be submitted through Ledger. The shop&apos;s identity will only be revealed after order confirmation. Payment is held in escrow until delivery is verified.
                                </p>
                            </div>

                            <div className="flex gap-3 mt-5">
                                <button onClick={() => setQuoteModal(null)} className="flex-1 px-4 py-2.5 border border-[#E5E5E0] text-sm font-medium text-[#6B7265] rounded-xl">Cancel</button>
                                <button onClick={() => setQuoteModal(null)} className="flex-1 px-4 py-2.5 bg-[#2C432D] text-white text-sm font-medium rounded-xl flex items-center justify-center gap-1"><Send size={12} /> Submit Quote</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
