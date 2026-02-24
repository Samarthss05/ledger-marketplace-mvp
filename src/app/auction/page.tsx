"use client";

import { motion } from "framer-motion";
import { Store, Truck, ArrowRight, Zap, TrendingDown, Shield, BarChart3 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/logo.png";

export default function AuctionLanding() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F7F7F5] via-white to-[#F2F5F0] flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between px-6 lg:px-12 py-5">
                <Link href="/" className="flex items-center gap-2.5">
                    <Image src={logo} alt="Ledger" width={32} height={32} className="rounded-lg" />
                    <span className="text-lg font-bold tracking-tight text-[#2C432D]">Ledger</span>
                </Link>
                <Link
                    href="/"
                    className="text-xs text-[#9CA38C] hover:text-[#4A6741] transition-colors"
                >
                    ← Back to Home
                </Link>
            </header>

            {/* Main content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#E8F5E9] rounded-full mb-6"
                >
                    <Zap size={12} className="text-[#4A6741]" />
                    <span className="text-xs font-semibold text-[#4A6741]">Pillar 2 — Demand Auction Module</span>
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-3xl md:text-5xl font-bold text-[#1A1A1A] text-center max-w-2xl leading-tight mb-3"
                >
                    The Demand{" "}
                    <span className="bg-gradient-to-r from-[#4A6741] to-[#6B8F71] bg-clip-text text-transparent">
                        Auction
                    </span>{" "}
                    Marketplace
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-base text-[#6B7265] text-center max-w-lg mb-12"
                >
                    Aggregated demand meets competitive supply. Get the best prices through
                    reverse auctions powered by collective buying power.
                </motion.p>

                {/* Role Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                    {/* Shop Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <Link href="/auction/shop">
                            <div className="group relative bg-white rounded-3xl border border-[#E5E5E0] p-8 hover:shadow-2xl hover:shadow-[#4A6741]/10 hover:border-[#4A6741]/30 transition-all duration-500 cursor-pointer overflow-hidden">
                                {/* Background glow */}
                                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#4A6741]/5 rounded-full blur-3xl group-hover:bg-[#4A6741]/10 transition-all duration-500" />

                                <div className="relative">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4A6741] to-[#6B8F71] flex items-center justify-center mb-5 shadow-lg shadow-[#4A6741]/20 group-hover:scale-110 transition-transform duration-300">
                                        <Store size={24} className="text-white" />
                                    </div>

                                    <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">I&apos;m a Shop Owner</h2>
                                    <p className="text-sm text-[#6B7265] mb-6 leading-relaxed">
                                        Browse auctions, join demand pools, and get the best wholesale
                                        prices for your store through collective buying power.
                                    </p>

                                    {/* Value props */}
                                    <div className="space-y-2.5 mb-6">
                                        {[
                                            { icon: TrendingDown, text: "Save 15-25% vs individual purchasing" },
                                            { icon: Shield, text: "Verified suppliers with quality guarantees" },
                                            { icon: Zap, text: "One-click ordering & demand requests" },
                                        ].map((item) => (
                                            <div key={item.text} className="flex items-center gap-2.5">
                                                <div className="w-5 h-5 rounded-md bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                                                    <item.icon size={10} className="text-[#4A6741]" />
                                                </div>
                                                <span className="text-xs text-[#6B7265]">{item.text}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2 text-sm font-semibold text-[#4A6741] group-hover:gap-3 transition-all">
                                        Enter Shop Portal <ArrowRight size={16} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Supplier Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <Link href="/auction/supplier">
                            <div className="group relative bg-white rounded-3xl border border-[#E5E5E0] p-8 hover:shadow-2xl hover:shadow-[#4A6741]/10 hover:border-[#4A6741]/30 transition-all duration-500 cursor-pointer overflow-hidden">
                                {/* Background glow */}
                                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#3B6B9B]/5 rounded-full blur-3xl group-hover:bg-[#3B6B9B]/10 transition-all duration-500" />

                                <div className="relative">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2C432D] to-[#4A6741] flex items-center justify-center mb-5 shadow-lg shadow-[#2C432D]/20 group-hover:scale-110 transition-transform duration-300">
                                        <Truck size={24} className="text-white" />
                                    </div>

                                    <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">I&apos;m a Supplier</h2>
                                    <p className="text-sm text-[#6B7265] mb-6 leading-relaxed">
                                        Access aggregated demand from 6,000+ shops. Bid on auctions,
                                        win guaranteed contracts, and grow your revenue.
                                    </p>

                                    {/* Value props */}
                                    <div className="space-y-2.5 mb-6">
                                        {[
                                            { icon: BarChart3, text: "Access to aggregated demand at scale" },
                                            { icon: Shield, text: "Guaranteed payments within 24-48 hours" },
                                            { icon: Zap, text: "Predictable revenue & volume forecasting" },
                                        ].map((item) => (
                                            <div key={item.text} className="flex items-center gap-2.5">
                                                <div className="w-5 h-5 rounded-md bg-[#F2F5F0] flex items-center justify-center flex-shrink-0">
                                                    <item.icon size={10} className="text-[#4A6741]" />
                                                </div>
                                                <span className="text-xs text-[#6B7265]">{item.text}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2 text-sm font-semibold text-[#4A6741] group-hover:gap-3 transition-all">
                                        Enter Supplier Portal <ArrowRight size={16} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                </div>

                {/* Bottom stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="flex flex-wrap items-center justify-center gap-8 mt-12 pt-8 border-t border-[#E5E5E0]"
                >
                    {[
                        { value: "$2.1M+", label: "Weekly GMV" },
                        { value: "156", label: "Shops Active" },
                        { value: "18.5%", label: "Avg. Savings" },
                        { value: "87%", label: "Auction Success Rate" },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <p className="text-lg font-bold text-[#1A1A1A]">{stat.value}</p>
                            <p className="text-[10px] text-[#9CA38C] uppercase tracking-wide">{stat.label}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
