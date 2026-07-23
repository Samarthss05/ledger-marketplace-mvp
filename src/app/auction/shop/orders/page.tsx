"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
    AlertTriangle,
    ArrowRight,
    Bot,
    Camera,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    FileCheck2,
    LockKeyhole,
    Package,
    Plus,
    ScanLine,
    ShieldCheck,
    Truck,
    Upload,
    X,
} from "lucide-react";
import { prepareEvidencePhoto } from "../../lib/delivery-proof-utils";
import {
    type FulfillmentOrder,
    useOrderWorkflowStore,
} from "../../lib/order-workflow-store";
import { formatCurrency } from "../../lib/mock-data";

type Filter = "all" | "action" | "in_transit" | "verified" | "disputed";
type DeliveryOutcome = "accepted" | "damaged" | "short" | "wrong_items" | "other";

export default function ShopOrders() {
    const { createdOrders, verifyShopDelivery } = useOrderWorkflowStore();
    const [filter, setFilter] = useState<Filter>("all");
    const [expandedId, setExpandedId] = useState<string | null>("ORD-6001");
    const [verifyOrder, setVerifyOrder] = useState<FulfillmentOrder | null>(null);
    const [photoDataUrl, setPhotoDataUrl] = useState("");
    const [fileName, setFileName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [outcome, setOutcome] = useState<DeliveryOutcome>("accepted");
    const [note, setNote] = useState("Received cartons counted at the shop entrance.");
    const [photoError, setPhotoError] = useState("");
    const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

    const orders = createdOrders;
    const needsAction = orders.filter(
        (order) => order.verificationStatus === "awaiting_shop_verification"
    ).length;
    const inTransit = orders.filter(
        (order) =>
            order.verificationStatus === "in_transit" ||
            order.verificationStatus === "awaiting_supplier_proof"
    ).length;
    const verified = orders.filter(
        (order) => order.verificationStatus === "verified"
    ).length;
    const disputed = orders.filter(
        (order) => order.verificationStatus === "disputed"
    ).length;

    const filtered = orders.filter((order) => {
        if (filter === "all") return true;
        if (filter === "action") {
            return order.verificationStatus === "awaiting_shop_verification";
        }
        if (filter === "in_transit") {
            return (
                order.verificationStatus === "in_transit" ||
                order.verificationStatus === "awaiting_supplier_proof"
            );
        }
        return order.verificationStatus === filter;
    });

    const openVerification = (order: FulfillmentOrder) => {
        setVerifyOrder(order);
        setPhotoDataUrl("");
        setFileName("");
        setQuantity(order.quantity.toString());
        setOutcome("accepted");
        setNote("Received cartons counted at the shop entrance.");
        setPhotoError("");
    };

    const handlePhoto = async (file?: File) => {
        if (!file) return;
        try {
            const prepared = await prepareEvidencePhoto(file);
            setPhotoDataUrl(prepared.photoDataUrl);
            setFileName(prepared.fileName);
            setPhotoError("");
        } catch (error) {
            setPhotoError(error instanceof Error ? error.message : "Unable to use this photo.");
        }
    };

    const submitVerification = () => {
        if (!verifyOrder || !photoDataUrl || Number(quantity) <= 0) return;
        verifyShopDelivery({
            orderId: verifyOrder.id,
            photoDataUrl,
            fileName,
            quantity: Number(quantity),
            note: note.trim(),
            outcome,
        });
        setCompletedOrderId(verifyOrder.id);
        setVerifyOrder(null);
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-[10px] font-bold tracking-[0.16em] text-[#6F9277] uppercase">
                        Protected fulfillment
                    </p>
                    <h1 className="text-2xl font-bold text-[#2F312F]">Orders</h1>
                    <p className="mt-1 text-sm text-[#666B66]">
                        Track Ninja Van delivery and verify receipt without seeing supplier identity.
                    </p>
                </div>
                <Link
                    href="/auction/shop/orders/new"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4F6F56] px-4 py-2.5 text-sm font-semibold text-white"
                >
                    <Plus size={14} /> Create order
                </Link>
            </div>

            <div className="grid gap-4 rounded-3xl border border-[#DDE5DC] bg-white p-5 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5B2C83] text-white">
                    <Truck size={22} />
                </div>
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-bold text-[#2F312F]">
                            Anonymous delivery with Ninja Van
                        </h2>
                        <span className="rounded-full bg-[#F1E9F7] px-2 py-0.5 text-[9px] font-bold text-[#5B2C83]">
                            Address protected
                        </span>
                    </div>
                    <p className="mt-1 max-w-2xl text-xs leading-5 text-[#666B66]">
                        You see a verified supplier alias only. Ninja Van receives the private
                        pickup and delivery details and provides neutral scan evidence.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-semibold text-[#4F6F56]">
                    <LockKeyhole size={13} /> Supplier hidden
                </div>
            </div>

            {completedOrderId && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-3 rounded-2xl border p-4 ${
                        outcome === "accepted"
                            ? "border-[#CFE0D1] bg-[#F4F8F3]"
                            : "border-[#F1C9C0] bg-[#FFF5F2]"
                    }`}
                >
                    {outcome === "accepted" ? (
                        <CheckCircle2 size={18} className="mt-0.5 text-[#4F6F56]" />
                    ) : (
                        <AlertTriangle size={18} className="mt-0.5 text-[#B85A43]" />
                    )}
                    <div>
                        <p className="text-sm font-bold text-[#2F312F]">
                            {outcome === "accepted"
                                ? "Delivery verified"
                                : "Evidence review opened"}
                        </p>
                        <p className="text-xs text-[#666B66]">
                            {outcome === "accepted"
                                ? `Order ${completedOrderId} passed the three-party evidence check.`
                                : `Payout for ${completedOrderId} is on hold while evidence is reviewed.`}
                        </p>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Metric
                    icon={Camera}
                    label="Need your photo"
                    value={needsAction.toString()}
                    note="delivered by Ninja Van"
                />
                <Metric
                    icon={Truck}
                    label="In fulfillment"
                    value={inTransit.toString()}
                    note="preparing or in transit"
                />
                <Metric
                    icon={ShieldCheck}
                    label="Verified"
                    value={verified.toString()}
                    note="evidence matched"
                />
                <Metric
                    icon={AlertTriangle}
                    label="Under review"
                    value={disputed.toString()}
                    note="payout protected"
                />
            </div>

            <div className="flex flex-wrap gap-2">
                {(
                    [
                        ["all", "All orders"],
                        ["action", "Needs my verification"],
                        ["in_transit", "In fulfillment"],
                        ["verified", "Verified"],
                        ["disputed", "Evidence review"],
                    ] as [Filter, string][]
                ).map(([value, label]) => (
                    <button
                        key={value}
                        onClick={() => setFilter(value)}
                        className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                            filter === value
                                ? "bg-[#365845] text-white"
                                : "border border-[#DDE5DC] bg-white text-[#666B66]"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filtered.map((order, index) => {
                    const expanded = expandedId === order.id;
                    return (
                        <motion.article
                            key={order.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                            className="overflow-hidden rounded-3xl border border-[#DDE5DC] bg-white"
                        >
                            <div className="p-5">
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#EDF3EC] text-[#4F6F56]">
                                            <Package size={17} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="text-sm font-bold text-[#2F312F]">
                                                    {order.productName}
                                                </h2>
                                                <VerificationChip status={order.verificationStatus} />
                                            </div>
                                            <p className="mt-1 text-[10px] text-[#8A918A]">
                                                {order.id} · {order.supplierAlias} · {order.quantity} units
                                            </p>
                                            <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
                                                <span className="rounded-lg bg-[#F1E9F7] px-2 py-1 font-semibold text-[#5B2C83]">
                                                    Ninja Van · {order.courier.trackingId}
                                                </span>
                                                <span className="rounded-lg bg-[#F4F7F3] px-2 py-1 text-[#666B66]">
                                                    {order.courier.lastScan}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                                        <div className="text-right">
                                            <p className="text-[9px] text-[#8A918A]">Order value</p>
                                            <p className="text-sm font-bold text-[#2F312F]">
                                                {formatCurrency(order.totalPrice)}
                                            </p>
                                        </div>
                                        {order.verificationStatus ===
                                        "awaiting_shop_verification" ? (
                                            <button
                                                onClick={() => openVerification(order)}
                                                className="inline-flex items-center gap-2 rounded-xl bg-[#365845] px-4 py-2.5 text-xs font-bold text-white"
                                            >
                                                <Camera size={13} /> Verify delivery
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    setExpandedId(expanded ? null : order.id)
                                                }
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-[#DDE5DC] px-3 py-2.5 text-xs font-bold text-[#4F6F56]"
                                            >
                                                Evidence
                                                {expanded ? (
                                                    <ChevronUp size={13} />
                                                ) : (
                                                    <ChevronDown size={13} />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {expanded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="border-t border-[#E6ECE4] bg-[#FAFBF9] p-5"
                                >
                                    {order.dispute && (
                                        <div className="mb-5 rounded-2xl border border-[#F1C9C0] bg-[#FFF5F2] p-4">
                                            <div className="flex items-start gap-3">
                                                <Bot size={17} className="mt-0.5 text-[#B85A43]" />
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="text-xs font-bold text-[#7A3D30]">
                                                            AI evidence summary
                                                        </p>
                                                        <span className="rounded-full bg-white px-2 py-0.5 text-[8px] font-bold text-[#A34D39]">
                                                            Payout held
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-[10px] leading-5 text-[#86584E]">
                                                        {order.dispute.aiAssessment}
                                                    </p>
                                                    <p className="mt-2 text-[9px] font-semibold text-[#A34D39]">
                                                        A human reviewer makes the final decision within
                                                        two business days.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
                                        <div className="space-y-3">
                                            <h3 className="text-xs font-bold text-[#2F312F]">
                                                Photo evidence
                                            </h3>
                                            {order.supplierProof && (
                                                <ProofCard
                                                    label="Supplier handoff"
                                                    proof={order.supplierProof}
                                                />
                                            )}
                                            {order.shopProof && (
                                                <ProofCard
                                                    label="Shop receipt"
                                                    proof={order.shopProof}
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="mb-3 text-xs font-bold text-[#2F312F]">
                                                Chain of custody
                                            </h3>
                                            <div className="space-y-0 border-l border-[#CCD6C9] pl-5">
                                                {order.events.map((event) => (
                                                    <div
                                                        key={event.id}
                                                        className="relative pb-5 last:pb-0"
                                                    >
                                                        <span className="absolute top-1 -left-[25px] h-2.5 w-2.5 rounded-full bg-[#6F9277] ring-4 ring-[#FAFBF9]" />
                                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                                                            <div>
                                                                <p className="text-xs font-semibold text-[#2F312F]">
                                                                    {event.title}
                                                                </p>
                                                                <p className="mt-0.5 text-[10px] leading-4 text-[#8A918A]">
                                                                    {event.detail}
                                                                </p>
                                                            </div>
                                                            <span className="text-[9px] whitespace-nowrap text-[#8A918A]">
                                                                {new Date(event.at).toLocaleString(
                                                                    "en-SG",
                                                                    {
                                                                        day: "numeric",
                                                                        month: "short",
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                    }
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.article>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="rounded-3xl border border-dashed border-[#C9D4C6] bg-white py-16 text-center">
                    <Package size={28} className="mx-auto text-[#A9B4A6]" />
                    <p className="mt-3 text-sm font-semibold text-[#2F312F]">No orders here</p>
                    <Link
                        href="/auction/shop/orders/new"
                        className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#4F6F56]"
                    >
                        Create order <ArrowRight size={12} />
                    </Link>
                </div>
            )}

            <div className="rounded-3xl border border-[#DDE5DC] bg-white p-5">
                <div className="flex items-start gap-3">
                    <FileCheck2 size={18} className="mt-0.5 text-[#4F6F56]" />
                    <div>
                        <h2 className="text-sm font-bold text-[#2F312F]">
                            Fair dispute management
                        </h2>
                        <p className="mt-1 max-w-3xl text-xs leading-5 text-[#666B66]">
                            ReStock compares both photos and quantities with Ninja Van&apos;s scan
                            trail. Any discrepancy freezes payout, creates an AI evidence summary,
                            and routes the case to human review. AI organizes evidence; it never
                            decides who wins.
                        </p>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {verifyOrder && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm"
                            onClick={() => setVerifyOrder(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.98 }}
                            className="fixed top-1/2 left-1/2 z-50 max-h-[92vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-bold tracking-wide text-[#6F9277] uppercase">
                                        {verifyOrder.id} · {verifyOrder.supplierAlias}
                                    </p>
                                    <h2 className="mt-1 text-lg font-bold text-[#2F312F]">
                                        Verify Ninja Van delivery
                                    </h2>
                                    <p className="mt-1 text-xs text-[#8A918A]">
                                        Photograph the received supply before opening or moving it.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setVerifyOrder(null)}
                                    className="rounded-lg p-2 text-[#8A918A] hover:bg-[#F4F7F3]"
                                    aria-label="Close delivery verification"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl border border-[#DDE5DC] bg-[#F8FAF7] p-4">
                                    <p className="text-[9px] font-bold tracking-wide text-[#8A918A] uppercase">
                                        Supplier handoff evidence
                                    </p>
                                    {verifyOrder.supplierProof?.photoDataUrl ? (
                                        <Image
                                            src={verifyOrder.supplierProof.photoDataUrl}
                                            alt="Anonymous supplier handoff evidence"
                                            width={560}
                                            height={300}
                                            unoptimized
                                            className="mt-3 h-32 w-full rounded-xl object-cover"
                                        />
                                    ) : (
                                        <div className="mt-3 flex h-28 items-center justify-center rounded-xl bg-white text-[#8A918A]">
                                            <Camera size={22} />
                                        </div>
                                    )}
                                    <p className="mt-3 text-xs font-semibold text-[#2F312F]">
                                        {verifyOrder.supplierProof?.quantity ?? verifyOrder.quantity} units
                                        recorded
                                    </p>
                                    <p className="mt-1 text-[10px] text-[#8A918A]">
                                        {verifyOrder.supplierProof?.note}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-[#D9CBE5] bg-[#F7F2FA] p-4">
                                    <p className="text-[9px] font-bold tracking-wide text-[#7B5790] uppercase">
                                        Ninja Van evidence
                                    </p>
                                    <div className="mt-4 flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5B2C83] text-white">
                                            <ScanLine size={16} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[#3F284B]">
                                                Delivery scan complete
                                            </p>
                                            <p className="text-[10px] text-[#7B6685]">
                                                {verifyOrder.courier.trackingId}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-[10px] leading-5 text-[#7B6685]">
                                        Neutral courier scan recorded at the protected receiving
                                        location.
                                    </p>
                                </div>
                            </div>

                            <label className="mt-5 block cursor-pointer rounded-2xl border-2 border-dashed border-[#C9D4C6] bg-[#F8FAF7] p-4 text-center">
                                {photoDataUrl ? (
                                    <Image
                                        src={photoDataUrl}
                                        alt="Shop receiving evidence preview"
                                        width={640}
                                        height={360}
                                        unoptimized
                                        className="mx-auto max-h-52 w-full rounded-xl object-cover"
                                    />
                                ) : (
                                    <div className="py-7">
                                        <Upload size={22} className="mx-auto text-[#6F9277]" />
                                        <p className="mt-2 text-xs font-bold text-[#2F312F]">
                                            Take or upload receiving photo
                                        </p>
                                        <p className="mt-1 text-[10px] text-[#8A918A]">
                                            Show all cartons and any visible damage.
                                        </p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="sr-only"
                                    aria-label="Shop receiving photo"
                                    onChange={(event) => handlePhoto(event.target.files?.[0])}
                                />
                            </label>
                            {fileName && (
                                <p className="mt-2 text-[10px] text-[#6F9277]">{fileName}</p>
                            )}
                            {photoError && (
                                <p className="mt-2 text-[10px] text-[#B85A43]">{photoError}</p>
                            )}

                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <label>
                                    <span className="mb-1.5 block text-xs font-semibold text-[#444944]">
                                        Units received
                                    </span>
                                    <input
                                        aria-label="Units received"
                                        type="number"
                                        min="0"
                                        value={quantity}
                                        onChange={(event) => setQuantity(event.target.value)}
                                        className="w-full rounded-xl border border-[#DDE5DC] bg-[#F8FAF7] px-4 py-3 text-sm"
                                    />
                                </label>
                                <label>
                                    <span className="mb-1.5 block text-xs font-semibold text-[#444944]">
                                        Delivery result
                                    </span>
                                    <select
                                        aria-label="Delivery result"
                                        value={outcome}
                                        onChange={(event) =>
                                            setOutcome(event.target.value as DeliveryOutcome)
                                        }
                                        className="w-full rounded-xl border border-[#DDE5DC] bg-[#F8FAF7] px-4 py-3 text-sm"
                                    >
                                        <option value="accepted">Everything matches</option>
                                        <option value="damaged">Items damaged</option>
                                        <option value="short">Quantity short</option>
                                        <option value="wrong_items">Wrong items</option>
                                        <option value="other">Other issue</option>
                                    </select>
                                </label>
                            </div>
                            <label className="mt-4 block">
                                <span className="mb-1.5 block text-xs font-semibold text-[#444944]">
                                    Receiving note
                                </span>
                                <textarea
                                    value={note}
                                    onChange={(event) => setNote(event.target.value)}
                                    rows={3}
                                    className="w-full resize-none rounded-xl border border-[#DDE5DC] bg-[#F8FAF7] px-4 py-3 text-sm"
                                />
                            </label>

                            <div
                                className={`mt-4 flex items-start gap-3 rounded-2xl p-4 ${
                                    outcome === "accepted"
                                        ? "bg-[#EAF3E8]"
                                        : "bg-[#FFF0EC]"
                                }`}
                            >
                                {outcome === "accepted" ? (
                                    <Bot size={17} className="mt-0.5 text-[#4F6F56]" />
                                ) : (
                                    <AlertTriangle
                                        size={17}
                                        className="mt-0.5 text-[#B85A43]"
                                    />
                                )}
                                <div>
                                    <p className="text-xs font-bold text-[#2F312F]">
                                        {outcome === "accepted"
                                            ? "AI pre-check: evidence is consistent"
                                            : "Dispute protection will activate"}
                                    </p>
                                    <p className="mt-1 text-[10px] leading-5 text-[#666B66]">
                                        {outcome === "accepted"
                                            ? `Supplier recorded ${
                                                verifyOrder.supplierProof?.quantity ??
                                                verifyOrder.quantity
                                            } units and you entered ${quantity || 0}. Ninja Van has a delivery scan.`
                                            : "Submitting an issue saves your photo, holds payout, and sends all three evidence sources to human review."}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={submitVerification}
                                disabled={!photoDataUrl || Number(quantity) < 0}
                                className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white disabled:opacity-40 ${
                                    outcome === "accepted" ? "bg-[#365845]" : "bg-[#A34D39]"
                                }`}
                            >
                                {outcome === "accepted" ? (
                                    <>
                                        <CheckCircle2 size={14} /> Confirm delivery
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle size={14} /> Submit issue and hold payout
                                    </>
                                )}
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

function Metric({
    icon: Icon,
    label,
    value,
    note,
}: {
    icon: typeof Camera;
    label: string;
    value: string;
    note: string;
}) {
    return (
        <div className="rounded-2xl border border-[#DDE5DC] bg-white p-4">
            <Icon size={15} className="mb-3 text-[#6F9277]" />
            <p className="text-xl font-bold text-[#2F312F]">{value}</p>
            <p className="mt-0.5 text-xs font-semibold text-[#2F312F]">{label}</p>
            <p className="text-[10px] text-[#8A918A]">{note}</p>
        </div>
    );
}

function VerificationChip({
    status,
}: {
    status: FulfillmentOrder["verificationStatus"];
}) {
    const config = {
        awaiting_supplier_proof: {
            label: "Supplier preparing",
            style: "bg-[#FFF5E6] text-[#94621B]",
        },
        in_transit: { label: "With Ninja Van", style: "bg-[#F1E9F7] text-[#5B2C83]" },
        awaiting_shop_verification: {
            label: "Verify delivery",
            style: "bg-[#EDF0FA] text-[#4A5D92]",
        },
        verified: { label: "Verified", style: "bg-[#E7F2E6] text-[#3F7048]" },
        disputed: { label: "Evidence review", style: "bg-[#FFF0EC] text-[#A34D39]" },
    }[status];

    return (
        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${config.style}`}>
            {config.label}
        </span>
    );
}

function ProofCard({
    label,
    proof,
}: {
    label: string;
    proof: NonNullable<FulfillmentOrder["supplierProof"]>;
}) {
    return (
        <div className="rounded-2xl border border-[#DDE5DC] bg-white p-3">
            <p className="mb-2 text-[9px] font-bold tracking-wide text-[#8A918A] uppercase">
                {label}
            </p>
            {proof.photoDataUrl ? (
                <Image
                    src={proof.photoDataUrl}
                    alt={`${label} evidence`}
                    width={560}
                    height={300}
                    unoptimized
                    className="h-32 w-full rounded-xl object-cover"
                />
            ) : (
                <div className="flex h-24 items-center justify-center rounded-xl bg-[#F4F7F3] text-[#8A918A]">
                    <Camera size={22} />
                </div>
            )}
            <p className="mt-3 text-xs font-semibold text-[#2F312F]">
                {proof.quantity} units · {proof.condition.replace("_", " ")}
            </p>
            <p className="mt-1 text-[10px] text-[#8A918A]">{proof.note}</p>
        </div>
    );
}
