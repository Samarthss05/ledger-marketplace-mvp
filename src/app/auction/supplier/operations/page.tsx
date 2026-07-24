"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
    AlertTriangle,
    Camera,
    CheckCircle2,
    ImageIcon,
    LoaderCircle,
    LockKeyhole,
    Package,
    ShieldCheck,
    Truck,
    X,
} from "lucide-react";
import {
    type DeliveryProof,
    type FulfillmentOrder,
    useOrderWorkflowStore,
} from "../../lib/order-workflow-store";
import {
    prepareEvidencePhoto,
    type PreparedEvidencePhoto,
} from "../../lib/delivery-proof-utils";

function money(value: number) {
    return new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD" }).format(value);
}

export default function SupplierOperationsPage() {
    const { createdOrders: orders, loading, error, submitSupplierProof } =
        useOrderWorkflowStore();
    const [proofOrder, setProofOrder] = useState<FulfillmentOrder | null>(null);
    const [photo, setPhoto] = useState<PreparedEvidencePhoto | null>(null);
    const [quantity, setQuantity] = useState("");
    const [note, setNote] = useState("");
    const [photoError, setPhotoError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(
        () => () => {
            if (photo) URL.revokeObjectURL(photo.previewUrl);
        },
        [photo]
    );

    const openProof = (order: FulfillmentOrder) => {
        setProofOrder(order);
        setQuantity(order.quantity.toString());
        setNote("");
        setPhoto(null);
        setPhotoError(null);
        setActionError(null);
    };

    const choosePhoto = async (file?: File) => {
        if (!file) return;
        setPhotoError(null);
        try {
            const prepared = await prepareEvidencePhoto(file);
            if (photo) URL.revokeObjectURL(photo.previewUrl);
            setPhoto(prepared);
        } catch (cause) {
            setPhotoError(cause instanceof Error ? cause.message : "Unable to prepare photo.");
        }
    };

    const submit = async () => {
        if (!proofOrder || !photo || Number(quantity) <= 0) return;
        setSubmitting(true);
        setActionError(null);
        try {
            await submitSupplierProof({
                orderId: proofOrder.id,
                photo,
                quantity: Number(quantity),
                note: note.trim() || "Sealed shipment ready for Ninja Van collection.",
            });
            setProofOrder(null);
            URL.revokeObjectURL(photo.previewUrl);
            setPhoto(null);
        } catch (cause) {
            setActionError(cause instanceof Error ? cause.message : "Unable to record proof.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6 lg:px-8">
            <div>
                <p className="text-[10px] font-bold tracking-[0.17em] text-[#6F9277] uppercase">Fulfillment control</p>
                <h1 className="mt-1 text-3xl font-bold tracking-[-0.03em] text-[#2F312F]">Orders & handoff proof</h1>
                <p className="mt-2 text-sm text-[#707670]">Seal the shipment, photograph it, then hand it to Ninja Van.</p>
            </div>

            {error ? <p role="alert" className="rounded-xl bg-[#FFF2EF] px-4 py-3 text-xs text-[#A33A2B]">{error}</p> : null}

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Metric label="Awarded orders" value={orders.length.toString()} />
                <Metric label="Proof required" value={orders.filter((order) => order.verificationStatus === "awaiting_supplier_proof").length.toString()} />
                <Metric label="With Ninja Van" value={orders.filter((order) => ["awaiting_courier_pickup", "in_transit", "awaiting_shop_verification"].includes(order.verificationStatus)).length.toString()} />
                <Metric label="Released payout" value={money(orders.filter((order) => order.payoutStatus === "released").reduce((sum, order) => sum + order.totalPrice, 0))} />
            </div>

            {loading ? (
                <div className="flex justify-center py-20 text-[#6F9277]"><LoaderCircle className="animate-spin" size={25} /></div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => <OrderCard key={order.id} order={order} onProof={() => openProof(order)} />)}
                </div>
            )}

            {!loading && orders.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#C9D4C6] bg-white py-16 text-center"><Package size={27} className="mx-auto text-[#A9B4A6]" /><p className="mt-3 text-sm font-semibold text-[#2F312F]">No awarded orders yet</p><p className="mt-1 text-xs text-[#8A918A]">Orders appear here after a retailer awards your quote.</p></div>
            ) : null}

            {proofOrder ? (
                <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#142016]/55 p-0 backdrop-blur-sm sm:items-center sm:p-4">
                    <div className="max-h-[95vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7">
                        <div className="flex items-start justify-between gap-4">
                            <div><p className="text-[10px] font-bold tracking-[0.15em] text-[#6F9277] uppercase">Immutable handoff evidence</p><h2 className="mt-1 text-xl font-bold text-[#2F312F]">{proofOrder.reference}</h2><p className="mt-1 text-xs text-[#7B817B]">Buyer {proofOrder.retailerAlias} will compare this with receiving evidence.</p></div>
                            <button type="button" onClick={() => setProofOrder(null)} className="rounded-xl p-2 text-[#7B837B]" aria-label="Close"><X size={18} /></button>
                        </div>

                        <label className="mt-5 flex min-h-52 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#BFCBBC] bg-[#F8FAF7]">
                            {photo ? (
                                // Local preview URL; never persisted in the browser.
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={photo.previewUrl} alt="Supplier handoff evidence preview" className="h-64 w-full object-cover" />
                            ) : (
                                <span className="text-center text-[#7B837B]"><Camera size={25} className="mx-auto" /><span className="mt-2 block text-xs font-semibold">Photograph sealed stock</span><span className="mt-1 block text-[10px]">Show cartons, labels, and full quantity clearly</span></span>
                            )}
                            <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="sr-only" onChange={(event) => void choosePhoto(event.target.files?.[0])} />
                        </label>
                        {photoError ? <p className="mt-2 text-[10px] text-[#A33A2B]">{photoError}</p> : null}

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <label><span className="mb-1.5 block text-xs font-semibold text-[#414641]">Units packed</span><input type="number" min={1} value={quantity} onChange={(event) => setQuantity(event.target.value)} className="w-full rounded-xl border border-[#D7DFD5] bg-[#FAFBF9] px-4 py-3 text-sm" /></label>
                            <div className="rounded-xl bg-[#F3F7F2] p-4"><p className="text-[9px] font-bold text-[#6F9277] uppercase">Expected</p><p className="mt-1 text-lg font-bold text-[#2F312F]">{proofOrder.quantity} units</p></div>
                        </div>
                        <label className="mt-4 block"><span className="mb-1.5 block text-xs font-semibold text-[#414641]">Packing note</span><textarea rows={3} maxLength={2000} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Carton count, seal identifiers, or handling note" className="w-full resize-none rounded-xl border border-[#D7DFD5] bg-[#FAFBF9] px-4 py-3 text-sm" /></label>
                        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#F3F7F2] p-4"><LockKeyhole size={17} className="mt-0.5 text-[#4F6F56]" /><p className="text-xs leading-5 text-[#5E685E]">Evidence is uploaded to private storage and cannot be replaced after submission. Ninja Van pickup is the next custody event.</p></div>
                        {actionError ? <p role="alert" className="mt-4 rounded-xl bg-[#FFF2EF] px-4 py-3 text-xs text-[#A33A2B]">{actionError}</p> : null}
                        <button type="button" onClick={() => void submit()} disabled={!photo || Number(quantity) <= 0 || submitting} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#365845] px-4 py-3 text-sm font-bold text-white disabled:opacity-40">{submitting ? <LoaderCircle className="animate-spin" size={16} /> : <ShieldCheck size={16} />} Lock handoff proof</button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return <div className="rounded-2xl border border-[#DDE5DC] bg-white p-4"><p className="text-xl font-bold text-[#2F312F]">{value}</p><p className="mt-1 text-[10px] font-semibold text-[#7B817B]">{label}</p></div>;
}

function OrderCard({ order, onProof }: { order: FulfillmentOrder; onProof: () => void }) {
    return (
        <article className="rounded-3xl border border-[#DDE5DC] bg-white p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="rounded-xl bg-[#EDF3EC] p-2.5 text-[#4F6F56]"><Package size={17} /></div>
                    <div><div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-bold text-[#2F312F]">{order.productName}</h2><OrderStatus status={order.verificationStatus} /></div><p className="mt-1 text-[10px] text-[#8A918A]">{order.reference} · Buyer {order.retailerAlias} · {order.quantity} units</p><p className="mt-3 text-sm font-bold text-[#2F312F]">{money(order.totalPrice)}</p></div>
                </div>
                <div className="min-w-72 rounded-2xl bg-[#F7F9F5] p-4"><div className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-xs font-bold text-[#2F312F]"><Truck size={14} className="text-[#4F6F56]" /> Ninja Van</span><span className="text-[9px] text-[#6F9277]">{order.courier.trackingId ?? "Booking pending"}</span></div><p className="mt-2 text-[10px] text-[#667066]">{order.courier.lastScan}</p></div>
            </div>
            <div className="mt-5 grid gap-4 border-t border-[#E8ECE7] pt-5 lg:grid-cols-[1fr_280px]">
                <div className="space-y-3">{order.events.slice(-4).map((event) => <div key={event.id} className="flex items-start gap-3"><span className="mt-1.5 h-2 w-2 rounded-full bg-[#6F9277]" /><div><p className="text-xs font-semibold text-[#414641]">{event.title}</p><p className="mt-0.5 text-[10px] text-[#7B817B]">{event.detail}</p></div></div>)}</div>
                <div>
                    {order.verificationStatus === "awaiting_supplier_proof" ? <button type="button" onClick={onProof} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#365845] px-4 py-3 text-xs font-bold text-white"><Camera size={14} /> Add handoff proof</button> : order.dispute ? <div className="rounded-2xl bg-[#FFF5EC] p-4"><p className="flex items-center gap-2 text-xs font-bold text-[#765031]"><AlertTriangle size={14} /> {order.dispute.reference}</p><p className="mt-2 text-[10px] leading-5 text-[#765F4C]">{order.dispute.automatedAssessment}</p><p className="mt-2 text-[9px] font-bold uppercase text-[#A66A3A]">{order.dispute.status.replaceAll("_", " ")}</p></div> : order.verificationStatus === "verified" ? <div className="rounded-2xl bg-[#EDF6EC] p-4"><p className="flex items-center gap-2 text-xs font-bold text-[#3F7048]"><CheckCircle2 size={14} /> Payout released</p><p className="mt-1 text-[10px] text-[#607460]">Retailer verification is complete.</p></div> : <ProofCard proof={order.supplierProof} />}
                </div>
            </div>
        </article>
    );
}

function ProofCard({ proof }: { proof?: DeliveryProof }) {
    return (
        <div className="rounded-2xl bg-[#F4F6F3] p-4">
            {proof?.photoUrl ? (
                <div className="relative h-28 overflow-hidden rounded-xl">
                    <Image
                        src={proof.photoUrl}
                        alt="Sealed handoff evidence"
                        fill
                        unoptimized
                        className="object-cover"
                    />
                </div>
            ) : (
                <div className="flex h-20 items-center justify-center text-[#9AA09A]">
                    <ImageIcon size={20} />
                </div>
            )}
            <p className="mt-2 flex items-center gap-1 text-[9px] text-[#667066]">
                <LockKeyhole size={10} /> {proof?.quantity ?? "—"} units · immutable evidence
            </p>
        </div>
    );
}

function OrderStatus({ status }: { status: FulfillmentOrder["verificationStatus"] }) {
    const style = status === "verified" ? "bg-[#E7F2E6] text-[#3F7048]" : status === "disputed" ? "bg-[#FFF0E8] text-[#A4582A]" : "bg-[#F1F2F0] text-[#666B66]";
    return <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${style}`}>{status.replaceAll("_", " ")}</span>;
}
