"use client";

import { motion } from "framer-motion";
import { TrendingUp, Target, Truck, Star, Shield, DollarSign, Award } from "lucide-react";
import { suppliers, formatCurrency } from "../../lib/mock-data";

export default function SupplierPerformance() {
    const me = suppliers.find((s) => s.id === "SUP-001")!;
    const score = me.performanceScore;
    const circumference = 2 * Math.PI * 56;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-xl font-bold text-[#1A1A1A]">Performance</h1>
                <p className="text-sm text-[#6B7265] mt-0.5">Your metrics and supplier rating</p>
            </motion.div>

            {/* Score + Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl border border-[#E5E5E0] p-6 flex flex-col items-center text-center">
                    <div className="relative w-32 h-32 mb-4">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                            <circle cx="64" cy="64" r="56" stroke="#F0F0EC" strokeWidth="8" fill="none" />
                            <motion.circle cx="64" cy="64" r="56" stroke={score >= 90 ? "#2E7D32" : score >= 80 ? "#F57F17" : "#C62828"} strokeWidth="8" fill="none"
                                strokeLinecap="round" strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }}
                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold text-[#1A1A1A]">{score}</span>
                        </div>
                    </div>
                    <h3 className="text-sm font-bold text-[#1A1A1A]">Performance Score</h3>
                    {me.preferredSupplierStatus ? (
                        <div className="flex items-center gap-1.5 mt-2 px-3 py-1 bg-[#FFF8E1] rounded-lg">
                            <Star size={12} className="text-[#B8860B] fill-[#B8860B]" />
                            <span className="text-xs font-bold text-[#B8860B]">Preferred Supplier</span>
                        </div>
                    ) : (
                        <p className="text-xs text-[#9CA38C] mt-1">Score 90+ to become Preferred</p>
                    )}
                </motion.div>

                {/* Metric Breakdown */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E5E0] p-6">
                    <h3 className="text-sm font-bold text-[#1A1A1A] mb-4">Score Breakdown</h3>
                    <div className="space-y-4">
                        {[
                            { label: "On-Time Delivery", value: me.onTimeDeliveryRate, icon: Truck, weight: "40%" },
                            { label: "Quality Score", value: me.qualityScore, icon: Shield, weight: "30%" },
                            { label: "Pricing Competitiveness", value: Math.min(Math.round((300 / me.averageBidPrice) * 100), 100), icon: DollarSign, weight: "20%" },
                            { label: "Response Rate", value: 94, icon: TrendingUp, weight: "10%" },
                        ].map((metric, i) => (
                            <div key={metric.label} className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <metric.icon size={14} className="text-[#9CA38C]" />
                                        <span className="text-xs font-medium text-[#6B7265]">{metric.label}</span>
                                        <span className="text-[9px] text-[#9CA38C]">({metric.weight})</span>
                                    </div>
                                    <span className={`text-xs font-bold ${metric.value >= 90 ? "text-[#2E7D32]" : metric.value >= 80 ? "text-[#F57F17]" : "text-[#C62828]"}`}>
                                        {metric.value}%
                                    </span>
                                </div>
                                <div className="h-2 bg-[#F0F0EC] rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full rounded-full ${metric.value >= 90 ? "bg-gradient-to-r from-[#4A6741] to-[#6B8F71]" : metric.value >= 80 ? "bg-gradient-to-r from-[#F57F17] to-[#FFC107]" : "bg-gradient-to-r from-[#C62828] to-[#EF5350]"}`}
                                        initial={{ width: 0 }} animate={{ width: `${metric.value}%` }}
                                        transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { icon: DollarSign, label: "Total Revenue", value: formatCurrency(me.totalRevenue), color: "bg-[#2C432D]" },
                    { icon: Award, label: "Auctions Won", value: me.totalAuctionsWon.toString(), color: "bg-[#4A6741]" },
                    { icon: Target, label: "Avg. Bid Price", value: `$${me.averageBidPrice}`, color: "bg-[#3B6B9B]" },
                    { icon: Star, label: "Categories", value: me.productCategories.length.toString(), color: "bg-[#B8860B]" },
                ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.05 }}
                        className="bg-white rounded-2xl border border-[#E5E5E0] p-4">
                        <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center text-white mb-3`}>
                            <stat.icon size={16} />
                        </div>
                        <p className="text-lg font-bold text-[#1A1A1A]">{stat.value}</p>
                        <p className="text-xs text-[#9CA38C]">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Tips */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                className="bg-gradient-to-br from-[#2C432D] to-[#4A6741] rounded-2xl p-6 text-white">
                <h3 className="text-sm font-bold mb-3">📈 Tips to Improve Your Score</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { title: "Deliver On Time", desc: "Consistently meeting delivery windows is the biggest factor in your score." },
                        { title: "Maintain Quality", desc: "Ensure product quality matches specifications to maintain high ratings." },
                        { title: "Competitive Pricing", desc: "Fair, competitive bids increase your win rate and overall volume." },
                    ].map((tip) => (
                        <div key={tip.title} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                            <p className="text-xs font-bold mb-1">{tip.title}</p>
                            <p className="text-[10px] text-white/70 leading-relaxed">{tip.desc}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
