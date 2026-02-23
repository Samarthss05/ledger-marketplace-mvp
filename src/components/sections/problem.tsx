"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { AlertTriangle, ArrowRight, Zap } from "lucide-react";

export default function Problem() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section id="problem" className="relative py-28 lg:py-36 bg-surface" ref={ref}>
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 grid-pattern pointer-events-none" />

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                {/* Section Label */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    className="mb-4"
                >
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                        The Problem
                    </span>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 max-w-3xl"
                >
                    Marketplaces are{" "}
                    <span className="text-muted line-through decoration-primary/40">broken by design</span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="text-lg text-muted max-w-2xl mb-16 leading-relaxed"
                >
                    Every B2B marketplace suffers from the same fatal flaw: disintermediation.
                    The moment buyers and sellers connect, they&apos;re incentivized to cut you out.
                </motion.p>

                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Problem Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="p-8 lg:p-10 rounded-2xl bg-white border border-border relative overflow-hidden group shadow-sm"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/5 rounded-full blur-[60px]" />
                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mb-6">
                                <AlertTriangle size={22} className="text-red-500" />
                            </div>
                            <h3 className="text-xl font-semibold mb-4 text-foreground">The Marketplace Trap</h3>
                            <ul className="space-y-4">
                                {[
                                    "Buyers and sellers transact off-platform to avoid fees",
                                    "Commission models create adversarial relationships",
                                    "No defensible moat — suppliers can always go direct",
                                    "Value captured only at the point of transaction",
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-muted leading-relaxed">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>

                    {/* Solution Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="p-8 lg:p-10 rounded-2xl bg-white border border-primary/20 relative overflow-hidden group shadow-sm"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-[60px]" />
                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-surface-green border border-primary/15 flex items-center justify-center mb-6">
                                <Zap size={22} className="text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-4 text-foreground">The OS Paradigm</h3>
                            <ul className="space-y-4">
                                {[
                                    "Become indispensable infrastructure, not a middleman",
                                    "Shops pay for tools they can't operate without",
                                    "Four reinforcing pillars create an unbreakable moat",
                                    "Value captured across every dimension of the business",
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-muted leading-relaxed">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                </div>

                {/* Transition */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mt-16 flex items-center justify-center"
                >
                    <a
                        href="#platform"
                        className="group inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                    >
                        See how Ledger solves this
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
