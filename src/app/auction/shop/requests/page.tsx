"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowRight,
    Bot,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    CircleDollarSign,
    Clock3,
    FileText,
    Package,
    Plus,
    Send,
    Sparkles,
    Truck,
    Users,
} from "lucide-react";
import {
    type SourcingRequest,
    type SupplierQuote,
    useOrderWorkflowStore,
} from "../../lib/order-workflow-store";
import { formatCurrency } from "../../lib/mock-data";

type Filter = "all" | "sent" | "quoted" | "awarded";

function requestValue(request: SourcingRequest) {
    return request.lines.reduce(
        (total, line) => total + line.targetPrice * line.quantity,
        0
    );
}

function bestQuote(request: SourcingRequest) {
    return [...request.quotes].sort((a, b) => b.score - a.score)[0];
}

export default function SourcingRequestsPage() {
    const { requests, awardQuote } = useOrderWorkflowStore();
    const [filter, setFilter] = useState<Filter>("all");
    const [expandedId, setExpandedId] = useState<string | null>("RFQ-4901");
    const [awardedOrderId, setAwardedOrderId] = useState<string | null>(null);

    const filtered =
        filter === "all"
            ? requests
            : requests.filter((request) => request.status === filter);
    const quotesReady = requests.filter((request) => request.status === "quoted").length;
    const totalOpenValue = requests
        .filter((request) => request.status !== "awarded")
        .reduce((total, request) => total + requestValue(request), 0);

    const selectQuote = (requestId: string, quoteId: string) => {
        const order = awardQuote(requestId, quoteId);
        if (order) setAwardedOrderId(order.id);
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-[10px] font-bold tracking-[0.16em] text-[#6F9277] uppercase">
                        Sourcing
                    </p>
                    <h1 className="text-2xl font-bold text-[#2F312F]">Supplier quote requests</h1>
                    <p className="mt-1 text-sm text-[#666B66]">
                        Track every request from supplier outreach through quote approval.
                    </p>
                </div>
                <Link
                    href="/auction/shop/orders/new"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4F6F56] px-4 py-2.5 text-sm font-semibold text-white"
                >
                    <Plus size={14} /> Create order
                </Link>
            </div>

            {awardedOrderId && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-3 rounded-2xl border border-[#CFE0D1] bg-[#F4F8F3] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="mt-0.5 text-[#4F6F56]" />
                        <div>
                            <p className="text-sm font-bold text-[#2F312F]">Supplier awarded</p>
                            <p className="text-xs text-[#666B66]">
                                Order {awardedOrderId} is confirmed and ready for fulfillment tracking.
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/auction/shop/orders"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#4F6F56]"
                    >
                        View order <ArrowRight size={12} />
                    </Link>
                </motion.div>
            )}

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Metric
                    icon={FileText}
                    label="Open requests"
                    value={requests.filter((request) => request.status !== "awarded").length.toString()}
                    note="still being sourced"
                />
                <Metric
                    icon={Sparkles}
                    label="Quotes ready"
                    value={quotesReady.toString()}
                    note="need your decision"
                />
                <Metric
                    icon={Users}
                    label="Suppliers contacted"
                    value={new Set(requests.flatMap((request) => request.selectedSupplierIds)).size.toString()}
                    note="across active requests"
                />
                <Metric
                    icon={CircleDollarSign}
                    label="Open value"
                    value={formatCurrency(totalOpenValue)}
                    note="at target prices"
                />
            </div>

            <div className="flex flex-wrap gap-2">
                {(["all", "sent", "quoted", "awarded"] as Filter[]).map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                            filter === status
                                ? "bg-[#365845] text-white"
                                : "border border-[#DDE5DC] bg-white text-[#666B66]"
                        }`}
                    >
                        {status === "all"
                            ? "All requests"
                            : status === "sent"
                              ? "Waiting for quotes"
                              : status === "quoted"
                                ? "Quotes ready"
                                : "Awarded"}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filtered.map((request, index) => {
                    const expanded = expandedId === request.id;
                    const recommendation = bestQuote(request);
                    return (
                        <motion.article
                            key={request.id}
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
                                                    {request.title}
                                                </h2>
                                                <StatusChip status={request.status} />
                                                {request.priority === "urgent" && (
                                                    <span className="rounded-full bg-[#FFF0E8] px-2 py-0.5 text-[9px] font-bold text-[#B75E28]">
                                                        Urgent
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-1 text-[10px] text-[#8A918A]">
                                                {request.id} · {request.lines.length} product
                                                {request.lines.length === 1 ? "" : "s"} · needed by{" "}
                                                {new Date(`${request.deliveryDate}T00:00:00`).toLocaleDateString(
                                                    "en-SG",
                                                    { day: "numeric", month: "short" }
                                                )}
                                            </p>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {request.lines.map((line) => (
                                                    <span
                                                        key={line.id}
                                                        className="rounded-lg bg-[#F4F7F3] px-2 py-1 text-[10px] text-[#666B66]"
                                                    >
                                                        {line.productName} · {line.quantity}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-5 lg:justify-end">
                                        <div>
                                            <p className="text-[9px] text-[#8A918A]">Target value</p>
                                            <p className="text-sm font-bold text-[#2F312F]">
                                                {formatCurrency(requestValue(request))}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-[#8A918A]">Supplier quotes</p>
                                            <p className="text-sm font-bold text-[#4F6F56]">
                                                {request.quotes.length} / {request.selectedSupplierIds.length}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() =>
                                                setExpandedId(expanded ? null : request.id)
                                            }
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#DDE5DC] px-3 py-2 text-xs font-semibold text-[#4F6F56]"
                                        >
                                            {request.quotes.length > 0 ? "Compare quotes" : "View request"}
                                            {expanded ? (
                                                <ChevronUp size={13} />
                                            ) : (
                                                <ChevronDown size={13} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {expanded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="border-t border-[#E6ECE4] bg-[#FAFBF9] p-5"
                                >
                                    {request.quotes.length === 0 ? (
                                        <div className="flex flex-col gap-5 rounded-2xl border border-dashed border-[#C9D4C6] bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex items-start gap-3">
                                                <Clock3 size={18} className="mt-0.5 text-[#6F9277]" />
                                                <div>
                                                    <p className="text-sm font-bold text-[#2F312F]">
                                                        Waiting for supplier quotes
                                                    </p>
                                                    <p className="mt-1 text-xs text-[#8A918A]">
                                                        Sent to {request.selectedSupplierIds.length} suppliers.
                                                        ReStock will rank offers as they arrive.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-semibold text-[#6F9277]">
                                                <Send size={12} /> Request delivered
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {recommendation && request.status !== "awarded" && (
                                                <div className="mb-4 flex items-start gap-3 rounded-2xl bg-[#EAF3E8] p-4">
                                                    <Bot size={18} className="mt-0.5 text-[#4F6F56]" />
                                                    <div>
                                                        <p className="text-xs font-bold text-[#2F312F]">
                                                            ReStock AI recommends {recommendation.supplierName}
                                                        </p>
                                                        <p className="mt-1 text-[10px] leading-5 text-[#666B66]">
                                                            It has the strongest balance of price, delivery speed,
                                                            payment terms, and supplier reliability.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="grid gap-4 lg:grid-cols-3">
                                                {[...request.quotes]
                                                    .sort((a, b) => b.score - a.score)
                                                    .map((quote, quoteIndex) => (
                                                        <QuoteCard
                                                            key={quote.id}
                                                            quote={quote}
                                                            recommended={quoteIndex === 0}
                                                            awarded={request.awardedQuoteId === quote.id}
                                                            disabled={request.status === "awarded"}
                                                            onSelect={() =>
                                                                selectQuote(request.id, quote.id)
                                                            }
                                                        />
                                                    ))}
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </motion.article>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="rounded-3xl border border-dashed border-[#C9D4C6] bg-white py-16 text-center">
                    <FileText size={28} className="mx-auto text-[#A9B4A6]" />
                    <p className="mt-3 text-sm font-semibold text-[#2F312F]">No requests here</p>
                    <Link
                        href="/auction/shop/orders/new"
                        className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#4F6F56]"
                    >
                        Create an order <ArrowRight size={12} />
                    </Link>
                </div>
            )}
        </div>
    );
}

function Metric({
    icon: Icon,
    label,
    value,
    note,
}: {
    icon: typeof FileText;
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

function StatusChip({ status }: { status: SourcingRequest["status"] }) {
    const style =
        status === "awarded"
            ? "bg-[#E7F2E6] text-[#3F7048]"
            : status === "quoted"
              ? "bg-[#EDF0FA] text-[#4A5D92]"
              : "bg-[#FFF5E6] text-[#94621B]";
    return (
        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${style}`}>
            {status === "sent" ? "Waiting for quotes" : status === "quoted" ? "Quotes ready" : "Awarded"}
        </span>
    );
}

