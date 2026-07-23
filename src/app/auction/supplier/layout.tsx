"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLockup } from "@/components/brand-lockup";
import {
    Truck, LayoutDashboard, Gavel, ClipboardList, Bell, LogOut,
    Package, Users, Menu, X,
} from "lucide-react";

const supplierNav = [
    { label: "Dashboard", href: "/auction/supplier", icon: LayoutDashboard },
    { label: "Auctions", href: "/auction/supplier/auctions", icon: Gavel },
    { label: "My Bids", href: "/auction/supplier/bids", icon: ClipboardList },
    { label: "RFQs", href: "/auction/supplier/crm", icon: Users },
    { label: "Fulfillment", href: "/auction/supplier/operations", icon: Package },
];

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === "/auction/supplier") return pathname === "/auction/supplier";
        return pathname.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-[#FAFBF8]">
            <header className="sticky top-0 z-50 border-b border-[#DDE5DC] bg-white/92 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-[72px] items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/auction" aria-label="ReStock by Ledger home">
                                <BrandLockup size="sm" priority />
                            </Link>
                            <div className="hidden items-center gap-1.5 rounded-lg bg-[#EDF3EC] px-2.5 py-1 sm:flex">
                                <Truck size={12} className="text-[#4F6F56]" />
                                <span className="text-[9px] font-bold tracking-wide text-[#4F6F56] uppercase">Supplier</span>
                            </div>
                        </div>
                        <nav className="hidden lg:flex items-center gap-0.5">
                            {supplierNav.map((item) => (
                                <Link key={item.href} href={item.href}>
                                    <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${isActive(item.href) ? "bg-[#4F6F56] text-white shadow-sm" : "text-[#666B66] hover:text-[#2F312F] hover:bg-[#F4F7F3]"}`}>
                                        <item.icon size={14} />
                                        <span>{item.label}</span>
                                    </div>
                                </Link>
                            ))}
                        </nav>
                        <div className="flex items-center gap-2">
                            <button className="relative p-2 rounded-xl hover:bg-[#F7F7F5] transition-colors">
                                <Bell size={16} className="text-[#6B7265]" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-[#C53030] rounded-full" />
                            </button>
                            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#E5E5E0]">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4F6F56] to-[#89A98D] flex items-center justify-center text-white text-[10px] font-bold">PF</div>
                                <span className="text-xs font-medium text-[#666B66]">Pacific Foods</span>
                            </div>
                            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-xl hover:bg-[#F7F7F5]">
                                {mobileOpen ? <X size={16} className="text-[#6B7265]" /> : <Menu size={16} className="text-[#6B7265]" />}
                            </button>
                            <Link href="/auction" className="hidden lg:block p-2 rounded-xl hover:bg-[#F7F7F5] transition-colors" title="Switch role">
                                <LogOut size={14} className="text-[#9CA38C]" />
                            </Link>
                        </div>
                    </div>
                </div>
                {mobileOpen && (
                    <div className="lg:hidden border-t border-[#E5E5E0] bg-white p-3 space-y-1">
                        {supplierNav.map((item) => (
                            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive(item.href) ? "bg-[#4F6F56] text-white" : "text-[#666B66] hover:bg-[#F4F7F3]"}`}>
                                    <item.icon size={16} />
                                    <span>{item.label}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </header>
            <main>{children}</main>
        </div>
    );
}
