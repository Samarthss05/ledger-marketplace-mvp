"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Brain, TrendingUp, TrendingDown, BarChart3, Eye, Sparkles, Target,
    AlertTriangle, ArrowRight, Globe, Users, DollarSign, Clock,
} from "lucide-react";
import { formatCurrency } from "../../lib/mock-data";

const priceOracle = [
    { product: "Nestle Milo 400G", current: 5.50, predicted: 5.20, change: -5.5, direction: "down" as const, confidence: 86, timeframe: "2 weeks", reason: "New supplier entering market" },
    { product: "India Gate Basmati Rice 1KG", current: 6.50, predicted: 6.20, change: -4.6, direction: "down" as const, confidence: 72, timeframe: "1 month", reason: "Harvest season approaching" },
    { product: "LKK Oyster Sauce 770G", current: 5.80, predicted: 6.30, change: +8.6, direction: "up" as const, confidence: 79, timeframe: "3 weeks", reason: "Global supply chain disruption" },
    { product: "Indomie Mi Goreng", current: 3.60, predicted: 3.50, change: -2.8, direction: "down" as const, confidence: 64, timeframe: "1 week", reason: "Stable market, slight oversupply" },
    { product: "Heineken 330ML", current: 2.70, predicted: 2.50, change: -7.4, direction: "down" as const, confidence: 81, timeframe: "2 weeks", reason: "Rainy season reducing demand" },
];

const competitorBenchmark = [
    { category: "Beverages & Drinks", yourAvg: 4.20, topAvg: 3.80, marketAvg: 4.50, position: "competitive", winRate: 57, topWinRate: 72 },
    { category: "Rice & Grains", yourAvg: 5.80, topAvg: 5.20, marketAvg: 6.10, position: "above", winRate: 45, topWinRate: 68 },
    { category: "Sauces & Condiments", yourAvg: 3.90, topAvg: 3.65, marketAvg: 4.20, position: "competitive", winRate: 52, topWinRate: 65 },
    { category: "Instant Noodles", yourAvg: 2.80, topAvg: 2.60, marketAvg: 3.00, position: "above", winRate: 38, topWinRate: 60 },
];

const priceTrends = [
    { month: "Sep", beverages: 4.80, rice: 6.80, oil: 6.20 },
    { month: "Oct", beverages: 4.60, rice: 6.70, oil: 6.10 },
    { month: "Nov", beverages: 4.50, rice: 6.50, oil: 5.90 },
    { month: "Dec", beverages: 4.40, rice: 6.40, oil: 5.85 },
    { month: "Jan", beverages: 4.20, rice: 6.30, oil: 5.80 },
    { month: "Feb", beverages: 4.10, rice: 6.20, oil: 5.85 },
];

