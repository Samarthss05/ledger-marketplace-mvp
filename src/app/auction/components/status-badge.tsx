"use client";

interface StatusBadgeProps {
    status: string;
    size?: "sm" | "md";
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    active: { bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]", dot: "bg-[#4CAF50]" },
    pending: { bg: "bg-[#FFF3E0]", text: "text-[#E65100]", dot: "bg-[#FF9800]" },
    closed: { bg: "bg-[#F3E5F5]", text: "text-[#7B1FA2]", dot: "bg-[#9C27B0]" },
    awarded: { bg: "bg-[#E3F2FD]", text: "text-[#1565C0]", dot: "bg-[#2196F3]" },
    open: { bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]", dot: "bg-[#4CAF50]" },
    bidding: { bg: "bg-[#FFF8E1]", text: "text-[#F57F17]", dot: "bg-[#FFC107]" },
    fulfilled: { bg: "bg-[#E0F2F1]", text: "text-[#00695C]", dot: "bg-[#009688]" },
    confirmed: { bg: "bg-[#E3F2FD]", text: "text-[#1565C0]", dot: "bg-[#2196F3]" },
    shipped: { bg: "bg-[#F3E5F5]", text: "text-[#7B1FA2]", dot: "bg-[#9C27B0]" },
    delivered: { bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]", dot: "bg-[#4CAF50]" },
    cancelled: { bg: "bg-[#FFEBEE]", text: "text-[#C62828]", dot: "bg-[#F44336]" },
    won: { bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]", dot: "bg-[#4CAF50]" },
    lost: { bg: "bg-[#FFEBEE]", text: "text-[#C62828]", dot: "bg-[#F44336]" },
    withdrawn: { bg: "bg-[#F5F5F5]", text: "text-[#616161]", dot: "bg-[#9E9E9E]" },
    sealed: { bg: "bg-[#E8EAF6]", text: "text-[#283593]", dot: "bg-[#3F51B5]" },
    english: { bg: "bg-[#FFF3E0]", text: "text-[#E65100]", dot: "bg-[#FF9800]" },
    dutch: { bg: "bg-[#FCE4EC]", text: "text-[#AD1457]", dot: "bg-[#E91E63]" },
};

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
    const config = statusConfig[status.toLowerCase()] ?? { bg: "bg-[#F5F5F5]", text: "text-[#616161]", dot: "bg-[#9E9E9E]" };

    return (
        <span className={`inline-flex items-center gap-1.5 ${size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"} font-semibold rounded-full ${config.bg} ${config.text} uppercase tracking-wide`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${status === "active" || status === "bidding" ? "animate-pulse" : ""}`} />
            {status}
        </span>
    );
}
