"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    ArrowRight,
    ArrowDownUp,
    Bot,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    CircleDollarSign,
    Clock3,
    FileText,
    LoaderCircle,
    MessageCircle,
    Package,
    Plus,
    Send,
    Sparkles,
    Truck,
    Users,
} from "lucide-react";
import { MetricCard } from "../../components/metric-card";
import { primaryButtonClass, secondaryButtonClass } from "../../components/form";
import { Modal } from "../../components/modal";
import { retailerRequestStatus } from "../../lib/display-copy";
import { dateTime, money, moneyCompact, shortDate } from "../../lib/format";
import {
    type SourcingRequest,
    type SupplierQuote,
    useOrderWorkflowStore,
} from "../../lib/order-workflow-store";
import { quoteDecisionWhatsAppMessage, whatsappUrl } from "../../lib/whatsapp";

type Filter = "all" | SourcingRequest["status"];
type QuoteSort = "recommended" | "price" | "delivery";

function targetValue(request: SourcingRequest) {
    return request.lines.reduce((sum, line) => sum + line.quantity * line.targetPrice, 0);
}

function totalUnits(request: SourcingRequest) {
    return request.lines.reduce((sum, line) => sum + line.quantity, 0);
}

function sortQuotes(quotes: SupplierQuote[], sort: QuoteSort) {
    return [...quotes].sort((a, b) => {
        if (sort === "price") return a.totalPrice - b.totalPrice || b.score - a.score;
        if (sort === "delivery") {
            return a.deliveryDate.localeCompare(b.deliveryDate) || a.totalPrice - b.totalPrice;
        }
        return b.score - a.score || a.totalPrice - b.totalPrice;
    });
}

