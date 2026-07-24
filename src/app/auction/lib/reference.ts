export function createReference(prefix: "RET" | "SUP" | "RFQ" | "QUO" | "ORD" | "DSP") {
    const size = prefix === "RET" || prefix === "SUP" ? 6 : 8;
    const bytes = crypto.getRandomValues(new Uint8Array(size));
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const suffix = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
    return `${prefix}-${suffix}`;
}
