"use client";

import { useState } from "react";
import {
    CheckCircle2,
    CircleDollarSign,
    Clock3,
    FileText,
    LoaderCircle,
    Package,
    Search,
    Send,
} from "lucide-react";
import { useAuth } from "../../components/auth-context";
import { MetricCard } from "../../components/metric-card";
import { primaryButtonClass } from "../../components/form";
import { supplierRequestStatus } from "../../lib/display-copy";
import {
    type SourcingRequest,
    useOrderWorkflowStore,
} from "../../lib/order-workflow-store";
import { money, shortDate } from "../../lib/format";
import { QuoteDialog, type QuoteValues } from "./quote-dialog";

type Filter = "all" | "open" | "submitted" | "awarded";

function requestBudget(request: SourcingRequest) {
    return request.lines.reduce((sum, line) => sum + line.targetPrice * line.quantity, 0);
}

export default function SupplierRequestsPage() {
    const { organization } = useAuth();
    const { requests, loading, error, submitQuote } = useOrderWorkflowStore();
    const [filter, setFilter] = useState<Filter>("all");
    const [search, setSearch] = useState("");
    const [quoteRequestId, setQuoteRequestId] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const myQuote = (request: SourcingRequest) =>
        request.quotes.find((quote) => quote.supplierId === organization?.id);
    const matchesFilter = (request: SourcingRequest) => {
        const quote = myQuote(request);
        if (filter === "open") return !quote && ["sent", "quoted"].includes(request.status);
        if (filter === "submitted") return Boolean(quote) && request.status !== "awarded";
        if (filter === "awarded") return request.awardedQuoteId === quote?.id;
        return true;
    };
    const filtered = requests.filter(
        (request) =>
            matchesFilter(request) &&
            `${request.title} ${request.reference} ${request.lines.map((line) => line.productName).join(" ")}`
                .toLowerCase()
                .includes(search.toLowerCase())
    );
    const quoteRequest = requests.find((request) => request.id === quoteRequestId) ?? null;

    const sendQuote = async (values: QuoteValues) => {
        if (!quoteRequest) return;
        const result = await submitQuote({ requestId: quoteRequest.id, ...values });
        setSuccess(`${result.reference} was sent. The retailer can now review your quote.`);
        setQuoteRequestId(null);
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
            <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-[#6F9277] uppercase">
                    Sales
                </p>
                <h1 className="mt-1.5 text-[28px] leading-tight font-semibold tracking-[-0.025em] text-[#2F312F]">
                    Quote requests
                </h1>
                <p className="mt-1.5 text-[15px] text-[#707670]">
                    Review each order and send your best price and delivery date.
                </p>
            </div>

            {success ? (
                <div className="flex items-start gap-3 rounded-xl border border-[#CFE0D1] bg-[#F4F8F3] px-4 py-3.5">
                    <CheckCircle2 size={18} className="mt-px shrink-0 text-[#4F6F56]" />
                    <p className="text-[14px] leading-6 text-[#365845]">{success}</p>
                </div>
            ) : null}
            {error ? (
                <p role="alert" className="rounded-xl bg-[#FFF2EF] px-4 py-3 text-[14px] text-[#A33A2B]">
                    {error}
                </p>
            ) : null}

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <MetricCard icon={FileText} label="Total requests" value={requests.length.toString()} />
                <MetricCard
                    icon={Clock3}
                    label="Need your quote"
                    value={requests
                        .filter((request) => !myQuote(request) && ["sent", "quoted"].includes(request.status))
                        .length.toString()}
                />
                <MetricCard
                    icon={Send}
                    label="Quotes sent"
                    value={requests.filter((request) => myQuote(request)).length.toString()}
                />
                <MetricCard
                    icon={CheckCircle2}
                    label="Orders won"
                    value={requests
                        .filter((request) => request.awardedQuoteId === myQuote(request)?.id)
                        .length.toString()}
                />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                    {(["all", "open", "submitted", "awarded"] as Filter[]).map((value) => (
                        <button
                            type="button"
                            key={value}
                            onClick={() => setFilter(value)}
                            className={`h-9 rounded-lg px-3.5 text-[13px] font-medium transition ${
                                filter === value
                                    ? "bg-[#365845] text-white"
                                    : "border border-[#DDE5DC] bg-white text-[#5D645D] hover:border-[#B9C6B8] hover:text-[#2F312F]"
                            }`}
                        >
                            {
                                {
                                    all: "All",
                                    open: "Need your quote",
                                    submitted: "Quotes sent",
                                    awarded: "Orders won",
                                }[value]
                            }
                        </button>
                    ))}
                </div>
                <div className="relative w-full sm:w-72">
                    <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-[#8A918A]" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search requests or products"
                        className="h-10 w-full rounded-lg border border-[#DDE5DC] bg-white pr-3 pl-9 text-[14px] outline-none transition placeholder:text-[#A3AAA3] focus:border-[#6F9277] focus:ring-2 focus:ring-[#6F9277]/15"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20 text-[#6F9277]">
                    <LoaderCircle className="animate-spin" size={25} />
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((request) => {
                        const quote = myQuote(request);
                        const won = request.awardedQuoteId === quote?.id;
                        const closed = ["awarded", "cancelled", "expired"].includes(request.status);
                        return (
                            <article
                                key={request.id}
                                className="rounded-2xl border border-[#E2E8E0] bg-white p-5"
                            >
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="shrink-0 rounded-lg bg-[#EDF3EC] p-2.5 text-[#4F6F56]">
                                            <Package size={18} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="text-[15px] font-semibold text-[#2F312F]">
                                                    {request.title}
                                                </h2>
                                                <span className="rounded-full bg-[#F1F5F0] px-2 py-0.5 text-[11px] font-semibold text-[#5B705F]">
                                                    {supplierRequestStatus(request.status)}
                                                </span>
                                                {won ? (
                                                    <span className="rounded-full bg-[#E7F2E6] px-2 py-0.5 text-[11px] font-semibold text-[#3F7048]">
                                                        Your quote was selected
                                                    </span>
                                                ) : null}
                                            </div>
                                            <p className="mt-1.5 text-[13px] text-[#8A918A]">
                                                {request.reference} · Retailer {request.retailerAlias} · delivery by{" "}
                                                {shortDate(`${request.deliveryDate}T12:00:00`)}
                                            </p>
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {request.lines.map((line) => (
                                                    <span
                                                        key={line.id}
                                                        className="rounded-md bg-[#F4F7F3] px-2 py-1 text-[13px] text-[#5D645D]"
                                                    >
                                                        {line.productName} · {line.quantity} units
                                                    </span>
                                                ))}
                                            </div>
                                            {request.notes ? (
                                                <p className="mt-3 text-[13px] leading-6 text-[#707670]">
                                                    Receiving: {request.notes}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="shrink-0 rounded-xl border border-[#E8EDE6] bg-[#F7F9F5] p-4 lg:w-64">
                                        {quote ? (
                                            <>
                                                <p className="text-[11px] font-semibold tracking-[0.1em] text-[#6F9277] uppercase">
                                                    Your quote · {quote.reference}
                                                </p>
                                                <p className="tabular mt-2 text-[22px] leading-none font-semibold text-[#2F312F]">
                                                    {money(quote.totalPrice)}
                                                </p>
                                                <p className="mt-2 text-[13px] text-[#7B817B]">
                                                    {quote.deliveryDays} days · {quote.paymentTerms}
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-[11px] font-semibold tracking-[0.1em] text-[#6F9277] uppercase">
                                                    Retailer budget
                                                </p>
                                                <p className="tabular mt-2 text-[22px] leading-none font-semibold text-[#2F312F]">
                                                    {money(requestBudget(request))}
                                                </p>
                                                <p className="mt-2 text-[13px] text-[#7B817B]">
                                                    Maximum requested total
                                                </p>
                                            </>
                                        )}
                                        {!closed ? (
                                            <button
                                                type="button"
                                                onClick={() => setQuoteRequestId(request.id)}
                                                className={`${primaryButtonClass} mt-4 w-full`}
                                            >
                                                <CircleDollarSign size={16} />
                                                {quote ? "Update quote" : "Prepare quote"}
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {!loading && filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#C9D4C6] bg-white py-14 text-center">
                    <FileText size={26} className="mx-auto text-[#A9B4A6]" />
                    <p className="mt-3 text-[15px] font-semibold text-[#2F312F]">
                        No requests in this view
                    </p>
                </div>
            ) : null}

            {quoteRequest ? (
                <QuoteDialog
                    key={quoteRequest.id}
                    request={quoteRequest}
                    existingQuote={myQuote(quoteRequest)}
                    onClose={() => setQuoteRequestId(null)}
                    onSubmit={sendQuote}
                />
            ) : null}
        </div>
    );
}
