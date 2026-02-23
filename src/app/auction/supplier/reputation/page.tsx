"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Award, Star, Shield, Zap, Target, TrendingUp, MapPin, Globe,
    CheckCircle2, Clock, Package, Truck, Users, ArrowRight, Brain,
} from "lucide-react";

const badges = [
    { id: "b1", name: "Bulk Expert", icon: "📦", desc: "Fulfilled 50+ large quantity orders", earned: true, date: "Jan 2026" },
    { id: "b2", name: "Speed Demon", icon: "⚡", desc: "Average delivery time under 3 days", earned: true, date: "Dec 2025" },
    { id: "b3", name: "Zero Defect", icon: "✅", desc: "100% quality score for 3 months", earned: false, progress: 78 },
    { id: "b4", name: "Community Favorite", icon: "❤️", desc: "4.8+ rating from 50+ shops", earned: false, progress: 62 },
    { id: "b5", name: "Multi-Category", icon: "🏪", desc: "Win auctions in 4+ categories", earned: true, date: "Feb 2026" },
    { id: "b6", name: "Repeat Champion", icon: "🔁", desc: "80%+ repeat order rate", earned: false, progress: 45 },
];

const preferredProgress = [
    { metric: "On-Time Deliveries", current: 47, target: 50, icon: Truck },
    { metric: "Quality Score", current: 93, target: 95, icon: Shield },
    { metric: "Active Months", current: 5, target: 6, icon: Clock },
    { metric: "Avg Rating", current: 4.5, target: 4.7, icon: Star },
];

const shopReviews = [
    { shop: "RK Minimart", rating: 5, comment: "Always on time, great quality! Best supplier for beverages.", date: "Feb 18" },
    { shop: "Kedai Muthu", rating: 4, comment: "Good pricing but delivery was 1 day late last time.", date: "Feb 12" },
    { shop: "Lucky Express Mart", rating: 5, comment: "Excellent communication and product quality.", date: "Feb 5" },
    { shop: "Ah Kow Store Sari-Sari", rating: 4, comment: "Competitive prices, would order again.", date: "Jan 28" },
];

const territories = [
    { zone: "Zone A (Makati)", shops: 15, orders: 42, revenue: 280000, strength: "strong", opportunity: false },
    { zone: "Zone B (BGC)", shops: 8, orders: 18, revenue: 120000, strength: "growing", opportunity: true },
    { zone: "Zone C (QC North)", shops: 3, orders: 5, revenue: 35000, strength: "new", opportunity: true },
    { zone: "Zone D (Mandaluyong)", shops: 0, orders: 0, revenue: 0, strength: "unexplored", opportunity: true },
];

