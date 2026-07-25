"use client";

import Link from "next/link";
import {
    ArrowRight,
    Camera,
    CheckCircle2,
    CircleDollarSign,
    FileText,
    LoaderCircle,
    Package,
    Send,
    ShieldCheck,
    Truck,
} from "lucide-react";
import { useAuth } from "../components/auth-context";
import { MetricCard } from "../components/metric-card";
import { moneyCompact } from "../lib/format";
import { useOrderWorkflowStore } from "../lib/order-workflow-store";

export default function SupplierDashboard() {
    const { organization } = useAuth();
    const { requests, createdOrders: orders, loading, error } = useOrderWorkflowStore();
    const myQuote = (request: (typeof requests)[number]) =>
        request.quotes.find((quote) => quote.supplierId === organization?.id);
    const openRequests = requests.filter(
        (request) => !myQuote(request) && ["sent", "quoted"].includes(request.status)
    );
    const activeOrders = orders.filter(
        (order) => !["verified", "disputed"].includes(order.verificationStatus)
    );
    const proofRequired = orders.filter(
        (order) => order.verificationStatus === "awaiting_supplier_proof"
    );
    const released = orders
        .filter((order) => order.payoutStatus === "released")
        .reduce((sum, order) => sum + order.totalPrice, 0);

    return (
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
            <section className="overflow-hidden rounded-2xl bg-[#365845] p-6 text-white sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#CFE0D1] uppercase">
                            {organization?.aliasCode} · Supplier workspace
                        </p>
                        <h1 className="mt-2.5 text-[26px] leading-tight font-semibold tracking-[-0.03em] sm:text-[32px]">
                            Turn new requests into completed deliveries.
                        </h1>
                        <p className="mt-2.5 max-w-2xl text-[15px] leading-6 text-[#DCE7DC]">
                            Review order requests, send your quote, and prepare confirmed orders for
                            Ninja Van pickup.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href="/auction/supplier/crm"
                            className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-4 text-[14px] font-semibold text-[#365845] transition hover:bg-[#EDF3EC]"
                        >
                            <Send size={16} /> View quote requests
                        </Link>
                        <Link
                            href="/auction/supplier/operations"
                            className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/30 px-4 text-[14px] font-semibold text-white transition hover:bg-white/10"
                        >
                            Manage deliveries <ArrowRight size={15} />
                        </Link>
                    </div>
                </div>
            </section>

            {error ? (
                <p role="alert" className="rounded-xl bg-[#FFF2EF] px-4 py-3 text-[14px] text-[#A33A2B]">
                    {error}
                </p>
            ) : null}

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <MetricCard icon={FileText} label="Requests to quote" value={openRequests.length.toString()} />
                <MetricCard icon={Package} label="Orders in progress" value={activeOrders.length.toString()} />
                <MetricCard icon={Camera} label="Dispatch photos needed" value={proofRequired.length.toString()} />
                <MetricCard icon={CircleDollarSign} label="Completed order value" value={moneyCompact(released)} />
            </div>

            {loading ? (
                <div className="flex justify-center py-16 text-[#6F9277]">
                    <LoaderCircle className="animate-spin" size={24} />
                </div>
            ) : (
                <div className="grid items-start gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                    <section className="rounded-2xl border border-[#E2E8E0] bg-white p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-[17px] font-semibold text-[#2F312F]">
                                    Quote requests
                                </h2>
                                <p className="mt-1 text-[13px] leading-5 text-[#7B817B]">
                                    New requests and quotes you have sent
                                </p>
                            </div>
                            <Link
                                href="/auction/supplier/crm"
                                className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-[#4F6F56] hover:underline"
                            >
                                View all <ArrowRight size={13} />
                            </Link>
                        </div>
                        <div className="mt-4 space-y-2">
                            {requests.slice(0, 5).map((request) => {
                                const quote = myQuote(request);
                                return (
                                    <Link
                                        key={request.id}
                                        href="/auction/supplier/crm"
                                        className="flex items-center justify-between gap-4 rounded-xl border border-[#EDF0EC] bg-[#FAFBF9] p-4 transition hover:border-[#D4DED2] hover:bg-[#F4F7F3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6F9277]"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-[15px] font-semibold text-[#2F312F]">
                                                {request.title}
                                            </p>
                                            <p className="mt-1 text-[13px] text-[#7B817B]">
                                                {request.reference} · Retailer {request.retailerAlias}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                                    quote
                                                        ? "bg-[#E7F2E6] text-[#3F7048]"
                                                        : "bg-[#FFF5E6] text-[#94621B]"
                                                }`}
                                            >
                                                {quote ? "Quoted" : "Respond"}
                                            </span>
                                            <ArrowRight size={14} className="text-[#91A195]" />
                                        </div>
                                    </Link>
                                );
                            })}
                            {requests.length === 0 ? <Empty text="No quote requests yet." /> : null}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-[#E2E8E0] bg-white p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-[17px] font-semibold text-[#2F312F]">Deliveries</h2>
                                <p className="mt-1 text-[13px] leading-5 text-[#7B817B]">
                                    Photos and delivery status
                                </p>
                            </div>
                            <Link
                                href="/auction/supplier/operations"
                                className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-[#4F6F56] hover:underline"
                            >
                                View all <ArrowRight size={13} />
                            </Link>
                        </div>
                        <div className="mt-4 space-y-2">
                            {orders.slice(0, 4).map((order) => (
                                <Link
                                    key={order.id}
                                    href="/auction/supplier/operations"
                                    className="block rounded-xl border border-[#EDF0EC] bg-[#FAFBF9] p-4 transition hover:border-[#D4DED2] hover:bg-[#F4F7F3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6F9277]"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-[15px] font-semibold text-[#2F312F]">
                                                {order.productName}
                                            </p>
                                            <p className="mt-1 text-[13px] text-[#7B817B]">
                                                {order.reference} · Retailer {order.retailerAlias}
                                            </p>
                                        </div>
                                        {order.verificationStatus === "verified" ? (
                                            <CheckCircle2 size={16} className="shrink-0 text-[#4F6F56]" />
                                        ) : order.verificationStatus === "awaiting_supplier_proof" ? (
                                            <Camera size={16} className="shrink-0 text-[#A96838]" />
                                        ) : (
                                            <Truck size={16} className="shrink-0 text-[#6F9277]" />
                                        )}
                                    </div>
                                    <p className="mt-2.5 text-[13px] leading-5 text-[#5D645D]">
                                        {order.courier.lastScan}
                                    </p>
                                </Link>
                            ))}
                            {orders.length === 0 ? (
                                <Empty text="Orders appear when a retailer chooses your quote." />
                            ) : null}
                        </div>
                    </section>
                </div>
            )}

            <section className="grid gap-3 sm:grid-cols-3">
                <Trust
                    icon={ShieldCheck}
                    title="Your business details stay private"
                    body="Retailers see your ReStock ID, not your company name or contact details."
                />
                <Trust
                    icon={Camera}
                    title="Photo before pickup"
                    body="Upload one clear photo before handing the order to Ninja Van."
                />
                <Trust
                    icon={Truck}
                    title="Delivery tracking"
                    body="Follow each order from collection to retailer confirmation."
                />
            </section>
        </div>
    );
}

function Trust({ icon: Icon, title, body }: { icon: typeof ShieldCheck; title: string; body: string }) {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-[#E2E8E0] bg-white p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EDF3EC] text-[#4F6F56]">
                <Icon size={18} />
            </div>
            <div>
                <p className="text-[14px] font-semibold leading-5 text-[#2F312F]">{title}</p>
                <p className="mt-1 text-[13px] leading-5 text-[#7B817B]">{body}</p>
            </div>
        </div>
    );
}

function Empty({ text }: { text: string }) {
    return <p className="py-8 text-center text-[13px] text-[#8A918A]">{text}</p>;
}
