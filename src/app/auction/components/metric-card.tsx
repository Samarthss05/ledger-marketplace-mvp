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
        "group flex min-w-0 w-full flex-col gap-3 rounded-xl border p-4 text-left transition",
        active
            ? "border-[#8FA993] bg-[#F3F7F2]"
            : "border-[#E2E8E0] bg-white",
        interactive
            ? "cursor-pointer hover:border-[#B4C5B6] hover:shadow-[0_10px_24px_-18px_rgba(54,88,69,0.55)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6F9277]"
            : "",
    ].join(" ");

    const content = (
        <>
            <div className="flex items-center gap-2.5">
                <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        active ? "bg-[#DCE8DA] text-[#3F6047]" : "bg-[#EDF3EC] text-[#55765D]"
                    }`}
                >
                    <Icon size={15} strokeWidth={2} />
                </span>
                <p className="min-w-0 flex-1 text-[13px] leading-snug font-medium text-balance text-[#5D645D]">
                    {label}
                </p>
                {interactive ? (
                    <ArrowRight
                        size={14}
                        className="mt-0.5 shrink-0 self-start text-[#B3BDB4] transition group-hover:translate-x-0.5 group-hover:text-[#4F6F56]"
                    />
                ) : null}
            </div>
            <div className="mt-auto">
                <p className="tabular text-[22px] leading-none font-semibold tracking-[-0.025em] break-words text-[#2F312F] sm:text-[26px]">
                    {value}
                </p>
                {detail ? (
                    <p className="mt-1.5 text-[12px] leading-snug text-[#8A918A]">{detail}</p>
                ) : null}
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
