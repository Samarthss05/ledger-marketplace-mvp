"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Image from "next/image";
import logo from "../../../public/logo.png";

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
            {/* Background pattern */}
            <div className="absolute inset-0 dot-pattern pointer-events-none" />

            {/* Subtle gradient orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-[100px]" />
                <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-accent/[0.03] rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-32 lg:py-40">
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/15 bg-surface-green text-sm text-primary mb-8">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            Powering ASEAN&apos;s Retail Infrastructure
                        </div>
                    </motion.div>

                    {/* Logo icon */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.05 }}
                        className="mb-8"
                    >
                        <Image src={logo} alt="Ledger" width={72} height={72} className="rounded-2xl" />
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.05] mb-6"
                    >
                        <span className="text-foreground">The Operating</span>
                        <br />
                        <span className="text-foreground">System for </span>
                        <span className="bg-gradient-to-r from-primary-dark via-primary to-accent bg-clip-text text-transparent">
                            Retail
                        </span>
                    </motion.h1>

                    {/* Subheading */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg sm:text-xl text-muted max-w-2xl leading-relaxed mb-10"
                    >
                        Not a marketplace. An indispensable infrastructure layer that makes
                        traditional retail autonomous, bankable, and unstoppable.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4"
                    >
                        <a
                            href="#contact"
                            className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-all duration-200 shadow-md shadow-primary/20"
                        >
                            Request Early Access
                            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        </a>
                        <a
                            href="#platform"
                            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-medium text-foreground border border-border bg-white rounded-xl hover:bg-surface hover:border-primary/20 transition-all duration-200"
                        >
                            Explore the Platform
                        </a>
                    </motion.div>

                    {/* Stats strip */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="mt-20 grid grid-cols-3 gap-8 sm:gap-16 border-t border-border pt-10"
                    >
                        {[
                            { value: "40%+", label: "SME loans rejected by banks" },
                            { value: "$1.2T", label: "Traditional retail market in ASEAN" },
                            { value: "15M+", label: "Shops underserved by technology" },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p className="text-2xl sm:text-3xl font-bold text-primary">
                                    {stat.value}
                                </p>
                                <p className="text-xs sm:text-sm text-muted mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
                <a href="#problem" className="flex flex-col items-center gap-2 text-muted hover:text-foreground transition-colors">
                    <span className="text-xs uppercase tracking-widest">Scroll</span>
                    <ChevronDown size={16} className="animate-bounce" />
                </a>
            </motion.div>
        </section>
    );
}
