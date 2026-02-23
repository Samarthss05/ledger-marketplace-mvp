"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    Truck, LayoutDashboard, Gavel, ClipboardList, BarChart3, Bell, LogOut,
    Bot, Brain, Package, Wallet, Award, Users, ChevronDown, Menu, X,
} from "lucide-react";

const supplierNav = [
    { label: "Dashboard", href: "/auction/supplier", icon: LayoutDashboard },
    { label: "Auctions", href: "/auction/supplier/auctions", icon: Gavel },
    { label: "Auto-Bidder", href: "/auction/supplier/auto-bidder", icon: Bot },
    { label: "Intelligence", href: "/auction/supplier/intelligence", icon: Brain },
    { label: "Operations", href: "/auction/supplier/operations", icon: Package },
    { label: "My Bids", href: "/auction/supplier/bids", icon: ClipboardList },
    { label: "Inventory", href: "/auction/supplier/inventory", icon: Package },
    { label: "Finance", href: "/auction/supplier/finance", icon: Wallet },
    { label: "Reputation", href: "/auction/supplier/reputation", icon: Award },
    { label: "Shop CRM", href: "/auction/supplier/crm", icon: Users },
    { label: "Performance", href: "/auction/supplier/performance", icon: BarChart3 },
];

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === "/auction/supplier") return pathname === "/auction/supplier";
        return pathname.startsWith(href);
    };

    const primaryNav = supplierNav.slice(0, 6);
    const secondaryNav = supplierNav.slice(6);

    return (
        <div className="min-h-screen bg-[#F7F7F5]">
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[#E5E5E0]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14">
                        <div className="flex items-center gap-4">
                            <Link href="/auction" className="flex items-center gap-2">
                                <Image src="/logo.png" alt="Ledger" width={28} height={28} className="rounded-lg" />
                                <span className="text-base font-bold tracking-tight text-[#2C432D] hidden sm:block">Ledger</span>
                            </Link>
                            <div className="h-5 w-px bg-[#E5E5E0]" />
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#2C432D] rounded-lg">
                                <Truck size={12} className="text-white" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-wide">Supplier Portal</span>
                            </div>
                        </div>
                        <nav className="hidden lg:flex items-center gap-0.5">
                            {primaryNav.map((item) => (
                                <Link key={item.href} href={item.href}>
                                    <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${isActive(item.href) ? "bg-[#2C432D] text-white shadow-sm" : "text-[#6B7265] hover:text-[#1A1A1A] hover:bg-[#F7F7F5]"}`}>
                                        <item.icon size={14} />
                                        <span>{item.label}</span>
                                    </div>
                                </Link>
                            ))}
                            <div className="relative group">
                                <button className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-[#6B7265] hover:text-[#1A1A1A] hover:bg-[#F7F7F5] transition-all">
                                    More <ChevronDown size={12} />
                                </button>
                                <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-xl border border-[#E5E5E0] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1.5">
                                    {secondaryNav.map((item) => (
                                        <Link key={item.href} href={item.href}>
                                            <div className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors ${isActive(item.href) ? "bg-[#E8F5E9] text-[#2C432D]" : "text-[#6B7265] hover:bg-[#F7F7F5]"}`}>
                                                <item.icon size={14} />
                                                <span>{item.label}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </nav>
                        <div className="flex items-center gap-2">
                            <button className="relative p-2 rounded-xl hover:bg-[#F7F7F5] transition-colors">
                                <Bell size={16} className="text-[#6B7265]" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-[#C53030] rounded-full" />
                            </button>
                            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#E5E5E0]">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2C432D] to-[#4A6741] flex items-center justify-center text-white text-[10px] font-bold">PF</div>
                                <span className="text-xs font-medium text-[#6B7265]">Pacific Foods</span>
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
                                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive(item.href) ? "bg-[#2C432D] text-white" : "text-[#6B7265] hover:bg-[#F7F7F5]"}`}>
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
