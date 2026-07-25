"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    AlertTriangle,
    ArrowRight,
    Camera,
    CheckCircle2,
    CircleDollarSign,
    Clock3,
    FileWarning,
    ImageIcon,
    LoaderCircle,
    LockKeyhole,
    Package,
    Plus,
    ShieldCheck,
    Truck,
    X,
} from "lucide-react";
import { MetricCard } from "../../components/metric-card";
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

type Outcome = "accepted" | "damaged" | "short" | "wrong_items" | "other";
type OrderFilter = "all" | "active" | "confirm" | "pending";

function money(value: number) {
    return new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD" }).format(value);
}

export default function OrdersPage() {
    const { createdOrders: orders, loading, error, verifyShopDelivery } =
        useOrderWorkflowStore();
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
                note: note.trim() || (outcome === "accepted" ? "Received in good condition." : "Photo added for review."),
                outcome,
            });
            setVerifyOrder(null);
            URL.revokeObjectURL(photo.previewUrl);
            setPhoto(null);
        } catch (cause) {
            setActionError(cause instanceof Error ? cause.message : "We could not save your delivery confirmation. Please try again.");
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

    return (
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-bold tracking-[0.16em] text-[#6F9277] uppercase">
                        Deliveries
                    </p>
                    <h1 className="mt-1 text-3xl font-bold tracking-[-0.03em] text-[#2F312F]">
                        Track and confirm orders
                    </h1>
                    <p className="mt-2 text-sm text-[#707670]">
                        Follow Ninja Van updates. When an order arrives, upload a photo and confirm
                        whether everything is correct.
                    </p>
                </div>
                <Link href="/auction/shop/orders/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4F6F56] px-4 py-2.5 text-sm font-bold text-white">
                    <Plus size={15} /> Create order
                </Link>
            </div>

            {error ? <p role="alert" className="rounded-xl bg-[#FFF2EF] px-4 py-3 text-xs text-[#A33A2B]">{error}</p> : null}

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <MetricCard icon={Package} label="Total orders" value={orders.length.toString()} active={filter === "all"} onClick={() => selectFilter("all")} />
                <MetricCard icon={Truck} label="In delivery" value={orders.filter((order) => ["awaiting_courier_pickup", "in_transit"].includes(order.verificationStatus)).length.toString()} active={filter === "active"} onClick={() => selectFilter("active")} />
                <MetricCard icon={Camera} label="Ready to confirm" value={orders.filter((order) => order.verificationStatus === "awaiting_shop_verification").length.toString()} active={filter === "confirm"} onClick={() => selectFilter("confirm")} />
                <MetricCard icon={CircleDollarSign} label="Value awaiting confirmation" value={money(orders.filter((order) => ["held", "under_review"].includes(order.payoutStatus)).reduce((sum, order) => sum + order.totalPrice, 0))} active={filter === "pending"} onClick={() => selectFilter("pending")} />
            </div>

            {loading ? (
                <div className="flex justify-center py-20 text-[#6F9277]"><LoaderCircle className="animate-spin" size={25} /></div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <OrderCard key={order.id} order={order} focused={order.id === focusedOrderId} onVerify={() => openVerification(order)} />
                    ))}
                </div>
            )}

            {!loading && orders.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#C9D4C6] bg-white py-16 text-center">
                    <Package size={27} className="mx-auto text-[#A9B4A6]" />
                    <p className="mt-3 text-sm font-semibold text-[#2F312F]">No orders yet</p>
                    <p className="mt-1 text-xs text-[#8A918A]">Choose a supplier quote to create your first order.</p>
                    <Link href="/auction/shop/requests" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#4F6F56]">
                        View quote requests <ArrowRight size={12} />
                    </Link>
                </div>
            ) : null}

            {!loading && orders.length > 0 && filteredOrders.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#C9D4C6] bg-white py-12 text-center">
                    <Package size={24} className="mx-auto text-[#A9B4A6]" />
                    <p className="mt-3 text-sm font-semibold text-[#2F312F]">No orders in this view</p>
                    <button type="button" onClick={() => selectFilter("all")} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#4F6F56] hover:underline">
                        Show all orders <ArrowRight size={12} />
                    </button>
                </div>
            ) : null}

            {verifyOrder ? (
                <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#142016]/55 p-0 backdrop-blur-sm sm:items-center sm:p-4">
                    <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold tracking-[0.15em] text-[#6F9277] uppercase">Confirm delivery</p>
                                <h2 className="mt-1 text-xl font-bold text-[#2F312F]">{verifyOrder.reference}</h2>
                                <p className="mt-1 text-xs text-[#7B817B]">Check what arrived against the supplier&apos;s dispatch photo.</p>
                            </div>
                            <button type="button" onClick={() => setVerifyOrder(null)} className="rounded-xl p-2 text-[#7B837B] hover:bg-[#F4F7F3]" aria-label="Close"><X size={18} /></button>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <ProofCard title="Supplier dispatch photo" proof={verifyOrder.supplierProof} />
                            <div className="rounded-2xl border border-[#DDE5DC] p-4">
                                <p className="text-xs font-bold text-[#2F312F]">Photo of what arrived</p>
                                <label className="mt-3 flex min-h-36 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#BFCBBC] bg-[#F8FAF7]">
                                    {photo ? (
                                        // A local object URL is safe and intentionally bypasses Next image optimization.
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={photo.previewUrl} alt="Delivery photo preview" className="h-44 w-full object-cover" />
                                    ) : (
                                        <span className="text-center text-[#7B837B]"><Camera size={22} className="mx-auto" /><span className="mt-2 block text-xs">Take or choose a clear photo</span></span>
                                    )}
                                    <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="sr-only" onChange={(event) => void choosePhoto(event.target.files?.[0])} />
                                </label>
                                {photoError ? <p className="mt-2 text-xs text-[#A33A2B]">{photoError}</p> : null}
                            </div>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <label>
                                <span className="mb-1.5 block text-xs font-semibold text-[#414641]">Units received</span>
                                <input type="number" min={1} value={quantity} onChange={(event) => setQuantity(event.target.value)} className="w-full rounded-xl border border-[#D7DFD5] bg-[#FAFBF9] px-4 py-3 text-sm" />
                            </label>
                            <label>
                                <span className="mb-1.5 block text-xs font-semibold text-[#414641]">Delivery condition</span>
                                <select value={outcome} onChange={(event) => setOutcome(event.target.value as Outcome)} className="w-full rounded-xl border border-[#D7DFD5] bg-[#FAFBF9] px-4 py-3 text-sm">
                                    <option value="accepted">Everything is correct</option>
                                    <option value="damaged">Some items are damaged</option>
                                    <option value="short">Some items are missing</option>
                                    <option value="wrong_items">Wrong items arrived</option>
                                    <option value="other">Another issue</option>
                                </select>
                            </label>
                        </div>
                        <label className="mt-4 block">
                            <span className="mb-1.5 block text-xs font-semibold text-[#414641]">Add a note</span>
                            <textarea rows={3} maxLength={2000} value={note} onChange={(event) => setNote(event.target.value)} placeholder={outcome === "accepted" ? "Optional receiving note" : "Describe the issue clearly for the independent reviewer"} className="w-full resize-none rounded-xl border border-[#D7DFD5] bg-[#FAFBF9] px-4 py-3 text-sm" />
                        </label>

                        {outcome !== "accepted" ? (
                            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#FFF5EC] p-4">
                                <FileWarning size={17} className="mt-0.5 text-[#B26A35]" />
                                <p className="text-xs leading-5 text-[#765031]">Reporting an issue keeps the order open and sends both photos and Ninja Van updates to an independent reviewer.</p>
                            </div>
                        ) : null}
                        {actionError ? <p role="alert" className="mt-4 rounded-xl bg-[#FFF2EF] px-4 py-3 text-xs text-[#A33A2B]">{actionError}</p> : null}
                        <button type="button" onClick={() => void submit()} disabled={!photo || Number(quantity) <= 0 || submitting || (outcome !== "accepted" && note.trim().length < 2)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#365845] px-4 py-3 text-sm font-bold text-white disabled:opacity-40">
                            {submitting ? <LoaderCircle className="animate-spin" size={16} /> : outcome === "accepted" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                            {outcome === "accepted" ? "Confirm delivery" : "Report issue"}
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function OrderCard({ order, focused, onVerify }: { order: FulfillmentOrder; focused: boolean; onVerify: () => void }) {
    return (
        <article
            id={`order-${order.id}`}
            className={`scroll-mt-24 rounded-3xl border bg-white p-5 transition ${
                focused
                    ? "border-[#8FA993] shadow-[0_18px_45px_-36px_rgba(54,88,69,0.6)]"
                    : "border-[#DDE5DC]"
            }`}
        >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="rounded-xl bg-[#EDF3EC] p-2.5 text-[#4F6F56]"><Package size={17} /></div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-sm font-bold text-[#2F312F]">{order.productName}</h2>
                            <OrderStatus status={order.verificationStatus} />
                        </div>
                        <p className="mt-1 text-xs text-[#8A918A]">{order.reference} · {order.supplierAlias} · {order.quantity} units</p>
                        <p className="mt-3 text-sm font-bold text-[#2F312F]">{money(order.totalPrice)}</p>
                    </div>
                </div>
                <div className="min-w-72 rounded-2xl bg-[#F7F9F5] p-4">
                    <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-2 text-xs font-bold text-[#2F312F]"><Truck size={14} className="text-[#4F6F56]" /> Ninja Van</span>
                        <span className="text-[11px] font-semibold text-[#6F9277]">{order.courier.trackingId ?? "Booking pending"}</span>
                    </div>
                    <p className="mt-2 text-xs text-[#667066]">{order.courier.lastScan}</p>
                    <p className="mt-1 text-[11px] text-[#9AA09A]">{new Date(order.courier.lastScanAt).toLocaleString("en-SG", { dateStyle: "medium", timeStyle: "short" })}</p>
                </div>
            </div>

            <div className="mt-5 grid gap-4 border-t border-[#E8ECE7] pt-5 lg:grid-cols-[1fr_280px]">
                <div className="space-y-3">
                    {order.events.slice(-4).map((event) => {
                        const copy = timelineEventCopy(event);
                        return <div key={event.id} className="flex items-start gap-3">
                            <span className="mt-1.5 h-2 w-2 rounded-full bg-[#6F9277]" />
                            <div>
                                <p className="text-xs font-semibold text-[#414641]">{copy.title}</p>
                                <p className="mt-0.5 text-xs text-[#7B817B]">{copy.detail}</p>
                            </div>
                        </div>;
                    })}
                </div>
                <div>
                    {order.verificationStatus === "awaiting_shop_verification" ? (
                        <button type="button" onClick={onVerify} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#365845] px-4 py-3 text-xs font-bold text-white"><Camera size={14} /> Confirm delivery</button>
                    ) : order.dispute ? (
                        <div className="rounded-2xl bg-[#FFF5EC] p-4">
                            <p className="flex items-center gap-2 text-xs font-bold text-[#765031]"><AlertTriangle size={14} /> {order.dispute.reference}</p>
                            <p className="mt-2 text-xs leading-5 text-[#765F4C]">{order.dispute.automatedAssessment}</p>
                            <p className="mt-2 text-[11px] font-bold uppercase text-[#A66A3A]">{disputeStatusLabel(order.dispute.status)}</p>
                        </div>
                    ) : order.verificationStatus === "verified" ? (
                        <div className="rounded-2xl bg-[#EDF6EC] p-4"><p className="flex items-center gap-2 text-xs font-bold text-[#3F7048]"><ShieldCheck size={14} /> Order completed</p><p className="mt-1 text-xs text-[#607460]">You confirmed the delivery. Payment status was updated.</p></div>
                    ) : (
                        <div className="rounded-2xl bg-[#F4F6F3] p-4"><p className="flex items-center gap-2 text-xs font-bold text-[#5E685E]"><Clock3 size={14} /> No action needed</p><p className="mt-1 text-xs text-[#7B817B]">We&apos;ll notify you when the order is ready to confirm.</p></div>
                    )}
                </div>
            </div>
        </article>
    );
}

function ProofCard({ title, proof }: { title: string; proof?: DeliveryProof }) {
    return (
        <div className="rounded-2xl border border-[#DDE5DC] p-4">
            <p className="text-xs font-bold text-[#2F312F]">{title}</p>
            {proof?.photoUrl ? (
                // Signed URLs are short-lived and served from a private bucket.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={proof.photoUrl} alt={title} className="mt-3 h-44 w-full rounded-xl object-cover" />
            ) : (
                <div className="mt-3 flex h-44 items-center justify-center rounded-xl bg-[#F4F6F3] text-[#9AA09A]"><ImageIcon size={22} /></div>
            )}
            <div className="mt-3 flex items-center justify-between text-xs text-[#667066]"><span>{proof?.quantity ?? "—"} units</span><span className="inline-flex items-center gap-1"><LockKeyhole size={10} /> Private photo</span></div>
        </div>
    );
}

function OrderStatus({ status }: { status: FulfillmentOrder["verificationStatus"] }) {
    const style = status === "verified" ? "bg-[#E7F2E6] text-[#3F7048]" : status === "disputed" ? "bg-[#FFF0E8] text-[#A4582A]" : status === "awaiting_shop_verification" ? "bg-[#EDF0FA] text-[#4A5D92]" : "bg-[#F1F2F0] text-[#666B66]";
    return <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${style}`}>{retailerOrderStatus(status)}</span>;
}
