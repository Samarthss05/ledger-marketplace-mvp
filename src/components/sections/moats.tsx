"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, Database, TrendingUp, Layers } from "lucide-react";

const moats = [
    {
        icon: Database,
        title: "Data Moat",
        description:
            "The Sentient OS grows more intelligent with every transaction. Prediction accuracy becomes unassailable over time.",
    },
    {
        icon: TrendingUp,
        title: "Liquidity Moat",
        description:
            "The Demand Auction creates a unique market with deep liquidity — the only place suppliers find guaranteed demand.",
    },
    {
        icon: Shield,
        title: "Brand Moat",
        description:
            "The Digital Cooperative builds a trusted consumer brand, capturing the most valuable asset: the end-customer relationship.",
    },
    {
        icon: Layers,
        title: "Financial Moat",
        description:
            "Shops build platform-specific credit history. Leaving means losing financial identity and reverting to bank rejection.",
    },
];

export default function Moats() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section className="relative py-28 lg:py-36 bg-surface" ref={ref}>
            {/* Dot pattern */}
            <div className="absolute inset-0 dot-pattern pointer-events-none" />

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-4"
                >
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                        Defensibility
                    </span>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-center"
                >
                    Four moats.{" "}
                    <span className="text-muted">Zero attack surface.</span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="text-lg text-muted max-w-2xl mx-auto text-center mb-16 leading-relaxed"
                >
                    Not just advantages — compounding moats that deepen with every
                    shop, transaction, and data point added to the network.
                </motion.p>

                {/* Moats Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {moats.map((moat, i) => (
                        <motion.div
                            key={moat.title}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                            className="group p-6 rounded-2xl bg-white border border-border hover:border-primary/25 transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-md"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-surface-green/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative">
                                <div className="w-11 h-11 rounded-xl bg-surface-green border border-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/10 transition-colors duration-300">
                                    <moat.icon size={20} className="text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-3 text-foreground">{moat.title}</h3>
                                <p className="text-sm text-muted leading-relaxed">
                                    {moat.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
