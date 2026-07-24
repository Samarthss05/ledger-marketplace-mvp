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
import { useOrderWorkflowStore } from "../lib/order-workflow-store";

function money(value: number) {
    return new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD" }).format(value);
}

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
        <div className="mx-auto max-w-7xl space-y-7 px-4 py-7 sm:px-6 lg:px-8">
            <section className="overflow-hidden rounded-[30px] bg-[#365845] p-6 text-white sm:p-8">
                <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-[10px] font-bold tracking-[0.18em] text-[#CFE0D1] uppercase">
                            {organization?.aliasCode} · Supplier workspace
                        </p>
                        <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
                            Turn new requests into completed deliveries.
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#E4ECE4]">
                            Review order requests, send your quote, and prepare confirmed orders
                            for Ninja Van pickup.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/auction/supplier/crm" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#365845]">
                            <Send size={14} /> View quote requests
                        </Link>
                        <Link href="/auction/supplier/operations" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2.5 text-xs font-bold text-white">
                            Manage deliveries <ArrowRight size={13} />
                        </Link>
                    </div>
                </div>
            </section>

            {error ? <p role="alert" className="rounded-xl bg-[#FFF2EF] px-4 py-3 text-xs text-[#A33A2B]">{error}</p> : null}

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Metric icon={FileText} label="Requests to quote" value={openRequests.length.toString()} />
                <Metric icon={Package} label="Orders in progress" value={activeOrders.length.toString()} />
                <Metric icon={Camera} label="Dispatch photos needed" value={proofRequired.length.toString()} />
                <Metric icon={CircleDollarSign} label="Completed order value" value={money(released)} />
            </div>

            {loading ? (
                <div className="flex justify-center py-16 text-[#6F9277]"><LoaderCircle className="animate-spin" size={24} /></div>
            ) : (
                <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                    <section className="rounded-3xl border border-[#DDE5DC] bg-white p-5">
                        <div className="flex items-center justify-between">
                            <div><h2 className="text-base font-bold text-[#2F312F]">Quote requests</h2><p className="mt-1 text-[10px] text-[#8A918A]">New requests and quotes you have sent</p></div>
                            <Link href="/auction/supplier/crm" className="text-xs font-bold text-[#4F6F56]">View all</Link>
                        </div>
                        <div className="mt-4 divide-y divide-[#EDF0EC]">
                            {requests.slice(0, 5).map((request) => {
                                const quote = myQuote(request);
                                return (
                                    <div key={request.id} className="flex items-center justify-between gap-4 py-4">
                                        <div className="min-w-0"><p className="truncate text-xs font-bold text-[#2F312F]">{request.title}</p><p className="mt-1 text-[10px] text-[#8A918A]">{request.reference} · Retailer {request.retailerAlias}</p></div>
                                        <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${quote ? "bg-[#E7F2E6] text-[#3F7048]" : "bg-[#FFF5E6] text-[#94621B]"}`}>{quote ? "Quoted" : "Respond"}</span>
                                    </div>
                                );
                            })}
                            {requests.length === 0 ? <Empty text="No quote requests yet." /> : null}
                        </div>
                    </section>

                    <section className="rounded-3xl border border-[#DDE5DC] bg-white p-5">
                        <div className="flex items-center justify-between">
                            <div><h2 className="text-base font-bold text-[#2F312F]">Deliveries</h2><p className="mt-1 text-[10px] text-[#8A918A]">Photos and delivery status</p></div>
                            <Link href="/auction/supplier/operations" className="text-xs font-bold text-[#4F6F56]">View all</Link>
                        </div>
                        <div className="mt-4 space-y-3">
                            {orders.slice(0, 4).map((order) => (
                                <div key={order.id} className="rounded-2xl bg-[#F7F9F5] p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div><p className="text-xs font-bold text-[#2F312F]">{order.productName}</p><p className="mt-1 text-[10px] text-[#8A918A]">{order.reference} · Retailer {order.retailerAlias}</p></div>
                                        {order.verificationStatus === "verified" ? <CheckCircle2 size={15} className="text-[#4F6F56]" /> : order.verificationStatus === "awaiting_supplier_proof" ? <Camera size={15} className="text-[#A96838]" /> : <Truck size={15} className="text-[#6F9277]" />}
                                    </div>
                                    <p className="mt-3 text-[10px] text-[#667066]">{order.courier.lastScan}</p>
                                </div>
                            ))}
                            {orders.length === 0 ? <Empty text="Orders appear when a retailer chooses your quote." /> : null}
                        </div>
                    </section>
                </div>
            )}

            <section className="grid gap-4 sm:grid-cols-3">
                <Trust icon={ShieldCheck} title="Your business details stay private" body="Retailers see your ReStock ID, not your company name or contact details." />
                <Trust icon={Camera} title="Photo before pickup" body="Upload one clear photo before handing the order to Ninja Van." />
                <Trust icon={Truck} title="Delivery tracking" body="Follow each order from collection to retailer confirmation." />
            </section>
        </div>
    );
}

function Metric({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string }) {
    return <div className="rounded-2xl border border-[#DDE5DC] bg-white p-4"><Icon size={15} className="text-[#6F9277]" /><p className="mt-3 text-xl font-bold text-[#2F312F]">{value}</p><p className="mt-0.5 text-[10px] font-semibold text-[#7B817B]">{label}</p></div>;
}

function Trust({ icon: Icon, title, body }: { icon: typeof ShieldCheck; title: string; body: string }) {
    return <div className="flex items-start gap-3 rounded-2xl border border-[#DDE5DC] bg-white p-4"><div className="rounded-xl bg-[#EDF3EC] p-2 text-[#4F6F56]"><Icon size={15} /></div><div><p className="text-xs font-bold text-[#2F312F]">{title}</p><p className="mt-1 text-[10px] leading-5 text-[#7B817B]">{body}</p></div></div>;
}

function Empty({ text }: { text: string }) {
    return <p className="py-9 text-center text-xs text-[#8A918A]">{text}</p>;
}
