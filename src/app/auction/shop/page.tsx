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
import { MetricCard } from "../components/metric-card";
import { retailerRequestStatus } from "../lib/display-copy";
import { useOrderWorkflowStore } from "../lib/order-workflow-store";

function money(value: number) {
    return new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD" }).format(value);
}

export default function ShopDashboard() {
    const { organization } = useAuth();
    const { requests, createdOrders: orders, loading, error } = useOrderWorkflowStore();
    const waitingRequests = requests.filter((request) => request.status === "sent");
    const needsDecision = requests.filter((request) => request.status === "quoted");
    const needsVerification = orders.filter(
        (order) => order.verificationStatus === "awaiting_shop_verification"
    );
    const protectedValue = orders
        .filter((order) => ["held", "under_review"].includes(order.payoutStatus))
        .reduce((sum, order) => sum + order.totalPrice, 0);

    return (
        <div className="mx-auto max-w-7xl space-y-7 px-4 py-7 sm:px-6 lg:px-8">
            <section className="overflow-hidden rounded-[30px] bg-[#365845] p-6 text-white sm:p-8">
                <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-bold tracking-[0.16em] text-[#CFE0D1] uppercase">
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
                <MetricCard href="/auction/shop/requests?status=sent" icon={FileText} label="Requests awaiting quotes" value={waitingRequests.length.toString()} detail="Waiting for suppliers" />
                <MetricCard href="/auction/shop/requests?status=quoted" icon={Sparkles} label="Quotes received" value={needsDecision.length.toString()} detail="Ready for you" />
                <MetricCard href="/auction/shop/orders?filter=confirm" icon={Camera} label="Deliveries to confirm" value={needsVerification.length.toString()} detail="Check what arrived" />
                <MetricCard href="/auction/shop/orders?filter=pending" icon={CircleDollarSign} label="Order value pending" value={money(protectedValue)} detail="Until delivery is confirmed" />
            </div>

            {loading ? (
                <div className="flex justify-center py-16 text-[#6F9277]"><LoaderCircle className="animate-spin" size={24} /></div>
            ) : (
                <div className="grid items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <section className="rounded-3xl border border-[#DDE5DC] bg-white p-5 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-[#2F312F]">Quote requests</h2>
                                <p className="mt-1 text-xs leading-5 text-[#7B817B]">Recent requests and supplier responses</p>
                            </div>
                            <Link href="/auction/shop/requests" className="inline-flex items-center gap-1 text-xs font-bold text-[#4F6F56] hover:underline">View all <ArrowRight size={11} /></Link>
                        </div>
                        <div className="mt-5 space-y-3">
                            {requests.slice(0, 5).map((request) => (
                                <Link
                                    key={request.id}
                                    href={`/auction/shop/requests?request=${request.id}`}
                                    className="flex min-h-20 items-center justify-between gap-4 rounded-2xl border border-[#EDF0EC] bg-[#FAFBF9] p-4 transition hover:border-[#D4DED2] hover:bg-[#F4F7F3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6F9277]"
                                    aria-label={`Open ${request.title}`}
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-[#2F312F]">{request.title}</p>
                                        <p className="mt-1 text-xs text-[#7B817B]">{request.reference} · {request.quotes.length} quotes</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="rounded-full bg-[#EDF3EC] px-2.5 py-1 text-[11px] font-bold text-[#4F6F56]">{retailerRequestStatus(request.status)}</span>
                                        <ArrowRight size={13} className="text-[#91A195]" />
                                    </div>
                                </Link>
                            ))}
                            {requests.length === 0 ? <Empty text="No quote requests yet." href="/auction/shop/orders/new" action="Create an order" /> : null}
                        </div>
                    </section>

                    <section className="rounded-3xl border border-[#DDE5DC] bg-white p-5 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-[#2F312F]">Deliveries</h2>
                                <p className="mt-1 text-xs leading-5 text-[#7B817B]">Latest Ninja Van updates</p>
                            </div>
                            <Link href="/auction/shop/orders" className="inline-flex items-center gap-1 text-xs font-bold text-[#4F6F56] hover:underline">View all <ArrowRight size={11} /></Link>
                        </div>
                        <div className="mt-4 space-y-3">
                            {orders.slice(0, 4).map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/auction/shop/orders?order=${order.id}`}
                                    className="block min-h-28 rounded-2xl border border-[#EDF0EC] bg-[#FAFBF9] p-4 transition hover:border-[#D4DED2] hover:bg-[#F4F7F3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6F9277]"
                                    aria-label={`Open delivery ${order.reference}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-bold text-[#2F312F]">{order.productName}</p>
                                            <p className="mt-1 text-xs text-[#7B817B]">{order.reference} · {order.supplierAlias}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {order.verificationStatus === "verified" ? <CheckCircle2 size={15} className="text-[#4F6F56]" /> : <Truck size={15} className="text-[#6F9277]" />}
                                            <ArrowRight size={13} className="text-[#91A195]" />
                                        </div>
                                    </div>
                                    <p className="mt-3 text-xs leading-5 text-[#667066]">{order.courier.lastScan}</p>
                                </Link>
                            ))}
                            {orders.length === 0 ? <Empty text="Orders appear after you choose a supplier quote." href="/auction/shop/requests?status=quoted" action="Review quotes" /> : null}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

function Empty({ text, href, action }: { text: string; href: string; action: string }) {
    return (
        <div className="py-8 text-center">
            <p className="text-xs text-[#8A918A]">{text}</p>
            <Link href={href} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#4F6F56] hover:underline">
                {action} <ArrowRight size={11} />
            </Link>
        </div>
    );
}
