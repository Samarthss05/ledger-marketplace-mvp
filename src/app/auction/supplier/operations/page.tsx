"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
    AlertTriangle,
    Camera,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    FileCheck2,
    LockKeyhole,
    Package,
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

const SUPPLIER_ID = "SUP-001";

export default function SupplierOperationsPage() {
    const { createdOrders, submitSupplierProof } = useOrderWorkflowStore();
    const [proofOrder, setProofOrder] = useState<FulfillmentOrder | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>("ORD-6001");
    const [photoDataUrl, setPhotoDataUrl] = useState("");
    const [fileName, setFileName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [note, setNote] = useState("Sealed cartons counted and handed to Ninja Van.");
    const [photoError, setPhotoError] = useState("");
    const [savedOrderId, setSavedOrderId] = useState<string | null>(null);

    const orders = createdOrders.filter((order) => order.supplierId === SUPPLIER_ID);
    const awaitingProof = orders.filter(
        (order) => order.verificationStatus === "awaiting_supplier_proof"
    ).length;
    const inTransit = orders.filter(
        (order) =>
            order.verificationStatus === "in_transit" ||
            order.verificationStatus === "awaiting_shop_verification"
    ).length;
    const verified = orders.filter(
        (order) => order.verificationStatus === "verified"
    ).length;
    const disputed = orders.filter(
        (order) => order.verificationStatus === "disputed"
    ).length;

    const openProof = (order: FulfillmentOrder) => {
        setProofOrder(order);
        setPhotoDataUrl("");
        setFileName("");
        setQuantity(order.quantity.toString());
        setNote("Sealed cartons counted and handed to Ninja Van.");
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

    const saveProof = () => {
        if (!proofOrder || !photoDataUrl || Number(quantity) <= 0) return;
        submitSupplierProof({
            orderId: proofOrder.id,
            photoDataUrl,
            fileName,
            quantity: Number(quantity),
            note: note.trim(),
        });
        setSavedOrderId(proofOrder.id);
        setProofOrder(null);
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <div>
                <p className="text-[10px] font-bold tracking-[0.16em] text-[#6F9277] uppercase">
                    Anonymous fulfillment
                </p>
                <h1 className="text-2xl font-bold text-[#2F312F]">Ninja Van handoffs</h1>
                <p className="mt-1 text-sm text-[#666B66]">
                    Photograph sealed supply, hand it to Ninja Van, and monitor shop verification.
                </p>
            </div>

            <div className="grid gap-4 rounded-3xl border border-[#DDE5DC] bg-white p-5 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5B2C83] text-white">
                    <Truck size={22} />
                </div>
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-bold text-[#2F312F]">Ninja Van protected delivery</h2>
                        <span className="rounded-full bg-[#F1E9F7] px-2 py-0.5 text-[9px] font-bold text-[#5B2C83]">
                            Neutral logistics partner
                        </span>
                    </div>
                    <p className="mt-1 max-w-2xl text-xs leading-5 text-[#666B66]">
                        ReStock shares pickup and delivery locations only with Ninja Van. You see a
                        protected retailer ID; the retailer sees only a verified supplier alias.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-semibold text-[#4F6F56]">
                    <LockKeyhole size={13} /> Identities hidden
                </div>
            </div>

            {savedOrderId && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 rounded-2xl border border-[#CFE0D1] bg-[#F4F8F3] p-4"
                >
                    <CheckCircle2 size={18} className="mt-0.5 text-[#4F6F56]" />
                    <div>
                        <p className="text-sm font-bold text-[#2F312F]">Handoff evidence saved</p>
                        <p className="text-xs text-[#666B66]">
                            Ninja Van pickup tracking is active for {savedOrderId}.
                        </p>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Metric
                    icon={Camera}
                    label="Need handoff proof"
                    value={awaitingProof.toString()}
                    note="before courier pickup"
                />
                <Metric
                    icon={Truck}
                    label="With Ninja Van"
                    value={inTransit.toString()}
                    note="in transit or delivered"
                />
                <Metric
                    icon={ShieldCheck}
                    label="Verified"
                    value={verified.toString()}
                    note="payout released"
                />
                <Metric
                    icon={AlertTriangle}
                    label="Evidence reviews"
                    value={disputed.toString()}
                    note="payout held"
                />
            </div>

            <div className="space-y-4">
                {orders.map((order, index) => {
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
                                                {order.id} · {order.retailerAlias} · {order.quantity} units
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
                                        {order.verificationStatus === "awaiting_supplier_proof" ? (
                                            <button
                                                onClick={() => openProof(order)}
                                                className="inline-flex items-center gap-2 rounded-xl bg-[#365845] px-4 py-2.5 text-xs font-bold text-white"
                                            >
                                                <Camera size={13} /> Record handoff proof
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
                                                <AlertTriangle
                                                    size={17}
                                                    className="mt-0.5 text-[#B85A43]"
                                                />
                                                <div>
                                                    <p className="text-xs font-bold text-[#7A3D30]">
                                                        Evidence review {order.dispute.id}
                                                    </p>
                                                    <p className="mt-1 text-[10px] leading-5 text-[#86584E]">
                                                        {order.dispute.aiAssessment}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
                                        <div className="space-y-3">
                                            <h3 className="text-xs font-bold text-[#2F312F]">
                                                Supplier handoff record
                                            </h3>
                                            {order.supplierProof ? (
                                                <ProofCard proof={order.supplierProof} />
                                            ) : (
                                                <p className="text-xs text-[#8A918A]">
                                                    No supplier evidence yet.
                                                </p>
                                            )}
                                            {order.shopProof && (
                                                <>
                                                    <h3 className="pt-2 text-xs font-bold text-[#2F312F]">
                                                        Shop receipt record
                                                    </h3>
                                                    <ProofCard proof={order.shopProof} />
                                                </>
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
                                                                {new Date(event.at).toLocaleString("en-SG", {
                                                                    day: "numeric",
                                                                    month: "short",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
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

            <div className="rounded-3xl border border-[#DDE5DC] bg-white p-5">
                <div className="flex items-start gap-3">
                    <FileCheck2 size={18} className="mt-0.5 text-[#4F6F56]" />
                    <div>
                        <h2 className="text-sm font-bold text-[#2F312F]">
                            How disputes are handled
                        </h2>
                        <p className="mt-1 max-w-3xl text-xs leading-5 text-[#666B66]">
                            ReStock compares supplier quantity and photo, Ninja Van scans, and the
                            shop&apos;s receiving photo. A mismatch holds payout automatically and
                            creates an evidence review; AI summarizes conflicts but does not make
                            the final decision.
                        </p>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {proofOrder && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm"
                            onClick={() => setProofOrder(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.98 }}
                            className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-bold tracking-wide text-[#6F9277] uppercase">
                                        {proofOrder.id} · {proofOrder.retailerAlias}
                                    </p>
                                    <h2 className="mt-1 text-lg font-bold text-[#2F312F]">
                                        Record sealed handoff
                                    </h2>
                                    <p className="mt-1 text-xs text-[#8A918A]">
                                        Photograph the complete supply immediately before Ninja Van
                                        collection.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setProofOrder(null)}
                                    className="rounded-lg p-2 text-[#8A918A] hover:bg-[#F4F7F3]"
                                    aria-label="Close handoff form"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <label className="mt-5 block cursor-pointer rounded-2xl border-2 border-dashed border-[#C9D4C6] bg-[#F8FAF7] p-4 text-center">
                                {photoDataUrl ? (
                                    <Image
                                        src={photoDataUrl}
                                        alt="Supplier handoff evidence preview"
                                        width={640}
                                        height={360}
                                        unoptimized
                                        className="mx-auto max-h-52 w-full rounded-xl object-cover"
                                    />
                                ) : (
                                    <div className="py-7">
                                        <Upload size={22} className="mx-auto text-[#6F9277]" />
                                        <p className="mt-2 text-xs font-bold text-[#2F312F]">
                                            Take or upload handoff photo
                                        </p>
                                        <p className="mt-1 text-[10px] text-[#8A918A]">
                                            Include carton seals and the full shipment.
                                        </p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="sr-only"
                                    aria-label="Supplier handoff photo"
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
                                        Units handed over
                                    </span>
                                    <input
                                        aria-label="Units handed over"
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(event) => setQuantity(event.target.value)}
                                        className="w-full rounded-xl border border-[#DDE5DC] bg-[#F8FAF7] px-4 py-3 text-sm"
                                    />
                                </label>
                                <div>
                                    <span className="mb-1.5 block text-xs font-semibold text-[#444944]">
                                        Courier
                                    </span>
                                    <div className="flex items-center gap-2 rounded-xl border border-[#DDE5DC] bg-[#F1E9F7] px-4 py-3 text-sm font-semibold text-[#5B2C83]">
                                        <Truck size={14} /> Ninja Van
                                    </div>
                                </div>
                            </div>
                            <label className="mt-4 block">
                                <span className="mb-1.5 block text-xs font-semibold text-[#444944]">
                                    Handoff note
                                </span>
                                <textarea
                                    value={note}
                                    onChange={(event) => setNote(event.target.value)}
                                    rows={3}
                                    className="w-full resize-none rounded-xl border border-[#DDE5DC] bg-[#F8FAF7] px-4 py-3 text-sm"
                                />
                            </label>

                            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#F1E9F7] p-4">
                                <ScanLine size={17} className="mt-0.5 text-[#5B2C83]" />
                                <p className="text-[10px] leading-5 text-[#6B4B7D]">
                                    Saving this evidence starts the Ninja Van pickup record. The shop
                                    will compare its own receiving photo after delivery.
                                </p>
                            </div>

                            <button
                                onClick={saveProof}
                                disabled={!photoDataUrl || Number(quantity) <= 0}
                                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#365845] px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
                            >
                                <Camera size={14} /> Save proof and hand to Ninja Van
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
            label: "Handoff proof needed",
            style: "bg-[#FFF5E6] text-[#94621B]",
        },
        in_transit: { label: "With Ninja Van", style: "bg-[#F1E9F7] text-[#5B2C83]" },
        awaiting_shop_verification: {
            label: "Awaiting shop verification",
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

function ProofCard({ proof }: { proof: NonNullable<FulfillmentOrder["supplierProof"]> }) {
    return (
        <div className="rounded-2xl border border-[#DDE5DC] bg-white p-3">
            {proof.photoDataUrl ? (
                <Image
                    src={proof.photoDataUrl}
                    alt={`${proof.actor} delivery evidence`}
                    width={560}
                    height={300}
                    unoptimized
                    className="h-36 w-full rounded-xl object-cover"
                />
            ) : (
                <div className="flex h-28 items-center justify-center rounded-xl bg-[#F4F7F3] text-[#8A918A]">
                    <Camera size={22} />
                </div>
            )}
            <div className="mt-3 flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold text-[#2F312F]">
                        {proof.quantity} units · {proof.condition.replace("_", " ")}
                    </p>
                    <p className="mt-1 text-[10px] text-[#8A918A]">{proof.note}</p>
                </div>
                <span className="text-[9px] whitespace-nowrap text-[#8A918A]">
                    {new Date(proof.capturedAt).toLocaleString("en-SG", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </span>
            </div>
        </div>
    );
}
