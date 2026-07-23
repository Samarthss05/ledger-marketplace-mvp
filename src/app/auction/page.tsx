"use client";

import { motion } from "framer-motion";
import { Store, Truck, ArrowRight, Sparkles, TrendingDown, Shield, BarChart3 } from "lucide-react";
import Link from "next/link";
import { BrandLockup } from "@/components/brand-lockup";

export default function AuctionLanding() {
    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(111,146,119,0.13),transparent_30%),linear-gradient(145deg,#FAFBF8_0%,#FFFFFF_48%,#EDF3EC_100%)] flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-5 lg:px-12">
                <Link href="/auction" aria-label="ReStock by Ledger home">
                    <BrandLockup size="lg" priority />
                </Link>
                <span className="hidden rounded-full border border-[#DDE5DC] bg-white/75 px-3 py-1.5 text-[10px] font-semibold tracking-[0.16em] text-[#4F6F56] uppercase sm:inline-flex">
                    Retail procurement network
                </span>
            </header>

            {/* Main content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#DDE5DC] bg-white/80 px-4 py-1.5 shadow-sm"
                >
                    <Sparkles size={12} className="text-[#6F9277]" />
                    <span className="text-xs font-semibold text-[#4F6F56]">One connected procurement workspace</span>
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mb-4 max-w-3xl text-center text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-[#2F312F] md:text-6xl"
                >
                    Restocking,{" "}
                    <span className="bg-gradient-to-r from-[#4F6F56] to-[#89A98D] bg-clip-text text-transparent">
                        without the chaos.
                    </span>{" "}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-12 max-w-2xl text-center text-base leading-7 text-[#666B66]"
                >
                    ReStock connects independent retailers and trusted suppliers to plan demand,
                    compare bids, place orders, and manage fulfillment with confidence.
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
                            <div className="group relative cursor-pointer overflow-hidden rounded-3xl border border-[#DDE5DC] bg-white/90 p-8 shadow-[0_24px_60px_-44px_rgba(79,111,86,0.45)] transition-all duration-500 hover:-translate-y-1 hover:border-[#6F9277]/40 hover:shadow-[0_28px_70px_-38px_rgba(79,111,86,0.5)]">
                                {/* Background glow */}
                                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#4A6741]/5 rounded-full blur-3xl group-hover:bg-[#4A6741]/10 transition-all duration-500" />

                                <div className="relative">
                                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6F9277] to-[#89A98D] shadow-lg shadow-[#6F9277]/20 transition-transform duration-300 group-hover:scale-105">
                                        <Store size={24} className="text-white" />
                                    </div>

                                    <p className="mb-2 text-[10px] font-bold tracking-[0.18em] text-[#6F9277] uppercase">Retailer workspace</p>
                                    <h2 className="mb-2 text-xl font-bold text-[#2F312F]">Buy for my shop</h2>
                                    <p className="mb-6 text-sm leading-relaxed text-[#666B66]">
                                        Plan what you need, pool demand, compare supplier bids, and
                                        keep every order moving in one place.
                                    </p>

                                    {/* Value props */}
                                    <div className="space-y-2.5 mb-6">
                                        {[
                                            { icon: TrendingDown, text: "Compare market-ready supplier bids" },
                                            { icon: Shield, text: "Buy from verified suppliers" },
                                            { icon: Sparkles, text: "Plan demand and reorder faster" },
                                        ].map((item) => (
                                            <div key={item.text} className="flex items-center gap-2.5">
                                                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-[#EDF3EC]">
                                                    <item.icon size={10} className="text-[#6F9277]" />
                                                </div>
                                                <span className="text-xs text-[#666B66]">{item.text}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2 text-sm font-semibold text-[#4F6F56] transition-all group-hover:gap-3">
                                        Open retailer workspace <ArrowRight size={16} />
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
                            <div className="group relative cursor-pointer overflow-hidden rounded-3xl border border-[#DDE5DC] bg-white/90 p-8 shadow-[0_24px_60px_-44px_rgba(79,111,86,0.45)] transition-all duration-500 hover:-translate-y-1 hover:border-[#6F9277]/40 hover:shadow-[0_28px_70px_-38px_rgba(79,111,86,0.5)]">
                                {/* Background glow */}
                                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#6F9277]/5 rounded-full blur-3xl group-hover:bg-[#6F9277]/10 transition-all duration-500" />

                                <div className="relative">
                                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4F6F56] to-[#6F9277] shadow-lg shadow-[#4F6F56]/20 transition-transform duration-300 group-hover:scale-105">
                                        <Truck size={24} className="text-white" />
                                    </div>

                                    <p className="mb-2 text-[10px] font-bold tracking-[0.18em] text-[#6F9277] uppercase">Supplier workspace</p>
                                    <h2 className="mb-2 text-xl font-bold text-[#2F312F]">Sell as a supplier</h2>
                                    <p className="mb-6 text-sm leading-relaxed text-[#666B66]">
                                        See qualified demand, submit competitive bids, and manage
                                        orders from award through delivery.
                                    </p>

                                    {/* Value props */}
                                    <div className="space-y-2.5 mb-6">
                                        {[
                                            { icon: BarChart3, text: "Access qualified aggregated demand" },
                                            { icon: Shield, text: "Transact through a trusted workflow" },
                                            { icon: Sparkles, text: "Forecast volume and act earlier" },
                                        ].map((item) => (
                                            <div key={item.text} className="flex items-center gap-2.5">
                                                <div className="w-5 h-5 rounded-md bg-[#F2F5F0] flex items-center justify-center flex-shrink-0">
                                                    <item.icon size={10} className="text-[#4A6741]" />
                                                </div>
                                                <span className="text-xs text-[#666B66]">{item.text}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2 text-sm font-semibold text-[#4F6F56] transition-all group-hover:gap-3">
                                        Open supplier workspace <ArrowRight size={16} />
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
                    className="mt-12 flex flex-wrap items-center justify-center gap-8 border-t border-[#DDE5DC] pt-8"
                >
                    {[
                        { value: "One", label: "Procurement workspace" },
                        { value: "Live", label: "Supplier competition" },
                        { value: "Clear", label: "Order visibility" },
                        { value: "SEA", label: "Built for the region" },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <p className="text-lg font-bold text-[#2F312F]">{stat.value}</p>
                            <p className="text-[10px] tracking-wide text-[#8A918A] uppercase">{stat.label}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