export default function RequestsPage() {
    const { requests, loading, error, awardQuote } = useOrderWorkflowStore();
    const [filter, setFilter] = useState<Filter>("all");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [awardingId, setAwardingId] = useState<string | null>(null);
    const [successReference, setSuccessReference] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [quoteSort, setQuoteSort] = useState<QuoteSort>("recommended");
    const [pendingAward, setPendingAward] = useState<{
        request: SourcingRequest;
        quote: SupplierQuote;
    } | null>(null);

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
            setPendingAward(null);
        } catch (cause) {
            setActionError(cause instanceof Error ? cause.message : "We could not select this quote. Please try again.");
        } finally {
            setAwardingId(null);
        }
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-[#6F9277] uppercase">
                        Supplier quotes
                    </p>
                    <h1 className="mt-1.5 text-[28px] leading-tight font-semibold tracking-[-0.025em] text-[#2F312F]">
                        Requests and quotes
                    </h1>
                    <p className="mt-1.5 max-w-2xl text-[15px] leading-6 text-[#707670]">
                        Review quotes side by side and choose the supplier that best fits your price
                        and delivery date.
                    </p>
                </div>
                <Link href="/auction/shop/orders/new" className={`${primaryButtonClass} shrink-0`}>
                    <Plus size={16} /> New request
                </Link>
            </div>

            {successReference ? (
                <div className="flex flex-col gap-3 rounded-xl border border-[#CFE0D1] bg-[#F4F8F3] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#4F6F56]" />
                        <div>
                            <p className="text-[14px] font-semibold text-[#2F312F]">Supplier selected</p>
                            <p className="mt-0.5 text-[13px] leading-5 text-[#667066]">
                                {successReference} has been created. The supplier will prepare it for
                                Ninja Van pickup.
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/auction/shop/orders"
                        className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-[#4F6F56] hover:underline"
                    >
                        Track order <ArrowRight size={14} />
                    </Link>
                </div>
            ) : null}

            {error || actionError ? (
                <p role="alert" className="rounded-xl bg-[#FFF2EF] px-4 py-3 text-[14px] text-[#A33A2B]">
                    {actionError ?? error}
                </p>
            ) : null}

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <MetricCard
                    icon={FileText}
                    label="Requests in progress"
                    value={requests
                        .filter((request) => ["sent", "quoted"].includes(request.status))
                        .length.toString()}
                />
                <MetricCard
                    icon={Sparkles}
                    label="Requests with quotes"
                    value={requests.filter((request) => request.status === "quoted").length.toString()}
                />
                <MetricCard
                    icon={Users}
                    label="Suppliers invited"
                    value={new Set(
                        requests.flatMap((request) => request.selectedSupplierIds)
                    ).size.toString()}
                />
                <MetricCard
                    icon={CircleDollarSign}
                    label="Estimated order value"
                    value={moneyCompact(
                        requests
                            .filter((request) => ["sent", "quoted"].includes(request.status))
                            .reduce((sum, request) => sum + targetValue(request), 0)
                    )}
                />
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
                            className={`h-9 rounded-lg px-3.5 text-[13px] font-medium transition ${
                                filter === value
                                    ? "bg-[#365845] text-white"
                                    : "border border-[#DDE5DC] bg-white text-[#5D645D] hover:border-[#B9C6B8] hover:text-[#2F312F]"
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
                <div className="space-y-3">
                    {filtered.map((request) => {
                        const expanded = request.id === expandedId;
                        const recommendedQuote = [...request.quotes].sort(
                            (a, b) => b.score - a.score || a.totalPrice - b.totalPrice
                        )[0];
                        const ranked = sortQuotes(request.quotes, quoteSort);
                        const lowestPrice = request.quotes.length
                            ? Math.min(...request.quotes.map((quote) => quote.totalPrice))
                            : 0;
                        const earliestDelivery = request.quotes.length
                            ? [...request.quotes]
                                  .map((quote) => quote.deliveryDate)
                                  .sort((a, b) => a.localeCompare(b))[0]
                            : "";
                        const responsePercent = request.selectedSupplierIds.length
                            ? Math.round(
                                  (request.quotes.length / request.selectedSupplierIds.length) * 100
                              )
                            : 0;
                        return (
                            <article
                                id={`request-${request.id}`}
                                key={request.id}
                                className={`scroll-mt-24 overflow-hidden rounded-2xl border bg-white transition ${
                                    expanded
                                        ? "border-[#9DB29F] shadow-[0_14px_36px_-30px_rgba(54,88,69,0.6)]"
                                        : "border-[#E2E8E0]"
                                }`}
                            >
                                <div className="p-5">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <div className="shrink-0 rounded-lg bg-[#EDF3EC] p-2.5 text-[#4F6F56]">
                                                <Package size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="text-[15px] font-semibold text-[#2F312F]">
                                                        {request.title}
                                                    </h2>
                                                    <Status status={request.status} />
                                                    {request.priority === "urgent" ? (
                                                        <span className="rounded-full bg-[#FFF0E8] px-2 py-0.5 text-[11px] font-semibold text-[#B75E28]">
                                                            Urgent
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <p className="mt-1.5 text-[13px] text-[#8A918A]">
                                                    {request.reference} · {request.lines.length}{" "}
                                                    {request.lines.length === 1 ? "item" : "items"} ·
                                                    delivery by {shortDate(`${request.deliveryDate}T12:00:00`)}
                                                </p>
                                                <div className="mt-3 flex flex-wrap gap-1.5">
                                                    {request.lines.map((line) => (
                                                        <span
                                                            key={line.id}
                                                            className="rounded-md bg-[#F4F7F3] px-2 py-1 text-[13px] text-[#5D645D]"
                                                        >
                                                            {line.productName} · {line.quantity}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 flex-wrap items-center gap-6">
                                            <div>
                                                <p className="text-[12px] text-[#8A918A]">Budget</p>
                                                <p className="tabular mt-0.5 text-[15px] font-semibold text-[#2F312F]">
                                                    {money(targetValue(request))}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[12px] text-[#8A918A]">Quotes</p>
                                                <p className="tabular mt-0.5 text-[15px] font-semibold text-[#4F6F56]">
                                                    {request.quotes.length} / {request.selectedSupplierIds.length}
                                                </p>
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
                                                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#DDE5DC] px-3.5 text-[13px] font-medium text-[#4F6F56] transition hover:border-[#B9C6B8] hover:bg-[#F6F8F5]"
                                            >
                                                Details {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {expanded ? (
                                    <div className="border-t border-[#E6ECE4] bg-[#FAFBF9] p-5">
                                        <div className="mb-4 grid gap-3 rounded-xl border border-[#E2E8E0] bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                    <p className="text-[14px] font-semibold text-[#2F312F]">
                                                        {request.quotes.length} of {request.selectedSupplierIds.length}{" "}
                                                        {request.selectedSupplierIds.length === 1
                                                            ? "supplier"
                                                            : "suppliers"}{" "}
                                                        replied
                                                    </p>
                                                    <span className="text-[12px] text-[#8A918A]">
                                                        Quotes close {dateTime(request.quoteDeadline)}
                                                    </span>
                                                </div>
                                                <div
                                                    className="mt-2 h-1.5 max-w-md overflow-hidden rounded-full bg-[#E8EDE6]"
                                                    role="progressbar"
                                                    aria-label="Supplier response progress"
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                    aria-valuenow={responsePercent}
                                                >
                                                    <div
                                                        className="h-full rounded-full bg-[#6F9277] transition-all"
                                                        style={{ width: `${responsePercent}%` }}
                                                    />
                                                </div>
                                            </div>
                                            {request.quotes.length > 1 ? (
                                                <label className="flex items-center gap-2 text-[12px] font-medium text-[#667066]">
                                                    <ArrowDownUp size={14} />
                                                    Sort
                                                    <select
                                                        aria-label="Sort supplier quotes"
                                                        value={quoteSort}
                                                        onChange={(event) =>
                                                            setQuoteSort(event.target.value as QuoteSort)
                                                        }
                                                        className="h-9 rounded-lg border border-[#D7DFD5] bg-white px-3 text-[13px] font-medium text-[#2F312F] outline-none focus:border-[#6F9277] focus:ring-2 focus:ring-[#6F9277]/15"
                                                    >
                                                        <option value="recommended">Recommended</option>
                                                        <option value="price">Lowest price</option>
                                                        <option value="delivery">Earliest delivery</option>
                                                    </select>
                                                </label>
                                            ) : null}
                                        </div>
                                        {request.quotes.length === 0 ? (
                                            <div className="flex items-start gap-3 rounded-xl border border-dashed border-[#C9D4C6] bg-white p-5">
                                                <Clock3 size={18} className="mt-0.5 shrink-0 text-[#6F9277]" />
                                                <div>
                                                    <p className="text-[15px] font-semibold text-[#2F312F]">
                                                        Waiting for quotes
                                                    </p>
                                                    <p className="mt-1 text-[13px] leading-6 text-[#8A918A]">
                                                        {request.selectedSupplierIds.length}{" "}
                                                        {request.selectedSupplierIds.length === 1
                                                            ? "supplier"
                                                            : "suppliers"}{" "}
                                                        received
                                                        your request. Quotes are due{" "}
                                                        {dateTime(request.quoteDeadline)}.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {request.status !== "awarded" ? (
                                                    <div className="mb-4 flex items-start gap-3 rounded-xl bg-[#EAF3E8] px-4 py-3.5">
                                                        <Bot size={18} className="mt-0.5 shrink-0 text-[#4F6F56]" />
                                                        <div>
                                                            <p className="text-[14px] font-semibold text-[#2F312F]">
                                                                Recommended: {recommendedQuote?.supplierAlias}
                                                            </p>
                                                            <p className="mt-0.5 text-[13px] leading-6 text-[#667066]">
                                                                The fit score balances price and delivery speed.
                                                                Lowest-price and earliest-delivery labels show the
                                                                trade-offs; you make the final decision.
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : null}
                                                <div className="grid gap-3 lg:grid-cols-3">
                                                    {ranked.map((quote) => (
                                                        <QuoteCard
                                                            key={quote.id}
                                                            quote={quote}
                                                            budget={targetValue(request)}
                                                            units={totalUnits(request)}
                                                            recommended={recommendedQuote?.id === quote.id}
                                                            lowestPrice={quote.totalPrice === lowestPrice}
                                                            earliestDelivery={quote.deliveryDate === earliestDelivery}
                                                            awarded={request.awardedQuoteId === quote.id}
                                                            disabled={
                                                                !["sent", "quoted"].includes(request.status) ||
                                                                Boolean(awardingId)
                                                            }
                                                            working={awardingId === quote.id}
                                                            onSelect={() => setPendingAward({ request, quote })}
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
                <div className="rounded-2xl border border-dashed border-[#C9D4C6] bg-white py-14 text-center">
                    <Send size={26} className="mx-auto text-[#A9B4A6]" />
                    <p className="mt-3 text-[15px] font-semibold text-[#2F312F]">
                        No requests in this view
                    </p>
                    <Link
                        href="/auction/shop/orders/new"
                        className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#4F6F56] hover:underline"
                    >
                        Create a request <ArrowRight size={14} />
                    </Link>
                </div>
            ) : null}

            {pendingAward ? (
                <Modal
                    open
                    onClose={() => {
                        if (!awardingId) setPendingAward(null);
                    }}
                    eyebrow="Confirm supplier"
                    title={`Create order with ${pendingAward.quote.supplierAlias}?`}
                    description={`${pendingAward.request.reference} · ${pendingAward.quote.reference}`}
                    footer={
                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                            <a
                                href={whatsappUrl(
                                    quoteDecisionWhatsAppMessage({
                                        request: pendingAward.request,
                                        quote: pendingAward.quote,
                                    })
                                )}
                                target="_blank"
                                rel="noreferrer"
                                className={secondaryButtonClass}
                            >
                                <MessageCircle size={16} /> Ask on WhatsApp
                            </a>
                            <div className="flex flex-col-reverse gap-2 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => setPendingAward(null)}
                                    disabled={Boolean(awardingId)}
                                    className={secondaryButtonClass}
                                >
                                    Keep comparing
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        void selectQuote(
                                            pendingAward.request.id,
                                            pendingAward.quote.id
                                        )
                                    }
                                    disabled={Boolean(awardingId)}
                                    className={primaryButtonClass}
                                >
                                    {awardingId ? (
                                        <LoaderCircle className="animate-spin" size={16} />
                                    ) : (
                                        <CheckCircle2 size={16} />
                                    )}
                                    Confirm and create order
                                </button>
                            </div>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <DecisionSummary
                                label="Order total"
                                value={money(pendingAward.quote.totalPrice)}
                                detail={`${money(
                                    Math.abs(
                                        targetValue(pendingAward.request) -
                                            pendingAward.quote.totalPrice
                                    )
                                )} ${
                                    pendingAward.quote.totalPrice <=
                                    targetValue(pendingAward.request)
                                        ? "under budget"
                                        : "over budget"
                                }`}
                            />
                            <DecisionSummary
                                label="Delivery"
                                value={shortDate(
                                    `${pendingAward.quote.deliveryDate}T12:00:00`
                                )}
                                detail={`${pendingAward.quote.deliveryDays} day lead time`}
                            />
                            <DecisionSummary
                                label="Payment terms"
                                value={pendingAward.quote.paymentTerms}
                                detail="As submitted by the supplier"
                            />
                            <DecisionSummary
                                label="Fit score"
                                value={`${pendingAward.quote.score}/100`}
                                detail="Price and delivery fit"
                            />
                        </div>
                        <div className="rounded-xl bg-[#FFF7E9] px-4 py-3.5 text-[13px] leading-6 text-[#7A5A25]">
                            Confirming creates the order and closes the other supplier quotes. This
                            action cannot currently be changed from the app, so check the total,
                            delivery date, and payment terms first.
                        </div>
                    </div>
                </Modal>
            ) : null}
        </div>
    );
}

function DecisionSummary({
    label,
    value,
    detail,
}: {
    label: string;
    value: string;
    detail: string;
}) {
    return (
        <div className="rounded-xl border border-[#E2E8E0] p-4">
            <p className="text-[12px] font-medium text-[#7B817B]">{label}</p>
            <p className="tabular mt-1 text-[17px] font-semibold text-[#2F312F]">{value}</p>
            <p className="mt-1 text-[12px] leading-5 text-[#8A918A]">{detail}</p>
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
    return (
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${style}`}>
            {retailerRequestStatus(status)}
        </span>
    );
}

