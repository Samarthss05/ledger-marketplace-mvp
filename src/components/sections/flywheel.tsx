"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, Gavel, Users, Landmark, ArrowRight } from "lucide-react";

const nodes = [
    {
        icon: Brain,
        title: "Sentient OS",
        short: "Generates demand data & transaction signals",
    },
    {
        icon: Gavel,
        title: "Demand Auction",
        short: "Creates transaction volume & competitive pricing",
    },
    {
        icon: Users,
        title: "Digital Cooperative",
        short: "Attracts more shops, increases network value",
    },
    {
        icon: Landmark,
        title: "Embedded Bank",
        short: "Provides capital for larger orders & growth",
    },
];

export default function Flywheel() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section className="relative py-28 lg:py-36 bg-white" ref={ref}>
            {/* Cross pattern */}
            <div className="absolute inset-0 cross-pattern pointer-events-none" />

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-4"
                >
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                        The Flywheel
                    </span>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-center"
                >
                    Each pillar makes the
                    <br />
                    <span className="text-muted">others stronger</span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="text-lg text-muted max-w-2xl mx-auto text-center mb-20 leading-relaxed"
                >
                    This isn&apos;t a collection of products. It&apos;s a single integrated operating
                    system where every component amplifies the value of the rest.
                </motion.p>

                {/* Flywheel Visualization */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="relative max-w-4xl mx-auto"
                >
                    {/* Nodes Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {nodes.map((node, i) => (
                            <motion.div
                                key={node.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                                className="group p-6 rounded-2xl bg-white border border-border hover:border-primary/25 transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-md"
                            >
                                <div className="absolute inset-0 bg-surface-green opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-surface-green border border-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                                        <node.icon size={18} className="text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-foreground mb-1">
                                            {node.title}
                                        </h4>
                                        <p className="text-sm text-muted leading-relaxed">
                                            {node.short}
                                        </p>
                                    </div>
                                </div>
                                {/* Arrow showing flow */}
                                <div className="absolute bottom-3 right-4 text-border group-hover:text-primary/40 transition-colors">
                                    <ArrowRight size={14} />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Flow description */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.7 }}
                        className="mt-10 p-6 rounded-2xl bg-surface border border-border text-center"
                    >
                        <p className="text-sm text-muted leading-relaxed max-w-xl mx-auto">
                            <span className="text-primary font-medium">More shops</span> → better AI predictions →{" "}
                            <span className="text-primary font-medium">lower prices</span> → more demand →{" "}
                            <span className="text-primary font-medium">more capital</span> → larger orders →{" "}
                            <span className="text-primary font-medium">more data</span> → repeat ∞
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
