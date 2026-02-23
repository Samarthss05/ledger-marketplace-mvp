"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Package, AlertTriangle, CheckCircle2, TrendingDown, RefreshCcw,
    Plus, Bell, Brain, Sparkles, Clock, Settings, BarChart3, Store,
    DollarSign, Search, Filter, Edit
} from "lucide-react";
import { formatCurrency } from "../../lib/mock-data";
import { products } from "../../lib/products-db";
import StatusBadge from "../../components/status-badge";

interface SupplierListing {
    id: string;
    productName: string;
    category: string;
    sku: string;
    availableStock: number;
    unit: string;
    directBuyPrice: number;
    auctionReservePrice: number;
    status: "active" | "low_stock" | "out_of_stock" | "draft";
    monthlySales: number;
    lastUpdated: string;
}

// Generate some mock listings for Pacific Foods (SUP-001) based on real products
const mockListings: SupplierListing[] = products.slice(0, 45).filter(p => ["Beverages", "Snacks", "Household"].includes(p.category)).map((p, i) => {
    const isOutOfStock = i % 12 === 0;
    const isLowStock = i % 5 === 0 && !isOutOfStock;
    const isDraft = i % 8 === 0 && !isOutOfStock && !isLowStock;

    let status: "active" | "low_stock" | "out_of_stock" | "draft" = "active";
    if (isOutOfStock) status = "out_of_stock";
    else if (isLowStock) status = "low_stock";
    else if (isDraft) status = "draft";

    const stock = status === "out_of_stock" ? 0 : status === "low_stock" ? 15 + (i % 20) : 100 + (i * 10 % 500);

    return {
        id: `lst-${i}`,
        productName: p.name,
        category: p.category,
        sku: `PF-${p.category.substring(0, 3).toUpperCase()}-${1000 + i}`,
        availableStock: stock,
        unit: p.category && p.category.includes("Beverage") ? "cans" : "packs",
        directBuyPrice: p.price,
        auctionReservePrice: p.price * 0.95, // Usually slightly cheaper in auctions
        status,
        monthlySales: 50 + (i % 200),
        lastUpdated: `Feb ${20 - (i % 15)}`,
    };
});

