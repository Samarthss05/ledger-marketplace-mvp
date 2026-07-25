"use client";

import { useState } from "react";
import { CalendarClock, LoaderCircle, Send, ShieldCheck, TriangleAlert } from "lucide-react";
import { Modal } from "../../components/modal";
import {
    Field,
    fieldClass,
    primaryButtonClass,
    secondaryButtonClass,
    Segmented,
} from "../../components/form";
import type { SourcingRequest, SupplierQuote } from "../../lib/order-workflow-store";
import { money, shortDate } from "../../lib/format";

const paymentTermsOptions = [
    { value: "Net 15", label: "Net 15" },
    { value: "Net 30", label: "Net 30" },
    { value: "Net 45", label: "Net 45" },
    { value: "Payment on delivery", label: "On delivery" },
] as const;

export type QuoteValues = {
    totalPrice: number;
    deliveryDays: number;
    paymentTerms: string;
};

export function QuoteDialog({
    request,
    existingQuote,
    onClose,
    onSubmit,
}: {
    request: SourcingRequest;
    existingQuote?: SupplierQuote;
    onClose: () => void;
    onSubmit: (values: QuoteValues) => Promise<void>;
}) {
    const [totalPrice, setTotalPrice] = useState(existingQuote?.totalPrice.toString() ?? "");
    const [deliveryDays, setDeliveryDays] = useState(existingQuote?.deliveryDays.toString() ?? "5");
    const [paymentTerms, setPaymentTerms] = useState(existingQuote?.paymentTerms ?? "Net 30");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const price = Number(totalPrice);
    const days = Number(deliveryDays);
    const priceValid = price > 0;
    const daysValid = days > 0 && days <= 120;
    const budget = request.lines.reduce((sum, line) => sum + line.targetPrice * line.quantity, 0);
    const arrival = daysValid
        ? new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10)
        : null;
    const missesDeliveryDate = Boolean(arrival && arrival > request.deliveryDate);

    const submit = async () => {
        if (!priceValid || !daysValid) return;
        setSubmitting(true);
        setError(null);
        try {
            await onSubmit({ totalPrice: price, deliveryDays: days, paymentTerms });
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Unable to submit quote.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            open
            onClose={onClose}
            eyebrow={existingQuote ? "Update your quote" : "Send your quote"}
            title={request.title}
            description={`${request.reference} · Retailer ${request.retailerAlias} · delivery by ${shortDate(`${request.deliveryDate}T12:00:00`)}`}
            footer={
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button type="button" onClick={onClose} className={secondaryButtonClass}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => void submit()}
                        disabled={submitting || !priceValid || !daysValid}
                        className={primaryButtonClass}
                    >
                        {submitting ? (
                            <LoaderCircle className="animate-spin" size={16} />
                        ) : (
                            <Send size={16} />
                        )}
                        {existingQuote ? "Update quote" : "Send quote"}
                    </button>
                </div>
            }
        >
            <div className="space-y-5">
                <section className="rounded-xl border border-[#E2E8E0] bg-[#FAFBF9] p-4">
                    <div className="flex items-baseline justify-between gap-3">
                        <p className="text-[13px] font-medium text-[#414641]">
                            {request.lines.length} item{request.lines.length === 1 ? "" : "s"} requested
                        </p>
                        <p className="text-[13px] text-[#8A918A]">
                            Budget{" "}
                            <span className="tabular font-semibold text-[#2F312F]">{money(budget)}</span>
                        </p>
                    </div>
                    <ul className="mt-3 space-y-2 border-t border-[#E8EDE6] pt-3">
                        {request.lines.map((line) => (
                            <li
                                key={line.id}
                                className="flex items-baseline justify-between gap-4 text-[14px]"
                            >
                                <span className="min-w-0 truncate text-[#2F312F]">{line.productName}</span>
                                <span className="tabular shrink-0 text-[#7B817B]">
                                    {line.quantity} × {money(line.targetPrice)}
                                </span>
                            </li>
                        ))}
                    </ul>
                    {request.notes ? (
                        <p className="mt-3 border-t border-[#E8EDE6] pt-3 text-[13px] leading-6 text-[#707670]">
                            {request.notes}
                        </p>
                    ) : null}
                </section>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Your total price" hint="SGD" htmlFor="quote-price">
                        <div className="relative">
                            <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[15px] font-medium text-[#8A918A]">
                                S$
                            </span>
                            <input
                                id="quote-price"
                                type="number"
                                min={0.01}
                                step={0.01}
                                inputMode="decimal"
                                placeholder="0.00"
                                value={totalPrice}
                                onChange={(event) => setTotalPrice(event.target.value)}
                                className={`${fieldClass} tabular pl-9 font-medium`}
                            />
                        </div>
                    </Field>
                    <Field label="Lead time" hint="Days until delivery" htmlFor="quote-days">
                        <div className="relative">
                            <input
                                id="quote-days"
                                type="number"
                                min={1}
                                max={120}
                                inputMode="numeric"
                                value={deliveryDays}
                                onChange={(event) => setDeliveryDays(event.target.value)}
                                className={`${fieldClass} tabular pr-14 font-medium`}
                            />
                            <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[14px] text-[#8A918A]">
                                days
                            </span>
                        </div>
                    </Field>
                </div>

                {arrival ? (
                    <div
                        className={`flex items-start gap-2.5 rounded-lg px-3.5 py-3 text-[13px] leading-5 ${
                            missesDeliveryDate
                                ? "bg-[#FFF5EC] text-[#8A5A2E]"
                                : "bg-[#F1F6F0] text-[#4F6F56]"
                        }`}
                    >
                        {missesDeliveryDate ? (
                            <TriangleAlert size={16} className="mt-px shrink-0" />
                        ) : (
                            <CalendarClock size={16} className="mt-px shrink-0" />
                        )}
                        <p>
                            Arrives about {shortDate(`${arrival}T12:00:00`)}
                            {missesDeliveryDate
                                ? " — after the date the retailer asked for."
                                : " — on time for this request."}
                        </p>
                    </div>
                ) : null}

                <Field label="Payment terms">
                    <Segmented
                        ariaLabel="Payment terms"
                        options={paymentTermsOptions}
                        value={paymentTerms}
                        onChange={setPaymentTerms}
                    />
                </Field>

                {priceValid ? (
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-[#E2E8E0] bg-[#FAFBF9] px-4 py-3.5">
                        <div>
                            <p className="text-[13px] text-[#7B817B]">Your quote</p>
                            <p className="tabular mt-0.5 text-[20px] leading-none font-semibold text-[#2F312F]">
                                {money(price)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[13px] text-[#7B817B]">Against budget</p>
                            <p
                                className={`tabular mt-0.5 text-[15px] font-semibold ${
                                    price <= budget ? "text-[#3F7048]" : "text-[#A4582A]"
                                }`}
                            >
                                {price <= budget
                                    ? `${money(budget - price)} under`
                                    : `${money(price - budget)} over`}
                            </p>
                        </div>
                    </div>
                ) : null}

                <div className="flex items-start gap-2.5 text-[13px] leading-6 text-[#7B817B]">
                    <ShieldCheck size={16} className="mt-1 shrink-0 text-[#6F9277]" />
                    <p>
                        The retailer sees your ReStock ID, quote, and delivery record. Your company
                        name and contact details stay private.
                    </p>
                </div>

                {error ? (
                    <p
                        role="alert"
                        className="rounded-lg bg-[#FFF2EF] px-4 py-3 text-[13px] text-[#A33A2B]"
                    >
                        {error}
                    </p>
                ) : null}
            </div>
        </Modal>
    );
}
