"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
    AlertTriangle,
    ArrowRight,
    Camera,
    CheckCircle2,
    CircleDollarSign,
    Clock3,
    CreditCard,
    FileWarning,
    ImageIcon,
    LoaderCircle,
    LockKeyhole,
    Package,
    Plus,
    QrCode,
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
    retailerOrderStatus,
    timelineEventCopy,
} from "../../lib/display-copy";
import { dateTime, money, moneyCompact } from "../../lib/format";
import {
    createCheckout,
    quoteCheckout,
    retryPaymentOperation,
    syncCheckout,
    type CheckoutQuote,
    type PaymentMethod,
} from "../../lib/payments";

type Outcome = "accepted" | "damaged" | "short" | "wrong_items" | "other";
type OrderFilter = "all" | "active" | "confirm" | "pending";

export default function OrdersPage() {
    const { createdOrders: orders, loading, error, refresh, verifyShopDelivery } = useOrderWorkflowStore();
    const [verifyOrder, setVerifyOrder] = useState<FulfillmentOrder | null>(null);
    const [photo, setPhoto] = useState<PreparedEvidencePhoto | null>(null);
    const [quantity, setQuantity] = useState("");
    const [outcome, setOutcome] = useState<Outcome>("accepted");
    const [note, setNote] = useState("");
    const [photoError, setPhotoError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [filter, setFilter] = useState<OrderFilter>("all");
    const [focusedOrderId, setFocusedOrderId] = useState<string | null>(null);
    const [paymentOrder, setPaymentOrder] = useState<FulfillmentOrder | null>(null);
    const [paymentQuote, setPaymentQuote] = useState<CheckoutQuote | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("paynow");
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [paymentNotice, setPaymentNotice] = useState<string | null>(null);
    const checkoutSyncStarted = useRef(false);
    const settlementRetries = useRef(new Set<string>());

    const filteredOrders = orders.filter((order) => {
        if (filter === "active") {
            return ["awaiting_courier_pickup", "in_transit"].includes(order.verificationStatus);
        }
        if (filter === "confirm") {
            return order.verificationStatus === "awaiting_shop_verification";
        }
        if (filter === "pending") return ["held", "under_review"].includes(order.payoutStatus);
        return true;
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const requestedFilter = params.get("filter");
        const requestedOrder = params.get("order");
        const validFilters: OrderFilter[] = ["all", "active", "confirm", "pending"];

        if (requestedFilter && validFilters.includes(requestedFilter as OrderFilter)) {
            setFilter(requestedFilter as OrderFilter);
        }
        if (requestedOrder) setFocusedOrderId(requestedOrder);
    }, []);

    useEffect(() => {
        if (checkoutSyncStarted.current) return;
        const params = new URLSearchParams(window.location.search);
        const paymentResult = params.get("payment");
        const orderId = params.get("order");
        const sessionId = params.get("session_id");

        if (paymentResult === "cancelled") {
            checkoutSyncStarted.current = true;
            setPaymentNotice("Payment was cancelled. Your order is unchanged and you can pay when ready.");
            return;
        }
        if (paymentResult !== "success" || !orderId || !sessionId) return;

        checkoutSyncStarted.current = true;
        setPaymentNotice("Confirming your payment with Stripe…");
        void syncCheckout(orderId, sessionId)
            .then(async (result) => {
                setPaymentNotice(
                    result.paymentStatus === "paid"
                        ? "Payment confirmed. The supplier can now prepare your order."
                        : "Stripe is still confirming the payment. This page will update automatically."
                );
                await refresh();
            })
            .catch((cause) => {
                setPaymentNotice(
                    cause instanceof Error
                        ? cause.message
                        : "Payment was submitted, but its status could not be refreshed yet."
                );
            });
    }, [refresh]);

    useEffect(() => {
        if (loading) return;
        orders
            .filter((order) => ["transfer_pending", "refund_pending"].includes(order.paymentStatus))
            .forEach((order) => {
                if (settlementRetries.current.has(order.id)) return;
                settlementRetries.current.add(order.id);
                void retryPaymentOperation(order.id)
                    .then(async (result) => {
                        if (result.processed) await refresh();
                    })
                    .catch(() => undefined);
            });
    }, [loading, orders, refresh]);

    useEffect(() => {
        if (!loading && focusedOrderId) {
            window.requestAnimationFrame(() => {
                document.getElementById(`order-${focusedOrderId}`)?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            });
        }
    }, [focusedOrderId, loading]);

    useEffect(
        () => () => {
            if (photo) URL.revokeObjectURL(photo.previewUrl);
        },
        [photo]
    );

    const openVerification = (order: FulfillmentOrder) => {
        setVerifyOrder(order);
        setQuantity(order.quantity.toString());
        setOutcome("accepted");
        setNote("");
        setPhoto(null);
        setPhotoError(null);
        setActionError(null);
    };

    const openPayment = async (order: FulfillmentOrder) => {
        setPaymentOrder(order);
        setPaymentQuote(null);
        setPaymentMethod("paynow");
        setPaymentError(null);
        setPaymentLoading(true);
        try {
            setPaymentQuote(await quoteCheckout(order.id));
        } catch (cause) {
            setPaymentError(cause instanceof Error ? cause.message : "Unable to prepare payment.");
        } finally {
            setPaymentLoading(false);
        }
    };

    const continueToStripe = async () => {
        if (!paymentOrder || !paymentQuote?.supplierReady) return;
        setPaymentLoading(true);
        setPaymentError(null);
        try {
            const checkout = await createCheckout(paymentOrder.id, paymentMethod);
            window.location.assign(checkout.checkoutUrl);
        } catch (cause) {
            setPaymentError(cause instanceof Error ? cause.message : "Unable to open Stripe Checkout.");
            setPaymentLoading(false);
        }
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
        if (!verifyOrder || !photo || Number(quantity) <= 0) return;
        setSubmitting(true);
        setActionError(null);
        try {
            await verifyShopDelivery({
                orderId: verifyOrder.id,
                photo,
                quantity: Number(quantity),
                note:
                    note.trim() ||
                    (outcome === "accepted" ? "Received in good condition." : "Photo added for review."),
                outcome,
            });
            setVerifyOrder(null);
            URL.revokeObjectURL(photo.previewUrl);
            setPhoto(null);
        } catch (cause) {
            setActionError(
                cause instanceof Error
                    ? cause.message
                    : "We could not save your delivery confirmation. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const selectFilter = (value: OrderFilter) => {
        setFilter(value);
        setFocusedOrderId(null);
        const url = new URL(window.location.href);
        if (value === "all") url.searchParams.delete("filter");
        else url.searchParams.set("filter", value);
        url.searchParams.delete("order");
        window.history.replaceState({}, "", url);
    };

    const submitDisabled =
        !photo ||
        Number(quantity) <= 0 ||
        submitting ||
        (outcome !== "accepted" && note.trim().length < 2);

    return (
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-[#6F9277] uppercase">
                        Deliveries
                    </p>
                    <h1 className="mt-1.5 text-[28px] leading-tight font-semibold tracking-[-0.025em] text-[#2F312F]">
                        Track and confirm orders
                    </h1>
                    <p className="mt-1.5 max-w-2xl text-[15px] leading-6 text-[#707670]">
                        Follow Ninja Van updates. When an order arrives, upload a photo and confirm
                        whether everything is correct.
                    </p>
                </div>
                <Link href="/auction/shop/orders/new" className={`${primaryButtonClass} shrink-0`}>
                    <Plus size={16} /> Create order
                </Link>
            </div>

            {error ? (
                <p role="alert" className="rounded-xl bg-[#FFF2EF] px-4 py-3 text-[14px] text-[#A33A2B]">
                    {error}
                </p>
            ) : null}

            {paymentNotice ? (
                <div
                    role="status"
                    className="flex items-start justify-between gap-4 rounded-xl border border-[#D9E5D7] bg-[#F1F7EF] px-4 py-3 text-[14px] text-[#46634C]"
                >
                    <span>{paymentNotice}</span>
                    <button
                        type="button"
                        onClick={() => setPaymentNotice(null)}
                        className="shrink-0 text-[12px] font-semibold hover:underline"
                    >
                        Dismiss
                    </button>
                </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <MetricCard
                    icon={Package}
                    label="Total orders"
                    value={orders.length.toString()}
                    active={filter === "all"}
                    onClick={() => selectFilter("all")}
                />
                <MetricCard
                    icon={Truck}
                    label="In delivery"
                    value={orders
                        .filter((order) =>
                            ["awaiting_courier_pickup", "in_transit"].includes(order.verificationStatus)
                        )
                        .length.toString()}
                    active={filter === "active"}
                    onClick={() => selectFilter("active")}
                />
                <MetricCard
                    icon={Camera}
                    label="Ready to confirm"
                    value={orders
                        .filter((order) => order.verificationStatus === "awaiting_shop_verification")
                        .length.toString()}
                    active={filter === "confirm"}
                    onClick={() => selectFilter("confirm")}
                />
                <MetricCard
                    icon={CircleDollarSign}
                    label="Value awaiting confirmation"
                    value={moneyCompact(
                        orders
                            .filter((order) => ["held", "under_review"].includes(order.payoutStatus))
                            .reduce((sum, order) => sum + order.totalPrice, 0)
                    )}
                    active={filter === "pending"}
                    onClick={() => selectFilter("pending")}
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-20 text-[#6F9277]">
                    <LoaderCircle className="animate-spin" size={25} />
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredOrders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            focused={order.id === focusedOrderId}
                            onVerify={() => openVerification(order)}
                            onPay={() => void openPayment(order)}
                        />
                    ))}
                </div>
            )}

            {!loading && orders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#C9D4C6] bg-white py-14 text-center">
                    <Package size={26} className="mx-auto text-[#A9B4A6]" />
                    <p className="mt-3 text-[15px] font-semibold text-[#2F312F]">No orders yet</p>
                    <p className="mt-1 text-[13px] text-[#8A918A]">
                        Choose a supplier quote to create your first order.
                    </p>
                    <Link
                        href="/auction/shop/requests"
                        className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#4F6F56] hover:underline"
                    >
                        View quote requests <ArrowRight size={14} />
                    </Link>
                </div>
            ) : null}

            {!loading && orders.length > 0 && filteredOrders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#C9D4C6] bg-white py-12 text-center">
                    <Package size={24} className="mx-auto text-[#A9B4A6]" />
                    <p className="mt-3 text-[15px] font-semibold text-[#2F312F]">
                        No orders in this view
                    </p>
                    <button
                        type="button"
                        onClick={() => selectFilter("all")}
                        className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#4F6F56] hover:underline"
                    >
                        Show all orders <ArrowRight size={14} />
                    </button>
                </div>
            ) : null}

            {verifyOrder ? (
                <Modal
                    open
                    onClose={() => setVerifyOrder(null)}
                    size="lg"
                    eyebrow="Confirm delivery"
                    title={verifyOrder.productName}
                    description={`${verifyOrder.reference} · ${verifyOrder.supplierAlias} · ${verifyOrder.quantity} units ordered`}
                    footer={
                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setVerifyOrder(null)}
                                className={secondaryButtonClass}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => void submit()}
                                disabled={submitDisabled}
                                className={primaryButtonClass}
                            >
                                {submitting ? (
                                    <LoaderCircle className="animate-spin" size={16} />
                                ) : outcome === "accepted" ? (
                                    <CheckCircle2 size={16} />
                                ) : (
                                    <AlertTriangle size={16} />
                                )}
                                {outcome === "accepted" ? "Confirm delivery" : "Report issue"}
                            </button>
                        </div>
                    }
                >
                    <div className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <ProofCard title="Supplier dispatch photo" proof={verifyOrder.supplierProof} />
                            <div className="rounded-xl border border-[#E2E8E0] p-4">
                                <p className="text-[13px] font-medium text-[#414641]">
                                    Photo of what arrived
                                </p>
                                <label className="mt-3 flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-[#BFCBBC] bg-[#F8FAF7] transition hover:border-[#6F9277] hover:bg-[#F1F6F0]">
                                    {photo ? (
                                        // A local object URL is safe and intentionally bypasses Next image optimization.
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={photo.previewUrl}
                                            alt="Delivery photo preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="px-4 text-center text-[#7B837B]">
                                            <Camera size={22} className="mx-auto" />
                                            <span className="mt-2 block text-[13px]">
                                                Take or choose a clear photo
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
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Units received" htmlFor="verify-quantity">
                                <input
                                    id="verify-quantity"
                                    type="number"
                                    min={1}
                                    inputMode="numeric"
                                    value={quantity}
                                    onChange={(event) => setQuantity(event.target.value)}
                                    className={`${fieldClass} tabular`}
                                />
                            </Field>
                            <Field label="Delivery condition" htmlFor="verify-outcome">
                                <select
                                    id="verify-outcome"
                                    value={outcome}
                                    onChange={(event) => setOutcome(event.target.value as Outcome)}
                                    className={fieldClass}
                                >
                                    <option value="accepted">Everything is correct</option>
                                    <option value="damaged">Some items are damaged</option>
                                    <option value="short">Some items are missing</option>
                                    <option value="wrong_items">Wrong items arrived</option>
                                    <option value="other">Another issue</option>
                                </select>
                            </Field>
                        </div>

                        <Field
                            label="Add a note"
                            hint={outcome === "accepted" ? "Optional" : "Required"}
                            htmlFor="verify-note"
                        >
                            <textarea
                                id="verify-note"
                                rows={3}
                                maxLength={2000}
                                value={note}
                                onChange={(event) => setNote(event.target.value)}
                                placeholder={
                                    outcome === "accepted"
                                        ? "Optional receiving note"
                                        : "Describe the issue clearly for the independent reviewer"
                                }
                                className={`${fieldClass} resize-none`}
                            />
                        </Field>

                        {outcome !== "accepted" ? (
                            <div className="flex items-start gap-3 rounded-xl bg-[#FFF5EC] px-4 py-3.5">
                                <FileWarning size={17} className="mt-0.5 shrink-0 text-[#B26A35]" />
                                <p className="text-[13px] leading-6 text-[#765031]">
                                    Reporting an issue keeps the order open and sends both photos and
                                    Ninja Van updates to an independent reviewer.
                                </p>
                            </div>
                        ) : null}

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

            {paymentOrder ? (
                <PaymentModal
                    order={paymentOrder}
                    quote={paymentQuote}
                    selectedMethod={paymentMethod}
                    loading={paymentLoading}
                    error={paymentError}
                    onSelectMethod={setPaymentMethod}
                    onClose={() => {
                        if (!paymentLoading) setPaymentOrder(null);
                    }}
                    onContinue={() => void continueToStripe()}
                />
            ) : null}
        </div>
    );
}

function OrderCard({
    order,
    focused,
    onVerify,
    onPay,
}: {
    order: FulfillmentOrder;
    focused: boolean;
    onVerify: () => void;
    onPay: () => void;
}) {
    const paymentRequired = ["not_started", "checkout_pending", "failed"].includes(
        order.paymentStatus
    );
    return (
        <article
            id={`order-${order.id}`}
            className={`scroll-mt-24 rounded-2xl border bg-white p-5 transition ${
                focused
                    ? "border-[#8FA993] shadow-[0_14px_36px_-30px_rgba(54,88,69,0.6)]"
                    : "border-[#E2E8E0]"
            }`}
        >
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
                            <PaymentStatusChip status={order.paymentStatus} />
                        </div>
                        <p className="mt-1.5 text-[13px] text-[#8A918A]">
                            {order.reference} · {order.supplierAlias} · {order.quantity} units
                        </p>
                        <p className="tabular mt-3 text-[18px] font-semibold text-[#2F312F]">
                            {money(order.totalPrice)}
                        </p>
                        {order.payment && order.payment.transactionFee > 0 ? (
                            <p className="mt-1 text-[12px] text-[#8A918A]">
                                Paid total {money(order.payment.amountTotal)} including transaction fee
                            </p>
                        ) : null}
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
                    <p className="mt-1 text-[12px] text-[#9AA09A]">{dateTime(order.courier.lastScanAt)}</p>
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
                    {paymentRequired ? (
                        <div className="rounded-xl border border-[#D9E5D7] bg-[#F4F8F2] p-4">
                            <p className="flex items-center gap-2 text-[14px] font-semibold text-[#3F5F47]">
                                <CreditCard size={15} /> Payment required
                            </p>
                            <p className="mt-1 text-[13px] leading-6 text-[#657265]">
                                Review PayNow and card fees before continuing to Stripe.
                            </p>
                            <button
                                type="button"
                                onClick={onPay}
                                className={`${primaryButtonClass} mt-3 w-full`}
                            >
                                Pay securely <ArrowRight size={15} />
                            </button>
                        </div>
                    ) : order.paymentStatus === "checkout_creating" || order.paymentStatus === "processing" ? (
                        <div className="rounded-xl bg-[#F4F6F3] p-4">
                            <p className="flex items-center gap-2 text-[14px] font-semibold text-[#5E685E]">
                                <LoaderCircle className="animate-spin" size={15} /> Confirming payment
                            </p>
                            <p className="mt-1 text-[13px] leading-6 text-[#7B817B]">
                                Stripe is preparing or confirming the payment. This page updates automatically.
                            </p>
                        </div>
                    ) : order.verificationStatus === "awaiting_shop_verification" ? (
                        <button type="button" onClick={onVerify} className={`${primaryButtonClass} w-full`}>
                            <Camera size={16} /> Confirm delivery
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
                                <ShieldCheck size={15} /> Order completed
                            </p>
                            <p className="mt-1 text-[13px] leading-6 text-[#607460]">
                                You confirmed the delivery. Supplier payment is being released securely.
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-xl bg-[#F4F6F3] p-4">
                            <p className="flex items-center gap-2 text-[14px] font-semibold text-[#5E685E]">
                                <Clock3 size={15} /> No action needed
                            </p>
                            <p className="mt-1 text-[13px] leading-6 text-[#7B817B]">
                                We&apos;ll notify you when the order is ready to confirm.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}

function PaymentModal({
    order,
    quote,
    selectedMethod,
    loading,
    error,
    onSelectMethod,
    onClose,
    onContinue,
}: {
    order: FulfillmentOrder;
    quote: CheckoutQuote | null;
    selectedMethod: PaymentMethod;
    loading: boolean;
    error: string | null;
    onSelectMethod: (method: PaymentMethod) => void;
    onClose: () => void;
    onContinue: () => void;
}) {
    const selectedQuote = quote?.quotes.find((item) => item.paymentMethod === selectedMethod);
    return (
        <Modal
            open
            onClose={onClose}
            size="lg"
            eyebrow="Secure payment"
            title={`Pay ${order.reference}`}
            description={`${order.productName} · ${order.quantity} units`}
            footer={
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button type="button" onClick={onClose} disabled={loading} className={secondaryButtonClass}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onContinue}
                        disabled={loading || !quote?.supplierReady || !selectedQuote}
                        className={primaryButtonClass}
                    >
                        {loading ? <LoaderCircle className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                        {selectedQuote
                            ? `Continue to Stripe · ${money(selectedQuote.amountTotal / 100)}`
                            : "Continue to Stripe"}
                    </button>
                </div>
            }
        >
            <div className="space-y-5">
                {loading && !quote ? (
                    <div className="flex items-center justify-center gap-2 py-12 text-[14px] text-[#6F9277]">
                        <LoaderCircle className="animate-spin" size={18} /> Preparing payment options…
                    </div>
                ) : quote ? (
                    <>
                        {!quote.supplierReady ? (
                            <div className="flex items-start gap-3 rounded-xl bg-[#FFF5EC] px-4 py-3.5 text-[13px] leading-6 text-[#765031]">
                                <AlertTriangle className="mt-0.5 shrink-0" size={17} />
                                <span>{quote.unavailableReason}</span>
                            </div>
                        ) : null}

                        <div className="grid gap-3 sm:grid-cols-2">
                            {quote.quotes.map((option) => {
                                const selected = option.paymentMethod === selectedMethod;
                                const Icon = option.paymentMethod === "paynow" ? QrCode : CreditCard;
                                return (
                                    <button
                                        key={option.paymentMethod}
                                        type="button"
                                        onClick={() => onSelectMethod(option.paymentMethod)}
                                        className={`rounded-xl border p-4 text-left transition ${
                                            selected
                                                ? "border-[#6F9277] bg-[#F1F7EF] shadow-[0_8px_22px_-18px_rgba(54,88,69,0.7)]"
                                                : "border-[#E0E6DE] bg-white hover:border-[#AFC0AC]"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="rounded-lg bg-[#EAF2E8] p-2 text-[#4F6F56]">
                                                <Icon size={18} />
                                            </span>
                                            {option.recommended ? (
                                                <span className="rounded-full bg-[#DCEBDA] px-2 py-1 text-[10px] font-semibold tracking-[0.05em] text-[#416449] uppercase">
                                                    Lowest fee
                                                </span>
                                            ) : null}
                                        </div>
                                        <p className="mt-3 text-[15px] font-semibold text-[#2F312F]">
                                            {option.paymentMethod === "paynow" ? "PayNow" : "Card"}
                                        </p>
                                        <p className="mt-1 text-[12px] leading-5 text-[#7B817B]">
                                            {option.feeDescription}
                                        </p>
                                        <p className="tabular mt-3 text-[14px] font-semibold text-[#415646]">
                                            Fee {money(option.transactionFee / 100)}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>

                        {selectedQuote ? (
                            <div className="rounded-xl border border-[#E2E8E0] bg-[#FAFBF9] p-4">
                                <div className="flex items-center justify-between text-[13px] text-[#646B64]">
                                    <span>Supplier quote</span>
                                    <span className="tabular font-medium text-[#343834]">
                                        {money(selectedQuote.amountSubtotal / 100)}
                                    </span>
                                </div>
                                <div className="mt-2 flex items-center justify-between text-[13px] text-[#646B64]">
                                    <span>{selectedQuote.feeDescription}</span>
                                    <span className="tabular font-medium text-[#343834]">
                                        {money(selectedQuote.transactionFee / 100)}
                                    </span>
                                </div>
                                <div className="mt-3 flex items-center justify-between border-t border-[#E1E6DF] pt-3">
                                    <span className="text-[14px] font-semibold text-[#2F312F]">Total charged</span>
                                    <span className="tabular text-[18px] font-semibold text-[#2F312F]">
                                        {money(selectedQuote.amountTotal / 100)}
                                    </span>
                                </div>
                            </div>
                        ) : null}

                        <p className="flex items-start gap-2 text-[12px] leading-5 text-[#7D847D]">
                            <LockKeyhole className="mt-0.5 shrink-0" size={13} />
                            The supplier receives the quoted amount. The disclosed transaction fee covers payment processing,
                            controlled payout and refund handling. Card details are entered only on Stripe Checkout.
                        </p>
                    </>
                ) : null}

                {error ? (
                    <p role="alert" className="rounded-lg bg-[#FFF2EF] px-4 py-3 text-[13px] text-[#A33A2B]">
                        {error}
                    </p>
                ) : null}
            </div>
        </Modal>
    );
}

function PaymentStatusChip({ status }: { status: FulfillmentOrder["paymentStatus"] }) {
    if (status === "legacy") return null;
    const paid = ["paid", "transfer_pending", "transferred"].includes(status);
    const problem = ["failed", "disputed", "refund_pending", "refunded"].includes(status);
    const label =
        status === "not_started"
            ? "Payment required"
            : status === "checkout_pending"
              ? "Checkout ready"
              : status === "transferred"
                ? "Supplier paid"
                : status === "transfer_pending"
                  ? "Supplier payment queued"
                  : status === "refund_pending"
                    ? "Refund pending"
                    : status === "refunded"
                      ? "Refunded"
                      : status === "disputed"
                        ? "Payment under review"
                        : status === "failed"
                          ? "Payment failed"
                          : paid
                            ? "Paid"
                            : "Payment processing";
    return (
        <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                paid
                    ? "bg-[#E7F2E6] text-[#3F7048]"
                    : problem
                      ? "bg-[#FFF0E8] text-[#A4582A]"
                      : "bg-[#EDF0FA] text-[#4A5D92]"
            }`}
        >
            {label}
        </span>
    );
}

function ProofCard({ title, proof }: { title: string; proof?: DeliveryProof }) {
    return (
        <div className="rounded-xl border border-[#E2E8E0] p-4">
            <p className="text-[13px] font-medium text-[#414641]">{title}</p>
            {proof?.photoUrl ? (
                // Signed URLs are short-lived and served from a private bucket.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={proof.photoUrl} alt={title} className="mt-3 h-40 w-full rounded-lg object-cover" />
            ) : (
                <div className="mt-3 flex h-40 items-center justify-center rounded-lg bg-[#F4F6F3] text-[#9AA09A]">
                    <ImageIcon size={22} />
                </div>
            )}
            <div className="mt-3 flex items-center justify-between text-[13px] text-[#5D645D]">
                <span>{proof?.quantity ?? "—"} units</span>
                <span className="inline-flex items-center gap-1 text-[#8A918A]">
                    <LockKeyhole size={11} /> Private photo
                </span>
            </div>
        </div>
    );
}

function OrderStatus({ status }: { status: FulfillmentOrder["verificationStatus"] }) {
    const style =
        status === "verified"
            ? "bg-[#E7F2E6] text-[#3F7048]"
            : status === "disputed"
              ? "bg-[#FFF0E8] text-[#A4582A]"
              : status === "awaiting_shop_verification"
                ? "bg-[#EDF0FA] text-[#4A5D92]"
                : "bg-[#F1F2F0] text-[#666B66]";
    return (
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${style}`}>
            {retailerOrderStatus(status)}
        </span>
    );
}
