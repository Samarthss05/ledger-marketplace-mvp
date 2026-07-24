"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Menu, Package, Truck, Users, X } from "lucide-react";
import { BrandLockup } from "@/components/brand-lockup";
import { useAuth } from "../components/auth-context";
import { WorkspaceGate } from "../components/workspace-gate";

const supplierNav = [
    { label: "Dashboard", href: "/auction/supplier", icon: LayoutDashboard },
    { label: "Quote requests", href: "/auction/supplier/crm", icon: Users },
    { label: "Deliveries", href: "/auction/supplier/operations", icon: Package },
];

function SupplierShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { organization, signOut } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string) =>
        href === "/auction/supplier" ? pathname === href : pathname.startsWith(href);

    const initials = organization?.displayName
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();

    return (
        <div className="min-h-screen bg-[#FAFBF8]">
            <header className="sticky top-0 z-50 border-b border-[#DDE5DC] bg-white/95 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-[72px] items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/auction/supplier" aria-label="ReStock supplier dashboard">
                                <BrandLockup size="sm" priority />
                            </Link>
                            <div className="hidden items-center gap-1.5 rounded-lg bg-[#EDF3EC] px-2.5 py-1 sm:flex">
                                <Truck size={12} className="text-[#4F6F56]" />
                                <span className="text-[9px] font-bold tracking-wide text-[#4F6F56] uppercase">
                                    Supplier
                                </span>
                            </div>
                        </div>

                        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Supplier">
                            {supplierNav.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition ${
                                        isActive(item.href)
                                            ? "bg-[#4F6F56] text-white shadow-sm"
                                            : "text-[#666B66] hover:bg-[#F4F7F3] hover:text-[#2F312F]"
                                    }`}
                                >
                                    <item.icon size={14} />
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center gap-2">
                            <div className="hidden items-center gap-2 border-l border-[#E5E5E0] pl-3 sm:flex">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4F6F56] text-[10px] font-bold text-white">
                                    {initials}
                                </div>
                                <div className="max-w-36">
                                    <p className="truncate text-xs font-semibold text-[#4A514A]">
                                        {organization?.displayName}
                                    </p>
                                    <p className="text-[9px] text-[#8A918A]">{organization?.aliasCode}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => void signOut()}
                                className="hidden rounded-xl p-2 text-[#7B837B] hover:bg-[#F4F7F3] lg:block"
                                aria-label="Sign out"
                                title="Sign out"
                            >
                                <LogOut size={15} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setMobileOpen((open) => !open)}
                                className="rounded-xl p-2 text-[#667066] hover:bg-[#F4F7F3] lg:hidden"
                                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                            >
                                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                {mobileOpen ? (
                    <div className="border-t border-[#E5E5E0] bg-white p-3 lg:hidden">
                        <nav className="space-y-1" aria-label="Supplier mobile">
                            {supplierNav.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${
                                        isActive(item.href)
                                            ? "bg-[#4F6F56] text-white"
                                            : "text-[#666B66]"
                                    }`}
                                >
                                    <item.icon size={16} />
                                    {item.label}
                                </Link>
                            ))}
                            <button
                                type="button"
                                onClick={() => void signOut()}
                                className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-[#8A4A3B]"
                            >
                                <LogOut size={16} /> Sign out
                            </button>
                        </nav>
                    </div>
                ) : null}
            </header>
            <main>{children}</main>
        </div>
    );
}

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
    return (
        <WorkspaceGate requiredRole="supplier">
            <SupplierShell>{children}</SupplierShell>
        </WorkspaceGate>
    );
}
