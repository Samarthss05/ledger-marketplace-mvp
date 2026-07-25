"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

type ModalProps = {
    open: boolean;
    onClose: () => void;
    eyebrow?: string;
    title: string;
    description?: string;
    size?: "md" | "lg";
    footer?: React.ReactNode;
    children: React.ReactNode;
};

export function Modal({
    open,
    onClose,
    eyebrow,
    title,
    description,
    size = "md",
    footer,
    children,
}: ModalProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const titleId = useId();
    const descriptionId = useId();

    useEffect(() => {
        if (!open) return;

        const previouslyFocused = document.activeElement as HTMLElement | null;
        const { overflow } = document.body.style;
        document.body.style.overflow = "hidden";
        panelRef.current?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = overflow;
            previouslyFocused?.focus();
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="overlay-in fixed inset-0 z-80 flex items-end justify-center bg-[#141F16]/45 backdrop-blur-[3px] sm:items-center sm:p-6"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={description ? descriptionId : undefined}
                tabIndex={-1}
                className={`panel-in flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_32px_80px_-24px_rgba(20,31,22,0.4)] outline-none sm:max-h-[88vh] sm:rounded-2xl ${
                    size === "lg" ? "sm:max-w-3xl" : "sm:max-w-lg"
                }`}
            >
                <div className="flex items-start justify-between gap-4 border-b border-[#E8EDE6] px-5 py-4 sm:px-6 sm:py-5">
                    <div className="min-w-0">
                        {eyebrow ? (
                            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#6F9277] uppercase">
                                {eyebrow}
                            </p>
                        ) : null}
                        <h2
                            id={titleId}
                            className="mt-1 truncate text-lg font-semibold tracking-[-0.01em] text-[#2F312F]"
                        >
                            {title}
                        </h2>
                        {description ? (
                            <p id={descriptionId} className="mt-1 text-[13px] leading-5 text-[#7B817B]">
                                {description}
                            </p>
                        ) : null}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="-mt-1 -mr-1 shrink-0 rounded-lg p-2 text-[#7B837B] transition hover:bg-[#F2F5F1] hover:text-[#2F312F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6F9277]"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

                {footer ? (
                    <div className="border-t border-[#E8EDE6] bg-[#FBFCFA] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
                        {footer}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
