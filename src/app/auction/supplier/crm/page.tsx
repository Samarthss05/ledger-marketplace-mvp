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
    ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../components/auth-context";
import { supplierRequestStatus } from "../../lib/display-copy";
import {
    type SourcingRequest,
    useOrderWorkflowStore,
} from "../../lib/order-workflow-store";

type Filter = "all" | "open" | "submitted" | "awarded";

function money(value: number) {
    return new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD" }).format(value);
}

export default function SupplierRequestsPage() {
    const { organization } = useAuth();
    const { requests, loading, error, submitQuote } = useOrderWorkflowStore();
    const [filter, setFilter] = useState<Filter>("all");
    const [search, setSearch] = useState("");
    const [quoteRequest, setQuoteRequest] = useState<SourcingRequest | null>(null);
    const [totalPrice, setTotalPrice] = useState("");
    const [deliveryDays, setDeliveryDays] = useState("5");
    const [paymentTerms, setPaymentTerms] = useState("Net 30");
    const [submitting, setSubmitting] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
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

    const openQuote = (request: SourcingRequest) => {
        const existing = myQuote(request);
        setQuoteRequest(request);
        setTotalPrice(existing?.totalPrice.toString() ?? "");
        setDeliveryDays(existing?.deliveryDays.toString() ?? "5");
        setPaymentTerms(existing?.paymentTerms ?? "Net 30");
        setActionError(null);
    };

    const submit = async () => {
        if (!quoteRequest || Number(totalPrice) <= 0 || Number(deliveryDays) <= 0) return;
        setSubmitting(true);
        setActionError(null);
        try {
            const result = await submitQuote({
                requestId: quoteRequest.id,
                totalPrice: Number(totalPrice),
                deliveryDays: Number(deliveryDays),
                paymentTerms,
            });
            setSuccess(`${result.reference} was sent. The retailer can now review your quote.`);
            setQuoteRequest(null);
        } catch (cause) {
            setActionError(cause instanceof Error ? cause.message : "Unable to submit quote.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6 lg:px-8">
            <div>
                <p className="text-[10px] font-bold tracking-[0.17em] text-[#6F9277] uppercase">Sales</p>
                <h1 className="mt-1 text-3xl font-bold tracking-[-0.03em] text-[#2F312F]">Quote requests</h1>
                <p className="mt-2 text-sm text-[#707670]">Review each order and send your best price and delivery date.</p>
            </div>

            {success ? <div className="flex items-start gap-3 rounded-2xl border border-[#CFE0D1] bg-[#F4F8F3] p-4"><CheckCircle2 size={18} className="mt-0.5 text-[#4F6F56]" /><p className="text-xs font-semibold text-[#365845]">{success}</p></div> : null}
            {error ? <p role="alert" className="rounded-xl bg-[#FFF2EF] px-4 py-3 text-xs text-[#A33A2B]">{error}</p> : null}

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Metric icon={FileText} label="Total requests" value={requests.length.toString()} />
                <Metric icon={Clock3} label="Need your quote" value={requests.filter((request) => !myQuote(request) && ["sent", "quoted"].includes(request.status)).length.toString()} />
                <Metric icon={Send} label="Quotes sent" value={requests.filter((request) => myQuote(request)).length.toString()} />
                <Metric icon={CheckCircle2} label="Orders won" value={requests.filter((request) => request.awardedQuoteId === myQuote(request)?.id).length.toString()} />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                    {(["all", "open", "submitted", "awarded"] as Filter[]).map((value) => (
                        <button type="button" key={value} onClick={() => setFilter(value)} className={`rounded-xl px-3 py-2 text-xs font-semibold ${filter === value ? "bg-[#365845] text-white" : "border border-[#DDE5DC] bg-white text-[#667066]"}`}>{{ all: "All", open: "Need your quote", submitted: "Quotes sent", awarded: "Orders won" }[value]}</button>
                    ))}
                </div>
                <div className="relative w-full sm:w-72">
                    <Search size={14} className="absolute top-3 left-3 text-[#8A918A]" />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search requests or products" className="w-full rounded-xl border border-[#DDE5DC] bg-white py-2.5 pr-3 pl-9 text-xs outline-none focus:border-[#6F9277]" />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20 text-[#6F9277]"><LoaderCircle className="animate-spin" size={25} /></div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((request) => {
                        const quote = myQuote(request);
                        const won = request.awardedQuoteId === quote?.id;
                        const closed = ["awarded", "cancelled", "expired"].includes(request.status);
                        return (
                            <article key={request.id} className="rounded-3xl border border-[#DDE5DC] bg-white p-5">
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="rounded-xl bg-[#EDF3EC] p-2.5 text-[#4F6F56]"><Package size={17} /></div>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="text-sm font-bold text-[#2F312F]">{request.title}</h2>
                                                <span className="rounded-full bg-[#F1F5F0] px-2 py-0.5 text-[9px] font-bold text-[#5B705F]">{supplierRequestStatus(request.status)}</span>
                                                {won ? <span className="rounded-full bg-[#E7F2E6] px-2 py-0.5 text-[9px] font-bold text-[#3F7048]">Your quote was selected</span> : null}
                                            </div>
                                            <p className="mt-1 text-[10px] text-[#8A918A]">{request.reference} · Retailer {request.retailerAlias} · delivery by {new Date(`${request.deliveryDate}T12:00:00`).toLocaleDateString("en-SG", { dateStyle: "medium" })}</p>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {request.lines.map((line) => <span key={line.id} className="rounded-lg bg-[#F4F7F3] px-2 py-1 text-[10px] text-[#667066]">{line.productName} · {line.quantity} units</span>)}
                                            </div>
                                            {request.notes ? <p className="mt-3 text-[10px] leading-5 text-[#707670]">Receiving: {request.notes}</p> : null}
                                        </div>
                                    </div>
                                    <div className="min-w-64 rounded-2xl bg-[#F7F9F5] p-4">
                                        {quote ? (
                                            <>
                                                <p className="text-[9px] font-bold text-[#6F9277] uppercase">Your quote · {quote.reference}</p>
                                                <p className="mt-2 text-xl font-bold text-[#2F312F]">{money(quote.totalPrice)}</p>
                                                <p className="mt-1 text-[10px] text-[#7B817B]">{quote.deliveryDays} days · {quote.paymentTerms}</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-[9px] font-bold text-[#6F9277] uppercase">Retailer budget</p>
                                                <p className="mt-2 text-xl font-bold text-[#2F312F]">{money(request.lines.reduce((sum, line) => sum + line.targetPrice * line.quantity, 0))}</p>
                                                <p className="mt-1 text-[10px] text-[#7B817B]">Maximum requested total</p>
                                            </>
                                        )}
                                        {!closed ? <button type="button" onClick={() => openQuote(request)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#365845] px-3 py-2.5 text-xs font-bold text-white"><CircleDollarSign size={13} /> {quote ? "Update quote" : "Prepare quote"}</button> : null}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {!loading && filtered.length === 0 ? <div className="rounded-3xl border border-dashed border-[#C9D4C6] bg-white py-16 text-center"><FileText size={27} className="mx-auto text-[#A9B4A6]" /><p className="mt-3 text-sm font-semibold text-[#2F312F]">No requests in this view</p></div> : null}

            {quoteRequest ? (
                <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#142016]/55 p-0 backdrop-blur-sm sm:items-center sm:p-4">
                    <div className="w-full max-w-xl rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7">
                        <div className="flex items-start justify-between gap-3">
                            <div><p className="text-[10px] font-bold tracking-[0.15em] text-[#6F9277] uppercase">Send your quote</p><h2 className="mt-1 text-xl font-bold text-[#2F312F]">{quoteRequest.reference}</h2><p className="mt-1 text-xs text-[#7B817B]">Confirm your price, delivery time, and payment terms.</p></div>
                            <button type="button" onClick={() => setQuoteRequest(null)} className="text-xs font-semibold text-[#7B817B]">Cancel</button>
                        </div>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <label><span className="mb-1.5 block text-xs font-semibold text-[#414641]">Total price · SGD</span><input type="number" min={0.01} step={0.01} value={totalPrice} onChange={(event) => setTotalPrice(event.target.value)} className="w-full rounded-xl border border-[#D7DFD5] bg-[#FAFBF9] px-4 py-3 text-sm" /></label>
                            <label><span className="mb-1.5 block text-xs font-semibold text-[#414641]">Delivery time · days</span><input type="number" min={1} max={120} value={deliveryDays} onChange={(event) => setDeliveryDays(event.target.value)} className="w-full rounded-xl border border-[#D7DFD5] bg-[#FAFBF9] px-4 py-3 text-sm" /></label>
                            <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-semibold text-[#414641]">Payment terms</span><select value={paymentTerms} onChange={(event) => setPaymentTerms(event.target.value)} className="w-full rounded-xl border border-[#D7DFD5] bg-[#FAFBF9] px-4 py-3 text-sm"><option>Net 15</option><option>Net 30</option><option>Net 45</option><option>Payment on delivery</option></select></label>
                        </div>
                        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#F3F7F2] p-4"><ShieldCheck size={17} className="mt-0.5 text-[#4F6F56]" /><p className="text-xs leading-5 text-[#5E685E]">The retailer sees your ReStock ID, quote, and delivery record. Your company name and contact details stay private.</p></div>
                        {actionError ? <p role="alert" className="mt-4 rounded-xl bg-[#FFF2EF] px-4 py-3 text-xs text-[#A33A2B]">{actionError}</p> : null}
                        <button type="button" onClick={() => void submit()} disabled={submitting || Number(totalPrice) <= 0 || Number(deliveryDays) <= 0} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#365845] px-4 py-3 text-sm font-bold text-white disabled:opacity-40">{submitting ? <LoaderCircle className="animate-spin" size={16} /> : <Send size={16} />} Send quote</button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function Metric({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string }) {
    return <div className="rounded-2xl border border-[#DDE5DC] bg-white p-4"><Icon size={15} className="text-[#6F9277]" /><p className="mt-3 text-xl font-bold text-[#2F312F]">{value}</p><p className="mt-1 text-[10px] font-semibold text-[#7B817B]">{label}</p></div>;
}
