import type { OrderLine, SourcingRequest, SupplierQuote } from "./order-workflow-store";

const whatsappNumber = (process.env.NEXT_PUBLIC_RESTOCK_WHATSAPP_NUMBER ?? "").replace(
    /\D/g,
    ""
);

export const hasDirectWhatsAppNumber = whatsappNumber.length >= 8;

export function whatsappUrl(message: string) {
    const destination = hasDirectWhatsAppNumber
        ? `https://wa.me/${whatsappNumber}`
        : "https://wa.me/";
    return `${destination}?text=${encodeURIComponent(message)}`;
}

export const startOrderWhatsAppMessage = [
    "Hi ReStock, I would like help placing a stock order.",
    "",
    "Products needed:",
    "Preferred delivery date:",
    "Approximate budget:",
    "",
    "Please help me prepare the request.",
].join("\n");

export function orderDraftWhatsAppMessage({
    retailerAlias,
    title,
    lines,
    deliveryDate,
    targetTotal,
}: {
    retailerAlias?: string;
    title: string;
    lines: OrderLine[];
    deliveryDate: string;
    targetTotal: number;
}) {
    const visibleLines = lines.slice(0, 12).map(
        (line) => `• ${line.productName}: ${line.quantity} ${line.quantity === 1 ? "unit" : "units"}`
    );
    if (lines.length > visibleLines.length) {
        visibleLines.push(`• Plus ${lines.length - visibleLines.length} more products`);
    }

    return [
        "Hi ReStock, I would like help with this stock order:",
        "",
        retailerAlias ? `Retailer ID: ${retailerAlias}` : null,
        `Order: ${title || "New stock order"}`,
        ...visibleLines,
        `Delivery by: ${deliveryDate}`,
        `Target budget: S$${targetTotal.toFixed(2)}`,
        "",
        "Please review this draft with me before it is sent to suppliers.",
    ]
        .filter((line): line is string => Boolean(line))
        .join("\n");
}

export function quoteDecisionWhatsAppMessage({
    request,
    quote,
}: {
    request: SourcingRequest;
    quote: SupplierQuote;
}) {
    return [
        "Hi ReStock, I need help reviewing a supplier quote.",
        "",
        `Request: ${request.reference}`,
        `Supplier ID: ${quote.supplierAlias}`,
        `Quote: ${quote.reference}`,
        `Total: S$${quote.totalPrice.toFixed(2)}`,
        `Delivery date: ${quote.deliveryDate}`,
        `Payment terms: ${quote.paymentTerms}`,
        "",
        "Please help me check this before I create the order.",
    ].join("\n");
}
