"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, TrendingUp, TrendingDown, Sparkles, AlertTriangle, Lightbulb, Target, ChevronRight } from "lucide-react";

interface AIPrediction {
    id: string;
    type: "demand" | "price" | "reorder" | "opportunity" | "risk";
    title: string;
    description: string;
    confidence: number;
    impact: "high" | "medium" | "low";
    action?: string;
    actionLabel?: string;
    metric?: { label: string; value: string; trend: "up" | "down" };
}

export function AIInsightCard({ prediction, delay = 0 }: { prediction: AIPrediction; delay?: number }) {
    const typeIcons: Record<string, string> = {
        demand: "📊", price: "💰", reorder: "🔄", opportunity: "⚡", risk: "⚠️",
    };
    const icon = typeIcons[prediction.type] || "✨";

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className="relative rounded-2xl border border-[#E5E5E0] overflow-hidden hover:shadow-lg hover:shadow-[#4A6741]/8 transition-all duration-300 bg-white"
        >
            {/* Subtle gradient background */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ background: "radial-gradient(ellipse at 30% 0%, #4A6741, transparent 60%)" }} />
            <div className="relative p-4">
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2C432D] to-[#4A6741] flex items-center justify-center text-base flex-shrink-0 shadow-sm">
                        <span className="brightness-0 invert opacity-90">{icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-[#F2F5F0] rounded-full border border-[#E5E5E0]">
                                <Sparkles size={8} className="text-[#4A6741]" />
                                <span className="text-[8px] font-bold text-[#4A6741] uppercase tracking-wider">AI Prediction</span>
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 bg-[#F7F7F5] rounded text-[#6B7265] font-medium border border-[#E5E5E0]">
                                {prediction.confidence}% confident
                            </span>
                        </div>
                        <h3 className="text-sm font-bold text-[#1A1A1A] leading-snug">{prediction.title}</h3>
                        <p className="text-[11px] text-[#6B7265] mt-1 leading-relaxed">{prediction.description}</p>

                        {prediction.metric && (
                            <div className="flex items-center gap-2 mt-2 px-2.5 py-1.5 bg-[#F7F7F5] rounded-lg w-fit border border-[#E5E5E0]">
                                {prediction.metric.trend === "up" ? (
                                    <TrendingUp size={12} className="text-[#4A6741]" />
                                ) : (
                                    <TrendingDown size={12} className="text-[#6B7265]" />
                                )}
                                <span className="text-[10px] text-[#9CA38C]">{prediction.metric.label}:</span>
                                <span className="text-xs font-bold text-[#1A1A1A]">{prediction.metric.value}</span>
                            </div>
                        )}

                        {prediction.actionLabel && (
                            <button className="flex items-center gap-1 mt-2.5 text-xs font-semibold text-[#4A6741] hover:text-[#2C432D] transition-colors">
                                {prediction.actionLabel} <ChevronRight size={12} />
                            </button>
                        )}
                    </div>
                    <div className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide flex-shrink-0 ${prediction.impact === "high" ? "bg-[#2C432D]/10 text-[#2C432D]" :
                        prediction.impact === "medium" ? "bg-[#4A6741]/10 text-[#4A6741]" :
                            "bg-[#6B7265]/10 text-[#6B7265]"
                        }`}>
                        {prediction.impact}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Win Probability Gauge
export function WinProbabilityGauge({ probability, delay = 0 }: { probability: number; delay?: number }) {
    const circumference = 2 * Math.PI * 42;
    const offset = circumference - (probability / 100) * circumference;
    const color = probability >= 70 ? "#2E7D32" : probability >= 40 ? "#F57F17" : "#C62828";
    const label = probability >= 70 ? "Strong" : probability >= 40 ? "Fair" : "Low";

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.5 }}
            className="flex flex-col items-center"
        >
            <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="42" stroke="#F0F0EC" strokeWidth="6" fill="none" />
                    <motion.circle
                        cx="48" cy="48" r="42"
                        stroke={color}
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: delay + 0.3 }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-[#1A1A1A]">{probability}%</span>
                    <span className="text-[8px] font-semibold uppercase tracking-wider" style={{ color }}>{label}</span>
                </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
                <Brain size={10} className="text-[#4A6741]" />
                <span className="text-[9px] font-medium text-[#9CA38C]">AI Win Probability</span>
            </div>
        </motion.div>
    );
}

// Bid Strategy Advisor
export function BidStrategyAdvisor({
    reservePrice,
    lowestBid,
    avgBid,
    bidsCount,
    quantity,
}: {
    reservePrice: number;
    lowestBid: number | null;
    avgBid: number | null;
    bidsCount: number;
    quantity: number;
}) {
    const suggestedPrice = lowestBid
        ? Math.round(lowestBid * 0.97)
        : Math.round(reservePrice * 0.88);
    const aggressivePrice = lowestBid
        ? Math.round(lowestBid * 0.93)
        : Math.round(reservePrice * 0.82);
    const conservativePrice = lowestBid
        ? Math.round(lowestBid * 0.99)
        : Math.round(reservePrice * 0.93);

    const strategies = [
        {
            name: "Conservative",
            price: conservativePrice,
            win: lowestBid ? "35%" : "55%",
            margin: "12-15%",
            desc: "Safe margin, moderate win chance",
            color: "border-[#1565C0] bg-[#E3F2FD]",
            tag: "bg-[#1565C0]",
        },
        {
            name: "Recommended",
            price: suggestedPrice,
            win: lowestBid ? "72%" : "78%",
            margin: "8-10%",
            desc: "Optimal balance of price and probability",
            color: "border-[#4A6741] bg-[#E8F5E9] ring-2 ring-[#4A6741]/20",
            tag: "bg-[#4A6741]",
        },
        {
            name: "Aggressive",
            price: aggressivePrice,
            win: lowestBid ? "89%" : "92%",
            margin: "3-5%",
            desc: "High win chance, lower margin",
            color: "border-[#E65100] bg-[#FFF3E0]",
            tag: "bg-[#E65100]",
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white rounded-2xl border border-[#E5E5E0] p-5"
        >
            <div className="flex items-center gap-2 mb-1">
                <Brain size={14} className="text-[#4A6741]" />
                <h3 className="text-sm font-bold text-[#1A1A1A]">AI Bid Strategy</h3>
                <span className="px-2 py-0.5 bg-[#E8F5E9] text-[#4A6741] text-[9px] font-bold rounded-full">SMART</span>
            </div>
            <p className="text-[10px] text-[#9CA38C] mb-4">Based on market analysis of {bidsCount} bids and demand patterns</p>

            <div className="space-y-3">
                {strategies.map((s, i) => (
                    <motion.div
                        key={s.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        className={`relative rounded-xl border ${s.color} p-4 cursor-pointer hover:shadow-md transition-all`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 ${s.tag} text-white text-[9px] font-bold rounded`}>{s.name}</span>
                                {s.name === "Recommended" && <Sparkles size={12} className="text-[#4A6741]" />}
                            </div>
                            <span className="text-lg font-bold text-[#1A1A1A]">${s.price}<span className="text-xs font-normal text-[#9CA38C]">/unit</span></span>
                        </div>
                        <p className="text-[10px] text-[#6B7265] mb-2">{s.desc}</p>
                        <div className="flex items-center gap-4 text-[10px]">
                            <div className="flex items-center gap-1">
                                <Target size={9} className="text-[#9CA38C]" />
                                <span className="text-[#9CA38C]">Win:</span>
                                <span className="font-bold text-[#1A1A1A]">{s.win}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <TrendingUp size={9} className="text-[#9CA38C]" />
                                <span className="text-[#9CA38C]">Margin:</span>
                                <span className="font-bold text-[#1A1A1A]">{s.margin}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-[#9CA38C]">Total:</span>
                                <span className="font-bold text-[#4A6741]">${(s.price * quantity).toLocaleString()}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

// AI Demand Forecast Chart
export function DemandForecast({ category, delay = 0 }: { category: string; delay?: number }) {
    const historicalData = [
        { month: "Sep", actual: 65 },
        { month: "Oct", actual: 72 },
        { month: "Nov", actual: 68 },
        { month: "Dec", actual: 85 },
        { month: "Jan", actual: 78 },
        { month: "Feb", actual: 82 },
    ];
    const forecastData = [
        { month: "Mar", predicted: 88, low: 80, high: 96 },
        { month: "Apr", predicted: 95, low: 85, high: 105 },
        { month: "May", predicted: 102, low: 90, high: 114 },
    ];
    const maxVal = Math.max(...historicalData.map(d => d.actual), ...forecastData.map(d => d.high));

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className="bg-white rounded-2xl border border-[#E5E5E0] p-5"
        >
            <div className="flex items-center gap-2 mb-1">
                <Brain size={14} className="text-[#4A6741]" />
                <h3 className="text-sm font-bold text-[#1A1A1A]">Demand Forecast</h3>
                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-[#F2F5F0] rounded-full border border-[#E5E5E0]"><Sparkles size={8} className="text-[#4A6741]" /><span className="text-[8px] font-bold text-[#4A6741]">AI</span></span>
            </div>
            <p className="text-[10px] text-[#9CA38C] mb-4">{category} — next 3 months predicted</p>

            <div className="flex items-end gap-2 h-32">
                {/* Historical */}
                {historicalData.map((item, i) => (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end group">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#1A1A1A] text-white text-[8px] px-1.5 py-0.5 rounded whitespace-nowrap">
                            {item.actual}
                        </div>
                        <motion.div
                            className="w-full rounded-t bg-gradient-to-t from-[#4A6741] to-[#6B8F71]"
                            initial={{ height: 0 }}
                            animate={{ height: `${(item.actual / maxVal) * 100}%` }}
                            transition={{ duration: 0.5, delay: delay + 0.2 + i * 0.04 }}
                        />
                        <span className="text-[8px] text-[#9CA38C] mt-1">{item.month}</span>
                    </div>
                ))}
                {/* Divider */}
                <div className="w-px h-full bg-[#E5E5E0] mx-0.5 flex-shrink-0" />
                {/* Forecast */}
                {forecastData.map((item, i) => (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end group">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#1A2E1B] text-white text-[8px] px-1.5 py-0.5 rounded whitespace-nowrap">
                            {item.low}-{item.high}
                        </div>
                        <motion.div
                            className="w-full rounded-t bg-gradient-to-t from-[#4A6741]/20 to-[#6B8F61]/20 border-2 border-dashed border-[#4A6741]/40 relative"
                            initial={{ height: 0 }}
                            animate={{ height: `${(item.predicted / maxVal) * 100}%` }}
                            transition={{ duration: 0.5, delay: delay + 0.5 + i * 0.04 }}
                        >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 rounded-full bg-[#4A6741]" />
                        </motion.div>
                        <span className="text-[8px] text-[#4A6741] font-medium mt-1">{item.month}</span>
                    </div>
                ))}
            </div>

            <div className="mt-3 pt-3 border-t border-[#F0F0EC] flex items-center gap-4 text-[9px] text-[#9CA38C]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#4A6741]" />Actual</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded border-2 border-dashed border-[#4A6741]/40 bg-[#4A6741]/20" />Forecast</span>
                <span className="ml-auto font-bold text-[#4A6741]">+18% growth predicted</span>
            </div>
        </motion.div>
    );
}
