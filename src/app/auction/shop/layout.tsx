"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLockup } from "@/components/brand-lockup";
import {
    Store, ClipboardList, Bell, LogOut,
    FileText, Package, Menu, X, CheckCircle2, PlusCircle
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const shopNav = [
    { label: "Dashboard", href: "/auction/shop", icon: Store },
    { label: "Create Order", href: "/auction/shop/orders/new", icon: PlusCircle },
    { label: "Requests", href: "/auction/shop/requests", icon: FileText },
    { label: "Orders", href: "/auction/shop/orders", icon: ClipboardList },
];

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    const notifications = [
        { id: "n1", title: "Quotes ready", desc: "Three supplier quotes are ready for your August replenishment order.", time: "10m ago", read: false, type: "success" },
        { id: "n2", title: "AI price insight", desc: "Your rice target could be reduced by 8% without limiting supplier coverage.", time: "2h ago", read: false, type: "alert" },
        { id: "n3", title: "Order Shipped", desc: "Order #ORD-2918 from Metro Foods is on its way.", time: "5h ago", read: true, type: "info" },
        { id: "n4", title: "Supplier responded", desc: "Pacific Foods submitted an offer for RFQ-4901.", time: "1d ago", read: true, type: "info" },
    ];

    const isActive = (href: string) => {
        if (href === "/auction/shop") return pathname === "/auction/shop";
        if (href === "/auction/shop/orders/new") {
            return pathname === "/auction/shop/orders/new";
        }
        if (href === "/auction/shop/orders") {
            return pathname === "/auction/shop/orders";
        }
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
                                <Store size={12} className="text-[#4F6F56]" />
                                <span className="text-[9px] font-bold tracking-wide text-[#4F6F56] uppercase">Retailer</span>
                            </div>
                        </div>

                        <nav className="hidden lg:flex items-center gap-0.5">
                            {shopNav.map((item) => (
                                <Link key={item.href} href={item.href}>
                                    <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${isActive(item.href) ? "bg-[#4F6F56] text-white shadow-sm" : "text-[#666B66] hover:text-[#2F312F] hover:bg-[#F4F7F3]"}`}>
                                        <item.icon size={14} />
                                        <span>{item.label}</span>
                                    </div>
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center gap-2">
                            <button onClick={() => setNotificationsOpen(true)} className="relative p-2 rounded-xl hover:bg-[#F7F7F5] transition-colors">
                                <Bell size={16} className="text-[#6B7265]" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-[#C53030] rounded-full" />
                            </button>
                            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#E5E5E0]">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4F6F56] to-[#89A98D] flex items-center justify-center text-white text-[10px] font-bold">RK</div>
                                <span className="text-xs font-medium text-[#666B66]">RK Minimart</span>
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
                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="lg:hidden border-t border-[#E5E5E0] bg-white p-3 space-y-1">
                        {shopNav.map((item) => (
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

            {/* Notification Slide-out Panel */}
            <AnimatePresence>
                {notificationsOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
                            onClick={() => setNotificationsOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "100%", boxShadow: "none" }} animate={{ x: 0, boxShadow: "-8px 0 24px rgba(0,0,0,0.1)" }} exit={{ x: "100%", boxShadow: "none" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 flex flex-col border-l border-[#E5E5E0]"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-[#E5E5E0]">
                                <h2 className="text-lg font-bold text-[#1A1A1A]">Notifications</h2>
                                <button onClick={() => setNotificationsOpen(false)} className="p-2 rounded-xl hover:bg-[#F7F7F5] transition-colors">
                                    <X size={16} className="text-[#6B7265]" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {notifications.map((n) => (
                                    <div key={n.id} className={`p-4 rounded-xl border ${n.read ? "bg-white border-[#E5E5E0]" : "bg-[#F7F7F5] border-[#4A6741]/20 shadow-sm"}`}>
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${n.type === "success" ? "bg-[#E8F5E9] text-[#2E7D32]" : n.type === "alert" ? "bg-[#FFF8E1] text-[#F57F17]" : "bg-[#E3F2FD] text-[#1565C0]"}`}>
                                                {n.type === "success" ? <CheckCircle2 size={14} /> : n.type === "alert" ? <Bell size={14} /> : <Package size={14} />}
                                            </div>
                                            <div>
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="text-sm font-bold text-[#1A1A1A]">{n.title}</h3>
                                                    <span className="text-[10px] text-[#9CA38C] whitespace-nowrap ml-2">{n.time}</span>
                                                </div>
                                                <p className="text-xs text-[#6B7265] leading-relaxed">{n.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 border-t border-[#E5E5E0] bg-[#F7F7F5]">
                                <button className="w-full py-2.5 bg-white border border-[#E5E5E0] rounded-xl text-sm font-semibold text-[#1A1A1A] hover:bg-[#F0F0EC] transition-colors shadow-sm">
                                    Mark all as read
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <main>{children}</main>
        </div>
    );
}
