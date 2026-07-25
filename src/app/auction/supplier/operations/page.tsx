"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
    AlertTriangle,
    Camera,
    CheckCircle2,
    CircleDollarSign,
    ImageIcon,
    LoaderCircle,
    LockKeyhole,
    Package,
    ShieldCheck,
    Truck,
} from "lucide-react";
import { MetricCard } from "../../components/metric-card";
import { Modal } from "../../components/modal";
import {
    Field,
    fieldClass,
    primaryButtonClass,
    secondaryButtonClass,
} from "../../components/form";
import {
    type DeliveryProof,
    type FulfillmentOrder,
    useOrderWorkflowStore,
} from "../../lib/order-workflow-store";
import {
    prepareEvidencePhoto,
    type PreparedEvidencePhoto,
} from "../../lib/delivery-proof-utils";
import {
    disputeStatusLabel,
    supplierOrderStatus,
    timelineEventCopy,
} from "../../lib/display-copy";
import { money, moneyCompact } from "../../lib/format";

export default function SupplierOperationsPage() {
    const { createdOrders: orders, loading, error, submitSupplierProof } = useOrderWorkflowStore();
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
                note: note.trim() || "Order packed and ready for Ninja Van pickup.",
            });
            setProofOrder(null);
            URL.revokeObjectURL(photo.previewUrl);
            setPhoto(null);
        } catch (cause) {
            setActionError(
                cause instanceof Error
                    ? cause.message
                    : "We could not save the dispatch photo. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const quantityMismatch =
        proofOrder && Number(quantity) > 0 && Number(quantity) !== proofOrder.quantity;

    return (
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
            <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-[#6F9277] uppercase">
                    Deliveries
                </p>
                <h1 className="mt-1.5 text-[28px] leading-tight font-semibold tracking-[-0.025em] text-[#2F312F]">
                    Prepare and track orders
                </h1>
                <p className="mt-1.5 max-w-2xl text-[15px] leading-6 text-[#707670]">
                    Upload a clear dispatch photo, then follow the order through Ninja Van delivery.
                </p>
            </div>

            {error ? (
                <p role="alert" className="rounded-xl bg-[#FFF2EF] px-4 py-3 text-[14px] text-[#A33A2B]">
                    {error}
                </p>
            ) : null}

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <MetricCard icon={Package} label="Confirmed orders" value={orders.length.toString()} />
                <MetricCard
                    icon={Camera}
                    label="Dispatch photos needed"
                    value={orders
                        .filter((order) => order.verificationStatus === "awaiting_supplier_proof")
                        .length.toString()}
                />
                <MetricCard
                    icon={Truck}
                    label="With Ninja Van"
                    value={orders
                        .filter((order) =>
                            ["awaiting_courier_pickup", "in_transit", "awaiting_shop_verification"].includes(
                                order.verificationStatus
                            )
                        )
                        .length.toString()}
                />
                <MetricCard
                    icon={CircleDollarSign}
                    label="Completed order value"
                    value={moneyCompact(
                        orders
                            .filter((order) => order.payoutStatus === "released")
                            .reduce((sum, order) => sum + order.totalPrice, 0)
                    )}
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-20 text-[#6F9277]">
                    <LoaderCircle className="animate-spin" size={25} />
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map((order) => (
                        <OrderCard key={order.id} order={order} onProof={() => openProof(order)} />
                    ))}
                </div>
            )}

            {!loading && orders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#C9D4C6] bg-white py-14 text-center">
                    <Package size={26} className="mx-auto text-[#A9B4A6]" />
                    <p className="mt-3 text-[15px] font-semibold text-[#2F312F]">
                        No confirmed orders yet
                    </p>
                    <p className="mt-1 text-[13px] text-[#8A918A]">
                        Orders appear here when a retailer chooses your quote.
                    </p>
                </div>
            ) : null}

            {proofOrder ? (
                <Modal
                    open
                    onClose={() => setProofOrder(null)}
                    eyebrow="Dispatch photo"
                    title={proofOrder.productName}
                    description={`${proofOrder.reference} · Retailer ${proofOrder.retailerAlias} · ${proofOrder.quantity} units ordered`}
                    footer={
                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setProofOrder(null)}
                                className={secondaryButtonClass}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => void submit()}
                                disabled={!photo || Number(quantity) <= 0 || submitting}
                                className={primaryButtonClass}
                            >
                                {submitting ? (
                                    <LoaderCircle className="animate-spin" size={16} />
                                ) : (
                                    <ShieldCheck size={16} />
                                )}
                                Submit dispatch photo
                            </button>
                        </div>
                    }
                >
                    <div className="space-y-5">
                        <div>
                            <label className="flex h-52 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#BFCBBC] bg-[#F8FAF7] transition hover:border-[#6F9277] hover:bg-[#F1F6F0]">
                                {photo ? (
                                    // Local preview URL; never persisted in the browser.
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={photo.previewUrl}
                                        alt="Dispatch photo preview"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="px-6 text-center text-[#7B837B]">
                                        <Camera size={26} className="mx-auto" />
                                        <span className="mt-2.5 block text-[14px] font-medium text-[#414641]">
                                            Photograph the packed order
                                        </span>
                                        <span className="mt-1 block text-[13px]">
                                            Show cartons, labels, and full quantity clearly
                                        </span>
                                    </span>
                                )}
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    capture="environment"
                                    className="sr-only"
                                    onChange={(event) => void choosePhoto(event.target.files?.[0])}
                                />
                            </label>
                            {photoError ? (
                                <p className="mt-2 text-[13px] text-[#A33A2B]">{photoError}</p>
                            ) : null}
                        </div>

                        <Field
                            label="Units packed"
                            hint={`${proofOrder.quantity} ordered`}
                            htmlFor="proof-quantity"
                        >
                            <input
                                id="proof-quantity"
                                type="number"
                                min={1}
                                inputMode="numeric"
                                value={quantity}
                                onChange={(event) => setQuantity(event.target.value)}
                                className={`${fieldClass} tabular`}
                            />
                            {quantityMismatch ? (
                                <p className="mt-2 flex items-start gap-2 text-[13px] leading-5 text-[#8A5A2E]">
                                    <AlertTriangle size={15} className="mt-px shrink-0" />
                                    This does not match the {proofOrder.quantity} units ordered. The
                                    retailer will see the difference when the order arrives.
                                </p>
                            ) : null}
                        </Field>

                        <Field label="Packing details" hint="Optional" htmlFor="proof-note">
                            <textarea
                                id="proof-note"
                                rows={3}
                                maxLength={2000}
                                value={note}
                                onChange={(event) => setNote(event.target.value)}
                                placeholder="Carton count, seal identifiers, or handling note"
                                className={`${fieldClass} resize-none`}
                            />
                        </Field>

                        <div className="flex items-start gap-2.5 text-[13px] leading-6 text-[#7B817B]">
                            <LockKeyhole size={16} className="mt-1 shrink-0 text-[#6F9277]" />
                            <p>
                                Your photo is stored privately and cannot be changed after you submit
                                it. The next step is Ninja Van pickup.
                            </p>
                        </div>

                        {actionError ? (
                            <p
                                role="alert"
                                className="rounded-lg bg-[#FFF2EF] px-4 py-3 text-[13px] text-[#A33A2B]"
                            >
                                {actionError}
                            </p>
                        ) : null}
                    </div>
                </Modal>
            ) : null}
        </div>
    );
}

