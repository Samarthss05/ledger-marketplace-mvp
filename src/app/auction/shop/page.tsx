"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowRight,
    Bot,
    ClipboardCheck,
    FileText,
    PackageCheck,
    Plus,
    Send,
    Store,
    Truck,
} from "lucide-react";
import StatusBadge from "../components/status-badge";
import { useOrderWorkflowStore } from "../lib/order-workflow-store";
import { formatCurrency, orders } from "../lib/mock-data";

export default function ShopDashboard() {
    const { requests, createdOrders } = useOrderWorkflowStore();
    const myOrders = [
        ...createdOrders,
        ...orders.filter(
            (order) =>
                order.shopName === "RK Minimart" &&
                !createdOrders.some((created) => created.id === order.id)
        ),
    ];
    const activeOrders = myOrders.filter(
        (order) => order.status !== "delivered" && order.status !== "cancelled"
    );
    const openRequests = requests.filter((request) => request.status !== "awarded");
    const quotesReady = requests.filter((request) => request.status === "quoted");
    const committedValue = myOrders.reduce((total, order) => total + order.totalPrice, 0);

    const stats = [
        {
            icon: FileText,
            label: "Open requests",
            value: openRequests.length.toString(),
            note: "being sourced",
        },
        {
            icon: Bot,
            label: "Quotes ready",
            value: quotesReady.length.toString(),
            note: "AI-ranked for review",
        },
        {
            icon: PackageCheck,
            label: "Active orders",
            value: activeOrders.length.toString(),
            note: "in fulfillment",
        },
        {
            icon: ClipboardCheck,
            label: "Committed value",
            value: formatCurrency(committedValue),
            note: "across confirmed orders",
        },
    ];

    return (
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#365845] via-[#4F6F56] to-[#719179] p-6 text-white"
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
                        <p className="mt-1 max-w-xl text-sm text-white/70">
                            Create one order request, compare supplier quotes, then track delivery.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href="/auction/shop/orders/new"
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#365845] shadow-sm"
                        >
                            <Plus size={14} /> Create order
                        </Link>
                        <Link
                            href="/auction/shop/requests"
                            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white"
                        >
                            <FileText size={14} /> View requests
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
                        className="rounded-2xl border border-[#DDE5DC] bg-white p-4"
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

            <section className="rounded-3xl border border-[#DDE5DC] bg-white p-5">
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-base font-bold text-[#2F312F]">How ordering works</h2>
                        <p className="mt-1 text-xs text-[#8A918A]">
                            One clear process from stock requirement to delivered order.
                        </p>
                    </div>
                    <Link
                        href="/auction/shop/orders/new"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#4F6F56]"
                    >
                        Start an order <ArrowRight size={12} />
                    </Link>
                </div>
                <div className="grid gap-3 md:grid-cols-4">
                    {[
                        {
                            icon: Plus,
                            step: "01",
                            title: "Build the order",
                            note: "Add products, quantities, targets, and delivery needs.",
                        },
                        {
                            icon: Bot,
                            step: "02",
                            title: "AI checks it",
                            note: "Review pricing, timing, savings, and supplier coverage.",
                        },
                        {
                            icon: Send,
                            step: "03",
                            title: "Compare quotes",
                            note: "Invite suppliers and approve the best ranked offer.",
                        },
                        {
                            icon: Truck,
                            step: "04",
                            title: "Track fulfillment",
                            note: "Follow confirmation, shipping, and delivery in Orders.",
                        },
                    ].map((item) => (
                        <div key={item.step} className="rounded-2xl bg-[#F4F7F3] p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#4F6F56]">
                                    <item.icon size={14} />
                                </div>
                                <span className="text-[9px] font-bold text-[#A0AAA0]">{item.step}</span>
                            </div>
                            <p className="mt-4 text-xs font-bold text-[#2F312F]">{item.title}</p>
                            <p className="mt-1 text-[10px] leading-5 text-[#8A918A]">{item.note}</p>
                        </div>
                    ))}
                </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
                <section className="rounded-3xl border border-[#DDE5DC] bg-white p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-[#2F312F]">Sourcing requests</h2>
                            <p className="mt-0.5 text-xs text-[#8A918A]">
                                Requests waiting for quotes or a supplier decision.
                            </p>
                        </div>
                        <Link
                            href="/auction/shop/requests"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F6F56]"
                        >
                            View all <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="divide-y divide-[#EDF3EC]">
                        {requests.slice(0, 4).map((request) => {
                            const targetValue = request.lines.reduce(
                                (total, line) => total + line.targetPrice * line.quantity,
                                0
                            );
                            return (
                                <div
                                    key={request.id}
                                    className="flex flex-col gap-3 py-4 first:pt-1 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="truncate text-sm font-semibold text-[#2F312F]">
                                                {request.title}
                                            </p>
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                                    request.status === "quoted"
                                                        ? "bg-[#EDF0FA] text-[#4A5D92]"
                                                        : request.status === "awarded"
                                                          ? "bg-[#E7F2E6] text-[#3F7048]"
                                                          : "bg-[#FFF5E6] text-[#94621B]"
                                                }`}
                                            >
                                                {request.status === "quoted"
                                                    ? "Quotes ready"
                                                    : request.status === "awarded"
                                                      ? "Awarded"
                                                      : "Waiting"}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-[#8A918A]">
                                            {request.lines.length} product
                                            {request.lines.length === 1 ? "" : "s"} ·{" "}
                                            {request.quotes.length} quote
                                            {request.quotes.length === 1 ? "" : "s"}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                                        <div className="text-right">
                                            <p className="text-[10px] text-[#8A918A]">Target value</p>
                                            <p className="text-sm font-bold text-[#4F6F56]">
                                                {formatCurrency(targetValue)}
                                            </p>
                                        </div>
                                        <Link
                                            href="/auction/shop/requests"
                                            className="rounded-xl border border-[#DDE5DC] px-3 py-2 text-xs font-semibold text-[#4F6F56]"
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
                            <h2 className="text-base font-bold text-[#2F312F]">Recent orders</h2>
                            <p className="mt-0.5 text-xs text-[#8A918A]">Confirmed supplier awards.</p>
                        </div>
                        <Link
                            href="/auction/shop/orders"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F6F56]"
                        >
                            View <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {myOrders.slice(0, 3).map((order) => (
                            <div key={order.id} className="rounded-2xl bg-[#F4F7F3] p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-xs font-semibold text-[#2F312F]">
                                            {order.productName}
                                        </p>
                                        <p className="mt-1 text-[10px] text-[#8A918A]">
                                            {order.supplierName}
                                        </p>
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
        </div>
    );
}
