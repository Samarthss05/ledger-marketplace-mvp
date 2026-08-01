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
    MessageCircle,
    Package,
    Plus,
    Search,
    Send,
    Sparkles,
    Trash2,
    Users,
} from "lucide-react";
import { useAuth } from "../../../components/auth-context";
import {
    Field,
    fieldClass,
    primaryButtonClass,
    secondaryButtonClass,
} from "../../../components/form";
import { money, shortDate } from "../../../lib/format";
import {
    type OrderLine,
    type SupplierDirectoryEntry,
    useOrderWorkflowStore,
} from "../../../lib/order-workflow-store";
import { products, type Product } from "../../../lib/products-db";
import {
    hasDirectWhatsAppNumber,
    orderDraftWhatsAppMessage,
    whatsappUrl,
} from "../../../lib/whatsapp";

const steps = ["Order details", "Review", "Choose suppliers", "Send request"];

function suggestedTarget(product: Product) {
    return Number(Math.max(product.cost * 1.08, product.price * 0.76).toFixed(2));
}

const supplierCategoryGroups: Record<string, string[]> = {
    beverages: ["beer & alcohol", "beverages & drinks", "spirits & wine", "energy drinks"],
    "dry goods": [
        "canned food",
        "dried goods & pulses",
        "instant noodles & pasta",
        "flour & baking",
        "rice & grains",
        "sugar & salt",
        "spices & masala",
    ],
    "cooking essentials": [
        "sauces & condiments",
        "dried goods & pulses",
        "eggs",
        "flour & baking",
        "pickles & preserves",
        "rice & grains",
        "spices & masala",
        "sugar & salt",
    ],
    snacks: [
        "biscuits & cookies",
        "bread & bakery",
        "cakes & pastries",
        "chips & snacks",
        "confectionery",
        "ice cream & frozen",
        "indian snacks",
    ],
    household: [
        "flowers",
        "general merchandise",
        "household cleaning",
        "prayer items",
        "tissue & paper",
    ],
    "personal care": ["feminine care", "hair care", "health & medicine", "oral care"],
};

function supplierCoversCategory(supplierTag: string, productCategory: string) {
    const tag = supplierTag.trim().toLowerCase();
    const category = productCategory.trim().toLowerCase();
    return tag === category || supplierCategoryGroups[tag]?.includes(category) || false;
}

function supplierScore(supplier: SupplierDirectoryEntry, lines: OrderLine[]) {
    const matches = lines.filter((line) =>
        supplier.categoryTags.some((tag) => supplierCoversCategory(tag, line.category))
    ).length;
    const coverage = lines.length ? (matches / lines.length) * 100 : 0;
    return Math.round(
        supplier.performanceScore * 0.45 + supplier.onTimeRate * 0.3 + coverage * 0.25
    );
}

