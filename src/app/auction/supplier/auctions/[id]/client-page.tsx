"use client";

import { use, useState } from "react";
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    Gavel,
    Package,
    Send,
    Store,
    Users,
} from "lucide-react";
import Link from "next/link";
import StatusBadge from "../../../components/status-badge";
import { mergeAuctionBids, useSupplierBidStore } from "../../../lib/bid-store";
import { auctions, formatCurrency, suppliers } from "../../../lib/mock-data";

export default function SupplierBidPageClient({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const auction = auctions.find((candidate) => candidate.id === id);
    const supplier = suppliers.find((candidate) => candidate.id === "SUP-001")!;
    const { bids: storedBids, submitBid } = useSupplierBidStore();
    const [price, setPrice] = useState("");
    const [deliveryDays, setDeliveryDays] = useState("7");
    const [paymentTerms, setPaymentTerms] = useState("Net 30");
    const [submitted, setSubmitted] = useState(false);

    if (!auction) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="mx-auto mb-3 text-[#8A918A]" size={40} />
                    <p className="text-sm font-semibold text-[#2F312F]">Auction not found</p>
                    <Link
                        href="/auction/supplier/auctions"
                        className="mt-2 inline-block text-sm text-[#4F6F56]"
                    >
                        Back to auctions
                    </Link>
                </div>
            </div>
        );
    }

    const auctionBids = mergeAuctionBids(auction, storedBids);
    const myBid = auctionBids.find((bid) => bid.supplierId === supplier.id);
    const enteredPrice = Number(price);
    const totalValue = enteredPrice * auction.totalQuantity;
    const canSubmit = enteredPrice > 0 && enteredPrice <= auction.reservePrice;

    const handleSubmit = () => {
        if (!canSubmit) {
            return;
        }

        const submittedAt = new Date();
        const deliveryDate = new Date(
            submittedAt.getTime() + Number(deliveryDays) * 24 * 60 * 60 * 1000
        );

        submitBid({
            id: `BID-${submittedAt.getTime()}`,
            auctionId: auction.id,
            supplierId: supplier.id,
            supplierName: supplier.companyName,
            pricePerUnit: enteredPrice,
            totalPrice: totalValue,
            deliveryDate: deliveryDate.toISOString().slice(0, 10),
            paymentTerms,
            minimumOrderQuantity: auction.totalQuantity,
            submittedAt: submittedAt.toISOString(),
            status: "active",
        });
        setSubmitted(true);
    };

    const visibleBid = myBid ?? (submitted ? auctionBids.find((bid) => bid.supplierId === supplier.id) : undefined);

    return (
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-start gap-3">
                <Link
                    href="/auction/supplier/auctions"
                    className="mt-0.5 rounded-xl border border-[#DDE5DC] bg-white p-2 text-[#666B66]"
                    aria-label="Back to auctions"
                >
                    <ArrowLeft size={16} />
                </Link>
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-bold text-[#2F312F]">{auction.productName}</h1>
                        <StatusBadge status={auction.status} />
                        <StatusBadge status={auction.auctionType} />
                    </div>
                    <p className="mt-1 text-sm text-[#8A918A]">
                        {auction.productCategory} · {auction.id}
                    </p>
                </div>
            </div>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    {
                        icon: Package,
                        label: "Quantity",
                        value: `${auction.totalQuantity.toLocaleString()} units`,
                    },
                    {
                        icon: Users,
                        label: "Participating shops",
                        value: auction.participatingShops.toString(),
                    },
                    {
                        icon: Gavel,
                        label: "Submitted bids",
                        value: auctionBids.length.toString(),
                    },
                    {
                        icon: Store,
                        label: "Maximum price",
                        value: `${formatCurrency(auction.reservePrice)}/unit`,
                    },
                ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-[#DDE5DC] bg-white p-4">
                        <item.icon size={14} className="mb-3 text-[#6F9277]" />
                        <p className="text-[10px] font-semibold tracking-wide text-[#8A918A] uppercase">
                            {item.label}
                        </p>
                        <p className="mt-1 text-sm font-bold text-[#2F312F]">{item.value}</p>
                    </div>
                ))}
            </section>

            {visibleBid ? (
                <section className="rounded-3xl border border-[#CFE0D1] bg-[#F4F8F3] p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DDEBDD] text-[#4F6F56]">
                                <CheckCircle2 size={20} />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-[#2F312F]">Bid submitted</h2>
                                <p className="mt-1 text-sm text-[#666B66]">
                                    Your offer is saved and now appears in My Bids.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/auction/supplier/bids"
                            className="rounded-xl bg-[#4F6F56] px-4 py-2.5 text-center text-sm font-semibold text-white"
                        >
                            View My Bids
                        </Link>
                    </div>
                    <div className="mt-6 grid gap-3 sm:grid-cols-4">
                        {[
                            {
                                label: "Price",
                                value: `${formatCurrency(visibleBid.pricePerUnit)}/unit`,
                            },
                            {
                                label: "Total value",
                                value: formatCurrency(visibleBid.totalPrice),
                            },
                            { label: "Delivery", value: visibleBid.deliveryDate },
                            { label: "Terms", value: visibleBid.paymentTerms },
                        ].map((item) => (
                            <div key={item.label} className="rounded-2xl bg-white p-4">
                                <p className="text-[10px] text-[#8A918A]">{item.label}</p>
                                <p className="mt-1 text-sm font-bold text-[#2F312F]">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </section>
            ) : (
                <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr]">
                    <section className="rounded-3xl border border-[#DDE5DC] bg-white p-6">
                        <h2 className="text-base font-bold text-[#2F312F]">Submit your bid</h2>
                        <p className="mt-1 text-sm text-[#8A918A]">
                            Enter the commercial terms you can commit to for the full quantity.
                        </p>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label
                                    htmlFor="price"
                                    className="mb-1.5 block text-xs font-semibold text-[#2F312F]"
                                >
                                    Price per unit
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#8A918A]">
                                        $
                                    </span>
                                    <input
                                        id="price"
                                        type="number"
                                        min="0"
                                        max={auction.reservePrice}
                                        step="0.01"
                                        value={price}
                                        onChange={(event) => setPrice(event.target.value)}
                                        placeholder={`Maximum ${auction.reservePrice.toFixed(2)}`}
                                        className="w-full rounded-xl border border-[#DDE5DC] bg-[#F8FAF6] py-3 pr-4 pl-8 text-sm outline-none focus:border-[#6F9277]"
                                    />
                                </div>
                                {enteredPrice > auction.reservePrice ? (
                                    <p className="mt-1.5 text-xs text-[#B45309]">
                                        Your bid must not exceed the maximum price of{" "}
                                        {formatCurrency(auction.reservePrice)}.
                                    </p>
                                ) : null}
                            </div>

                            <div>
                                <label
                                    htmlFor="delivery"
                                    className="mb-1.5 block text-xs font-semibold text-[#2F312F]"
                                >
                                    Delivery timeline
                                </label>
                                <select
                                    id="delivery"
                                    value={deliveryDays}
                                    onChange={(event) => setDeliveryDays(event.target.value)}
                                    className="w-full rounded-xl border border-[#DDE5DC] bg-[#F8FAF6] px-4 py-3 text-sm outline-none focus:border-[#6F9277]"
                                >
                                    <option value="3">3 days</option>
                                    <option value="5">5 days</option>
                                    <option value="7">7 days</option>
                                    <option value="14">14 days</option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="terms"
                                    className="mb-1.5 block text-xs font-semibold text-[#2F312F]"
                                >
                                    Payment terms
                                </label>
                                <select
                                    id="terms"
                                    value={paymentTerms}
                                    onChange={(event) => setPaymentTerms(event.target.value)}
                                    className="w-full rounded-xl border border-[#DDE5DC] bg-[#F8FAF6] px-4 py-3 text-sm outline-none focus:border-[#6F9277]"
                                >
                                    <option>COD</option>
                                    <option>Net 15</option>
                                    <option>Net 30</option>
                                    <option>Net 45</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4F6F56] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <Send size={14} />
                            Submit bid
                        </button>
                    </section>

                    <aside className="rounded-3xl border border-[#DDE5DC] bg-white p-6">
                        <h2 className="text-base font-bold text-[#2F312F]">Bid summary</h2>
                        <div className="mt-5 space-y-4">
                            <div className="flex items-center justify-between border-b border-[#EDF3EC] pb-3">
                                <span className="text-xs text-[#8A918A]">Quantity</span>
                                <span className="text-sm font-semibold text-[#2F312F]">
                                    {auction.totalQuantity.toLocaleString()} units
                                </span>
                            </div>
                            <div className="flex items-center justify-between border-b border-[#EDF3EC] pb-3">
                                <span className="text-xs text-[#8A918A]">Price per unit</span>
                                <span className="text-sm font-semibold text-[#2F312F]">
                                    {enteredPrice > 0 ? formatCurrency(enteredPrice) : "—"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between border-b border-[#EDF3EC] pb-3">
                                <span className="text-xs text-[#8A918A]">Total value</span>
                                <span className="text-sm font-semibold text-[#4F6F56]">
                                    {enteredPrice > 0 ? formatCurrency(totalValue) : "—"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-[#8A918A]">Terms</span>
                                <span className="text-sm font-semibold text-[#2F312F]">
                                    {paymentTerms}
                                </span>
                            </div>
                        </div>
                        <p className="mt-6 rounded-2xl bg-[#F8FAF6] p-4 text-xs leading-5 text-[#666B66]">
                            Your bid is binding for this demo auction and will remain available in
                            My Bids after navigation or refresh.
                        </p>
                    </aside>
                </div>
            )}
        </div>
    );
}
