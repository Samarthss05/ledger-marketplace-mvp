"use client";

export const fieldClass =
    "w-full rounded-lg border border-[#D7DFD5] bg-white px-3.5 py-2.5 text-[15px] text-[#2F312F] outline-none transition placeholder:text-[#A3AAA3] focus:border-[#6F9277] focus:ring-2 focus:ring-[#6F9277]/15";

export const primaryButtonClass =
    "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#365845] px-5 text-sm font-semibold text-white transition hover:bg-[#2C4A39] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6F9277] disabled:cursor-not-allowed disabled:opacity-45";

export const secondaryButtonClass =
    "inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#D7DFD5] bg-white px-5 text-sm font-semibold text-[#4A514A] transition hover:border-[#B9C6B8] hover:bg-[#F6F8F5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6F9277] disabled:opacity-45";

export function Field({
    label,
    hint,
    htmlFor,
    className = "",
    children,
}: {
    label: string;
    hint?: string;
    htmlFor?: string;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={className}>
            <label
                htmlFor={htmlFor}
                className="mb-1.5 flex items-baseline justify-between gap-3 text-[13px] font-medium text-[#414641]"
            >
                {label}
                {hint ? <span className="text-[12px] font-normal text-[#8A918A]">{hint}</span> : null}
            </label>
            {children}
        </div>
    );
}

export function Segmented<T extends string>({
    options,
    value,
    onChange,
    ariaLabel,
}: {
    options: readonly { value: T; label: string }[];
    value: T;
    onChange: (value: T) => void;
    ariaLabel: string;
}) {
    return (
        <div
            role="radiogroup"
            aria-label={ariaLabel}
            className="grid gap-1 rounded-lg bg-[#F1F4F0] p-1"
            style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
        >
            {options.map((option) => {
                const selected = option.value === value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => onChange(option.value)}
                        className={`rounded-md px-2 py-2 text-[13px] font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6F9277] ${
                            selected
                                ? "bg-white text-[#2F312F] shadow-[0_1px_3px_rgba(20,31,22,0.12)]"
                                : "text-[#6C736C] hover:text-[#2F312F]"
                        }`}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
