"use client";

import { motion } from "framer-motion";
import {
    ArrowRight,
    ClipboardList,
    Layers,
    PackageCheck,
    ShoppingBag,
    Store,
} from "lucide-react";
import Link from "next/link";
import StatusBadge from "../components/status-badge";
import {
    auctions,
    demandItems,
    formatCurrency,
    orders,
} from "../lib/mock-data";

export default function ShopDashboard() {
    const activeAuctions = auctions.filter((auction) => auction.status === "active");
    const myDemand = demandItems.filter((demand) =>
        demand.participatingShops.some((shop) => shop.name === "RK Minimart")
    );
    const myOrders = orders.filter((order) => order.shopName === "RK Minimart");
    const activeOrders = myOrders.filter((order) => order.status !== "delivered");
    const committedValue = myOrders.reduce((total, order) => total + order.totalPrice, 0);

    const stats = [
        {
            icon: ShoppingBag,
            label: "Open auctions",
            value: activeAuctions.length.toString(),
            note: "ready to review",
        },
        {
            icon: Layers,
            label: "Demand requests",
            value: myDemand.length.toString(),
            note: "in progress",
        },
        {
            icon: PackageCheck,
            label: "Active orders",
            value: activeOrders.length.toString(),
            note: "being fulfilled",
        },
        {
            icon: ClipboardList,
            label: "Committed value",
            value: formatCurrency(committedValue),
            note: "across current orders",
        },
    ];

    return (
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#375D49] via-[#4F6F56] to-[#6F9277] p-6 text-white"
            >
                <div
                    className="absolute inset-0 opacity-[0.08]"
                    style={{
                        backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                        backgroundSize: "18px 18px",
                    }}
                />
                <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1">
                            <Store size={11} />
                            <span className="text-[9px] font-semibold tracking-[0.16em] uppercase">
                                Retailer workspace
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Welcome back, RK Minimart</h1>
                        <p className="mt-1 text-sm text-white/70">
                            Review demand, compare supplier offers, and keep orders moving.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href="/auction/shop/marketplace"
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#375D49] shadow-sm"
                        >
                            <ShoppingBag size={14} />
                            Browse marketplace
                        </Link>
                        <Link
                            href="/auction/shop/demand"
                            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white"
                        >
                            <Layers size={14} />
                            Submit demand
                        </Link>
                    </div>
                </div>
            </motion.section>

            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="rounded-2xl border border-[#DDE5DC] bg-white p-4 shadow-[0_18px_45px_-38px_rgba(79,111,86,0.35)]"
                    >
                        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#EDF3EC] text-[#4F6F56]">
                            <stat.icon size={16} />
                        </div>
                        <p className="text-xl font-bold text-[#2F312F]">{stat.value}</p>
                        <p className="mt-0.5 text-xs font-semibold text-[#2F312F]">{stat.label}</p>
                        <p className="text-[10px] text-[#8A918A]">{stat.note}</p>
                    </motion.div>
                ))}
            </section>

            <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
                <section className="rounded-3xl border border-[#DDE5DC] bg-white p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-[#2F312F]">Available to buy</h2>
                            <p className="mt-0.5 text-xs text-[#8A918A]">
                                Active sourcing opportunities matched to your shop.
                            </p>
                        </div>
                        <Link
                            href="/auction/shop/marketplace"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F6F56]"
                        >
                            View all <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="divide-y divide-[#EDF3EC]">
                        {activeAuctions.slice(0, 4).map((auction) => {
                            const lowestBid =
                                auction.bids.length > 0
                                    ? Math.min(...auction.bids.map((bid) => bid.pricePerUnit))
                                    : auction.reservePrice;

                            return (
                                <div
                                    key={auction.id}
                                    className="flex flex-col gap-3 py-4 first:pt-1 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="truncate text-sm font-semibold text-[#2F312F]">
                                                {auction.productName}
                                            </p>
                                            <StatusBadge status={auction.auctionType} />
                                        </div>
                                        <p className="mt-1 text-xs text-[#8A918A]">
                                            {auction.totalQuantity.toLocaleString()} units ·{" "}
                                            {auction.participatingShops} shops
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                                        <div className="text-right">
                                            <p className="text-[10px] text-[#8A918A]">Best current price</p>
                                            <p className="text-sm font-bold text-[#4F6F56]">
                                                {formatCurrency(lowestBid)}/unit
                                            </p>
                                        </div>
                                        <Link
                                            href="/auction/shop/marketplace"
                                            className="rounded-xl bg-[#4F6F56] px-3 py-2 text-xs font-semibold text-white"
                                        >
                                            Review
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="rounded-3xl border border-[#DDE5DC] bg-white p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-[#2F312F]">My demand</h2>
                            <p className="mt-0.5 text-xs text-[#8A918A]">
                                Requests being pooled with other shops.
                            </p>
                        </div>
                        <Link
                            href="/auction/shop/demand"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F6F56]"
                        >
                            Manage <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {myDemand.slice(0, 3).map((demand) => {
                            const progress = Math.min(
                                100,
                                Math.round((demand.totalQuantity / demand.targetQuantity) * 100)
                            );

                            return (
                                <div key={demand.id} className="rounded-2xl bg-[#F8FAF6] p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-sm font-semibold text-[#2F312F]">
                                            {demand.productName}
                                        </p>
                                        <StatusBadge status={demand.status} />
                                    </div>
                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#DDE5DC]">
                                        <div
                                            className="h-full rounded-full bg-[#6F9277]"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <div className="mt-2 flex justify-between text-[10px] text-[#8A918A]">
                                        <span>
                                            {demand.totalQuantity.toLocaleString()} of{" "}
                                            {demand.targetQuantity.toLocaleString()} units
                                        </span>
                                        <span className="font-semibold text-[#4F6F56]">{progress}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>

            <section className="rounded-3xl border border-[#DDE5DC] bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-[#2F312F]">Recent orders</h2>
                        <p className="mt-0.5 text-xs text-[#8A918A]">
                            Fulfillment status for your latest purchases.
                        </p>
                    </div>
                    <Link
                        href="/auction/shop/orders"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F6F56]"
                    >
                        View orders <ArrowRight size={12} />
                    </Link>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                    {myOrders.slice(0, 3).map((order) => (
                        <div key={order.id} className="rounded-2xl border border-[#EDF3EC] p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-[#2F312F]">
                                        {order.productName}
                                    </p>
                                    <p className="mt-1 text-xs text-[#8A918A]">{order.supplierName}</p>
                                </div>
                                <StatusBadge status={order.status} />
                            </div>
                            <div className="mt-4 flex items-end justify-between">
                                <p className="text-xs text-[#666B66]">
                                    {order.quantity.toLocaleString()} units
                                </p>
                                <p className="text-sm font-bold text-[#4F6F56]">
                                    {formatCurrency(order.totalPrice)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