function OrderCard({ order, onProof }: { order: FulfillmentOrder; onProof: () => void }) {
    return (
        <article className="rounded-2xl border border-[#E2E8E0] bg-white p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="shrink-0 rounded-lg bg-[#EDF3EC] p-2.5 text-[#4F6F56]">
                        <Package size={18} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-[15px] font-semibold text-[#2F312F]">
                                {order.productName}
                            </h2>
                            <OrderStatus status={order.verificationStatus} />
                        </div>
                        <p className="mt-1.5 text-[13px] text-[#8A918A]">
                            {order.reference} · Retailer {order.retailerAlias} · {order.quantity} units
                        </p>
                        <p className="tabular mt-3 text-[18px] font-semibold text-[#2F312F]">
                            {money(order.totalPrice)}
                        </p>
                    </div>
                </div>
                <div className="shrink-0 rounded-xl border border-[#E8EDE6] bg-[#F7F9F5] p-4 lg:w-72">
                    <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#2F312F]">
                            <Truck size={15} className="text-[#4F6F56]" /> Ninja Van
                        </span>
                        <span className="text-[12px] font-medium text-[#6F9277]">
                            {order.courier.trackingId ?? "Booking pending"}
                        </span>
                    </div>
                    <p className="mt-2 text-[13px] leading-5 text-[#5D645D]">{order.courier.lastScan}</p>
                </div>
            </div>
            <div className="mt-5 grid gap-5 border-t border-[#E8ECE7] pt-5 lg:grid-cols-[1fr_280px]">
                <div className="space-y-3">
                    {order.events.slice(-4).map((event) => {
                        const copy = timelineEventCopy(event);
                        return (
                            <div key={event.id} className="flex items-start gap-3">
                                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#6F9277]" />
                                <div>
                                    <p className="text-[14px] font-medium text-[#414641]">{copy.title}</p>
                                    <p className="mt-0.5 text-[13px] leading-5 text-[#7B817B]">
                                        {copy.detail}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div>
                    {order.verificationStatus === "awaiting_supplier_proof" ? (
                        <button type="button" onClick={onProof} className={`${primaryButtonClass} w-full`}>
                            <Camera size={16} /> Add dispatch photo
                        </button>
                    ) : order.dispute ? (
                        <div className="rounded-xl bg-[#FFF5EC] p-4">
                            <p className="flex items-center gap-2 text-[14px] font-semibold text-[#765031]">
                                <AlertTriangle size={15} /> {order.dispute.reference}
                            </p>
                            <p className="mt-2 text-[13px] leading-6 text-[#765F4C]">
                                {order.dispute.automatedAssessment}
                            </p>
                            <p className="mt-2 text-[11px] font-semibold tracking-[0.06em] text-[#A66A3A] uppercase">
                                {disputeStatusLabel(order.dispute.status)}
                            </p>
                        </div>
                    ) : order.verificationStatus === "verified" ? (
                        <div className="rounded-xl bg-[#EDF6EC] p-4">
                            <p className="flex items-center gap-2 text-[14px] font-semibold text-[#3F7048]">
                                <CheckCircle2 size={15} /> Order completed
                            </p>
                            <p className="mt-1 text-[13px] leading-6 text-[#607460]">
                                The retailer confirmed the delivery.
                            </p>
                        </div>
                    ) : (
                        <ProofCard proof={order.supplierProof} />
                    )}
                </div>
            </div>
        </article>
    );
}

function ProofCard({ proof }: { proof?: DeliveryProof }) {
    return (
        <div className="rounded-xl bg-[#F4F6F3] p-4">
            {proof?.photoUrl ? (
                <div className="relative h-28 overflow-hidden rounded-lg">
                    <Image
                        src={proof.photoUrl}
                        alt="Private dispatch photo"
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
            <p className="mt-2.5 flex items-center gap-1.5 text-[12px] text-[#5D645D]">
                <LockKeyhole size={11} /> {proof?.quantity ?? "—"} units · private dispatch photo
            </p>
        </div>
    );
}

function OrderStatus({ status }: { status: FulfillmentOrder["verificationStatus"] }) {
    const style =
        status === "verified"
            ? "bg-[#E7F2E6] text-[#3F7048]"
            : status === "disputed"
              ? "bg-[#FFF0E8] text-[#A4582A]"
              : "bg-[#F1F2F0] text-[#666B66]";
    return (
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${style}`}>
            {supplierOrderStatus(status)}
        </span>
    );
}
