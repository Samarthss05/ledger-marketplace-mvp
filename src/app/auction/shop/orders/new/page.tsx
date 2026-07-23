"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    ArrowRight,
    Bot,
    Calendar,
    Check,
    CheckCircle2,
    ChevronRight,
    CircleDollarSign,
    Clock3,
    Package,
    Plus,
    Search,
    Send,
    Sparkles,
    Trash2,
    Truck,
    Users,
} from "lucide-react";
import {
    type OrderLine,
    useOrderWorkflowStore,
} from "../../../lib/order-workflow-store";
import { formatCurrency, suppliers } from "../../../lib/mock-data";
import { products, type Product } from "../../../lib/products-db";

const steps = [
    { label: "Order details", icon: Package },
    { label: "AI review", icon: Bot },
    { label: "Suppliers", icon: Users },
    { label: "Review & send", icon: Send },
];

function suggestedTarget(product: Product) {
    return Number(Math.max(product.cost * 1.08, product.price * 0.76).toFixed(2));
}

function supplierMatchScore(supplierId: string, lines: OrderLine[]) {
    const supplier = suppliers.find((candidate) => candidate.id === supplierId);
    if (!supplier) return 0;

    const categoryMatches = lines.filter((line) =>
        supplier.productCategories.some((category) => {
            const productCategory = line.category.toLowerCase();
            const supplierCategory = category.toLowerCase();
            return (
                productCategory.includes(supplierCategory) ||
                supplierCategory.includes(productCategory.split(" & ")[0])
            );
        })
    ).length;
    const coverage = lines.length ? categoryMatches / lines.length : 0;
    return Math.round(
        supplier.performanceScore * 0.45 +
        supplier.onTimeDeliveryRate * 0.2 +
        coverage * 100 * 0.35
    );
}

