"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    Bot,
    CheckCircle2,
    FileText,
    Package,
    Search,
    Send,
    ShieldCheck,
    Sparkles,
    X,
} from "lucide-react";
import {
    type SourcingRequest,
    useOrderWorkflowStore,
} from "../../lib/order-workflow-store";
import { formatCurrency } from "../../lib/mock-data";

const SUPPLIER_ID = "SUP-001";
const SUPPLIER_NAME = "Pacific Foods Distribution";

function targetValue(request: SourcingRequest) {
    return request.lines.reduce(
        (total, line) => total + line.targetPrice * line.quantity,
        0
    );
}

export default function SupplierRFQCenter() {
    const { requests, submitQuote } = useOrderWorkflowStore();
    const [search, setSearch] = useState("");
    const [selectedRequest, setSelectedRequest] = useState<SourcingRequest | null>(null);
    const [totalPrice, setTotalPrice] = useState("");
    const [deliveryDays, setDeliveryDays] = useState("5");
    const [paymentTerms, setPaymentTerms] = useState("Net 30");
    const [submittedId, setSubmittedId] = useState<string | null>(null);

    const supplierRequests = requests
        .filter((request) => request.selectedSupplierIds.includes(SUPPLIER_ID))
        .filter((request) =>
            `${request.title} ${request.id} ${request.lines.map((line) => line.productName).join(" ")}`
                .toLowerCase()
                .includes(search.toLowerCase())
        );

    const openRequests = supplierRequests.filter(
        (request) =>
            request.status !== "awarded" &&
            !request.quotes.some((quote) => quote.supplierId === SUPPLIER_ID)
    );
    const submittedQuotes = supplierRequests.filter((request) =>
        request.quotes.some((quote) => quote.supplierId === SUPPLIER_ID)
    );
    const wonRequests = supplierRequests.filter(
        (request) =>
            request.status === "awarded" &&
            request.quotes.find((quote) => quote.id === request.awardedQuoteId)?.supplierId ===
                SUPPLIER_ID
    );

    const openQuote = (request: SourcingRequest) => {
        const existingQuote = request.quotes.find(
            (quote) => quote.supplierId === SUPPLIER_ID
        );
        setTotalPrice(
            existingQuote
                ? existingQuote.totalPrice.toFixed(2)
                : (targetValue(request) * 1.02).toFixed(2)
        );
        setDeliveryDays(existingQuote?.deliveryDays.toString() ?? "5");
        setPaymentTerms(existingQuote?.paymentTerms ?? "Net 30");
        setSelectedRequest(request);
    };

    const submit = () => {
        if (!selectedRequest || Number(totalPrice) <= 0) return;
        submitQuote({
            requestId: selectedRequest.id,
            supplierId: SUPPLIER_ID,
            supplierName: SUPPLIER_NAME,
            totalPrice: Number(totalPrice),
            deliveryDays: Number(deliveryDays),
            paymentTerms,
        });
        setSubmittedId(selectedRequest.id);
        setSelectedRequest(null);
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-[10px] font-bold tracking-[0.16em] text-[#6F9277] uppercase">
                        Supplier sales
                    </p>
                    <h1 className="text-2xl font-bold text-[#2F312F]">Quote requests</h1>
                    <p className="mt-1 text-sm text-[#666B66]">
                        Review verified retailer requirements and submit a complete commercial offer.
                    </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl border border-[#DDE5DC] bg-white px-3 py-2 text-[10px] font-semibold text-[#4F6F56]">
                    <ShieldCheck size={13} /> Retailer identity protected until award
                </div>
            </div>

            {submittedId && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 rounded-2xl border border-[#CFE0D1] bg-[#F4F8F3] p-4"
                >
                    <CheckCircle2 size={18} className="mt-0.5 text-[#4F6F56]" />
                    <div>
                        <p className="text-sm font-bold text-[#2F312F]">Quote submitted</p>
                        <p className="text-xs text-[#666B66]">
                            Your offer for {submittedId} is now available to the retailer for approval.
                        </p>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Metric
                    icon={FileText}
                    label="Open requests"
                    value={openRequests.length.toString()}
                    note="need your quote"
                />
                <Metric
                    icon={Send}
                    label="Quotes sent"
                    value={submittedQuotes.length.toString()}
                    note="awaiting a decision"
                />
                <Metric
                    icon={CheckCircle2}
                    label="Orders won"
                    value={wonRequests.length.toString()}
                    note="ready for fulfillment"
                />
                <Metric
                    icon={Sparkles}
                    label="Average AI score"
                    value={
                        submittedQuotes.length
                            ? `${Math.round(
                                submittedQuotes.reduce((total, request) => {
                                    const quote = request.quotes.find(
                                        (candidate) => candidate.supplierId === SUPPLIER_ID
                                    );
                                    return total + (quote?.score ?? 0);
                                }, 0) / submittedQuotes.length
                            )}`
                            : "—"
                    }
                    note="price and delivery fit"
                />
            </div>

            <div className="relative">
                <Search size={14} className="absolute top-3.5 left-3.5 text-[#8A918A]" />
                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search requests or products"
                    className="w-full rounded-xl border border-[#DDE5DC] bg-white py-3 pr-4 pl-10 text-sm outline-none focus:border-[#6F9277]"
                />
            </div>

            <div className="space-y-4">
                {supplierRequests.map((request, index) => {
                    const myQuote = request.quotes.find(
                        (quote) => quote.supplierId === SUPPLIER_ID
                    );
                    const winningQuote = request.quotes.find(
                        (quote) => quote.id === request.awardedQuoteId
                    );
                    const won = winningQuote?.supplierId === SUPPLIER_ID;
                    return (
                        <motion.article
                            key={request.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                            className="rounded-3xl border border-[#DDE5DC] bg-white p-5"
                        >
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
                                            <span className="rounded-full bg-[#F4F7F3] px-2 py-0.5 text-[9px] font-bold text-[#666B66]">
                                                {request.id}
                                            </span>
                                            {request.priority === "urgent" && (
                                                <span className="rounded-full bg-[#FFF0E8] px-2 py-0.5 text-[9px] font-bold text-[#B75E28]">
                                                    Urgent
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 text-[10px] text-[#8A918A]">
                                            Central region · {request.lines.length} product
                                            {request.lines.length === 1 ? "" : "s"} · needed by{" "}
                                            {new Date(`${request.deliveryDate}T00:00:00`).toLocaleDateString(
                                                "en-SG",
                                                { day: "numeric", month: "short" }
                                            )}
                                        </p>
                                        <div className="mt-3 space-y-2">
                                            {request.lines.map((line) => (
                                                <div
                                                    key={line.id}
                                                    className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-[#F7F9F6] px-3 py-2 text-[10px]"
                                                >
                                                    <span className="font-semibold text-[#2F312F]">
                                                        {line.productName}
                                                    </span>
                                                    <span className="text-[#8A918A]">
                                                        {line.quantity} units
                                                    </span>
                                                    <span className="font-semibold text-[#4F6F56]">
                                                        Target {formatCurrency(line.targetPrice)}/unit
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        {request.notes && (
                                            <p className="mt-3 text-[10px] leading-5 text-[#666B66]">
                                                <strong>Delivery note:</strong> {request.notes}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex min-w-[220px] flex-col gap-3 lg:items-end">
                                    <div className="grid w-full grid-cols-2 gap-3 rounded-2xl bg-[#F4F7F3] p-3">
                                        <div>
                                            <p className="text-[9px] text-[#8A918A]">Target value</p>
                                            <p className="text-sm font-bold text-[#2F312F]">
                                                {formatCurrency(targetValue(request))}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-[#8A918A]">Competing quotes</p>
                                            <p className="text-sm font-bold text-[#2F312F]">
                                                {request.quotes.length}
                                            </p>
                                        </div>
                                    </div>
                                    {won ? (
                                        <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#E7F2E6] px-4 py-2.5 text-xs font-bold text-[#3F7048]">
                                            <CheckCircle2 size={13} /> Order awarded to you
                                        </span>
                                    ) : request.status === "awarded" ? (
                                        <span className="w-full rounded-xl bg-[#F1F3F0] px-4 py-2.5 text-center text-xs font-semibold text-[#8A918A]">
                                            Another supplier selected
                                        </span>
                                    ) : myQuote ? (
                                        <button
                                            onClick={() => openQuote(request)}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#C9D4C6] px-4 py-2.5 text-xs font-bold text-[#4F6F56]"
                                        >
                                            <CheckCircle2 size={13} />
                                            Quoted {formatCurrency(myQuote.totalPrice)} · Edit
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => openQuote(request)}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#365845] px-4 py-2.5 text-xs font-bold text-white"
                                        >
                                            <Send size={13} /> Prepare quote
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.article>
                    );
                })}
            </div>

            {supplierRequests.length === 0 && (
                <div className="rounded-3xl border border-dashed border-[#C9D4C6] bg-white py-16 text-center">
                    <FileText size={28} className="mx-auto text-[#A9B4A6]" />
                    <p className="mt-3 text-sm font-semibold text-[#2F312F]">No matching requests</p>
                </div>
            )}

            <AnimatePresence>
                {selectedRequest && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm"
                            onClick={() => setSelectedRequest(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.98 }}
                            className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-bold tracking-wide text-[#6F9277] uppercase">
                                        {selectedRequest.id}
                                    </p>
                                    <h2 className="mt-1 text-lg font-bold text-[#2F312F]">
                                        Submit supplier quote
                                    </h2>
                                    <p className="mt-1 text-xs text-[#8A918A]">
                                        One price must cover every product and delivery requirement.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    className="rounded-lg p-2 text-[#8A918A] hover:bg-[#F4F7F3]"
                                    aria-label="Close quote form"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <div className="rounded-xl bg-[#F4F7F3] p-3">
                                    <p className="text-[9px] text-[#8A918A]">Retailer target</p>
                                    <p className="mt-1 text-sm font-bold text-[#2F312F]">
                                        {formatCurrency(targetValue(selectedRequest))}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-[#F4F7F3] p-3">
                                    <p className="text-[9px] text-[#8A918A]">Required date</p>
                                    <p className="mt-1 text-sm font-bold text-[#2F312F]">
                                        {new Date(
                                            `${selectedRequest.deliveryDate}T00:00:00`
                                        ).toLocaleDateString("en-SG", {
                                            day: "numeric",
                                            month: "short",
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 space-y-4">
                                <label>
                                    <span className="mb-1.5 block text-xs font-semibold text-[#444944]">
                                        Total quote value
                                    </span>
                                    <div className="relative">
                                        <span className="absolute top-3 left-3.5 text-sm text-[#8A918A]">
                                            $
                                        </span>
                                        <input
                                            aria-label="Total quote value"
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={totalPrice}
                                            onChange={(event) => setTotalPrice(event.target.value)}
                                            className="w-full rounded-xl border border-[#DDE5DC] bg-[#F8FAF7] py-3 pr-4 pl-8 text-sm outline-none focus:border-[#6F9277]"
                                        />
                                    </div>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label>
                                        <span className="mb-1.5 block text-xs font-semibold text-[#444944]">
                                            Delivery lead time
                                        </span>
                                        <select
                                            value={deliveryDays}
                                            onChange={(event) => setDeliveryDays(event.target.value)}
                                            className="w-full rounded-xl border border-[#DDE5DC] bg-[#F8FAF7] px-3 py-3 text-sm"
                                        >
                                            <option value="3">3 days</option>
                                            <option value="5">5 days</option>
                                            <option value="7">7 days</option>
                                            <option value="10">10 days</option>
                                        </select>
                                    </label>
                                    <label>
                                        <span className="mb-1.5 block text-xs font-semibold text-[#444944]">
                                            Payment terms
                                        </span>
                                        <select
                                            value={paymentTerms}
                                            onChange={(event) => setPaymentTerms(event.target.value)}
                                            className="w-full rounded-xl border border-[#DDE5DC] bg-[#F8FAF7] px-3 py-3 text-sm"
                                        >
                                            <option>COD</option>
                                            <option>Net 15</option>
                                            <option>Net 30</option>
                                            <option>Net 45</option>
                                        </select>
                                    </label>
                                </div>
                            </div>

                            <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#EAF3E8] p-4">
                                <Bot size={17} className="mt-0.5 text-[#4F6F56]" />
                                <div>
                                    <p className="text-xs font-bold text-[#2F312F]">
                                        ReStock AI quote check
                                    </p>
                                    <p className="mt-1 text-[10px] leading-5 text-[#666B66]">
                                        This price is{" "}
                                        {Number(totalPrice) <= targetValue(selectedRequest)
                                            ? "within"
                                            : "above"}{" "}
                                        the retailer target. Faster delivery and Net 30 terms can
                                        improve your final ranking.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={submit}
                                disabled={Number(totalPrice) <= 0}
                                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#365845] px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
                            >
                                <Send size={14} /> Submit complete quote
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
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
