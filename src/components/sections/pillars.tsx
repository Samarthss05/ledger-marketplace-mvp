"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Brain, Gavel, Users, Landmark, Check } from "lucide-react";

const pillars = [
    {
        id: "platform",
        icon: Brain,
        label: "Pillar 01",
        title: "Sentient OS",
        subtitle: "The AI That Runs the Shop",
        description:
            "An autonomous AI agent that manages procurement, pricing, and inventory — not with suggestions, but with action. It places orders, negotiates with suppliers, and dynamically optimizes margins 24/7.",
        features: [
            "Autonomous procurement — the AI places orders, not the owner",
            "Dynamic pricing that optimizes sell-through and margin in real-time",
            "15% cost reduction guarantee or the service is free",
            "Learns and improves with every transaction across the network",
        ],
        metric: "15%",
        metricLabel: "Guaranteed cost reduction",
    },
    {
        id: "features",
        icon: Gavel,
        label: "Pillar 02",
        title: "Demand Auction",
        subtitle: "Suppliers Bid for Guaranteed Sales",
        description:
            "The platform aggregates demand from the entire shop network and puts it up for auction. Suppliers compete on price, terms, and speed — driving costs down while guaranteeing them predictable volume.",
        features: [
            "Aggregated demand creates hyper-competitive supplier bidding",
            "Suppliers bid on price, payment terms, and delivery speed",
            "Disintermediation is impossible — demand only exists on-platform",
            "Winner's fee model, not commission — suppliers pay for guaranteed sales",
        ],
        metric: "10K+",
        metricLabel: "Cases auctioned weekly",
    },
    {
        id: "ecosystem",
        icon: Users,
        label: "Pillar 03",
        title: "Digital Cooperative",
        subtitle: "Franchise Power Without the Fees",
        description:
            "Transform fragmented independent shops into a unified retail network with collective bargaining, private label products, and a consumer-facing brand — the power of 7-Eleven without the franchise costs.",
        features: [
            "Collective bargaining with manufacturers for exclusive pricing",
            "Private label brands with significantly higher margins",
            "Consumer-facing app with universal loyalty program",
            "Unified brand identity that attracts more foot traffic",
        ],
        metric: "3x",
        metricLabel: "Margin improvement on private label",
    },
    {
        id: "finance",
        icon: Landmark,
        label: "Pillar 04",
        title: "Embedded Bank",
        subtitle: "The Financial Backbone",
        description:
            "Real-time POS data enables instant credit scoring that traditional banks can't match. B2B Buy Now Pay Later, supplier accelerators, and growth financing — all embedded seamlessly in the transaction flow.",
        features: [
            "Instant working capital — B2B BNPL at the point of order",
            "AI credit scoring using real-time transaction velocity data",
            "Supplier Accelerator: 24-48hr payment for a small discount",
            "Growth Fund for high-performers to expand operations",
        ],
        metric: "40%+",
        metricLabel: "SME loans currently rejected by banks",
    },
];

export default function Pillars() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [activeIndex, setActiveIndex] = useState(0);
    const activePillar = pillars[activeIndex];

    return (
        <>
            {/* Transition gradient: white → green */}
            <div className="h-40 bg-gradient-to-b from-surface via-surface-green to-green-bg" />

            <section className="relative py-28 lg:py-36 bg-green-bg green-pattern" ref={ref}>
                <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                    {/* Section Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5 }}
                        className="mb-4"
                    >
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                            Four Pillars
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 max-w-3xl text-white"
                    >
                        Four pillars.{" "}
                        <span className="text-white/50">One unbreakable moat.</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="text-lg text-white/60 max-w-2xl mb-16 leading-relaxed"
                    >
                        Each pillar is powerful alone. Together, they create a self-reinforcing
                        ecosystem that&apos;s impossible for competitors to replicate.
                    </motion.p>

                    {/* Pillar Tabs + Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        {/* Tab Navigation */}
                        <div className="flex flex-wrap gap-2 mb-10">
                            {pillars.map((pillar, i) => (
                                <button
                                    key={pillar.id}
                                    onClick={() => setActiveIndex(i)}
                                    className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 border cursor-pointer ${i === activeIndex
                                            ? "bg-white/15 border-white/25 text-white"
                                            : "bg-white/5 border-white/10 text-white/50 hover:text-white/80 hover:border-white/20"
                                        }`}
                                >
                                    <pillar.icon size={16} />
                                    {pillar.title}
                                </button>
                            ))}
                        </div>

                        {/* Active Content */}
                        <div
                            id={activePillar.id}
                            className="grid lg:grid-cols-5 gap-8 lg:gap-12"
                        >
                            {/* Left: Description */}
                            <div className="lg:col-span-3 p-8 lg:p-10 rounded-2xl bg-white/[0.07] border border-white/10 backdrop-blur-sm relative overflow-hidden">
                                <div className="relative">
                                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40 mb-3 block">
                                        {activePillar.label}
                                    </span>
                                    <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-white">
                                        {activePillar.title}
                                    </h3>
                                    <p className="text-sm text-white/50 mb-6">
                                        {activePillar.subtitle}
                                    </p>
                                    <p className="text-white/70 leading-relaxed mb-8">
                                        {activePillar.description}
                                    </p>
                                    <ul className="space-y-3">
                                        {activePillar.features.map((feature, i) => (
                                            <li
                                                key={i}
                                                className="flex items-start gap-3 text-sm text-white/60"
                                            >
                                                <Check
                                                    size={16}
                                                    className="mt-0.5 text-white/80 flex-shrink-0"
                                                />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Right: Metric */}
                            <div className="lg:col-span-2 flex flex-col gap-6">
                                <div className="flex-1 p-8 rounded-2xl bg-white/[0.07] border border-white/10 backdrop-blur-sm flex flex-col items-center justify-center text-center">
                                    <p className="text-6xl sm:text-7xl font-bold text-white mb-3">
                                        {activePillar.metric}
                                    </p>
                                    <p className="text-sm text-white/50">
                                        {activePillar.metricLabel}
                                    </p>
                                </div>

                                <div className="p-6 rounded-2xl bg-white/[0.07] border border-white/10 backdrop-blur-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                            <activePillar.icon size={16} className="text-white/70" />
                                        </div>
                                        <span className="text-sm font-medium text-white">Lock-In Effect</span>
                                    </div>
                                    <p className="text-xs text-white/50 leading-relaxed">
                                        {activeIndex === 0 &&
                                            "Leaving means firing a 24/7 AI employee that maximizes profit — and reverting to manual operations."}
                                        {activeIndex === 1 &&
                                            "Demand only exists in aggregated form on-platform. Suppliers can't go around the system."}
                                        {activeIndex === 2 &&
                                            "Shops gain brand identity, exclusive products, and consumer loyalty they lose by leaving."}
                                        {activeIndex === 3 &&
                                            "Credit history is platform-specific. Leaving means starting from scratch with banks that reject 40%+ of SMEs."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Transition gradient: green → white */}
            <div className="h-40 bg-gradient-to-b from-green-bg via-surface-green to-white" />
        </>
    );
}