export default function CreateOrderPage() {
    const router = useRouter();
    const { organization } = useAuth();
    const { createRequest, supplierDirectory, loading, error: storeError } = useOrderWorkflowStore();
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
    const [idempotencyKey] = useState(() => crypto.randomUUID());
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
        setLines((current) => current.map((line) => (line.id === id ? { ...line, ...patch } : line)));

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
                idempotencyKey,
                title: title.trim(),
                lines,
                deliveryDate,
                priority,
                notes: notes.trim(),
                selectedSupplierIds,
            });
            router.push("/auction/shop/requests");
        } catch (cause) {
            setFormError(
                cause instanceof Error
                    ? cause.message
                    : "We could not create this request. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <Link
                href="/auction/shop"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#667066] hover:text-[#2F312F]"
            >
                <ArrowLeft size={14} /> Dashboard
            </Link>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-[#6F9277] uppercase">
                        New order
                    </p>
                    <h1 className="mt-1.5 text-[28px] leading-tight font-semibold tracking-[-0.025em] text-[#2F312F]">
                        Request quotes for a new order
                    </h1>
                    <p className="mt-1.5 max-w-2xl text-[15px] leading-6 text-[#707670]">
                        Add the products you need, review your budget, and choose which suppliers can
                        quote.
                    </p>
                </div>
                <p className="shrink-0 text-[13px] font-medium text-[#6F9277]">
                    Step {step + 1} of {steps.length}
                </p>
            </div>

            <ol className="mt-6 grid gap-2 sm:grid-cols-4">
                {steps.map((label, index) => (
                    <li
                        key={label}
                        aria-current={index === step ? "step" : undefined}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-medium ${
                            index === step
                                ? "bg-[#365845] text-white"
                                : index < step
                                  ? "bg-[#E8F1E7] text-[#3F7048]"
                                  : "border border-[#DDE5DC] bg-white text-[#8A918A]"
                        }`}
                    >
                        <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                                index === step
                                    ? "bg-white/20 text-white"
                                    : index < step
                                      ? "bg-[#3F7048] text-white"
                                      : "bg-[#F1F4F0] text-[#8A918A]"
                            }`}
                        >
                            {index < step ? <Check size={12} strokeWidth={3} /> : index + 1}
                        </span>
                        {label}
                    </li>
                ))}
            </ol>

            <section className="mt-5 rounded-2xl border border-[#E2E8E0] bg-white p-5 sm:p-7">
                {step === 0 ? (
                    <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Order name" className="sm:col-span-2" htmlFor="order-title">
                                <input
                                    id="order-title"
                                    required
                                    maxLength={140}
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    placeholder="e.g. August drinks order"
                                    className={fieldClass}
                                />
                            </Field>
                            <Field label="Delivery date" htmlFor="order-date">
                                <div className="relative">
                                    <Calendar
                                        size={16}
                                        className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#7B837B]"
                                    />
                                    <input
                                        id="order-date"
                                        type="date"
                                        min={minimumDate}
                                        value={deliveryDate}
                                        onChange={(event) => setDeliveryDate(event.target.value)}
                                        className={`${fieldClass} pl-10`}
                                    />
                                </div>
                            </Field>
                            <Field label="Quote deadline" htmlFor="order-priority">
                                <select
                                    id="order-priority"
                                    value={priority}
                                    onChange={(event) =>
                                        setPriority(event.target.value as "standard" | "urgent")
                                    }
                                    className={fieldClass}
                                >
                                    <option value="standard">Standard · suppliers have 48 hours</option>
                                    <option value="urgent">Urgent · suppliers have 12 hours</option>
                                </select>
                            </Field>
                        </div>

                        <Field label="Add products" hint={`${lines.length} added`} htmlFor="order-search">
                            <div className="relative">
                                <Search
                                    size={16}
                                    className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#7B837B]"
                                />
                                <input
                                    id="order-search"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search product, category, or barcode"
                                    className={`${fieldClass} pl-10`}
                                />
                            </div>
                            {search ? (
                                <div className="mt-2 overflow-hidden rounded-lg border border-[#DDE5DC]">
                                    {filteredProducts.map((product) => (
                                        <button
                                            type="button"
                                            key={product.id}
                                            onClick={() => addProduct(product)}
                                            className="flex w-full items-center justify-between gap-3 border-b border-[#EEF1ED] px-4 py-3 text-left transition last:border-0 hover:bg-[#F7F9F5]"
                                        >
                                            <span className="min-w-0">
                                                <span className="block truncate text-[14px] font-medium text-[#2F312F]">
                                                    {product.name}
                                                </span>
                                                <span className="text-[13px] text-[#8A918A]">
                                                    {product.category} · {product.barcode}
                                                </span>
                                            </span>
                                            <Plus size={15} className="shrink-0 text-[#4F6F56]" />
                                        </button>
                                    ))}
                                    {filteredProducts.length === 0 ? (
                                        <p className="px-4 py-3 text-[13px] text-[#8A918A]">
                                            No matching products.
                                        </p>
                                    ) : null}
                                </div>
                            ) : null}
                        </Field>

                        <div className="space-y-2.5">
                            {lines.map((line) => (
                                <div
                                    key={line.id}
                                    className="grid gap-3 rounded-xl border border-[#E1E7DF] bg-[#FAFBF9] p-4 sm:grid-cols-[1fr_110px_140px_40px] sm:items-end"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-[14px] font-medium text-[#2F312F]">
                                            {line.productName}
                                        </p>
                                        <p className="mt-1 text-[13px] text-[#8A918A]">{line.category}</p>
                                    </div>
                                    <label>
                                        <span className="mb-1 block text-[12px] text-[#777E77]">
                                            Quantity
                                        </span>
                                        <input
                                            type="number"
                                            min={1}
                                            inputMode="numeric"
                                            value={line.quantity}
                                            onChange={(event) =>
                                                updateLine(line.id, {
                                                    quantity: Math.max(0, Number(event.target.value)),
                                                })
                                            }
                                            className="tabular h-10 w-full rounded-lg border border-[#D7DFD5] bg-white px-3 text-[14px] outline-none focus:border-[#6F9277] focus:ring-2 focus:ring-[#6F9277]/15"
                                        />
                                    </label>
                                    <label>
                                        <span className="mb-1 block text-[12px] text-[#777E77]">
                                            Budget per unit
                                        </span>
                                        <div className="relative">
                                            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[13px] text-[#8A918A]">
                                                S$
                                            </span>
                                            <input
                                                type="number"
                                                min={0.01}
                                                step={0.01}
                                                inputMode="decimal"
                                                value={line.targetPrice}
                                                onChange={(event) =>
                                                    updateLine(line.id, {
                                                        targetPrice: Math.max(0, Number(event.target.value)),
                                                    })
                                                }
                                                className="tabular h-10 w-full rounded-lg border border-[#D7DFD5] bg-white pr-3 pl-8 text-[14px] outline-none focus:border-[#6F9277] focus:ring-2 focus:ring-[#6F9277]/15"
                                            />
                                        </div>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setLines((current) =>
                                                current.filter((candidate) => candidate.id !== line.id)
                                            )
                                        }
                                        className="flex h-10 w-10 items-center justify-center rounded-lg text-[#A45F48] transition hover:bg-[#FFF2EF]"
                                        aria-label={`Remove ${line.productName}`}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            {lines.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-[#C9D4C6] px-5 py-10 text-center">
                                    <Package size={24} className="mx-auto text-[#A9B4A6]" />
                                    <p className="mt-2 text-[13px] text-[#7B817B]">
                                        Search and add at least one product.
                                    </p>
                                </div>
                            ) : null}
                            {lines.length > 0 ? (
                                <div className="flex items-baseline justify-between gap-4 px-1 pt-1">
                                    <p className="text-[13px] text-[#7B817B]">
                                        {lines.length} product{lines.length === 1 ? "" : "s"} ·{" "}
                                        {lines.reduce((sum, line) => sum + line.quantity, 0)}{" "}
                                        {lines.reduce((sum, line) => sum + line.quantity, 0) === 1
                                            ? "unit"
                                            : "units"}
                                    </p>
                                    <p className="text-[14px] text-[#7B817B]">
                                        Budget{" "}
                                        <span className="tabular font-semibold text-[#2F312F]">
                                            {money(targetTotal)}
                                        </span>
                                    </p>
                                </div>
                            ) : null}
                        </div>

                        <Field label="Receiving instructions" hint="Optional" htmlFor="order-notes">
                            <textarea
                                id="order-notes"
                                maxLength={2000}
                                rows={3}
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                                placeholder="Receiving hours, pallet limits, or handling instructions"
                                className={`${fieldClass} resize-none`}
                            />
                        </Field>
                    </div>
                ) : null}

                {step === 1 ? (
                    <div>
                        <div className="flex items-start gap-3">
                            <div className="shrink-0 rounded-lg bg-[#EAF3E8] p-2.5 text-[#4F6F56]">
                                <Bot size={19} />
                            </div>
                            <div>
                                <h2 className="text-[17px] font-semibold text-[#2F312F]">
                                    Review your order
                                </h2>
                                <p className="mt-1 text-[13px] leading-6 text-[#707670]">
                                    Check your budget, delivery date, and receiving instructions before
                                    sending.
                                </p>
                            </div>
                        </div>
                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                            <Insight
                                label="Your budget"
                                value={money(targetTotal)}
                                detail="Maximum you want to spend"
                            />
                            <Insight
                                label="Retail price estimate"
                                value={money(marketTotal)}
                                detail="Based on catalogue prices"
                            />
                            <Insight
                                label="Estimated saving"
                                value={money(estimatedSaving)}
                                detail="Compared with retail prices"
                            />
                        </div>
                        <div className="mt-4 space-y-2.5">
                            <ReviewRow
                                ok={estimatedSaving > 0}
                                title="Budget check"
                                detail={
                                    estimatedSaving > 0
                                        ? `Targets are ${Math.round((estimatedSaving / marketTotal) * 100)}% below retail benchmarks.`
                                        : "Targets are at or above retail benchmarks; consider reviewing unit prices."
                                }
                            />
                            <ReviewRow
                                ok={new Date(deliveryDate).getTime() - Date.now() >= 3 * 86_400_000}
                                title="Delivery timing"
                                detail={
                                    priority === "urgent"
                                        ? "Urgent requests close after 12 hours, reducing response time."
                                        : "Suppliers receive a 48-hour response window."
                                }
                            />
                            <ReviewRow
                                ok={notes.trim().length > 0}
                                title="Delivery instructions"
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
                                <h2 className="text-[17px] font-semibold text-[#2F312F]">
                                    Choose suppliers to invite
                                </h2>
                                <p className="mt-1 text-[13px] leading-6 text-[#707670]">
                                    Supplier names are private. Choose using their ReStock ID, product
                                    match, and delivery record.
                                </p>
                            </div>
                            <Users size={20} className="shrink-0 text-[#6F9277]" />
                        </div>
                        {loading ? (
                            <div className="flex items-center justify-center py-16 text-[#6F9277]">
                                <LoaderCircle className="animate-spin" size={22} />
                            </div>
                        ) : rankedSuppliers.length ? (
                            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                                {rankedSuppliers.map(({ supplier, score }, index) => {
                                    const selected = selectedSupplierIds.includes(supplier.id);
                                    return (
                                        <button
                                            type="button"
                                            key={supplier.id}
                                            aria-pressed={selected}
                                            onClick={() =>
                                                setSelectedSupplierIds((current) =>
                                                    selected
                                                        ? current.filter((id) => id !== supplier.id)
                                                        : [...current, supplier.id]
                                                )
                                            }
                                            className={`rounded-xl border p-4 text-left transition ${
                                                selected
                                                    ? "border-[#6F9277] bg-[#F1F6F0]"
                                                    : "border-[#E2E8E0] hover:border-[#B9C6B8] hover:bg-[#FAFBF9]"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="text-[15px] font-semibold text-[#2F312F]">
                                                            {supplier.aliasCode}
                                                        </p>
                                                        {index === 0 ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F1E7] px-2 py-0.5 text-[11px] font-semibold text-[#3F7048]">
                                                                <Sparkles size={10} /> Best match
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                    <p className="mt-1 text-[13px] text-[#8A918A]">
                                                        {supplier.categoryTags.join(" · ") || "General supply"}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition ${
                                                        selected
                                                            ? "bg-[#4F6F56] text-white"
                                                            : "border border-[#CBD5C8] text-transparent"
                                                    }`}
                                                >
                                                    <Check size={13} strokeWidth={3} />
                                                </span>
                                            </div>
                                            <div className="mt-3.5 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-[#667066]">
                                                <span>
                                                    Product match{" "}
                                                    <b className="tabular font-semibold text-[#2F312F]">{score}</b>
                                                </span>
                                                <span>
                                                    Delivered on time{" "}
                                                    <b className="tabular font-semibold text-[#2F312F]">
                                                        {supplier.onTimeRate || "New"}
                                                        {supplier.onTimeRate ? "%" : ""}
                                                    </b>
                                                </span>
                                                <span>
                                                    Completed orders{" "}
                                                    <b className="tabular font-semibold text-[#2F312F]">
                                                        {supplier.completedOrders}
                                                    </b>
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="mt-5 rounded-xl border border-dashed border-[#C9D4C6] p-8 text-center">
                                <CircleAlert size={22} className="mx-auto text-[#A45F48]" />
                                <p className="mt-3 text-[15px] font-semibold text-[#2F312F]">
                                    No suppliers are available right now
                                </p>
                                <p className="mt-1 text-[13px] text-[#7B817B]">
                                    Please try again later or contact ReStock support.
                                </p>
                            </div>
                        )}
                    </div>
                ) : null}

                {step === 3 ? (
                    <div>
                        <h2 className="text-[17px] font-semibold text-[#2F312F]">Review and send</h2>
                        <p className="mt-1 text-[13px] text-[#707670]">
                            Only the suppliers you choose will receive this request.
                        </p>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <Summary label="Order name" value={title} />
                            <Summary
                                label="Delivery date"
                                value={shortDate(`${deliveryDate}T12:00:00`)}
                            />
                            <Summary
                                label="Items"
                                value={`${lines.length} ${lines.length === 1 ? "product" : "products"} · ${lines.reduce((sum, line) => sum + line.quantity, 0)} ${lines.reduce((sum, line) => sum + line.quantity, 0) === 1 ? "unit" : "units"}`}
                            />
                            <Summary label="Budget" value={money(targetTotal)} />
                            <Summary
                                label="Suppliers invited"
                                value={`${selectedSupplierIds.length} ${selectedSupplierIds.length === 1 ? "supplier" : "suppliers"}`}
                            />
                            <Summary
                                label="Quote window"
                                value={priority === "urgent" ? "12 hours" : "48 hours"}
                            />
                        </div>
                        <div className="mt-4 rounded-xl bg-[#F3F7F2] px-4 py-3.5 text-[13px] leading-6 text-[#5E685E]">
                            Your shop name and suppliers&apos; company names stay private. Both sides
                            use ReStock IDs while quotes, delivery updates, and photos are recorded
                            with the order.
                        </div>
                        <div className="mt-4 flex flex-col gap-4 rounded-xl border border-[#CFE0D1] bg-[#F8FBF7] p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-[14px] font-semibold text-[#2F312F]">
                                    Want help before sending?
                                </p>
                                <p className="mt-1 max-w-xl text-[13px] leading-5 text-[#707670]">
                                    Share this draft with {hasDirectWhatsAppNumber ? "ReStock" : "your ReStock contact"} on
                                    WhatsApp. The message contains ReStock IDs and order details, not
                                    business names or delivery addresses.
                                </p>
                            </div>
                            <a
                                href={whatsappUrl(
                                    orderDraftWhatsAppMessage({
                                        retailerAlias: organization?.aliasCode,
                                        title,
                                        lines,
                                        deliveryDate,
                                        targetTotal,
                                    })
                                )}
                                target="_blank"
                                rel="noreferrer"
                                className={`${secondaryButtonClass} shrink-0`}
                            >
                                <MessageCircle size={16} /> Share draft
                            </a>
                        </div>
                        <p className="mt-2 text-[12px] leading-5 text-[#8A918A]">
                            Sharing does not create a ReStock request. Use “Send request to suppliers”
                            below when the order is ready.
                        </p>
                    </div>
                ) : null}

                {formError || storeError ? (
                    <p
                        role="alert"
                        className="mt-5 rounded-lg bg-[#FFF2EF] px-4 py-3 text-[13px] text-[#A33A2B]"
                    >
                        {formError ?? storeError}
                    </p>
                ) : null}

                <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#E8ECE7] pt-5">
                    <button
                        type="button"
                        onClick={() => setStep((current) => Math.max(0, current - 1))}
                        disabled={step === 0 || submitting}
                        className="inline-flex h-11 items-center gap-1.5 rounded-lg px-4 text-[14px] font-semibold text-[#667066] transition hover:bg-[#F4F7F3] disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                        <ArrowLeft size={15} /> Back
                    </button>
                    {step < steps.length - 1 ? (
                        <button
                            type="button"
                            onClick={() => setStep((current) => current + 1)}
                            disabled={!canContinue}
                            className={primaryButtonClass}
                        >
                            Continue <ArrowRight size={15} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => void submit()}
                            disabled={submitting}
                            className={primaryButtonClass}
                        >
                            {submitting ? (
                                <LoaderCircle className="animate-spin" size={16} />
                            ) : (
                                <Send size={16} />
                            )}
                            Send request to suppliers
                        </button>
                    )}
                </div>
            </section>
        </div>
    );
}

function Insight({ label, value, detail }: { label: string; value: string; detail: string }) {
    return (
        <div className="rounded-xl border border-[#E2E8E0] p-4">
            <p className="text-[13px] font-medium text-[#7B817B]">{label}</p>
            <p className="tabular mt-1.5 text-[22px] leading-none font-semibold text-[#2F312F]">
                {value}
            </p>
            <p className="mt-1.5 text-[12px] text-[#8A918A]">{detail}</p>
        </div>
    );
}

function ReviewRow({ ok, title, detail }: { ok: boolean; title: string; detail: string }) {
    return (
        <div className="flex items-start gap-3 rounded-xl bg-[#FAFBF9] px-4 py-3.5">
            {ok ? (
                <Check size={17} className="mt-0.5 shrink-0 text-[#4F6F56]" />
            ) : (
                <CircleAlert size={17} className="mt-0.5 shrink-0 text-[#B26A35]" />
            )}
            <div>
                <p className="text-[14px] font-semibold text-[#2F312F]">{title}</p>
                <p className="mt-1 text-[13px] leading-5 text-[#707670]">{detail}</p>
            </div>
        </div>
    );
}

function Summary({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-[#E1E7DF] p-4">
            <p className="text-[13px] text-[#8A918A]">{label}</p>
            <p className="mt-1 text-[15px] font-semibold text-[#2F312F]">{value}</p>
        </div>
    );
}
