import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

type MetricCardProps = {
    icon: LucideIcon;
    label: string;
    value: string;
    detail?: string;
    href?: string;
    active?: boolean;
    onClick?: () => void;
};

export function MetricCard({
    icon: Icon,
    label,
    value,
    detail,
    href,
    active = false,
    onClick,
}: MetricCardProps) {
    const interactive = Boolean(href || onClick);
    const cardClassName = [
        "group flex min-h-36 min-w-0 w-full flex-col justify-between overflow-hidden rounded-2xl border p-4 text-left transition sm:p-5",
        active
            ? "border-[#8FA993] bg-[#F3F7F2] shadow-[0_16px_35px_-28px_rgba(54,88,69,0.7)]"
            : "border-[#DDE5DC] bg-white",
        interactive
            ? "cursor-pointer hover:-translate-y-0.5 hover:border-[#AFC2B1] hover:shadow-[0_16px_35px_-28px_rgba(54,88,69,0.65)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6F9277]"
            : "",
    ].join(" ");

    const content = (
        <>
            <div className="flex items-start justify-between gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EDF3EC] text-[#55765D]">
                    <Icon size={18} strokeWidth={1.9} />
                </span>
                {interactive ? (
                    <ArrowRight
                        size={15}
                        className="mt-1 text-[#A8B4A9] transition group-hover:translate-x-0.5 group-hover:text-[#4F6F56]"
                    />
                ) : null}
            </div>
            <div className="mt-5">
                <p className="break-words text-xl font-bold tracking-[-0.025em] text-[#2F312F] sm:text-2xl">{value}</p>
                <p className="mt-1 text-sm font-semibold leading-5 text-[#414641]">{label}</p>
                {detail ? <p className="mt-1 text-xs leading-5 text-[#7B817B]">{detail}</p> : null}
            </div>
        </>
    );

    const ariaLabel = detail ? `${label}: ${value}. ${detail}` : `${label}: ${value}`;

    if (href) {
        return (
            <Link href={href} aria-label={ariaLabel} className={cardClassName}>
                {content}
            </Link>
        );
    }

    if (onClick) {
        return (
            <button
                type="button"
                onClick={onClick}
                aria-label={ariaLabel}
                aria-pressed={active}
                className={cardClassName}
            >
                {content}
            </button>
        );
    }

    return <div className={cardClassName}>{content}</div>;
}
