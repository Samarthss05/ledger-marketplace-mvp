import { Github, Linkedin, Twitter } from "lucide-react";
import { BrandLockup } from "@/components/brand-lockup";

const footerLinks = {
    Platform: [
        { label: "Retailer workspace", href: "/auction/shop" },
        { label: "Supplier workspace", href: "/auction/supplier" },
        { label: "Demand marketplace", href: "/auction" },
        { label: "Ledger finance", href: "#finance" },
    ],
    Company: [
        { label: "About", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Press", href: "#" },
    ],
    Resources: [
        { label: "Documentation", href: "#" },
        { label: "API Reference", href: "#" },
        { label: "Status", href: "#" },
        { label: "Support", href: "#" },
    ],
};

export default function Footer() {
    return (
        <footer className="border-t border-border bg-surface">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <BrandLockup size="lg" />
                        </div>
                        <p className="text-sm text-muted leading-relaxed mb-6 max-w-xs">
                            Smarter retail procurement for independent shops and suppliers across Southeast Asia.
                        </p>
                        <div className="flex gap-3">
                            {[Twitter, Linkedin, Github].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-muted hover:text-foreground hover:shadow-sm transition-all duration-200 border border-border"
                                >
                                    <Icon size={15} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h4 className="text-sm font-semibold text-foreground mb-4 tracking-wide uppercase">
                                {title}
                            </h4>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="text-sm text-muted hover:text-foreground transition-colors duration-200"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom */}
                <div className="mt-14 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted">
                        © {new Date().getFullYear()} ReStock by Ledger. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        {["Privacy", "Terms", "Cookies"].map((item) => (
                            <a
                                key={item}
                                href="#"
                                className="text-xs text-muted hover:text-foreground transition-colors"
                            >
                                {item}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
