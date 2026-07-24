"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    Bot,
    Calendar,
    Check,
    CircleAlert,
    LoaderCircle,
    Package,
    Plus,
    Search,
    Send,
    Sparkles,
    Trash2,
    Users,
} from "lucide-react";
import {
    type OrderLine,
    type SupplierDirectoryEntry,
    useOrderWorkflowStore,
} from "../../../lib/order-workflow-store";
import { products, type Product } from "../../../lib/products-db";

const steps = ["Order lines", "Smart review", "Suppliers", "Confirm"];

function money(value: number) {
    return new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD" }).format(value);
}

function suggestedTarget(product: Product) {
    return Number(Math.max(product.cost * 1.08, product.price * 0.76).toFixed(2));
}

function supplierScore(supplier: SupplierDirectoryEntry, lines: OrderLine[]) {
    const matches = lines.filter((line) =>
        supplier.categoryTags.some((tag) =>
            line.category.toLowerCase().includes(tag.toLowerCase().split(" & ")[0])
        )
    ).length;
    const coverage = lines.length ? (matches / lines.length) * 100 : 0;
    return Math.round(
        supplier.performanceScore * 0.45 + supplier.onTimeRate * 0.3 + coverage * 0.25
    );
}

export default function CreateOrderPage() {
    const router = useRouter();
    const { createRequest, supplierDirectory, loading, error: storeError } =
        useOrderWorkflowStore();
    const minimumDate = useMemo(() => {
        const date = new Date();
        date.setDate(date.getDate() + 2);
        return date.toISOString().slice(0, 10);
    }, []);
    const [step, setStep] = useState(0);
    const [search, setSearch] = useState("");
    const [title, setTitle] = useState("");
    const [deliveryDate, setDeliveryDate] = useState(minimumDate);
    const [priority, setPriority] = useState<"standard" | "urgent">("standard");
    const [notes, setNotes] = useState("");
    const [lines, setLines] = useState<OrderLine[]>([]);
    const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const filteredProducts = products
        .filter((product) =>
            `${product.name} ${product.category} ${product.barcode}`
                .toLowerCase()
                .includes(search.toLowerCase())
        )
        .slice(0, 8);
    const rankedSuppliers = supplierDirectory
        .map((supplier) => ({ supplier, score: supplierScore(supplier, lines) }))
        .sort((a, b) => b.score - a.score);
    const targetTotal = lines.reduce((sum, line) => sum + line.quantity * line.targetPrice, 0);
    const marketTotal = lines.reduce((sum, line) => sum + line.quantity * line.marketPrice, 0);
    const estimatedSaving = Math.max(0, marketTotal - targetTotal);

    const addProduct = (product: Product) => {
        setLines((current) => {
            if (current.some((line) => line.productId === product.id)) return current;
            return [
                ...current,
                {
                    id: crypto.randomUUID(),
                    productId: product.id,
                    productName: product.name,
                    category: product.category,
                    quantity: 1,
                    targetPrice: suggestedTarget(product),
                    marketPrice: product.price,
                },
            ];
        });
        setSearch("");
    };

    const updateLine = (id: string, patch: Partial<OrderLine>) =>
        setLines((current) =>
            current.map((line) => (line.id === id ? { ...line, ...patch } : line))
        );

    const canContinue =
        step === 0
            ? title.trim().length >= 3 &&
              lines.length > 0 &&
              lines.every((line) => line.quantity > 0 && line.targetPrice > 0) &&
              deliveryDate >= minimumDate
            : step === 2
              ? selectedSupplierIds.length > 0
              : true;

    const submit = async () => {
        setSubmitting(true);
        setFormError(null);
        try {
            await createRequest({
                title: title.trim(),
                lines,
                deliveryDate,
                priority,
                notes: notes.trim(),
                selectedSupplierIds,
            });
            router.push("/auction/shop/requests");
        } catch (cause) {
            setFormError(cause instanceof Error ? cause.message : "Unable to create request.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
            <Link
                href="/auction/shop"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#667066]"
            >
                <ArrowLeft size={13} /> Dashboard
            </Link>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-[10px] font-bold tracking-[0.17em] text-[#6F9277] uppercase">
                        Guided order creation
                    </p>
                    <h1 className="mt-1 text-3xl font-bold tracking-[-0.03em] text-[#2F312F]">
                        Create a sourcing request
                    </h1>
                    <p className="mt-2 text-sm text-[#707670]">
                        Build the basket, review pricing guidance, then invite anonymous suppliers.
                    </p>
                </div>
                <p className="text-xs font-semibold text-[#6F9277]">
                    Step {step + 1} of {steps.length}
                </p>
            </div>

            <div className="mt-7 grid gap-2 sm:grid-cols-4">
                {steps.map((label, index) => (
                    <div
                        key={label}
                        className={`rounded-xl px-3 py-2.5 text-xs font-semibold ${
                            index === step
                                ? "bg-[#365845] text-white"
                                : index < step
                                  ? "bg-[#E8F1E7] text-[#3F7048]"
                                  : "border border-[#DDE5DC] bg-white text-[#8A918A]"
                        }`}
                    >
                        <span className="mr-2">{index < step ? "✓" : index + 1}</span>
                        {label}
                    </div>
                ))}
            </div>

            <section className="mt-6 rounded-3xl border border-[#DDE5DC] bg-white p-5 sm:p-7">
                {step === 0 ? (
                    <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="sm:col-span-2">
                                <span className="mb-1.5 block text-xs font-semibold text-[#414641]">
                                    Request title
                                </span>
                                <input
                                    required
                                    maxLength={140}
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    placeholder="e.g. August beverage replenishment"
                                    className="w-full rounded-xl border border-[#D7DFD5] bg-[#FAFBF9] px-4 py-3 text-sm outline-none focus:border-[#6F9277]"
                                />
                            </label>
                            <label>
                                <span className="mb-1.5 block text-xs font-semibold text-[#414641]">
                                    Needed by
                                </span>
                                <div className="relative">
                                    <Calendar
                                        size={15}
                                        className="pointer-events-none absolute top-3.5 left-3.5 text-[#7B837B]"
                                    />
                                    <input
                                        type="date"
                                        min={minimumDate}
                                        value={deliveryDate}
                                        onChange={(event) => setDeliveryDate(event.target.value)}
                                        className="w-full rounded-xl border border-[#D7DFD5] bg-[#FAFBF9] py-3 pr-4 pl-10 text-sm outline-none focus:border-[#6F9277]"
                                    />
                                </div>
                            </label>
                            <label>
                                <span className="mb-1.5 block text-xs font-semibold text-[#414641]">
                                    Priority
                                </span>
                                <select
                                    value={priority}
                                    onChange={(event) =>
                                        setPriority(event.target.value as "standard" | "urgent")
                                    }
                                    className="w-full rounded-xl border border-[#D7DFD5] bg-[#FAFBF9] px-4 py-3 text-sm outline-none focus:border-[#6F9277]"
                                >
                                    <option value="standard">Standard · 48-hour quote window</option>
                                    <option value="urgent">Urgent · 12-hour quote window</option>
                                </select>
                            </label>
                        </div>

                        <div>
                            <span className="mb-1.5 block text-xs font-semibold text-[#414641]">
                                Add products
                            </span>
                            <div className="relative">
                                <Search
                                    size={15}
                                    className="pointer-events-none absolute top-3.5 left-3.5 text-[#7B837B]"
                                />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search product, category, or barcode"
                                    className="w-full rounded-xl border border-[#D7DFD5] bg-[#FAFBF9] py-3 pr-4 pl-10 text-sm outline-none focus:border-[#6F9277]"
                                />
                            </div>
                            {search ? (
                                <div className="mt-2 overflow-hidden rounded-xl border border-[#DDE5DC]">
                                    {filteredProducts.map((product) => (
                                        <button
                                            type="button"
                                            key={product.id}
                                            onClick={() => addProduct(product)}
                                            className="flex w-full items-center justify-between border-b border-[#EEF1ED] px-4 py-3 text-left last:border-0 hover:bg-[#F7F9F5]"
                                        >
                                            <span>
                                                <span className="block text-xs font-semibold text-[#2F312F]">
                                                    {product.name}
                                                </span>
                                                <span className="text-[10px] text-[#8A918A]">
                                                    {product.category} · {product.barcode}
                                                </span>
                                            </span>
                                            <Plus size={14} className="text-[#4F6F56]" />
                                        </button>
                                    ))}
                                    {filteredProducts.length === 0 ? (
                                        <p className="px-4 py-3 text-xs text-[#8A918A]">
                                            No matching products.
                                        </p>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>

                        <div className="space-y-3">
                            {lines.map((line) => (
                                <div
                                    key={line.id}
                                    className="grid gap-3 rounded-2xl border border-[#E1E7DF] bg-[#FAFBF9] p-4 sm:grid-cols-[1fr_110px_130px_36px] sm:items-end"
                                >
                                    <div>
                                        <p className="text-xs font-bold text-[#2F312F]">
                                            {line.productName}
                                        </p>
                                        <p className="mt-1 text-[10px] text-[#8A918A]">{line.category}</p>
                                    </div>
                                    <label>
                                        <span className="mb-1 block text-[10px] text-[#777E77]">Quantity</span>
                                        <input
                                            type="number"
                                            min={1}
                                            value={line.quantity}
                                            onChange={(event) =>
                                                updateLine(line.id, {
                                                    quantity: Math.max(0, Number(event.target.value)),
                                                })
                                            }
                                            className="w-full rounded-lg border border-[#D7DFD5] bg-white px-3 py-2 text-xs"
                                        />
                                    </label>
                                    <label>
                                        <span className="mb-1 block text-[10px] text-[#777E77]">
                                            Target / unit
                                        </span>
                                        <input
                                            type="number"
                                            min={0.01}
                                            step={0.01}
                                            value={line.targetPrice}
                                            onChange={(event) =>
                                                updateLine(line.id, {
                                                    targetPrice: Math.max(0, Number(event.target.value)),
                                                })
                                            }
                                            className="w-full rounded-lg border border-[#D7DFD5] bg-white px-3 py-2 text-xs"
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setLines((current) =>
                                                current.filter((candidate) => candidate.id !== line.id)
                                            )
                                        }
                                        className="rounded-lg p-2 text-[#A45F48] hover:bg-[#FFF2EF]"
                                        aria-label={`Remove ${line.productName}`}
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            ))}
                            {lines.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-[#C9D4C6] px-5 py-10 text-center">
                                    <Package size={24} className="mx-auto text-[#A9B4A6]" />
                                    <p className="mt-2 text-xs text-[#7B817B]">
                                        Search and add at least one product.
                                    </p>
                                </div>
                            ) : null}
                        </div>

                        <label>
                            <span className="mb-1.5 block text-xs font-semibold text-[#414641]">
                                Receiving instructions
                            </span>
                            <textarea
                                maxLength={2000}
                                rows={3}
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                                placeholder="Receiving hours, pallet limits, or handling instructions"
                                className="w-full resize-none rounded-xl border border-[#D7DFD5] bg-[#FAFBF9] px-4 py-3 text-sm outline-none focus:border-[#6F9277]"
                            />
                        </label>
                    </div>
                ) : null}

                {step === 1 ? (
                    <div>
                        <div className="flex items-start gap-3">
                            <div className="rounded-xl bg-[#EAF3E8] p-2.5 text-[#4F6F56]">
                                <Bot size={19} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-[#2F312F]">Smart order review</h2>
                                <p className="mt-1 text-xs leading-5 text-[#707670]">
                                    ReStock checks pricing, timing, and basket structure before the RFQ
                                    is sent. Guidance is deterministic and remains reviewable by you.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 grid gap-4 sm:grid-cols-3">
                            <Insight label="Target basket" value={money(targetTotal)} detail="Your supplier ceiling" />
                            <Insight label="Retail benchmark" value={money(marketTotal)} detail="Current catalogue value" />
                            <Insight label="Potential saving" value={money(estimatedSaving)} detail="Before delivery costs" />
                        </div>
                        <div className="mt-5 space-y-3">
                            <ReviewRow
                                ok={estimatedSaving > 0}
                                title="Pricing check"
                                detail={
                                    estimatedSaving > 0
                                        ? `Targets are ${Math.round((estimatedSaving / marketTotal) * 100)}% below retail benchmarks.`
                                        : "Targets are at or above retail benchmarks; consider reviewing unit prices."
                                }
                            />
                            <ReviewRow
                                ok={new Date(deliveryDate).getTime() - Date.now() >= 3 * 86_400_000}
                                title="Delivery feasibility"
                                detail={
                                    priority === "urgent"
                                        ? "Urgent requests close after 12 hours, reducing response time."
                                        : "Suppliers receive a 48-hour response window."
                                }
                            />
                            <ReviewRow
                                ok={notes.trim().length > 0}
                                title="Receiving clarity"
                                detail={
                                    notes.trim()
                                        ? "Receiving instructions are included."
                                        : "Add receiving hours or special handling notes if relevant."
                                }
                            />
                        </div>
                    </div>
                ) : null}

                {step === 2 ? (
                    <div>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-[#2F312F]">
                                    Invite protected suppliers
                                </h2>
                                <p className="mt-1 text-xs leading-5 text-[#707670]">
                                    Only supplier aliases and verified performance data are shown.
                                </p>
                            </div>
                            <Users size={20} className="text-[#6F9277]" />
                        </div>
                        {loading ? (
                            <div className="flex items-center justify-center py-16 text-[#6F9277]">
                                <LoaderCircle className="animate-spin" size={22} />
                            </div>
                        ) : rankedSuppliers.length ? (
                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                {rankedSuppliers.map(({ supplier, score }, index) => {
                                    const selected = selectedSupplierIds.includes(supplier.id);
                                    return (
                                        <button
                                            type="button"
                                            key={supplier.id}
                                            onClick={() =>
                                                setSelectedSupplierIds((current) =>
                                                    selected
                                                        ? current.filter((id) => id !== supplier.id)
                                                        : [...current, supplier.id]
                                                )
                                            }
                                            className={`rounded-2xl border p-4 text-left transition ${
                                                selected
                                                    ? "border-[#6F9277] bg-[#F1F6F0] ring-1 ring-[#6F9277]/20"
                                                    : "border-[#DDE5DC] hover:bg-[#FAFBF9]"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold text-[#2F312F]">
                                                            {supplier.aliasCode}
                                                        </p>
                                                        {index === 0 ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F1E7] px-2 py-0.5 text-[8px] font-bold text-[#3F7048]">
                                                                <Sparkles size={8} /> Best match
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                    <p className="mt-1 text-[10px] text-[#8A918A]">
                                                        {supplier.categoryTags.join(" · ") || "General supply"}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                                                        selected
                                                            ? "bg-[#4F6F56] text-white"
                                                            : "border border-[#CBD5C8] text-transparent"
                                                    }`}
                                                >
                                                    <Check size={13} />
                                                </span>
                                            </div>
                                            <div className="mt-4 flex gap-4 text-[10px] text-[#667066]">
                                                <span>
                                                    Match <b className="text-[#2F312F]">{score}</b>
                                                </span>
                                                <span>
                                                    On time{" "}
                                                    <b className="text-[#2F312F]">
                                                        {supplier.onTimeRate || "New"}{supplier.onTimeRate ? "%" : ""}
                                                    </b>
                                                </span>
                                                <span>
                                                    Orders{" "}
                                                    <b className="text-[#2F312F]">{supplier.completedOrders}</b>
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="mt-6 rounded-2xl border border-dashed border-[#C9D4C6] p-8 text-center">
                                <CircleAlert size={22} className="mx-auto text-[#A45F48]" />
                                <p className="mt-3 text-sm font-semibold text-[#2F312F]">
                                    No suppliers are accepting requests
                                </p>
                                <p className="mt-1 text-xs text-[#7B817B]">
                                    Your draft is safe. Try again when a supplier completes onboarding.
                                </p>
                            </div>
                        )}
                    </div>
                ) : null}

                {step === 3 ? (
                    <div>
                        <h2 className="text-lg font-bold text-[#2F312F]">Confirm and send</h2>
                        <p className="mt-1 text-xs text-[#707670]">
                            This creates an auditable request and notifies only the selected suppliers.
                        </p>
                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <Summary label="Request" value={title} />
                            <Summary label="Needed by" value={new Date(`${deliveryDate}T12:00:00`).toLocaleDateString("en-SG", { dateStyle: "medium" })} />
                            <Summary label="Products" value={`${lines.length} lines · ${lines.reduce((sum, line) => sum + line.quantity, 0)} units`} />
                            <Summary label="Target value" value={money(targetTotal)} />
                            <Summary label="Suppliers invited" value={`${selectedSupplierIds.length} protected aliases`} />
                            <Summary label="Quote window" value={priority === "urgent" ? "12 hours" : "48 hours"} />
                        </div>
                        <div className="mt-5 rounded-2xl bg-[#F3F7F2] p-4 text-xs leading-5 text-[#5E685E]">
                            The retailer and supplier legal names are never shown to each other.
                            ReStock records the RFQ, quote decision, Ninja Van scans, and photo
                            verification under protected aliases.
                        </div>
                    </div>
                ) : null}

                {(formError || storeError) ? (
                    <p role="alert" className="mt-5 rounded-xl bg-[#FFF2EF] px-4 py-3 text-xs text-[#A33A2B]">
                        {formError ?? storeError}
                    </p>
                ) : null}

                <div className="mt-7 flex items-center justify-between border-t border-[#E8ECE7] pt-5">
                    <button
                        type="button"
                        onClick={() => setStep((current) => Math.max(0, current - 1))}
                        disabled={step === 0 || submitting}
                        className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-[#667066] disabled:opacity-30"
                    >
                        <ArrowLeft size={13} /> Back
                    </button>
                    {step < steps.length - 1 ? (
                        <button
                            type="button"
                            onClick={() => setStep((current) => current + 1)}
                            disabled={!canContinue}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#4F6F56] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40"
                        >
                            Continue <ArrowRight size={13} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => void submit()}
                            disabled={submitting}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#365845] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                        >
                            {submitting ? (
                                <LoaderCircle className="animate-spin" size={14} />
                            ) : (
                                <Send size={14} />
                            )}
                            Send quote request
                        </button>
                    )}
                </div>
            </section>
        </div>
    );
}

function Insight({ label, value, detail }: { label: string; value: string; detail: string }) {
    return (
        <div className="rounded-2xl border border-[#DDE5DC] p-4">
            <p className="text-[10px] font-semibold text-[#7B817B]">{label}</p>
            <p className="mt-1 text-xl font-bold text-[#2F312F]">{value}</p>
            <p className="mt-1 text-[10px] text-[#8A918A]">{detail}</p>
        </div>
    );
}

function ReviewRow({ ok, title, detail }: { ok: boolean; title: string; detail: string }) {
    return (
        <div className="flex items-start gap-3 rounded-2xl bg-[#FAFBF9] p-4">
            {ok ? (
                <Check size={17} className="mt-0.5 text-[#4F6F56]" />
            ) : (
                <CircleAlert size={17} className="mt-0.5 text-[#B26A35]" />
            )}
            <div>
                <p className="text-xs font-bold text-[#2F312F]">{title}</p>
                <p className="mt-1 text-[11px] leading-5 text-[#707670]">{detail}</p>
            </div>
        </div>
    );
}

function Summary({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-[#E1E7DF] p-4">
            <p className="text-[10px] font-semibold text-[#8A918A]">{label}</p>
            <p className="mt-1 text-sm font-bold text-[#2F312F]">{value}</p>
        </div>
    );
}