function QuoteCard({
    quote,
    budget,
    units,
    recommended,
    lowestPrice,
    earliestDelivery,
    awarded,
    disabled,
    working,
    onSelect,
}: {
    quote: SupplierQuote;
    budget: number;
    units: number;
    recommended: boolean;
    lowestPrice: boolean;
    earliestDelivery: boolean;
    awarded: boolean;
    disabled: boolean;
    working: boolean;
    onSelect: () => void;
}) {
    const difference = budget - quote.totalPrice;
    const withinBudget = difference >= 0;

    return (
        <div
            className={`flex flex-col overflow-hidden rounded-xl border bg-white ${
                recommended ? "border-[#6F9277]" : "border-[#E2E8E0]"
            }`}
        >
            {recommended ? (
                <p className="flex items-center gap-1.5 bg-[#4F6F56] px-4 py-1.5 text-[11px] font-semibold tracking-[0.06em] text-white uppercase">
                    <Sparkles size={11} /> Best overall match
                </p>
            ) : null}
            <div className="flex flex-1 flex-col p-4">
                <div className="mb-3 flex min-h-6 flex-wrap gap-1.5">
                    {lowestPrice ? (
                        <span className="rounded-full bg-[#E9F3E8] px-2 py-1 text-[11px] font-semibold text-[#3F7048]">
                            Lowest price
                        </span>
                    ) : null}
                    {earliestDelivery ? (
                        <span className="rounded-full bg-[#EDF0FA] px-2 py-1 text-[11px] font-semibold text-[#4A5D92]">
                            Earliest delivery
                        </span>
                    ) : null}
                </div>
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="truncate text-[15px] font-semibold text-[#2F312F]">
                            {quote.supplierAlias}
                        </p>
                        <p className="mt-1 text-[13px] text-[#8A918A]">
                            {quote.reference} · {quote.paymentTerms}
                        </p>
                    </div>
                    <div
                        className="shrink-0 rounded-lg bg-[#EDF3EC] px-3 py-1.5 text-center"
                        title="Fit score combines the quote total and delivery speed"
                    >
                        <p className="text-[11px] text-[#6F9277]">Fit score</p>
                        <p className="tabular text-[15px] font-semibold text-[#4F6F56]">
                            {quote.score}/100
                        </p>
                    </div>
                </div>
                <p className="tabular mt-4 text-[26px] leading-none font-semibold tracking-[-0.02em] text-[#2F312F]">
                    {money(quote.totalPrice)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
                    <span className="text-[#8A918A]">
                        {money(quote.totalPrice / Math.max(units, 1))} average per unit
                    </span>
                    <span className={withinBudget ? "font-semibold text-[#3F7048]" : "font-semibold text-[#A4582A]"}>
                        {money(Math.abs(difference))} {withinBudget ? "under" : "over"} budget
                    </span>
                </div>
                <div className="mt-3 space-y-1.5 text-[13px] text-[#5D645D]">
                    <p className="flex items-center gap-2">
                        <Truck size={14} className="shrink-0 text-[#8A918A]" />
                        Delivery {shortDate(`${quote.deliveryDate}T12:00:00`)}
                    </p>
                    <p className="flex items-center gap-2">
                        <Clock3 size={14} className="shrink-0 text-[#8A918A]" />
                        {quote.deliveryDays} day lead time
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onSelect}
                    disabled={disabled}
                    className={`mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-[14px] font-semibold transition ${
                        awarded
                            ? "bg-[#E7F2E6] text-[#3F7048]"
                            : disabled
                              ? "bg-[#F1F3F0] text-[#A0A6A0]"
                              : "bg-[#365845] text-white hover:bg-[#2C4A39]"
                    }`}
                >
                    {working ? <LoaderCircle className="animate-spin" size={15} /> : null}
                    {awarded ? "Selected" : working ? "Creating order…" : "Choose this quote"}
                </button>
            </div>
        </div>
    );
}