export default function ReputationPage() {
    const [tab, setTab] = useState<"overview" | "badges" | "territory" | "reviews">("overview");
    const earnedBadges = badges.filter(b => b.earned).length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#1A1A1A]">Reputation & Growth</h1>
                    <p className="text-sm text-[#6B7265] mt-0.5">Your supplier profile, badges, territory, and reviews</p>
                </div>
                <div className="flex bg-white border border-[#E5E5E0] rounded-xl overflow-hidden">
                    {(["overview", "badges", "territory", "reviews"] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)} className={`px-3 py-2 text-xs font-medium ${tab === t ? "bg-[#2C432D] text-white" : "text-[#6B7265]"}`}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
            </motion.div>

            {tab === "overview" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    {/* Preferred Supplier Progress */}
                    <div className="bg-gradient-to-br from-[#2C432D] to-[#4A6741] rounded-2xl p-6 text-white">
                        <div className="flex items-center gap-2 mb-4">
                            <Award size={16} />
                            <h2 className="text-sm font-bold">Preferred Supplier Program</h2>
                            <span className="text-[8px] px-1.5 py-0.5 bg-white/20 rounded font-bold">IN PROGRESS</span>
                        </div>
                        <p className="text-xs text-white/70 mb-4">Complete these milestones to earn ⭐ Preferred Supplier status and priority in auctions.</p>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {preferredProgress.map(p => {
                                const pct = (p.current / p.target) * 100;
                                return (
                                    <div key={p.metric} className="bg-white/10 rounded-xl p-3">
                                        <p.icon size={12} className="text-white/70 mb-1.5" />
                                        <p className="text-lg font-bold">{p.current}<span className="text-xs text-white/50">/{p.target}</span></p>
                                        <p className="text-[9px] text-white/60">{p.metric}</p>
                                        <div className="mt-1.5 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { icon: Award, label: "Badges Earned", value: `${earnedBadges}/${badges.length}`, color: "bg-[#B8860B]" },
                            { icon: Star, label: "Avg Rating", value: "4.6/5.0", color: "bg-[#F57F17]" },
                            { icon: Globe, label: "Active Zones", value: territories.filter(t => t.shops > 0).length.toString(), color: "bg-[#4A6741]" },
                            { icon: Users, label: "Shop Connections", value: "26", color: "bg-[#3B6B9B]" },
                        ].map((s, i) => (
                            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="bg-white rounded-2xl border border-[#E5E5E0] p-4">
                                <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center text-white mb-2`}><s.icon size={14} /></div>
                                <p className="text-lg font-bold text-[#1A1A1A]">{s.value}</p>
                                <p className="text-[10px] text-[#9CA38C]">{s.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {tab === "badges" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {badges.map((badge, i) => (
                            <motion.div key={badge.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                                className={`rounded-2xl border p-5 transition-all ${badge.earned ? "bg-white border-[#B8860B]/30 hover:shadow-lg hover:shadow-[#B8860B]/10" : "bg-[#F7F7F5] border-[#E5E5E0]"}`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${badge.earned ? "bg-[#FFF8E1]" : "bg-[#F0F0EC]"}`}>{badge.icon}</div>
                                    <div>
                                        <p className="text-sm font-bold text-[#1A1A1A]">{badge.name}</p>
                                        {badge.earned ? <span className="text-[9px] text-[#B8860B] font-bold">Earned {badge.date}</span> : <span className="text-[9px] text-[#9CA38C] font-bold">{badge.progress}% progress</span>}
                                    </div>
                                </div>
                                <p className="text-[10px] text-[#6B7265]">{badge.desc}</p>
                                {!badge.earned && badge.progress !== undefined && (
                                    <div className="mt-3 h-2 bg-[#E5E5E0] rounded-full overflow-hidden">
                                        <div className="h-full bg-[#B8860B] rounded-full" style={{ width: `${badge.progress}%` }} />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {tab === "territory" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-[#E3F2FD] to-[#E8F5E9] rounded-2xl border border-[#1565C0]/10">
                        <Brain size={14} className="text-[#1565C0] mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-[#1A1A1A]">AI sees expansion opportunity in Zone B & C</p>
                            <p className="text-[10px] text-[#6B7265] mt-0.5">Shops in these zones need your categories (Beverages, Rice). Expanding could add $180K/month in revenue.</p>
                        </div>
                    </div>
                    {territories.map((zone, i) => (
                        <motion.div key={zone.zone} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                            className={`bg-white rounded-2xl border p-5 hover:shadow-md transition-all ${zone.opportunity ? "border-[#4A6741]/30" : "border-[#E5E5E0]"}`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} className={zone.strength === "strong" ? "text-[#2E7D32]" : zone.strength === "growing" ? "text-[#F57F17]" : zone.strength === "new" ? "text-[#1565C0]" : "text-[#9CA38C]"} />
                                    <p className="text-sm font-bold text-[#1A1A1A]">{zone.zone}</p>
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${zone.strength === "strong" ? "bg-[#E8F5E9] text-[#2E7D32]" :
                                            zone.strength === "growing" ? "bg-[#FFF8E1] text-[#F57F17]" :
                                                zone.strength === "new" ? "bg-[#E3F2FD] text-[#1565C0]" : "bg-[#F7F7F5] text-[#9CA38C]"
                                        }`}>{zone.strength.toUpperCase()}</span>
                                </div>
                                {zone.opportunity && (
                                    <button className="flex items-center gap-1 px-3 py-1.5 bg-[#4A6741] text-white text-[10px] font-bold rounded-lg">
                                        Expand <ArrowRight size={8} />
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div><p className="text-lg font-bold text-[#1A1A1A]">{zone.shops}</p><p className="text-[9px] text-[#9CA38C]">Shops</p></div>
                                <div><p className="text-lg font-bold text-[#1A1A1A]">{zone.orders}</p><p className="text-[9px] text-[#9CA38C]">Orders</p></div>
                                <div><p className="text-lg font-bold text-[#4A6741]">{zone.revenue > 0 ? `$${(zone.revenue / 1000).toFixed(0)}K` : "—"}</p><p className="text-[9px] text-[#9CA38C]">Revenue</p></div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {tab === "reviews" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    {shopReviews.map((review, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-2xl border border-[#E5E5E0] p-5">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[#F7F7F5] flex items-center justify-center text-[10px] font-bold text-[#6B7265]">{review.shop.charAt(0)}</div>
                                    <div><p className="text-xs font-bold text-[#1A1A1A]">{review.shop}</p><p className="text-[9px] text-[#9CA38C]">{review.date}</p></div>
                                </div>
                                <div className="flex items-center gap-0.5">
                                    {Array.from({ length: 5 }, (_, s) => (
                                        <Star key={s} size={10} className={s < review.rating ? "fill-[#B8860B] text-[#B8860B]" : "text-[#E5E5E0]"} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-[#6B7265] leading-relaxed">{review.comment}</p>
                            <button className="mt-2 text-[10px] font-bold text-[#4A6741]">Reply to review</button>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
