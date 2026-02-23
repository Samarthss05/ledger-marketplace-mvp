"use client";

import { use, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, Clock, Users, Package, Gavel, DollarSign, CheckCircle2,
    AlertCircle, X, Send, Sparkles, Brain, Target, TrendingUp, TrendingDown,
    Shield, Truck, Star, ChevronRight, Info, Zap,
} from "lucide-react";
import Link from "next/link";
import StatusBadge from "../../../components/status-badge";
import { WinProbabilityGauge, BidStrategyAdvisor, AIInsightCard } from "../../../components/ai-insights";
import { auctions, suppliers, formatCurrency } from "../../../lib/mock-data";

export default function SupplierBidPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const auction = auctions.find((a) => a.id === id);
    const me = suppliers.find((s) => s.id === "SUP-001")!;

    const [bidStep, setBidStep] = useState<"overview" | "strategy" | "configure" | "review" | "submitted">("overview");
    const [selectedStrategy, setSelectedStrategy] = useState<"conservative" | "recommended" | "aggressive" | "custom">("recommended");
    const [price, setPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [deliveryDays, setDeliveryDays] = useState("7");
    const [paymentTerms, setPaymentTerms] = useState("Net 30");
    const [notes, setNotes] = useState("");

    if (!auction) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <AlertCircle size={48} className="text-[#9CA38C] mx-auto mb-3" />
                    <p className="text-sm text-[#6B7265]">Auction not found</p>
                    <Link href="/auction/supplier/auctions" className="text-sm text-[#4A6741] hover:underline mt-2 inline-block">Back to Auctions</Link>
                </div>
            </div>
        );
    }

    const sortedBids = [...auction.bids].sort((a, b) => a.pricePerUnit - b.pricePerUnit);
    const myExistingBid = auction.bids.find((b) => b.supplierId === "SUP-001");
    const lowestBid = sortedBids.length > 0 ? sortedBids[0].pricePerUnit : null;
    const avgBid = sortedBids.length > 0 ? Math.round(sortedBids.reduce((s, b) => s + b.pricePerUnit, 0) / sortedBids.length) : null;

    // AI strategy prices
    const suggestedPrice = lowestBid ? Math.round(lowestBid * 0.97) : Math.round(auction.reservePrice * 0.88);
    const conservativePrice = lowestBid ? Math.round(lowestBid * 0.99) : Math.round(auction.reservePrice * 0.93);
    const aggressivePrice = lowestBid ? Math.round(lowestBid * 0.93) : Math.round(auction.reservePrice * 0.82);

    const strategyPrices = { conservative: conservativePrice, recommended: suggestedPrice, aggressive: aggressivePrice, custom: Number(price) || 0 };

    const currentPrice = selectedStrategy === "custom" ? Number(price) || 0 : strategyPrices[selectedStrategy];
    const totalValue = currentPrice * auction.totalQuantity;
    const fee = totalValue * 0.03;
    const netRevenue = totalValue - fee;

    // Win probability based on price
    const getWinProb = (p: number) => {
        if (!lowestBid) return 75;
        const ratio = p / lowestBid;
        if (ratio <= 0.9) return 95;
        if (ratio <= 0.95) return 85;
        if (ratio <= 0.98) return 72;
        if (ratio <= 1.0) return 55;
        return 30;
    };
    const winProb = getWinProb(currentPrice);

    const stepLabels = ["Overview", "AI Strategy", "Configure Bid", "Review & Submit"];
    const stepKeys: typeof bidStep[] = ["overview", "strategy", "configure", "review"];
    const currentStepIndex = stepKeys.indexOf(bidStep);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/auction/supplier/auctions" className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-[#E5E5E0] transition-all">
                        <ArrowLeft size={16} className="text-[#6B7265]" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-[#1A1A1A]">{auction.productName}</h1>
                            <StatusBadge status={auction.status} />
                        </div>
                        <p className="text-xs text-[#9CA38C] mt-0.5">{auction.productCategory} · {auction.id}</p>
                    </div>
                </div>
                {myExistingBid && (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-[#E8F5E9] text-[#2E7D32] text-sm font-medium rounded-xl">
                        <CheckCircle2 size={14} /> Bid Placed: ${myExistingBid.pricePerUnit}/unit
                    </div>
                )}
            </motion.div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { icon: Package, label: "Total Qty", value: `${auction.totalQuantity.toLocaleString()} units` },
                    { icon: Users, label: "Shops", value: auction.participatingShops.toString() },
                    { icon: DollarSign, label: "Reserve", value: `$${auction.reservePrice}/unit` },
                    { icon: Gavel, label: "Bids", value: auction.bids.length.toString() },
                    { icon: Clock, label: "Est. Value", value: formatCurrency(auction.estimatedValue) },
                ].map((item, i) => (
                    <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                        className="bg-white rounded-2xl border border-[#E5E5E0] p-4">
                        <div className="flex items-center gap-1.5 mb-1"><item.icon size={12} className="text-[#9CA38C]" /><span className="text-[10px] uppercase tracking-wide text-[#9CA38C]">{item.label}</span></div>
                        <p className="text-lg font-bold text-[#1A1A1A]">{item.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Step Indicator + Main Content */}
            {!myExistingBid && bidStep !== "submitted" && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    className="bg-white rounded-2xl border border-[#E5E5E0] p-4">
                    <div className="flex items-center gap-2">
                        {stepLabels.map((label, i) => (
                            <div key={label} className="flex items-center gap-2 flex-1">
                                <div className={`flex items-center gap-2 flex-1 px-3 py-2 rounded-xl transition-all ${i === currentStepIndex ? "bg-[#2C432D] text-white shadow-sm" :
                                        i < currentStepIndex ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#F7F7F5] text-[#9CA38C]"
                                    }`}>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${i === currentStepIndex ? "bg-white/20" : i < currentStepIndex ? "bg-[#2E7D32]/20" : "bg-[#9CA38C]/20"
                                        }`}>
                                        {i < currentStepIndex ? "✓" : i + 1}
                                    </div>
                                    <span className="text-[10px] font-semibold hidden sm:block">{label}</span>
                                </div>
                                {i < stepLabels.length - 1 && <ChevronRight size={12} className="text-[#E5E5E0] flex-shrink-0" />}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Bid submitted state */}
            <AnimatePresence mode="wait">
                {bidStep === "submitted" && (
                    <motion.div key="submitted" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="bg-white rounded-2xl border border-[#E5E5E0] p-12 text-center">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                            <div className="w-20 h-20 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={40} className="text-[#2E7D32]" />
                            </div>
                        </motion.div>
                        <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Bid Submitted Successfully!</h2>
                        <p className="text-sm text-[#6B7265] mb-1">Your bid of <strong>${currentPrice}/unit</strong> has been placed on {auction.productName}</p>
                        <p className="text-xs text-[#9CA38C] mb-6">Total value: {formatCurrency(totalValue)} · AI win probability: {winProb}%</p>
                        <div className="bg-[#F7F7F5] rounded-xl p-4 max-w-sm mx-auto mb-6 space-y-2">
                            <div className="flex justify-between text-xs"><span className="text-[#9CA38C]">Auction</span><span className="font-medium">{auction.productName}</span></div>
                            <div className="flex justify-between text-xs"><span className="text-[#9CA38C]">Your Price</span><span className="font-bold text-[#2C432D]">${currentPrice}/unit</span></div>
                            <div className="flex justify-between text-xs"><span className="text-[#9CA38C]">Quantity</span><span className="font-medium">{auction.totalQuantity.toLocaleString()} units</span></div>
                            <div className="flex justify-between text-xs"><span className="text-[#9CA38C]">Payment</span><span className="font-medium">{paymentTerms}</span></div>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                            <Link href="/auction/supplier/bids" className="px-5 py-2.5 bg-[#2C432D] text-white text-sm font-medium rounded-xl hover:bg-[#1A2E1B] shadow-sm">View My Bids</Link>
                            <Link href="/auction/supplier/auctions" className="px-5 py-2.5 border border-[#E5E5E0] text-sm font-medium text-[#6B7265] rounded-xl hover:bg-[#F7F7F5]">Browse More</Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Overview */}
                        {bidStep === "overview" && !myExistingBid && (
                            <motion.div key="overview" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                                {/* Bid Table */}
                                <div className="bg-white rounded-2xl border border-[#E5E5E0] overflow-hidden">
                                    <div className="px-5 py-4 border-b border-[#E5E5E0] flex items-center justify-between">
                                        <h2 className="text-sm font-bold text-[#1A1A1A]">
                                            {auction.auctionType === "sealed" ? "Sealed Bids" : "Current Bids"}
                                        </h2>
                                        <span className="text-[10px] px-2 py-0.5 bg-[#F7F7F5] text-[#6B7265] rounded-full font-medium">{auction.bids.length} total</span>
                                    </div>
                                    {auction.auctionType === "sealed" ? (
                                        <div className="px-5 py-10 text-center">
                                            <div className="w-16 h-16 rounded-2xl bg-[#F7F7F5] flex items-center justify-center mx-auto mb-3">
                                                <Gavel size={24} className="text-[#9CA38C]" />
                                            </div>
                                            <p className="text-sm font-medium text-[#6B7265]">Sealed-bid auction</p>
                                            <p className="text-xs text-[#9CA38C] mt-1">Bid prices are hidden until the auction closes</p>
                                            <p className="text-sm font-bold text-[#1A1A1A] mt-3">{auction.bids.length} bids submitted so far</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead><tr className="bg-[#F7F7F5]">
                                                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#9CA38C] uppercase tracking-wide">Rank</th>
                                                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#9CA38C] uppercase tracking-wide">Supplier</th>
                                                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#9CA38C] uppercase tracking-wide">Price/Unit</th>
                                                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#9CA38C] uppercase tracking-wide">Total</th>
                                                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#9CA38C] uppercase tracking-wide">Score</th>
                                                </tr></thead>
                                                <tbody>
                                                    {sortedBids.map((bid, i) => {
                                                        const supplier = suppliers.find(s => s.id === bid.supplierId);
                                                        return (
                                                            <tr key={bid.id} className="border-b border-[#F0F0EC] hover:bg-[#F7F7F5]">
                                                                <td className="px-5 py-3">
                                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-[#2C432D] text-white" : i === 1 ? "bg-[#4A6741]/20 text-[#4A6741]" : "bg-[#F0F0EC] text-[#6B7265]"
                                                                        }`}>{i + 1}</div>
                                                                </td>
                                                                <td className="px-5 py-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-sm text-[#1A1A1A]">{bid.supplierName}</span>
                                                                        {supplier?.preferredSupplierStatus && <Star size={10} className="fill-[#B8860B] text-[#B8860B]" />}
                                                                    </div>
                                                                </td>
                                                                <td className="px-5 py-3"><span className={`text-sm font-bold ${i === 0 ? "text-[#2E7D32]" : "text-[#1A1A1A]"}`}>${bid.pricePerUnit.toLocaleString()}</span></td>
                                                                <td className="px-5 py-3 text-sm text-[#6B7265]">{formatCurrency(bid.totalPrice)}</td>
                                                                <td className="px-5 py-3"><span className="text-xs font-medium text-[#6B7265]">{supplier?.performanceScore || "—"}</span></td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                {/* AI Insight for this auction */}
                                <AIInsightCard delay={0.3} prediction={{
                                    id: "auction-insight", type: "opportunity",
                                    title: `High demand for ${auction.productCategory}`,
                                    description: `This auction has ${auction.participatingShops} shops requesting supply. Based on market trends, bidding competitively here could open repeat business with these shops.`,
                                    confidence: 81, impact: "high",
                                    metric: { label: "Potential repeat orders", value: "4-6/quarter", trend: "up" },
                                }} />

                                <button onClick={() => setBidStep("strategy")}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#2C432D] text-white text-sm font-semibold rounded-xl hover:bg-[#1A2E1B] transition-colors shadow-sm">
                                    <Brain size={16} /> Start AI-Assisted Bidding <ChevronRight size={14} />
                                </button>
                            </motion.div>
                        )}

                        {/* Step 2: AI Strategy */}
                        {bidStep === "strategy" && (
                            <motion.div key="strategy" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                                <BidStrategyAdvisor
                                    reservePrice={auction.reservePrice}
                                    lowestBid={lowestBid}
                                    avgBid={avgBid}
                                    bidsCount={auction.bids.length}
                                    quantity={auction.totalQuantity}
                                />

                                {/* Strategy Selection */}
                                <div className="bg-white rounded-2xl border border-[#E5E5E0] p-5">
                                    <h3 className="text-sm font-bold text-[#1A1A1A] mb-3">Choose Your Strategy</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            { key: "conservative" as const, label: "Conservative", price: conservativePrice, color: "border-[#1565C0]" },
                                            { key: "recommended" as const, label: "Recommended", price: suggestedPrice, color: "border-[#4A6741]" },
                                            { key: "aggressive" as const, label: "Aggressive", price: aggressivePrice, color: "border-[#E65100]" },
                                            { key: "custom" as const, label: "Custom", price: null, color: "border-[#6B7265]" },
                                        ].map(s => (
                                            <button key={s.key} onClick={() => { setSelectedStrategy(s.key); if (s.price) setPrice(s.price.toString()); }}
                                                className={`p-3 rounded-xl border-2 transition-all text-left ${selectedStrategy === s.key ? `${s.color} bg-[#F7F7F5] shadow-sm` : "border-[#E5E5E0] hover:border-[#9CA38C]"
                                                    }`}>
                                                <p className="text-xs font-bold text-[#1A1A1A]">{s.label}</p>
                                                <p className="text-sm font-bold text-[#2C432D] mt-1">{s.price ? `$${s.price}` : "Set price"}<span className="text-[9px] text-[#9CA38C] font-normal">/unit</span></p>
                                            </button>
                                        ))}
                                    </div>
                                    {selectedStrategy === "custom" && (
                                        <div className="mt-3">
                                            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder={`Max: ${auction.reservePrice}`}
                                                className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none focus:border-[#2C432D]" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => setBidStep("overview")} className="flex-1 px-4 py-3 border border-[#E5E5E0] text-sm font-medium text-[#6B7265] rounded-xl hover:bg-[#F7F7F5]">Back</button>
                                    <button onClick={() => { if (!price && selectedStrategy !== "custom") setPrice(strategyPrices[selectedStrategy].toString()); setBidStep("configure"); }}
                                        className="flex-1 px-4 py-3 bg-[#2C432D] text-white text-sm font-semibold rounded-xl hover:bg-[#1A2E1B] shadow-sm">Continue to Configure</button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Configure */}
                        {bidStep === "configure" && (
                            <motion.div key="configure" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                className="bg-white rounded-2xl border border-[#E5E5E0] p-6 space-y-5">
                                <h2 className="text-sm font-bold text-[#1A1A1A]">Configure Your Bid</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-[#1A1A1A] block mb-1.5">Price Per Unit ($)</label>
                                        <input type="number" value={price || currentPrice} onChange={(e) => { setPrice(e.target.value); setSelectedStrategy("custom"); }}
                                            className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none focus:border-[#2C432D] focus:ring-1 focus:ring-[#2C432D]/20" />
                                        {lowestBid && (
                                            <p className="text-[10px] text-[#9CA38C] mt-1">Current lowest: ${lowestBid}/unit · Reserve: ${auction.reservePrice}/unit</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-[#1A1A1A] block mb-1.5">Delivery Timeline</label>
                                        <select value={deliveryDays} onChange={(e) => setDeliveryDays(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none">
                                            <option value="3">3 days (Express)</option>
                                            <option value="5">5 days</option>
                                            <option value="7">7 days (Standard)</option>
                                            <option value="14">14 days</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-[#1A1A1A] block mb-1.5">Payment Terms</label>
                                        <select value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none">
                                            <option>COD</option><option>Net 15</option><option>Net 30</option><option>Net 45</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-[#1A1A1A] block mb-1.5">Notes (optional)</label>
                                        <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Free delivery for 10+ shops"
                                            className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none focus:border-[#2C432D]" />
                                    </div>
                                </div>

                                {/* AI Tip */}
                                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-[#F3E5F5] to-[#E8F5E9] rounded-xl">
                                    <Brain size={14} className="text-[#7B1FA2] mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-[11px] font-semibold text-[#1A1A1A]">AI Tip: Shorter delivery timelines win 28% more often</p>
                                        <p className="text-[10px] text-[#6B7265] mt-0.5">Shops prioritize reliable, fast delivery. Consider offering 5-day delivery to stand out.</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => setBidStep("strategy")} className="flex-1 px-4 py-3 border border-[#E5E5E0] text-sm font-medium text-[#6B7265] rounded-xl hover:bg-[#F7F7F5]">Back</button>
                                    <button onClick={() => setBidStep("review")}
                                        className="flex-1 px-4 py-3 bg-[#2C432D] text-white text-sm font-semibold rounded-xl hover:bg-[#1A2E1B] shadow-sm">Review Bid</button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Review & Submit */}
                        {bidStep === "review" && (
                            <motion.div key="review" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                className="bg-white rounded-2xl border border-[#E5E5E0] overflow-hidden">
                                <div className="p-6 border-b border-[#E5E5E0] bg-gradient-to-r from-[#2C432D] to-[#4A6741] text-white">
                                    <h2 className="text-sm font-bold mb-1">Review Your Bid</h2>
                                    <p className="text-xs text-white/70">Please review all details before submitting</p>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: "Auction", value: auction.productName },
                                            { label: "Price Per Unit", value: `$${currentPrice}`, highlight: true },
                                            { label: "Total Quantity", value: `${auction.totalQuantity.toLocaleString()} units` },
                                            { label: "Total Value", value: formatCurrency(totalValue), highlight: true },
                                            { label: "Delivery", value: `${deliveryDays} days` },
                                            { label: "Payment Terms", value: paymentTerms },
                                        ].map(item => (
                                            <div key={item.label} className="bg-[#F7F7F5] rounded-xl p-3">
                                                <p className="text-[10px] text-[#9CA38C] mb-0.5">{item.label}</p>
                                                <p className={`text-sm font-bold ${item.highlight ? "text-[#2C432D]" : "text-[#1A1A1A]"}`}>{item.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-gradient-to-r from-[#F7F7F5] to-[#F2F5F0] rounded-xl p-4 space-y-2">
                                        <h3 className="text-xs font-bold text-[#1A1A1A]">Revenue Breakdown</h3>
                                        <div className="flex justify-between text-xs"><span className="text-[#9CA38C]">Gross revenue</span><span className="font-medium">{formatCurrency(totalValue)}</span></div>
                                        <div className="flex justify-between text-xs"><span className="text-[#9CA38C]">Ledger platform fee (3%)</span><span className="font-medium text-[#C53030]">-{formatCurrency(fee)}</span></div>
                                        <div className="border-t border-[#E5E5E0] pt-2 flex justify-between"><span className="text-xs text-[#9CA38C]">Net revenue</span><span className="text-base font-bold text-[#2C432D]">{formatCurrency(netRevenue)}</span></div>
                                    </div>

                                    {notes && (
                                        <div className="bg-[#F7F7F5] rounded-xl p-3">
                                            <p className="text-[10px] text-[#9CA38C] mb-0.5">Notes</p>
                                            <p className="text-xs text-[#1A1A1A]">{notes}</p>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-2">
                                        <button onClick={() => setBidStep("configure")} className="flex-1 px-4 py-3 border border-[#E5E5E0] text-sm font-medium text-[#6B7265] rounded-xl hover:bg-[#F7F7F5]">Back</button>
                                        <button onClick={() => setBidStep("submitted")}
                                            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#2C432D] to-[#4A6741] text-white text-sm font-bold rounded-xl hover:from-[#1A2E1B] hover:to-[#3D5A35] shadow-lg shadow-[#2C432D]/20 flex items-center justify-center gap-2">
                                            <Send size={14} /> Submit Bid
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* If user already bid — show bid table */}
                        {myExistingBid && (
                            <motion.div key="existing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                <div className="bg-white rounded-2xl border border-[#E5E5E0] overflow-hidden">
                                    <div className="px-5 py-4 border-b border-[#E5E5E0]"><h2 className="text-sm font-bold text-[#1A1A1A]">Bid Standings</h2></div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead><tr className="bg-[#F7F7F5]">
                                                <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#9CA38C] uppercase">Rank</th>
                                                <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#9CA38C] uppercase">Supplier</th>
                                                <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#9CA38C] uppercase">Price</th>
                                                <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#9CA38C] uppercase">Total</th>
                                                <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#9CA38C] uppercase">Status</th>
                                            </tr></thead>
                                            <tbody>
                                                {sortedBids.map((bid, i) => {
                                                    const isMe = bid.supplierId === "SUP-001";
                                                    return (
                                                        <tr key={bid.id} className={`border-b border-[#F0F0EC] ${isMe ? "bg-[#F2F5F0]" : "hover:bg-[#F7F7F5]"}`}>
                                                            <td className="px-5 py-3"><div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-[#2C432D] text-white" : "bg-[#F0F0EC] text-[#6B7265]"}`}>{i + 1}</div></td>
                                                            <td className="px-5 py-3"><span className={`text-sm ${isMe ? "font-bold text-[#2C432D]" : "text-[#1A1A1A]"}`}>{isMe ? "You" : bid.supplierName}</span></td>
                                                            <td className="px-5 py-3"><span className={`text-sm font-bold ${i === 0 ? "text-[#2E7D32]" : "text-[#1A1A1A]"}`}>${bid.pricePerUnit.toLocaleString()}</span></td>
                                                            <td className="px-5 py-3 text-sm text-[#6B7265]">{formatCurrency(bid.totalPrice)}</td>
                                                            <td className="px-5 py-3"><StatusBadge status={bid.status} /></td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar */}
                <div className="space-y-5">
                    {/* Win Probability */}
                    {!myExistingBid && bidStep !== "submitted" && bidStep !== "overview" && currentPrice > 0 && (
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl border border-[#E5E5E0] p-5 flex flex-col items-center">
                            <WinProbabilityGauge probability={winProb} delay={0.3} />
                            <div className="mt-4 w-full space-y-2 pt-3 border-t border-[#F0F0EC]">
                                <div className="flex justify-between text-[10px]"><span className="text-[#9CA38C]">Your price</span><span className="font-bold">${currentPrice}/unit</span></div>
                                {lowestBid && <div className="flex justify-between text-[10px]"><span className="text-[#9CA38C]">Lowest bid</span><span className="font-bold text-[#2E7D32]">${lowestBid}/unit</span></div>}
                                <div className="flex justify-between text-[10px]"><span className="text-[#9CA38C]">Reserve price</span><span className="font-bold">${auction.reservePrice}/unit</span></div>
                            </div>
                        </motion.div>
                    )}

                    {/* Revenue Estimate */}
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-[#2C432D] to-[#4A6741] rounded-2xl p-5 text-white">
                        <h3 className="text-sm font-bold mb-3">Revenue Estimate</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between"><span className="text-xs text-white/60">Revenue at {currentPrice > 0 ? "your price" : "reserve"}</span><span className="text-sm font-bold">{formatCurrency(currentPrice > 0 ? totalValue : auction.reservePrice * auction.totalQuantity)}</span></div>
                            <div className="flex justify-between"><span className="text-xs text-white/60">Ledger fee (3%)</span><span className="text-sm font-bold">-{formatCurrency(currentPrice > 0 ? fee : auction.reservePrice * auction.totalQuantity * 0.03)}</span></div>
                            <div className="border-t border-white/20 pt-2 flex justify-between"><span className="text-xs text-white/60">Net revenue</span><span className="text-lg font-bold">{formatCurrency(currentPrice > 0 ? netRevenue : auction.reservePrice * auction.totalQuantity * 0.97)}</span></div>
                        </div>
                    </motion.div>

                    {/* Your Profile */}
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                        className="bg-white rounded-2xl border border-[#E5E5E0] p-5">
                        <h3 className="text-sm font-bold text-[#1A1A1A] mb-3">Your Profile Strength</h3>
                        <div className="space-y-3">
                            {[
                                { icon: Target, label: "Performance Score", value: `${me.performanceScore}/100`, good: me.performanceScore >= 85 },
                                { icon: Truck, label: "On-Time Delivery", value: `${me.onTimeDeliveryRate}%`, good: me.onTimeDeliveryRate >= 90 },
                                { icon: Shield, label: "Quality Score", value: `${me.qualityScore}%`, good: me.qualityScore >= 90 },
                                { icon: Star, label: "Preferred Status", value: me.preferredSupplierStatus ? "Yes ⭐" : "No", good: me.preferredSupplierStatus },
                            ].map(s => (
                                <div key={s.label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <s.icon size={12} className="text-[#9CA38C]" />
                                        <span className="text-xs text-[#6B7265]">{s.label}</span>
                                    </div>
                                    <span className={`text-xs font-bold ${s.good ? "text-[#2E7D32]" : "text-[#F57F17]"}`}>{s.value}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-[9px] text-[#9CA38C] mt-3 pt-2 border-t border-[#F0F0EC]">💡 Higher scores increase your AI win probability by up to 15%</p>
                    </motion.div>

                    {/* Auction Details */}
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                        className="bg-white rounded-2xl border border-[#E5E5E0] p-5 space-y-3">
                        <h3 className="text-sm font-bold text-[#1A1A1A]">Auction Details</h3>
                        {[
                            { l: "Type", v: auction.auctionType.charAt(0).toUpperCase() + auction.auctionType.slice(1) },
                            { l: "Created By", v: auction.createdBy === "system" ? "Auto-generated" : "Manual" },
                            { l: "Quantity", v: `${auction.totalQuantity.toLocaleString()} units` },
                            { l: "Est. Value", v: formatCurrency(auction.estimatedValue) },
                        ].map((item) => (
                            <div key={item.l} className="flex items-center justify-between">
                                <span className="text-xs text-[#9CA38C]">{item.l}</span>
                                <span className="text-xs font-medium text-[#1A1A1A]">{item.v}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