export default function CreateOrderPage() {
    const { createRequest } = useOrderWorkflowStore();
    const [dateContext] = useState(() => {
        const today = new Date();
        const minimum = new Date(today);
        const suggested = new Date(today);
        minimum.setDate(minimum.getDate() + 1);
        suggested.setDate(suggested.getDate() + 10);
        return {
            todayTimestamp: today.getTime(),
            minimum: minimum.toISOString().slice(0, 10),
            suggested: suggested.toISOString().slice(0, 10),
        };
    });
    const [step, setStep] = useState(0);
    const [title, setTitle] = useState("August store replenishment");
    const [deliveryDate, setDeliveryDate] = useState(dateContext.suggested);
    const [priority, setPriority] = useState<"standard" | "urgent">("standard");
    const [notes, setNotes] = useState("Deliver between 8:00 AM and 12:00 PM.");
    const [query, setQuery] = useState("");
    const [createdId, setCreatedId] = useState<string | null>(null);

    const initialProducts = [
        products.find((product) => product.name.includes("Milo 400G")) ?? products[0],
        products.find((product) => product.name.includes("Oyster Sauce 770G")) ?? products[1],
    ];
    const [lines, setLines] = useState<OrderLine[]>(
        initialProducts.map((product, index) => ({
            id: `LINE-${index + 1}`,
            productId: product.id,
            productName: product.name,
            category: product.category,
            quantity: index === 0 ? 120 : 80,
            targetPrice: Number((product.price * 0.82).toFixed(2)),
            marketPrice: product.price,
        }))
    );

    const rankedSuppliers = useMemo(
        () =>
            suppliers
                .map((supplier) => ({
                    ...supplier,
                    matchScore: supplierMatchScore(supplier.id, lines),
                }))
                .sort((a, b) => b.matchScore - a.matchScore),
        [lines]
    );
    const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([
        "SUP-001",
        "SUP-002",
        "SUP-006",
    ]);

    const visibleProducts = products
        .filter((product) =>
            `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase())
        )
        .filter((product) => !lines.some((line) => line.productId === product.id))
        .slice(0, 6);

    const marketTotal = lines.reduce(
        (total, line) => total + line.marketPrice * line.quantity,
        0
    );
    const targetTotal = lines.reduce(
        (total, line) => total + line.targetPrice * line.quantity,
        0
    );
    const aiTotal = lines.reduce((total, line) => {
        const product = products.find((candidate) => candidate.id === line.productId);
        return total + (product ? suggestedTarget(product) : line.targetPrice) * line.quantity;
    }, 0);
    const expectedSavings = marketTotal - aiTotal;
    const daysUntilDelivery = Math.ceil(
        (new Date(deliveryDate).getTime() - dateContext.todayTimestamp) /
            (24 * 60 * 60 * 1000)
    );
    const orderReady = title.trim() && deliveryDate && lines.length > 0;

    const addProduct = (product: Product) => {
        setLines((current) => [
            ...current,
            {
                id: `LINE-${Date.now()}`,
                productId: product.id,
                productName: product.name,
                category: product.category,
                quantity: 24,
                targetPrice: Number((product.price * 0.82).toFixed(2)),
                marketPrice: product.price,
            },
        ]);
        setQuery("");
    };

    const updateLine = (id: string, field: "quantity" | "targetPrice", value: number) => {
        setLines((current) =>
            current.map((line) =>
                line.id === id ? { ...line, [field]: Math.max(0, value) } : line
            )
        );
    };

    const applyAiTargets = () => {
        setLines((current) =>
            current.map((line) => {
                const product = products.find((candidate) => candidate.id === line.productId);
                return product
                    ? { ...line, targetPrice: suggestedTarget(product) }
                    : line;
            })
        );
    };

    const toggleSupplier = (supplierId: string) => {
        setSelectedSupplierIds((current) =>
            current.includes(supplierId)
                ? current.filter((id) => id !== supplierId)
                : [...current, supplierId]
        );
    };

    const submit = () => {
        const request = createRequest({
            title: title.trim(),
            lines,
            deliveryDate,
            priority,
            notes: notes.trim(),
            selectedSupplierIds,
        });
        setCreatedId(request.id);
    };

    if (createdId) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl border border-[#CFE0D1] bg-white p-8 text-center shadow-[0_24px_70px_-50px_rgba(55,93,73,0.6)]"
                >
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E7F2E6] text-[#4F6F56]">
                        <CheckCircle2 size={30} />
                    </div>
                    <p className="mt-5 text-[10px] font-bold tracking-[0.18em] text-[#6F9277] uppercase">
                        {createdId}
                    </p>
                    <h1 className="mt-2 text-2xl font-bold text-[#2F312F]">
                        Quote request sent
                    </h1>
                    <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#666B66]">
                        ReStock sent this order to {selectedSupplierIds.length} matched suppliers.
                        You can compare their offers in Requests and approve one into an order.
                    </p>
                    <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link
                            href="/auction/shop/requests"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4F6F56] px-5 py-3 text-sm font-semibold text-white"
                        >
                            Track supplier quotes <ArrowRight size={14} />
                        </Link>
                        <Link
                            href="/auction/shop"
                            className="inline-flex items-center justify-center rounded-xl border border-[#DDE5DC] px-5 py-3 text-sm font-semibold text-[#4F6F56]"
                        >
                            Back to dashboard
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-start gap-3">
                <Link
                    href="/auction/shop"
                    className="mt-0.5 rounded-xl border border-[#DDE5DC] bg-white p-2 text-[#666B66]"
                    aria-label="Back to dashboard"
                >
                    <ArrowLeft size={16} />
                </Link>
                <div>
                    <p className="text-[10px] font-bold tracking-[0.16em] text-[#6F9277] uppercase">
                        Guided procurement
                    </p>
                    <h1 className="text-2xl font-bold text-[#2F312F]">Create a new order</h1>
                    <p className="mt-1 text-sm text-[#666B66]">
                        Define what you need, let AI check it, then request supplier quotes.
                    </p>
                </div>
            </div>

            <div className="grid gap-2 rounded-2xl border border-[#DDE5DC] bg-white p-2 md:grid-cols-4">
                {steps.map((item, index) => {
                    const completed = index < step;
                    const active = index === step;
                    return (
                        <button
                            key={item.label}
                            onClick={() => index < step && setStep(index)}
                            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                                active
                                    ? "bg-[#4F6F56] text-white"
                                    : completed
                                      ? "bg-[#EDF3EC] text-[#4F6F56]"
                                      : "text-[#8A918A]"
                            }`}
                        >
                            <span
                                className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                                    active ? "bg-white/15" : "bg-white"
                                }`}
                            >
                                {completed ? <Check size={14} /> : <item.icon size={14} />}
                            </span>
                            <span>
                                <span className="block text-[9px] font-semibold uppercase opacity-65">
                                    Step {index + 1}
                                </span>
                                <span className="block text-xs font-semibold">{item.label}</span>
                            </span>
                        </button>
                    );
                })}
            </div>

            {step === 0 && (
                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    <section className="space-y-5 rounded-3xl border border-[#DDE5DC] bg-white p-5">
                        <div>
                            <h2 className="text-base font-bold text-[#2F312F]">Order details</h2>
                            <p className="mt-1 text-xs text-[#8A918A]">
                                Add products and the commercial limits suppliers should quote against.
                            </p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="sm:col-span-2">
                                <span className="mb-1.5 block text-xs font-semibold text-[#444944]">
                                    Order name
                                </span>
                                <input
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    className="w-full rounded-xl border border-[#DDE5DC] bg-[#F8FAF7] px-4 py-3 text-sm outline-none focus:border-[#6F9277]"
                                />
                            </label>
                            <label>
                                <span className="mb-1.5 block text-xs font-semibold text-[#444944]">
                                    Needed by
                                </span>
                                <input
                                    type="date"
                                    value={deliveryDate}
                                    min={dateContext.minimum}
                                    onChange={(event) => setDeliveryDate(event.target.value)}
                                    className="w-full rounded-xl border border-[#DDE5DC] bg-[#F8FAF7] px-4 py-3 text-sm outline-none focus:border-[#6F9277]"
                                />
                            </label>
                            <label>
                                <span className="mb-1.5 block text-xs font-semibold text-[#444944]">
                                    Priority
                                </span>
                                <select
                                    value={priority}
                                    onChange={(event) =>
                                        setPriority(event.target.value as "standard" | "urgent")
                                    }
                                    className="w-full rounded-xl border border-[#DDE5DC] bg-[#F8FAF7] px-4 py-3 text-sm outline-none focus:border-[#6F9277]"
                                >
                                    <option value="standard">Standard sourcing</option>
                                    <option value="urgent">Urgent sourcing</option>
                                </select>
                            </label>
                        </div>

                        <div className="border-t border-[#EDF3EC] pt-5">
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-[#2F312F]">Products</h3>
                                    <p className="text-[10px] text-[#8A918A]">
                                        Target price is your maximum preferred unit cost.
                                    </p>
                                </div>
                                <span className="rounded-full bg-[#EDF3EC] px-2.5 py-1 text-[10px] font-bold text-[#4F6F56]">
                                    {lines.length} lines
                                </span>
                            </div>
                            <div className="relative mb-4">
                                <Search
                                    size={14}
                                    className="absolute top-3.5 left-3.5 text-[#8A918A]"
                                />
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Search your product catalogue"
                                    className="w-full rounded-xl border border-[#DDE5DC] bg-[#F8FAF7] py-3 pr-4 pl-10 text-sm outline-none focus:border-[#6F9277]"
                                />
                                {query && visibleProducts.length > 0 && (
                                    <div className="absolute z-20 mt-2 w-full rounded-2xl border border-[#DDE5DC] bg-white p-2 shadow-xl">
                                        {visibleProducts.map((product) => (
                                            <button
                                                key={product.id}
                                                onClick={() => addProduct(product)}
                                                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left hover:bg-[#F4F7F3]"
                                            >
                                                <span>
                                                    <span className="block text-xs font-semibold text-[#2F312F]">
                                                        {product.name}
                                                    </span>
                                                    <span className="text-[10px] text-[#8A918A]">
                                                        {product.category}
                                                    </span>
                                                </span>
                                                <Plus size={14} className="text-[#4F6F56]" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-3">
                                {lines.map((line) => (
                                    <div
                                        key={line.id}
                                        className="grid gap-3 rounded-2xl border border-[#E5EBE3] p-4 sm:grid-cols-[1fr_100px_120px_32px] sm:items-end"
                                    >
                                        <div>
                                            <p className="text-xs font-semibold text-[#2F312F]">
                                                {line.productName}
                                            </p>
                                            <p className="mt-1 text-[10px] text-[#8A918A]">
                                                {line.category} · Retail {formatCurrency(line.marketPrice)}
                                            </p>
                                        </div>
                                        <label>
                                            <span className="mb-1 block text-[10px] font-semibold text-[#666B66]">
                                                Quantity
                                            </span>
                                            <input
                                                aria-label={`Quantity for ${line.productName}`}
                                                type="number"
                                                min="1"
                                                value={line.quantity}
                                                onChange={(event) =>
                                                    updateLine(
                                                        line.id,
                                                        "quantity",
                                                        Number(event.target.value)
                                                    )
                                                }
                                                className="w-full rounded-lg border border-[#DDE5DC] px-2.5 py-2 text-xs"
                                            />
                                        </label>
                                        <label>
                                            <span className="mb-1 block text-[10px] font-semibold text-[#666B66]">
                                                Target / unit
                                            </span>
                                            <input
                                                aria-label={`Target price for ${line.productName}`}
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                value={line.targetPrice}
                                                onChange={(event) =>
                                                    updateLine(
                                                        line.id,
                                                        "targetPrice",
                                                        Number(event.target.value)
                                                    )
                                                }
                                                className="w-full rounded-lg border border-[#DDE5DC] px-2.5 py-2 text-xs"
                                            />
                                        </label>
                                        <button
                                            onClick={() =>
                                                setLines((current) =>
                                                    current.filter((item) => item.id !== line.id)
                                                )
                                            }
                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#A16B6B] hover:bg-[#FFF1F1]"
                                            aria-label={`Remove ${line.productName}`}
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <aside className="space-y-4">
                        <div className="rounded-3xl bg-[#365845] p-5 text-white">
                            <p className="text-[10px] font-semibold tracking-[0.15em] text-white/60 uppercase">
                                Draft summary
                            </p>
                            <p className="mt-3 text-2xl font-bold">{formatCurrency(targetTotal)}</p>
                            <p className="text-xs text-white/65">target order value</p>
                            <div className="mt-5 space-y-3 border-t border-white/10 pt-4 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-white/60">Products</span>
                                    <span className="font-semibold">{lines.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/60">Total units</span>
                                    <span className="font-semibold">
                                        {lines
                                            .reduce((total, line) => total + line.quantity, 0)
                                            .toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/60">Delivery window</span>
                                    <span className="font-semibold">
                                        {daysUntilDelivery > 0 ? `${daysUntilDelivery} days` : "Overdue"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-[#DDE5DC] bg-white p-4">
                            <div className="flex items-start gap-3">
                                <Sparkles size={16} className="mt-0.5 text-[#6F9277]" />
                                <div>
                                    <p className="text-xs font-bold text-[#2F312F]">Next: AI review</p>
                                    <p className="mt-1 text-[10px] leading-5 text-[#8A918A]">
                                        ReStock will check target prices, timing, supplier coverage,
                                        and consolidation savings before any request is sent.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            )}

            {step === 1 && (
                <section className="space-y-5">
                    <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#2F4C3C] to-[#577760] p-6 text-white">
                        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12">
                                    <Bot size={22} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-bold">ReStock AI order review</h2>
                                        <span className="rounded-full bg-white/12 px-2 py-0.5 text-[9px] font-semibold">
                                            Complete
                                        </span>
                                    </div>
                                    <p className="mt-1 max-w-2xl text-sm text-white/65">
                                        Your order is viable. AI found a lower target range and
                                        enough supplier coverage for a competitive quote round.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={applyAiTargets}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#365845]"
                            >
                                <Sparkles size={13} /> Apply AI target prices
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <AiMetric
                            icon={CircleDollarSign}
                            label="Expected savings"
                            value={formatCurrency(expectedSavings)}
                            note={`${Math.max(0, Math.round((expectedSavings / marketTotal) * 100))}% below retail value`}
                        />
                        <AiMetric
                            icon={Clock3}
                            label="Delivery confidence"
                            value={daysUntilDelivery >= 7 ? "High" : "Medium"}
                            note={`${Math.max(daysUntilDelivery, 0)} days available to source`}
                        />
                        <AiMetric
                            icon={Users}
                            label="Supplier coverage"
                            value={`${rankedSuppliers.filter((supplier) => supplier.matchScore >= 80).length} strong matches`}
                            note="Based on category fit and reliability"
                        />
                    </div>

                    <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
                        <div className="rounded-3xl border border-[#DDE5DC] bg-white p-5">
                            <h3 className="text-sm font-bold text-[#2F312F]">AI price recommendations</h3>
                            <p className="mt-1 text-xs text-[#8A918A]">
                                Targets balance supplier cost, order size, and your resale margin.
                            </p>
                            <div className="mt-4 divide-y divide-[#EDF3EC]">
                                {lines.map((line) => {
                                    const product = products.find(
                                        (candidate) => candidate.id === line.productId
                                    );
                                    const recommendation = product
                                        ? suggestedTarget(product)
                                        : line.targetPrice;
                                    return (
                                        <div
                                            key={line.id}
                                            className="grid gap-3 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                                        >
                                            <div>
                                                <p className="text-xs font-semibold text-[#2F312F]">
                                                    {line.productName}
                                                </p>
                                                <p className="mt-1 text-[10px] text-[#8A918A]">
                                                    {line.quantity} units
                                                </p>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <p className="text-[9px] text-[#8A918A]">Your target</p>
                                                <p className="text-xs font-semibold text-[#666B66]">
                                                    {formatCurrency(line.targetPrice)}
                                                </p>
                                            </div>
                                            <div className="rounded-xl bg-[#EDF3EC] px-3 py-2 text-left sm:text-right">
                                                <p className="text-[9px] text-[#6F9277]">AI target</p>
                                                <p className="text-xs font-bold text-[#4F6F56]">
                                                    {formatCurrency(recommendation)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="rounded-3xl border border-[#DDE5DC] bg-white p-5">
                                <h3 className="text-sm font-bold text-[#2F312F]">Recommended strategy</h3>
                                <div className="mt-4 space-y-3">
                                    <Recommendation
                                        icon={Send}
                                        title="Request competitive quotes"
                                        note="Best fit for this mixed-product order."
                                    />
                                    <Recommendation
                                        icon={Truck}
                                        title="Use one delivery window"
                                        note="Ask suppliers to consolidate every line."
                                    />
                                    <Recommendation
                                        icon={Calendar}
                                        title="Keep the current date"
                                        note="The sourcing window is sufficient."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {step === 2 && (
                <section className="rounded-3xl border border-[#DDE5DC] bg-white p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-[#2F312F]">Choose suppliers</h2>
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#EDF3EC] px-2 py-1 text-[9px] font-bold text-[#4F6F56]">
                                    <Bot size={10} /> AI ranked
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-[#8A918A]">
                                Invite at least one supplier. Three gives you a healthier comparison.
                            </p>
                        </div>
                        <p className="text-xs font-semibold text-[#4F6F56]">
                            {selectedSupplierIds.length} selected
                        </p>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {rankedSuppliers.map((supplier, index) => {
                            const selected = selectedSupplierIds.includes(supplier.id);
                            return (
                                <button
                                    key={supplier.id}
                                    onClick={() => toggleSupplier(supplier.id)}
                                    className={`rounded-2xl border p-4 text-left transition-all ${
                                        selected
                                            ? "border-[#6F9277] bg-[#F4F8F3] ring-1 ring-[#6F9277]/20"
                                            : "border-[#E1E8DF] bg-white hover:border-[#A9BEAB]"
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#365845] text-xs font-bold text-white">
                                                {supplier.avatar}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-[#2F312F]">
                                                    {supplier.companyName}
                                                </p>
                                                <p className="mt-0.5 text-[10px] text-[#8A918A]">
                                                    {supplier.location.city}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                                                selected
                                                    ? "border-[#4F6F56] bg-[#4F6F56] text-white"
                                                    : "border-[#C9D4C6]"
                                            }`}
                                        >
                                            {selected && <Check size={12} />}
                                        </span>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between rounded-xl bg-white px-3 py-2.5">
                                        <div>
                                            <p className="text-[9px] text-[#8A918A]">
                                                ReStock AI match
                                            </p>
                                            <p className="text-sm font-bold text-[#4F6F56]">
                                                {supplier.matchScore}%
                                            </p>
                                        </div>
                                        {index === 0 && (
                                            <span className="rounded-full bg-[#E7F2E6] px-2 py-1 text-[9px] font-bold text-[#4F6F56]">
                                                Best match
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-[#666B66]">
                                        <span>{supplier.onTimeDeliveryRate}% on-time</span>
                                        <span>{supplier.qualityScore}% quality</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>
            )}

            {step === 3 && (
                <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                    <section className="space-y-5 rounded-3xl border border-[#DDE5DC] bg-white p-5">
                        <div>
                            <h2 className="text-base font-bold text-[#2F312F]">Review quote request</h2>
                            <p className="mt-1 text-xs text-[#8A918A]">
                                Suppliers receive product quantities, target prices, and delivery terms.
                            </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <Summary label="Order" value={title} />
                            <Summary label="Needed by" value={new Date(`${deliveryDate}T00:00:00`).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" })} />
                            <Summary label="Priority" value={priority === "urgent" ? "Urgent" : "Standard"} />
                        </div>
                        <div className="overflow-hidden rounded-2xl border border-[#E1E8DF]">
                            <div className="grid grid-cols-[1fr_72px_90px] gap-3 bg-[#F4F7F3] px-4 py-2.5 text-[9px] font-bold tracking-wide text-[#8A918A] uppercase">
                                <span>Product</span>
                                <span>Qty</span>
                                <span>Target</span>
                            </div>
                            {lines.map((line) => (
                                <div
                                    key={line.id}
                                    className="grid grid-cols-[1fr_72px_90px] gap-3 border-t border-[#EDF3EC] px-4 py-3 text-xs"
                                >
                                    <span className="font-semibold text-[#2F312F]">
                                        {line.productName}
                                    </span>
                                    <span className="text-[#666B66]">{line.quantity}</span>
                                    <span className="font-semibold text-[#4F6F56]">
                                        {formatCurrency(line.targetPrice)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <label>
                            <span className="mb-1.5 block text-xs font-semibold text-[#444944]">
                                Delivery notes
                            </span>
                            <textarea
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                                rows={3}
                                className="w-full resize-none rounded-xl border border-[#DDE5DC] bg-[#F8FAF7] px-4 py-3 text-sm outline-none focus:border-[#6F9277]"
                            />
                        </label>
                    </section>
                    <aside className="space-y-4">
                        <div className="rounded-3xl bg-[#365845] p-5 text-white">
                            <p className="text-[10px] font-bold tracking-[0.16em] text-white/60 uppercase">
                                Request summary
                            </p>
                            <p className="mt-3 text-2xl font-bold">{formatCurrency(targetTotal)}</p>
                            <p className="text-xs text-white/60">target value</p>
                            <div className="mt-5 space-y-3 border-t border-white/10 pt-4 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-white/60">Products</span>
                                    <span>{lines.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/60">Suppliers</span>
                                    <span>{selectedSupplierIds.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/60">Potential savings</span>
                                    <span>{formatCurrency(expectedSavings)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-[#CFE0D1] bg-[#F4F8F3] p-4">
                            <div className="flex items-start gap-3">
                                <Bot size={16} className="mt-0.5 text-[#4F6F56]" />
                                <div>
                                    <p className="text-xs font-bold text-[#2F312F]">AI confidence: high</p>
                                    <p className="mt-1 text-[10px] leading-5 text-[#666B66]">
                                        The targets are competitive and the selected suppliers can cover
                                        this order within the requested window.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            )}

            <div className="flex items-center justify-between rounded-2xl border border-[#DDE5DC] bg-white p-3">
                <button
                    onClick={() => setStep((current) => Math.max(0, current - 1))}
                    disabled={step === 0}
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#666B66] disabled:opacity-30"
                >
                    <ArrowLeft size={14} /> Back
                </button>
                {step < steps.length - 1 ? (
                    <button
                        onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}
                        disabled={!orderReady || (step === 2 && selectedSupplierIds.length === 0)}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#4F6F56] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Continue <ChevronRight size={14} />
                    </button>
                ) : (
                    <button
                        onClick={submit}
                        disabled={selectedSupplierIds.length === 0}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#4F6F56] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                    >
                        <Send size={14} /> Send quote request
                    </button>
                )}
            </div>
        </div>
    );
}

function AiMetric({
    icon: Icon,
    label,
    value,
    note,
}: {
    icon: typeof Bot;
    label: string;
    value: string;
    note: string;
}) {
    return (
        <div className="rounded-2xl border border-[#DDE5DC] bg-white p-4">
            <Icon size={16} className="mb-3 text-[#6F9277]" />
            <p className="text-[10px] font-semibold tracking-wide text-[#8A918A] uppercase">{label}</p>
            <p className="mt-1 text-lg font-bold text-[#2F312F]">{value}</p>
            <p className="mt-0.5 text-[10px] text-[#8A918A]">{note}</p>
        </div>
    );
}

function Recommendation({
    icon: Icon,
    title,
    note,
}: {
    icon: typeof Bot;
    title: string;
    note: string;
}) {
    return (
        <div className="flex items-start gap-3 rounded-xl bg-[#F4F7F3] p-3">
            <Icon size={14} className="mt-0.5 text-[#4F6F56]" />
            <div>
                <p className="text-xs font-semibold text-[#2F312F]">{title}</p>
                <p className="mt-0.5 text-[10px] leading-4 text-[#8A918A]">{note}</p>
            </div>
        </div>
    );
}

function Summary({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl bg-[#F4F7F3] p-3">
            <p className="text-[9px] font-semibold tracking-wide text-[#8A918A] uppercase">{label}</p>
            <p className="mt-1 text-xs font-bold text-[#2F312F]">{value}</p>
        </div>
    );
}