export default function IntelligencePage() {
    const [view, setView] = useState<"oracle" | "benchmark" | "trends">("oracle");

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-[#1A1A1A]">Market Intelligence</h1>
                        <span className="px-2 py-0.5 bg-gradient-to-r from-[#7B1FA2] to-[#CE93D8] text-white text-[9px] font-bold rounded-full flex items-center gap-1"><Brain size={8} /> AI</span>
                    </div>
                    <p className="text-sm text-[#6B7265] mt-0.5">Price predictions, competitor benchmarking, and market trends</p>
                </div>
                <div className="flex bg-white border border-[#E5E5E0] rounded-xl overflow-hidden">
                    {(["oracle", "benchmark", "trends"] as const).map(t => (
                        <button key={t} onClick={() => setView(t)} className={`px-4 py-2 text-xs font-medium ${view === t ? "bg-[#2C432D] text-white" : "text-[#6B7265]"}`}>
                            {t === "oracle" ? "Price Oracle" : t === "benchmark" ? "Competitors" : "Price Trends"}
                        </button>
                    ))}
                </div>
            </motion.div>

            {view === "oracle" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-[#F3E5F5] to-[#E8F5E9] rounded-2xl border border-[#7B1FA2]/10">
                        <Sparkles size={14} className="text-[#7B1FA2] mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-[#1A1A1A]">AI Price Oracle analyzes market data, supply chains, and seasonal patterns</p>
                            <p className="text-[10px] text-[#6B7265] mt-0.5">Predictions update daily. Use these insights to time your bids for maximum advantage.</p>
                        </div>
                    </div>

                    {priceOracle.map((item, i) => (
                        <motion.div key={item.product} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                            className="bg-white rounded-2xl border border-[#E5E5E0] p-5 hover:shadow-md transition-all">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.direction === "down" ? "bg-[#E8F5E9]" : "bg-[#FFF3E0]"}`}>
                                        {item.direction === "down" ? <TrendingDown size={18} className="text-[#2E7D32]" /> : <TrendingUp size={18} className="text-[#E65100]" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-[#1A1A1A]">{item.product}</p>
                                        <p className="text-[10px] text-[#9CA38C]">{item.reason}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 flex-shrink-0">
                                    <div className="text-center">
                                        <p className="text-xs text-[#9CA38C]">Current</p>
                                        <p className="text-sm font-bold text-[#1A1A1A]">${item.current}</p>
                                    </div>
                                    <ArrowRight size={14} className="text-[#9CA38C]" />
                                    <div className="text-center">
                                        <p className="text-xs text-[#9CA38C]">Predicted</p>
                                        <p className={`text-sm font-bold ${item.direction === "down" ? "text-[#2E7D32]" : "text-[#E65100]"}`}>${item.predicted}</p>
                                    </div>
                                    <div className={`px-2.5 py-1 rounded-lg ${item.direction === "down" ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#FFF3E0] text-[#E65100]"}`}>
                                        <p className="text-xs font-bold">{item.change > 0 ? "+" : ""}{item.change}%</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-[#9CA38C]">In</p>
                                        <p className="text-xs font-bold text-[#1A1A1A]">{item.timeframe}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Brain size={9} className="text-[#7B1FA2]" />
                                        <span className="text-[10px] font-bold text-[#6B7265]">{item.confidence}%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-[#F0F0EC] flex items-center gap-2 text-[10px]">
                                <Sparkles size={9} className="text-[#7B1FA2]" />
                                <span className="text-[#6B7265]">
                                    {item.direction === "down"
                                        ? `Wait to bid — prices likely falling. Best window: ${item.timeframe}`
                                        : `Bid now — prices rising. Lock in current rate before increase`}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {view === "benchmark" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="bg-white rounded-2xl border border-[#E5E5E0] overflow-hidden">
                        <div className="px-5 py-4 border-b border-[#E5E5E0] flex items-center gap-2">
                            <Users size={14} className="text-[#4A6741]" />
                            <h2 className="text-sm font-bold text-[#1A1A1A]">Competitor Benchmarking</h2>
                            <span className="text-[9px] px-1.5 py-0.5 bg-[#F7F7F5] text-[#6B7265] rounded">Anonymous data</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="bg-[#F7F7F5]">
                                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#9CA38C] uppercase">Category</th>
                                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#9CA38C] uppercase">Your Avg Bid</th>
                                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#9CA38C] uppercase">Top Suppliers</th>
                                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#9CA38C] uppercase">Market Avg</th>
                                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#9CA38C] uppercase">Your Win Rate</th>
                                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#9CA38C] uppercase">Top Win Rate</th>
                                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#9CA38C] uppercase">Gap</th>
                                </tr></thead>
                                <tbody>
                                    {competitorBenchmark.map(row => {
                                        const gap = ((row.yourAvg - row.topAvg) / row.topAvg * 100).toFixed(1);
                                        return (
                                            <tr key={row.category} className="border-b border-[#F0F0EC] hover:bg-[#F7F7F5]">
                                                <td className="px-5 py-3 text-xs font-bold text-[#1A1A1A]">{row.category}</td>
                                                <td className="px-5 py-3 text-xs font-bold text-[#1A1A1A]">${row.yourAvg}</td>
                                                <td className="px-5 py-3 text-xs font-bold text-[#2E7D32]">${row.topAvg}</td>
                                                <td className="px-5 py-3 text-xs text-[#6B7265]">${row.marketAvg}</td>
                                                <td className="px-5 py-3"><span className={`text-xs font-bold ${row.winRate >= 50 ? "text-[#4A6741]" : "text-[#F57F17]"}`}>{row.winRate}%</span></td>
                                                <td className="px-5 py-3 text-xs font-bold text-[#2E7D32]">{row.topWinRate}%</td>
                                                <td className="px-5 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded ${Number(gap) <= 3 ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#FFF3E0] text-[#E65100]"}`}>+{gap}%</span></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {competitorBenchmark.map((cat, i) => (
                        <motion.div key={cat.category} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                            className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-[#E5E5E0]">
                            <Brain size={14} className="text-[#7B1FA2] mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-[#1A1A1A]">{cat.category}: {cat.position === "competitive" ? "✅ Competitive" : "⚠️ Above market"}</p>
                                <p className="text-[10px] text-[#6B7265] mt-0.5">
                                    {cat.position === "competitive"
                                        ? `Your avg bid ($${cat.yourAvg}) is close to top suppliers ($${cat.topAvg}). Tighten by $${cat.yourAvg - cat.topAvg} to match leaders.`
                                        : `Your avg bid ($${cat.yourAvg}) is $${cat.yourAvg - cat.topAvg} above top suppliers. Reduce pricing to improve your ${cat.winRate}% win rate.`}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {view === "trends" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="bg-white rounded-2xl border border-[#E5E5E0] p-5 relative overflow-hidden">
                        {/* Subtle background */}
                        <div className="absolute inset-0 opacity-[0.015]" style={{ background: "radial-gradient(ellipse at 30% 0%, #4A6741, transparent 60%)" }} />
                        <div className="relative">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2 className="text-sm font-bold text-[#1A1A1A] mb-0.5">Price Trends (6 Months)</h2>
                                    <p className="text-[10px] text-[#9CA38C]">Average winning bid prices over time</p>
                                </div>
                                <div className="flex items-center gap-4 text-[10px]">
                                    {[
                                        { name: "Beverages", color: "#4A6741" },
                                        { name: "Rice & Grains", color: "#6B8F61" },
                                        { name: "Cooking Oil", color: "#2C432D" },
                                    ].map(cat => (
                                        <span key={cat.name} className="flex items-center gap-1.5">
                                            <span className="w-3 h-[2px] rounded-full" style={{ backgroundColor: cat.color }} />
                                            {cat.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <LineChart data={priceTrends} />
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

// SVG Line Chart Component
function LineChart({ data }: { data: typeof priceTrends }) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const categories = [
        { key: "beverages" as const, name: "Beverages", color: "#4A6741", label: "$" },
        { key: "rice" as const, name: "Rice & Grains", color: "#6B8F61", label: "$" },
        { key: "oil" as const, name: "Cooking Oil", color: "#2C432D", label: "$" },
    ];

    // Chart dimensions
    const width = 700;
    const height = 240;
    const padding = { top: 20, right: 20, bottom: 30, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Compute global min/max for each category to normalize
    const getMinMax = (key: "beverages" | "rice" | "oil") => {
        const vals = data.map(d => d[key]);
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        const range = max - min || 1;
        return { min: min - range * 0.15, max: max + range * 0.15 };
    };

    const ranges = {
        beverages: getMinMax("beverages"),
        rice: getMinMax("rice"),
        oil: getMinMax("oil"),
    };

    const getX = (i: number) => padding.left + (i / (data.length - 1)) * chartW;
    const getY = (val: number, key: "beverages" | "rice" | "oil") => {
        const { min, max } = ranges[key];
        return padding.top + chartH - ((val - min) / (max - min)) * chartH;
    };

    const buildPath = (key: "beverages" | "rice" | "oil") => {
        return data.map((d, i) => {
            const x = getX(i);
            const y = getY(d[key], key);
            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
        }).join(" ");
    };

    const buildAreaPath = (key: "beverages" | "rice" | "oil") => {
        const linePart = data.map((d, i) => {
            const x = getX(i);
            const y = getY(d[key], key);
            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
        }).join(" ");
        const lastX = getX(data.length - 1);
        const firstX = getX(0);
        const bottomY = padding.top + chartH;
        return `${linePart} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
    };

    // Grid lines (5 horizontal)
    const gridLines = Array.from({ length: 5 }, (_, i) => padding.top + (chartH / 4) * i);

    return (
        <div className="relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: "280px" }}
                onMouseLeave={() => setHoveredIndex(null)}>
                <defs>
                    {categories.map(cat => (
                        <linearGradient key={cat.key} id={`area-${cat.key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={cat.color} stopOpacity="0.15" />
                            <stop offset="100%" stopColor={cat.color} stopOpacity="0.01" />
                        </linearGradient>
                    ))}
                </defs>

                {/* Grid lines */}
                {gridLines.map((y, i) => (
                    <line key={i} x1={padding.left} y1={y} x2={width - padding.right} y2={y}
                        stroke="#F0F0EC" strokeWidth="1" />
                ))}
                {/* Bottom axis */}
                <line x1={padding.left} y1={padding.top + chartH} x2={width - padding.right} y2={padding.top + chartH}
                    stroke="#E5E5E0" strokeWidth="1" />

                {/* Area fills */}
                {categories.map(cat => (
                    <motion.path key={`area-${cat.key}`} d={buildAreaPath(cat.key)}
                        fill={`url(#area-${cat.key})`}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ duration: 0.8 }} />
                ))}

                {/* Lines */}
                {categories.map(cat => (
                    <motion.path key={`line-${cat.key}`} d={buildPath(cat.key)}
                        fill="none" stroke={cat.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        transition={{ duration: 1.2, ease: "easeInOut" }} />
                ))}

                {/* Data points */}
                {categories.map(cat =>
                    data.map((d, i) => (
                        <circle key={`dot-${cat.key}-${i}`}
                            cx={getX(i)} cy={getY(d[cat.key], cat.key)} r={hoveredIndex === i ? 5 : 3}
                            fill="white" stroke={cat.color} strokeWidth="2"
                            className="transition-all duration-150" />
                    ))
                )}

                {/* Hover columns */}
                {data.map((d, i) => (
                    <rect key={`hover-${i}`}
                        x={getX(i) - chartW / data.length / 2}
                        y={padding.top}
                        width={chartW / data.length}
                        height={chartH}
                        fill="transparent"
                        onMouseEnter={() => setHoveredIndex(i)}
                        className="cursor-pointer" />
                ))}

                {/* Hover line */}
                {hoveredIndex !== null && (
                    <line x1={getX(hoveredIndex)} y1={padding.top} x2={getX(hoveredIndex)} y2={padding.top + chartH}
                        stroke="#E5E5E0" strokeWidth="1" strokeDasharray="4 3" />
                )}

                {/* X-axis labels */}
                {data.map((d, i) => (
                    <text key={`label-${i}`} x={getX(i)} y={height - 6}
                        textAnchor="middle" fontSize="10" fill="#9CA38C" fontFamily="Inter, sans-serif">
                        {d.month}
                    </text>
                ))}
            </svg>

            {/* Tooltip */}
            {hoveredIndex !== null && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#1A2E1B] text-white rounded-lg px-3 py-2 shadow-lg z-10 pointer-events-none"
                    style={{ minWidth: "160px" }}>
                    <p className="text-[10px] font-bold text-white/60 mb-1">{data[hoveredIndex].month}</p>
                    {categories.map(cat => (
                        <div key={cat.key} className="flex items-center justify-between gap-4 text-[11px]">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                {cat.name}
                            </span>
                            <span className="font-bold">${data[hoveredIndex][cat.key]}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Summary footer */}
            <div className="mt-3 pt-3 border-t border-[#F0F0EC] grid grid-cols-3 gap-4">
                {categories.map(cat => {
                    const first = data[0][cat.key];
                    const last = data[data.length - 1][cat.key];
                    const change = ((last - first) / first * 100).toFixed(1);
                    return (
                        <div key={cat.key} className="text-center">
                            <p className="text-[10px] text-[#9CA38C]">{cat.name}</p>
                            <p className="text-sm font-bold" style={{ color: cat.color }}>
                                ${last}
                                <span className={`text-[10px] ml-1 ${Number(change) < 0 ? "text-[#4A6741]" : "text-[#6B7265]"}`}>
                                    {Number(change) > 0 ? "+" : ""}{change}%
                                </span>
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