export default function SupplierInventoryPage() {
    const [listings, setListings] = useState(mockListings);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<"all" | "active" | "low_stock" | "out_of_stock" | "draft">("all");

    const filtered = listings.filter(l => {
        if (filter !== "all" && l.status !== filter) return false;
        if (searchQuery && !l.productName.toLowerCase().includes(searchQuery.toLowerCase()) && !l.sku.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const activeCount = listings.filter(l => l.status === "active").length;
    const lowStockCount = listings.filter(l => l.status === "low_stock").length;
    const outOfStockCount = listings.filter(l => l.status === "out_of_stock").length;

    const statusStyles = {
        active: { color: "bg-[#E8F5E9] text-[#2E7D32]", label: "Active Listed" },
        low_stock: { color: "bg-[#FFF8E1] text-[#F57F17]", label: "Low Stock" },
        out_of_stock: { color: "bg-[#FFEBEE] text-[#C62828]", label: "Out of Stock" },
        draft: { color: "bg-[#F7F7F5] text-[#6B7265]", label: "Draft" },
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#1A1A1A]">Inventory & Direct Sales</h1>
                    <p className="text-sm text-[#6B7265] mt-0.5">Manage your product catalog, direct buy prices, and stock levels</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-[#E5E5E0] bg-white text-sm font-medium text-[#6B7265] rounded-xl hover:bg-[#F7F7F5] shadow-sm">
                        <DollarSign size={16} /> Bulk Update Prices
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#2C432D] text-white text-sm font-bold rounded-xl hover:bg-[#1A2E1B] shadow-sm">
                        <Plus size={16} /> Add New Product
                    </button>
                </div>
            </motion.div>

            {/* Stats Overview */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Active Listings", value: activeCount, icon: Package, color: "text-[#2E7D32]", bg: "bg-[#E8F5E9]" },
                    { label: "Low Stock Items", value: lowStockCount, icon: AlertTriangle, color: "text-[#F57F17]", bg: "bg-[#FFF8E1]" },
                    { label: "Out of Stock", value: outOfStockCount, icon: Clock, color: "text-[#C62828]", bg: "bg-[#FFEBEE]" },
                    { label: "Direct Buy Revenue", value: "$42.5K", icon: DollarSign, color: "text-[#2C432D]", bg: "bg-[#E5E5E0]" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-[#E5E5E0] p-4 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                            <stat.icon size={18} />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-[#1A1A1A]">{stat.value}</p>
                            <p className="text-[10px] text-[#9CA38C] uppercase tracking-wide">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Controls */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-[#E5E5E0]">
                    <Search size={16} className="text-[#9CA38C]" />
                    <input
                        type="text"
                        placeholder="Search by product name or SKU..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-sm text-[#1A1A1A] placeholder:text-[#9CA38C] outline-none w-full"
                    />
                </div>
                <div className="flex bg-white border border-[#E5E5E0] rounded-xl overflow-hidden p-1">
                    {(["all", "active", "low_stock", "out_of_stock"] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${filter === f ? "bg-[#F7F7F5] text-[#1A1A1A] shadow-sm" : "text-[#6B7265] hover:text-[#1A1A1A]"}`}>
                            {f === "all" ? "All" : f === "low_stock" ? "Low Stock" : f === "out_of_stock" ? "Stockout" : "Active"}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Inventory Table */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-[#E5E5E0] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[#F7F7F5]">
                                <th className="text-left px-5 py-3 text-[10px] font-semibold text-[#9CA38C] uppercase tracking-wide">Product</th>
                                <th className="text-left px-5 py-3 text-[10px] font-semibold text-[#9CA38C] uppercase tracking-wide">Stock Level</th>
                                <th className="text-left px-5 py-3 text-[10px] font-semibold text-[#9CA38C] uppercase tracking-wide">Direct Buy Price</th>
                                <th className="text-left px-5 py-3 text-[10px] font-semibold text-[#9CA38C] uppercase tracking-wide">Auction Reserve</th>
                                <th className="text-left px-5 py-3 text-[10px] font-semibold text-[#9CA38C] uppercase tracking-wide">Status</th>
                                <th className="text-right px-5 py-3 text-[10px] font-semibold text-[#9CA38C] uppercase tracking-wide">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((item) => (
                                <tr key={item.id} className="border-b border-[#F0F0EC] hover:bg-[#F7F7F5] transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F7F7F5] to-[#E5E5E0] flex items-center justify-center text-[#9CA38C] flex-shrink-0">
                                                <Package size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-[#1A1A1A]">{item.productName}</p>
                                                <p className="text-[10px] text-[#9CA38C] mt-0.5">{item.sku} · {item.category}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-[#E5E5E0] rounded-full overflow-hidden max-w-[60px]">
                                                <div
                                                    className={`h-full ${item.status === 'out_of_stock' ? 'bg-[#C62828]' : item.status === 'low_stock' ? 'bg-[#F57F17]' : 'bg-[#4A6741]'}`}
                                                    style={{ width: `${Math.min((item.availableStock / 500) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <span className={`text-sm font-bold ${item.status === 'out_of_stock' ? 'text-[#C62828]' : 'text-[#1A1A1A]'}`}>
                                                {item.availableStock}
                                            </span>
                                            <span className="text-[10px] text-[#9CA38C]">{item.unit}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-sm font-bold text-[#2C432D]">{formatCurrency(item.directBuyPrice)}</span>
                                            {item.status === 'active' && (
                                                <span className="text-[8px] px-1.5 py-0.5 bg-[#E8F5E9] text-[#2E7D32] rounded font-bold uppercase">Live</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="text-sm font-medium text-[#6B7265]">{formatCurrency(item.auctionReservePrice)}</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${statusStyles[item.status].color}`}>
                                            {statusStyles[item.status].label}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <button className="p-1.5 hover:bg-white rounded-lg text-[#9CA38C] hover:text-[#4A6741] transition-colors border border-transparent hover:border-[#E5E5E0] shadow-sm">
                                            <Edit size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filtered.length === 0 && (
                        <div className="text-center py-16">
                            <Package size={32} className="text-[#9CA38C] mx-auto mb-3" />
                            <p className="text-sm font-medium text-[#6B7265]">No listings found</p>
                            <p className="text-[10px] text-[#9CA38C] mt-1">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
