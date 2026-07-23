"use client";

import { motion } from "framer-motion";
import {
    ArrowRight,
    ClipboardList,
    FileText,
    Gavel,
    PackageCheck,
    Truck,
} from "lucide-react";
import Link from "next/link";
import StatusBadge from "../components/status-badge";
import { mergeAuctionBids, useSupplierBidStore } from "../lib/bid-store";
import {
    isFulfillmentOrder,
    useOrderWorkflowStore,
} from "../lib/order-workflow-store";
import {
    auctions,
    formatCurrency,
    orders,
    suppliers,
} from "../lib/mock-data";

export default function SupplierDashboard() {
    const me = suppliers.find((supplier) => supplier.id === "SUP-001")!;
    const { bids: storedBids } = useSupplierBidStore();
    const { requests, createdOrders } = useOrderWorkflowStore();
    const auctionsWithBids = auctions.map((auction) => ({
        ...auction,
        bids: mergeAuctionBids(auction, storedBids),
    }));
    const myBids = auctionsWithBids.flatMap((auction) =>
        auction.bids
            .filter((bid) => bid.supplierId === me.id)
            .map((bid) => ({ ...bid, auction }))
    );
    const activeBids = myBids.filter((bid) => bid.status === "active");
    const availableAuctions = auctionsWithBids.filter(
        (auction) =>
            auction.status === "active" &&
            !auction.bids.some((bid) => bid.supplierId === me.id)
    );
    const incomingRequests = requests.filter(
        (request) =>
            request.selectedSupplierIds.includes(me.id) &&
            request.status !== "awarded" &&
            !request.quotes.some((quote) => quote.supplierId === me.id)
    );
    const myOrders = [
        ...createdOrders.filter((order) => order.supplierName === me.companyName),
        ...orders.filter(
            (order) =>
                order.supplierName === me.companyName &&
                !createdOrders.some((created) => created.id === order.id)
        ),
    ];

    const stats = [
        {
            icon: Gavel,
            label: "Open auctions",
            value: availableAuctions.length.toString(),
            note: "ready to bid",
        },
        {
            icon: ClipboardList,
            label: "Active bids",
            value: activeBids.length.toString(),
            note: "awaiting results",
        },
        {
            icon: FileText,
            label: "Incoming RFQs",
            value: incomingRequests.length.toString(),
            note: "need a response",
        },
        {
            icon: PackageCheck,
            label: "Orders to fulfill",
            value: myOrders.length.toString(),
            note: "in your pipeline",
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
                            <Truck size={11} />
                            <span className="text-[9px] font-semibold tracking-[0.16em] uppercase">
                                Supplier workspace
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Welcome back, {me.companyName}
                        </h1>
                        <p className="mt-1 text-sm text-white/70">
                            Review demand, submit bids, and move awarded orders into fulfillment.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href="/auction/supplier/auctions"
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#375D49] shadow-sm"
                        >
                            <Gavel size={14} />
                            Browse auctions
                        </Link>
                        <Link
                            href="/auction/supplier/crm"
                            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white"
                        >
                            <FileText size={14} />
                            Respond to RFQs
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

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <section className="rounded-3xl border border-[#DDE5DC] bg-white p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-[#2F312F]">Auctions ready to bid</h2>
                            <p className="mt-0.5 text-xs text-[#8A918A]">
                                Active demand blocks without a bid from your company.
                            </p>
                        </div>
                        <Link
                            href="/auction/supplier/auctions"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F6F56]"
                        >
                            View all <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="divide-y divide-[#EDF3EC]">
                        {availableAuctions.slice(0, 4).map((auction) => (
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
                                        <p className="text-[10px] text-[#8A918A]">Maximum price</p>
                                        <p className="text-sm font-bold text-[#4F6F56]">
                                            {formatCurrency(auction.reservePrice)}/unit
                                        </p>
                                    </div>
                                    <Link
                                        href={`/auction/supplier/auctions/${auction.id}`}
                                        className="rounded-xl bg-[#4F6F56] px-3 py-2 text-xs font-semibold text-white"
                                    >
                                        Bid
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-3xl border border-[#DDE5DC] bg-white p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-[#2F312F]">Incoming RFQs</h2>
                            <p className="mt-0.5 text-xs text-[#8A918A]">
                                Direct requests waiting for a quote.
                            </p>
                        </div>
                        <Link
                            href="/auction/supplier/crm"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F6F56]"
                        >
                            Open RFQs <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {incomingRequests.slice(0, 3).map((request) => (
                            <Link
                                key={request.id}
                                href="/auction/supplier/crm"
                                className="block rounded-2xl border border-[#EDF3EC] p-4 transition-colors hover:bg-[#F8FAF6]"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-[#2F312F]">{request.title}</p>
                                        <p className="mt-1 text-xs text-[#8A918A]">
                                            {request.lines.length} product{request.lines.length === 1 ? "" : "s"} · {request.lines.reduce((total, line) => total + line.quantity, 0)} units
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-[#FFF3E0] px-2 py-1 text-[10px] font-semibold text-[#B35B12]">
                                        {request.priority === "urgent" ? "Urgent" : "Open"}
                                    </span>
                                </div>
                            </Link>
                        ))}
                        {incomingRequests.length === 0 && (
                            <div className="rounded-2xl border border-dashed border-[#DDE5DC] p-6 text-center">
                                <p className="text-sm font-semibold text-[#2F312F]">All caught up</p>
                                <p className="mt-1 text-xs text-[#8A918A]">No quote requests need a response.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <section className="rounded-3xl border border-[#DDE5DC] bg-white p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-[#2F312F]">My active bids</h2>
                            <p className="mt-0.5 text-xs text-[#8A918A]">
                                Submitted offers still awaiting an outcome.
                            </p>
                        </div>
                        <Link
                            href="/auction/supplier/bids"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F6F56]"
                        >
                            View bids <ArrowRight size={12} />
                        </Link>
                    </div>
                    {activeBids.length > 0 ? (
                        <div className="space-y-3">
                            {activeBids.slice(0, 3).map((bid) => (
                                <div key={bid.id} className="rounded-2xl bg-[#F8FAF6] p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-[#2F312F]">
                                                {bid.auction.productName}
                                            </p>
                                            <p className="mt-1 text-xs text-[#8A918A]">
                                                {formatCurrency(bid.pricePerUnit)}/unit · {bid.paymentTerms}
                                            </p>
                                        </div>
                                        <StatusBadge status={bid.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-[#DDE5DC] p-6 text-center">
                            <p className="text-sm font-semibold text-[#2F312F]">No active bids</p>
                            <p className="mt-1 text-xs text-[#8A918A]">
                                Browse open auctions to submit your first bid.
                            </p>
                        </div>
                    )}
                </section>

                <section className="rounded-3xl border border-[#DDE5DC] bg-white p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-[#2F312F]">Fulfillment</h2>
                            <p className="mt-0.5 text-xs text-[#8A918A]">
                                Orders awarded to your company.
                            </p>
                        </div>
                        <Link
                            href="/auction/supplier/operations"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F6F56]"
                        >
                            Manage <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {myOrders.slice(0, 3).map((order) => (
                            <div key={order.id} className="rounded-2xl border border-[#EDF3EC] p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-[#2F312F]">
                                            {order.productName}
                                        </p>
                                        <p className="mt-1 text-xs text-[#8A918A]">
                                            {order.quantity.toLocaleString()} units ·{" "}
                                            {isFulfillmentOrder(order)
                                                ? order.retailerAlias
                                                : "Protected retailer"}
                                        </p>
                                    </div>
                                    <StatusBadge status={order.status} />
                                </div>
                                <p className="mt-3 text-right text-sm font-bold text-[#4F6F56]">
                                    {formatCurrency(order.totalPrice)}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
