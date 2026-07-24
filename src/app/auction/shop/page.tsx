"use client";

import Link from "next/link";
import {
    ArrowRight,
    Camera,
    CheckCircle2,
    CircleDollarSign,
    FileText,
    LoaderCircle,
    Plus,
    Sparkles,
    Truck,
} from "lucide-react";
import { useAuth } from "../components/auth-context";
import { retailerRequestStatus } from "../lib/display-copy";
import { useOrderWorkflowStore } from "../lib/order-workflow-store";

function money(value: number) {
    return new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD" }).format(value);
}

export default function ShopDashboard() {
    const { organization } = useAuth();
    const { requests, createdOrders: orders, loading, error } = useOrderWorkflowStore();
    const openRequests = requests.filter((request) => ["sent", "quoted"].includes(request.status));
    const needsDecision = requests.filter((request) => request.status === "quoted");
    const needsVerification = orders.filter(
        (order) => order.verificationStatus === "awaiting_shop_verification"
    );
    const protectedValue = orders
        .filter((order) => order.payoutStatus !== "released")
        .reduce((sum, order) => sum + order.totalPrice, 0);

    return (
        <div className="mx-auto max-w-7xl space-y-7 px-4 py-7 sm:px-6 lg:px-8">
            <section className="overflow-hidden rounded-[30px] bg-[#365845] p-6 text-white sm:p-8">
                <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-[10px] font-bold tracking-[0.18em] text-[#CFE0D1] uppercase">
                            {organization?.aliasCode} · Retailer workspace
                        </p>
                        <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
                            Good to see you, {organization?.displayName}.
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#E4ECE4]">
                            Order stock, compare supplier quotes, and follow each delivery from
                            pickup to your shop.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/auction/shop/orders/new" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#365845]">
                            <Plus size={14} /> Create order
                        </Link>
                        <Link href="/auction/shop/requests" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2.5 text-xs font-bold text-white">
                            Review quotes <ArrowRight size={13} />
                        </Link>
                    </div>
                </div>
            </section>

            {error ? <p role="alert" className="rounded-xl bg-[#FFF2EF] px-4 py-3 text-xs text-[#A33A2B]">{error}</p> : null}

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Metric icon={FileText} label="Requests awaiting quotes" value={openRequests.length.toString()} detail="Waiting for suppliers" />
                <Metric icon={Sparkles} label="Quotes received" value={needsDecision.length.toString()} detail="Ready for you" />
                <Metric icon={Camera} label="Deliveries to confirm" value={needsVerification.length.toString()} detail="Check what arrived" />
                <Metric icon={CircleDollarSign} label="Order value pending" value={money(protectedValue)} detail="Until delivery is confirmed" />
            </div>

            {loading ? (
                <div className="flex justify-center py-16 text-[#6F9277]"><LoaderCircle className="animate-spin" size={24} /></div>
            ) : (
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <section className="rounded-3xl border border-[#DDE5DC] bg-white p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-bold text-[#2F312F]">Quote requests</h2>
                                <p className="mt-1 text-[10px] text-[#8A918A]">Recent requests and supplier responses</p>
                            </div>
                            <Link href="/auction/shop/requests" className="text-xs font-bold text-[#4F6F56]">View all</Link>
                        </div>
                        <div className="mt-4 divide-y divide-[#EDF0EC]">
                            {requests.slice(0, 5).map((request) => (
                                <div key={request.id} className="flex items-center justify-between gap-4 py-4">
                                    <div className="min-w-0">
                                        <p className="truncate text-xs font-bold text-[#2F312F]">{request.title}</p>
                                        <p className="mt-1 text-[10px] text-[#8A918A]">{request.reference} · {request.quotes.length} quotes</p>
                                    </div>
                                    <span className="rounded-full bg-[#F1F5F0] px-2.5 py-1 text-[9px] font-bold text-[#5B705F]">{retailerRequestStatus(request.status)}</span>
                                </div>
                            ))}
                            {requests.length === 0 ? <Empty text="No quote requests yet." /> : null}
                        </div>
                    </section>

                    <section className="rounded-3xl border border-[#DDE5DC] bg-white p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-bold text-[#2F312F]">Deliveries</h2>
                                <p className="mt-1 text-[10px] text-[#8A918A]">Latest Ninja Van updates</p>
                            </div>
                            <Link href="/auction/shop/orders" className="text-xs font-bold text-[#4F6F56]">View all</Link>
                        </div>
                        <div className="mt-4 space-y-3">
                            {orders.slice(0, 4).map((order) => (
                                <div key={order.id} className="rounded-2xl bg-[#F7F9F5] p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-bold text-[#2F312F]">{order.productName}</p>
                                            <p className="mt-1 text-[10px] text-[#8A918A]">{order.reference} · {order.supplierAlias}</p>
                                        </div>
                                        {order.verificationStatus === "verified" ? <CheckCircle2 size={15} className="text-[#4F6F56]" /> : <Truck size={15} className="text-[#6F9277]" />}
                                    </div>
                                    <p className="mt-3 text-[10px] text-[#667066]">{order.courier.lastScan}</p>
                                </div>
                            ))}
                            {orders.length === 0 ? <Empty text="Orders appear after you choose a supplier quote." /> : null}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

function Metric({ icon: Icon, label, value, detail }: { icon: typeof FileText; label: string; value: string; detail: string }) {
    return <div className="rounded-2xl border border-[#DDE5DC] bg-white p-4"><Icon size={15} className="text-[#6F9277]" /><p className="mt-3 text-xl font-bold text-[#2F312F]">{value}</p><p className="mt-0.5 text-xs font-semibold text-[#414641]">{label}</p><p className="mt-1 text-[9px] text-[#8A918A]">{detail}</p></div>;
}

function Empty({ text }: { text: string }) {
    return <p className="py-9 text-center text-xs text-[#8A918A]">{text}</p>;
}
