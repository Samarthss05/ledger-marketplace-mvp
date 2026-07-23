import Image from "next/image";
import logo from "../../public/restock-logo.png";

type BrandLockupProps = {
    className?: string;
    priority?: boolean;
    showCompany?: boolean;
    size?: "sm" | "md" | "lg";
};

const sizeClasses = {
    sm: {
        image: "h-7 w-[5.4rem]",
        divider: "h-5",
        company: "text-[7px]",
    },
    md: {
        image: "h-8 w-[6.4rem]",
        divider: "h-6",
        company: "text-[8px]",
    },
    lg: {
        image: "h-11 w-[8.8rem]",
        divider: "h-8",
        company: "text-[9px]",
    },
};

export function BrandLockup({
    className = "",
    priority = false,
    showCompany = true,
    size = "md",
}: BrandLockupProps) {
    const styles = sizeClasses[size];

    return (
        <div className={`inline-flex items-center gap-2.5 ${className}`}>
            <div className={`relative overflow-hidden ${styles.image}`}>
                <Image
                    src={logo}
                    alt="ReStock"
                    fill
                    priority={priority}
                    sizes={size === "lg" ? "140px" : "104px"}
                    className="object-cover object-center"
                />
            </div>
            {showCompany ? (
                <>
                    <span className={`w-px bg-[#DDE5DC] ${styles.divider}`} aria-hidden="true" />
                    <span
                        className={`${styles.company} font-semibold tracking-[0.2em] text-[#666B66] uppercase`}
                    >
                        by Ledger
                    </span>
                </>
            ) : null}
        </div>
    );
}
