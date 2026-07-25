const amountFormat = new Intl.NumberFormat("en-SG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

/**
 * en-SG renders SGD as a bare "$", which reads as USD to overseas suppliers.
 * Both sides of a quote need the currency to be unambiguous.
 */
export function money(value: number) {
    return `S$${amountFormat.format(value)}`;
}

const wholeAmountFormat = new Intl.NumberFormat("en-SG", {
    maximumFractionDigits: 0,
});

/** Cents add width without meaning in a KPI tile, where space is tightest. */
export function moneyCompact(value: number) {
    return `S$${wholeAmountFormat.format(value)}`;
}

export function shortDate(value: string) {
    return new Date(value).toLocaleDateString("en-SG", { dateStyle: "medium" });
}

export function dateTime(value: string) {
    return new Date(value).toLocaleString("en-SG", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}