function QuoteCard({
    quote,
    recommended,
    awarded,
    disabled,
    onSelect,
}: {
    quote: SupplierQuote;
    recommended: boolean;
    awarded: boolean;
    disabled: boolean;
    onSelect: () => void;
}) {
    return (
        <div
            className={`relative rounded-2xl border bg-white p-4 ${
                recommended ? "border-[#6F9277] ring-1 ring-[#6F9277]/20" : "border-[#DDE5DC]"
            }`}
        >
            {recommended && (
                <span className="absolute -top-2 left-4 inline-flex items-center gap-1 rounded-full bg-[#4F6F56] px-2 py-1 text-[8px] font-bold text-white">
                    <Sparkles size={8} /> AI best value
                </span>
            )}
            <div className="mt-1 flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-bold text-[#2F312F]">{quote.supplierName}</p>
                    <p className="mt-1 text-[10px] text-[#8A918A]">{quote.paymentTerms}</p>
                </div>
                <div className="rounded-xl bg-[#EDF3EC] px-2.5 py-2 text-center">
                    <p className="text-[8px] text-[#6F9277]">AI score</p>
                    <p className="text-sm font-bold text-[#4F6F56]">{quote.score}</p>
                </div>
            </div>
            <p className="mt-4 text-xl font-bold text-[#2F312F]">
                {formatCurrency(quote.totalPrice)}
            </p>
            <div className="mt-3 space-y-2 text-[10px] text-[#666B66]">
                <p className="flex items-center gap-2">
                    <Truck size={11} className="text-[#6F9277]" />
                    Delivery by{" "}
                    {new Date(`${quote.deliveryDate}T00:00:00`).toLocaleDateString("en-SG", {
                        day: "numeric",
                        month: "short",
                    })}
                </p>
                <p className="flex items-center gap-2">
                    <Clock3 size={11} className="text-[#6F9277]" />
                    {quote.deliveryDays} day lead time
                </p>
            </div>
            <button
                onClick={onSelect}
                disabled={disabled}
                className={`mt-4 w-full rounded-xl px-3 py-2.5 text-xs font-bold ${
                    awarded
                        ? "bg-[#E7F2E6] text-[#3F7048]"
                        : disabled
                          ? "bg-[#F1F3F0] text-[#A0A6A0]"
                          : "bg-[#365845] text-white"
                }`}
            >
                {awarded ? "Awarded" : disabled ? "Not selected" : "Approve supplier"}
            </button>
        </div>
    );
}
