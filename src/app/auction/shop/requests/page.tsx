"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    ArrowRight,
    Bot,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    CircleDollarSign,
    Clock3,
    FileText,
    LoaderCircle,
    Package,
    Plus,
    Send,
    Sparkles,
    Truck,
    Users,
} from "lucide-react";
import { retailerRequestStatus } from "../../lib/display-copy";
import {
    type SourcingRequest,
    type SupplierQuote,
    useOrderWorkflowStore,
} from "../../lib/order-workflow-store";

type Filter = "all" | SourcingRequest["status"];

function money(value: number) {
    return new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD" }).format(value);
}

function targetValue(request: SourcingRequest) {
    return request.lines.reduce((sum, line) => sum + line.quantity * line.targetPrice, 0);
}

export default function RequestsPage() {
    const { requests, loading, error, awardQuote } = useOrderWorkflowStore();
    const [filter, setFilter] = useState<Filter>("all");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [awardingId, setAwardingId] = useState<string | null>(null);
    const [successReference, setSuccessReference] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const requestedStatus = params.get("status");
        const requestedId = params.get("request");
        const validStatuses: Filter[] = ["all", "sent", "quoted", "awarded", "expired", "cancelled"];

        if (requestedStatus && validStatuses.includes(requestedStatus as Filter)) {
            setFilter(requestedStatus as Filter);
        }
        if (requestedId) setExpandedId(requestedId);
    }, []);

    useEffect(() => {
        if (!loading && expandedId) {
            window.requestAnimationFrame(() => {
                document.getElementById(`request-${expandedId}`)?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            });
        }
    }, [expandedId, loading]);

    const filtered =
        filter === "all" ? requests : requests.filter((request) => request.status === filter);

    const selectQuote = async (requestId: string, quoteId: string) => {
        setAwardingId(quoteId);
        setActionError(null);
        try {
            const order = await awardQuote(requestId, quoteId);
            setSuccessReference(order.reference);
        } catch (cause) {
            setActionError(cause instanceof Error ? cause.message : "We could not select this quote. Please try again.");
        } finally {
            setAwardingId(null);
        }
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-[10px] font-bold tracking-[0.17em] text-[#6F9277] uppercase">
                        Supplier quotes
                    </p>
                    <h1 className="mt-1 text-3xl font-bold tracking-[-0.03em] text-[#2F312F]">
                        Requests and quotes
                    </h1>
                    <p className="mt-2 text-sm text-[#707670]">
                        Review quotes side by side and choose the supplier that best fits your
                        price and delivery date.
                    </p>
                </div>
                <Link
                    href="/auction/shop/orders/new"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4F6F56] px-4 py-2.5 text-sm font-bold text-white"
                >
                    <Plus size={15} /> New request
                </Link>
            </div>

            {successReference ? (
                <div className="flex flex-col gap-3 rounded-2xl border border-[#CFE0D1] bg-[#F4F8F3] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="mt-0.5 text-[#4F6F56]" />
                        <div>
                            <p className="text-sm font-bold text-[#2F312F]">Supplier selected</p>
                            <p className="text-xs text-[#667066]">{successReference} has been created. The supplier will prepare it for Ninja Van pickup.</p>
                        </div>
                    </div>
                    <Link href="/auction/shop/orders" className="inline-flex items-center gap-1 text-xs font-bold text-[#4F6F56]">
                        Track order <ArrowRight size={12} />
                    </Link>
                </div>
            ) : null}

            {(error || actionError) ? (
                <p role="alert" className="rounded-xl bg-[#FFF2EF] px-4 py-3 text-xs text-[#A33A2B]">
                    {actionError ?? error}
                </p>
            ) : null}

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Metric icon={FileText} label="Requests in progress" value={requests.filter((request) => ["sent", "quoted"].includes(request.status)).length.toString()} />
                <Metric icon={Sparkles} label="Requests with quotes" value={requests.filter((request) => request.status === "quoted").length.toString()} />
                <Metric icon={Users} label="Suppliers invited" value={new Set(requests.flatMap((request) => request.selectedSupplierIds)).size.toString()} />
                <Metric icon={CircleDollarSign} label="Estimated order value" value={money(requests.filter((request) => ["sent", "quoted"].includes(request.status)).reduce((sum, request) => sum + targetValue(request), 0))} />
            </div>

            <div className="flex flex-wrap gap-2">
                {(["all", "sent", "quoted", "awarded", "expired", "cancelled"] as Filter[]).map(
                    (value) => (
                        <button
                            type="button"
                            key={value}
                            onClick={() => {
                                setFilter(value);
                                setExpandedId(null);
                                const url = new URL(window.location.href);
                                if (value === "all") url.searchParams.delete("status");
                                else url.searchParams.set("status", value);
                                url.searchParams.delete("request");
                                window.history.replaceState({}, "", url);
                            }}
                            className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                                filter === value
                                    ? "bg-[#365845] text-white"
                                    : "border border-[#DDE5DC] bg-white text-[#667066]"
                            }`}
                        >
                            {value === "all" ? "All" : retailerRequestStatus(value)}
                        </button>
                    )
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-20 text-[#6F9277]">
                    <LoaderCircle className="animate-spin" size={25} />
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((request) => {
                        const expanded = request.id === expandedId;
                        const ranked = [...request.quotes].sort((a, b) => b.score - a.score);
                        return (
                            <article
                                id={`request-${request.id}`}
                                key={request.id}
                                className={`scroll-mt-24 overflow-hidden rounded-3xl border bg-white transition ${
                                    expanded
                                        ? "border-[#9DB29F] shadow-[0_18px_45px_-36px_rgba(54,88,69,0.6)]"
                                        : "border-[#DDE5DC]"
                                }`}
                            >
                                <div className="p-5">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <div className="rounded-xl bg-[#EDF3EC] p-2.5 text-[#4F6F56]">
                                                <Package size={17} />
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="text-sm font-bold text-[#2F312F]">{request.title}</h2>
                                                    <Status status={request.status} />
                                                    {request.priority === "urgent" ? (
                                                        <span className="rounded-full bg-[#FFF0E8] px-2 py-0.5 text-[9px] font-bold text-[#B75E28]">Urgent</span>
                                                    ) : null}
                                                </div>
                                                <p className="mt-1 text-[10px] text-[#8A918A]">
                                                    {request.reference} · {request.lines.length} items · delivery by{" "}
                                                    {new Date(`${request.deliveryDate}T12:00:00`).toLocaleDateString("en-SG", { dateStyle: "medium" })}
                                                </p>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {request.lines.map((line) => (
                                                        <span key={line.id} className="rounded-lg bg-[#F4F7F3] px-2 py-1 text-[10px] text-[#667066]">
                                                            {line.productName} · {line.quantity}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-5">
                                            <div>
                                                <p className="text-[9px] text-[#8A918A]">Budget</p>
                                                <p className="text-sm font-bold text-[#2F312F]">{money(targetValue(request))}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-[#8A918A]">Quotes</p>
                                                <p className="text-sm font-bold text-[#4F6F56]">{request.quotes.length} / {request.selectedSupplierIds.length}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const nextId = expanded ? null : request.id;
                                                    setExpandedId(nextId);
                                                    const url = new URL(window.location.href);
                                                    if (nextId) url.searchParams.set("request", nextId);
                                                    else url.searchParams.delete("request");
                                                    window.history.replaceState({}, "", url);
                                                }}
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-[#DDE5DC] px-3 py-2 text-xs font-semibold text-[#4F6F56]"
                                            >
                                                Details {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {expanded ? (
                                    <div className="border-t border-[#E6ECE4] bg-[#FAFBF9] p-5">
                                        {request.quotes.length === 0 ? (
                                            <div className="flex items-start gap-3 rounded-2xl border border-dashed border-[#C9D4C6] bg-white p-5">
                                                <Clock3 size={18} className="mt-0.5 text-[#6F9277]" />
                                                <div>
                                                    <p className="text-sm font-bold text-[#2F312F]">Waiting for quotes</p>
                                                    <p className="mt-1 text-xs text-[#8A918A]">
                                                        {request.selectedSupplierIds.length} suppliers received your request. Quotes are due{" "}
                                                        {new Date(request.quoteDeadline).toLocaleString("en-SG", { dateStyle: "medium", timeStyle: "short" })}.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {request.status !== "awarded" ? (
                                                    <div className="mb-4 flex items-start gap-3 rounded-2xl bg-[#EAF3E8] p-4">
                                                        <Bot size={18} className="mt-0.5 text-[#4F6F56]" />
                                                        <div>
                                                            <p className="text-xs font-bold text-[#2F312F]">
                                                                Best overall match: {ranked[0].supplierAlias}
                                                            </p>
                                                            <p className="mt-1 text-[10px] leading-5 text-[#667066]">
                                                                We compare total price and delivery date. Check the full quote before choosing.
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : null}
                                                <div className="grid gap-4 lg:grid-cols-3">
                                                    {ranked.map((quote, index) => (
                                                        <QuoteCard
                                                            key={quote.id}
                                                            quote={quote}
                                                            recommended={index === 0}
                                                            awarded={request.awardedQuoteId === quote.id}
                                                            disabled={request.status === "awarded" || Boolean(awardingId)}
                                                            working={awardingId === quote.id}
                                                            onSelect={() => void selectQuote(request.id, quote.id)}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ) : null}
                            </article>
                        );
                    })}
                </div>
            )}

            {!loading && filtered.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#C9D4C6] bg-white py-16 text-center">
                    <Send size={26} className="mx-auto text-[#A9B4A6]" />
                    <p className="mt-3 text-sm font-semibold text-[#2F312F]">No requests in this view</p>
                    <Link href="/auction/shop/orders/new" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#4F6F56]">
                        Create a request <ArrowRight size={12} />
                    </Link>
                </div>
            ) : null}
        </div>
    );
}

function Metric({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-[#DDE5DC] bg-white p-4">
            <Icon size={15} className="text-[#6F9277]" />
            <p className="mt-3 text-xl font-bold text-[#2F312F]">{value}</p>
            <p className="text-[10px] font-semibold text-[#7B817B]">{label}</p>
        </div>
    );
}

function Status({ status }: { status: SourcingRequest["status"] }) {
    const style =
        status === "awarded"
            ? "bg-[#E7F2E6] text-[#3F7048]"
            : status === "quoted"
              ? "bg-[#EDF0FA] text-[#4A5D92]"
              : status === "sent"
                ? "bg-[#FFF5E6] text-[#94621B]"
                : "bg-[#F1F2F0] text-[#747A74]";
    return <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${style}`}>{retailerRequestStatus(status)}</span>;
}

function QuoteCard({
    quote,
    recommended,
    awarded,
    disabled,
    working,
    onSelect,
}: {
    quote: SupplierQuote;
    recommended: boolean;
    awarded: boolean;
    disabled: boolean;
    working: boolean;
    onSelect: () => void;
}) {
    return (
        <div className={`relative rounded-2xl border bg-white p-4 ${recommended ? "border-[#6F9277]" : "border-[#DDE5DC]"}`}>
            {recommended ? (
                <span className="absolute -top-2 left-4 inline-flex items-center gap-1 rounded-full bg-[#4F6F56] px-2 py-1 text-[8px] font-bold text-white">
                    <Sparkles size={8} /> Best overall match
                </span>
            ) : null}
            <div className="mt-1 flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-bold text-[#2F312F]">{quote.supplierAlias}</p>
                    <p className="mt-1 text-[10px] text-[#8A918A]">{quote.reference} · {quote.paymentTerms}</p>
                </div>
                <div className="rounded-xl bg-[#EDF3EC] px-2.5 py-2 text-center">
                    <p className="text-[8px] text-[#6F9277]">Overall match</p>
                    <p className="text-sm font-bold text-[#4F6F56]">{quote.score}</p>
                </div>
            </div>
            <p className="mt-4 text-xl font-bold text-[#2F312F]">{money(quote.totalPrice)}</p>
            <div className="mt-3 space-y-2 text-[10px] text-[#667066]">
                <p className="flex items-center gap-2"><Truck size={11} /> Delivery {new Date(`${quote.deliveryDate}T12:00:00`).toLocaleDateString("en-SG", { dateStyle: "medium" })}</p>
                <p className="flex items-center gap-2"><Clock3 size={11} /> {quote.deliveryDays} day lead time</p>
            </div>
            <button
                type="button"
                onClick={onSelect}
                disabled={disabled}
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold ${
                    awarded
                        ? "bg-[#E7F2E6] text-[#3F7048]"
                        : disabled
                          ? "bg-[#F1F3F0] text-[#A0A6A0]"
                          : "bg-[#365845] text-white"
                }`}
            >
                {working ? <LoaderCircle className="animate-spin" size={13} /> : null}
                {awarded ? "Selected" : working ? "Creating order…" : "Choose this quote"}
            </button>
        </div>
    );
}
