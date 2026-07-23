"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShoppingCart, Plus, Trash2, ArrowRight, Package, AlertCircle,
    CheckCircle2, RefreshCcw,
} from "lucide-react";
import StatusBadge from "../../components/status-badge";
import { formatCurrency } from "../../lib/mock-data";
import { products } from "../../lib/products-db";

interface CartItem {
    id: string;
    productName: string;
    category: string;
    quantity: number;
    maxPrice: number;
    matched: boolean;
    matchedAuctionId?: string;
    matchedPrice?: number;
    savings?: number;
}

const p1 = products.find(p => p.name.includes("Milo") && p.name.includes("400G")) || products[0];
const p2 = products.find(p => p.name.includes("Basmati Rice 1KG")) || products[1];
const p3 = products.find(p => p.name.includes("Oyster Sauce 770G")) || products[2];
const p4 = products.find(p => p.name.includes("Mi Goreng") && p.name.includes("Carton")) || products.find(p => p.name.includes("Mi Goreng")) || products[3];
const p5 = products.find(p => p.name.includes("Pringles") && p.name.includes("149G")) || products[5];
const p6 = products.find(p => p.name.includes("Downy Expert")) || products[6];
const p7 = products.find(p => p.name.includes("Darlie") && p.name.includes("260G")) || products[7];
const p8 = products.find(p => p.name.includes("Egg 12 Pcs")) || products[4];
const initialCart: CartItem[] = [
    { id: "c1", productName: p1.name, category: p1.category, quantity: 200, maxPrice: p1.price, matched: true, matchedAuctionId: "AUC-001", matchedPrice: p1.cost + 0.2, savings: p1.price - (p1.cost + 0.2) },
    { id: "c2", productName: p2.name, category: p2.category, quantity: 100, maxPrice: p2.price, matched: true, matchedAuctionId: "AUC-002", matchedPrice: p2.cost + 0.02, savings: p2.price - (p2.cost + 0.02) },
    { id: "c3", productName: p3.name, category: p3.category, quantity: 80, maxPrice: p3.price, matched: true, matchedAuctionId: "AUC-003", matchedPrice: p3.cost + 0.15, savings: p3.price - (p3.cost + 0.15) },
    { id: "c4", productName: p4.name, category: p4.category, quantity: 300, maxPrice: p4.price, matched: true, matchedAuctionId: "AUC-004", matchedPrice: p4.cost + 0.1, savings: p4.price - (p4.cost + 0.1) },
    { id: "c5", productName: p5.name, category: p5.category, quantity: 120, maxPrice: p5.price, matched: false },
    { id: "c6", productName: p6.name, category: p6.category, quantity: 40, maxPrice: p6.price, matched: false },
    { id: "c7", productName: p7.name, category: p7.category, quantity: 60, maxPrice: p7.price, matched: false },
    { id: "c8", productName: p8.name, category: p8.category, quantity: 150, maxPrice: p8.price, matched: true, matchedAuctionId: "AUC-006", matchedPrice: p8.cost + 0.03, savings: p8.price - (p8.cost + 0.03) },
];

export default function SmartCart() {
    const [cart, setCart] = useState(initialCart);
    const [showAdd, setShowAdd] = useState(false);
    const [newProduct, setNewProduct] = useState("");
    const [newQty, setNewQty] = useState("");
    const [newMax, setNewMax] = useState("");
    const [autoMatch, setAutoMatch] = useState(true);

    const matched = cart.filter((c) => c.matched);
    const unmatched = cart.filter((c) => !c.matched);
    const totalSavings = matched.reduce((s, c) => s + (c.savings || 0) * c.quantity, 0);
    const totalCost = matched.reduce((s, c) => s + (c.matchedPrice || 0) * c.quantity, 0);

    const removeItem = (id: string) => setCart((prev) => prev.filter((c) => c.id !== id));

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#1A1A1A]">Procurement List</h1>
                    <p className="text-sm text-[#6B7265] mt-0.5">Build your weekly order and match items to available auctions.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowAdd(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#4A6741] text-white text-sm font-medium rounded-xl hover:bg-[#3D5A35] transition-colors shadow-sm">
                        <Plus size={14} /> Add Item
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#1A1A1A] text-sm font-medium rounded-xl border border-[#E5E5E0] hover:bg-[#F7F7F5]">
                        <RefreshCcw size={14} /> Re-match All
                    </button>
                </div>
            </motion.div>

            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Cart Items", value: cart.length.toString(), sub: `${matched.length} matched`, color: "bg-[#4A6741]" },
                    { label: "Matched Cost", value: formatCurrency(totalCost), sub: "auto-matched to auctions", color: "bg-[#3B6B9B]" },
                    { label: "Total Savings", value: formatCurrency(totalSavings), sub: "vs retail prices", color: "bg-[#2E7D32]" },
                    { label: "Unmatched", value: unmatched.length.toString(), sub: "waiting for auctions", color: "bg-[#B8860B]" },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-white rounded-2xl border border-[#E5E5E0] p-4">
                        <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center text-white mb-2`}><ShoppingCart size={14} /></div>
                        <p className="text-lg font-bold text-[#1A1A1A]">{s.value}</p>
                        <p className="text-[10px] text-[#9CA38C]">{s.sub}</p>
                    </motion.div>
                ))}
            </div>

            {/* Auto-match toggle */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="flex items-center justify-between bg-white rounded-2xl border border-[#E5E5E0] p-4">
                <div className="flex items-center gap-3">
                    <RefreshCcw size={16} className="text-[#4A6741]" />
                    <div>
                        <p className="text-sm font-bold text-[#1A1A1A]">Match to available auctions</p>
                        <p className="text-[10px] text-[#9CA38C]">ReStock checks your list against current supplier demand blocks.</p>
                    </div>
                </div>
                <button onClick={() => setAutoMatch(!autoMatch)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${autoMatch ? "bg-[#4A6741]" : "bg-[#E5E5E0]"}`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform shadow-sm ${autoMatch ? "translate-x-6" : "translate-x-1"}`} />
                </button>
            </motion.div>

            {/* Matched Items */}
            {matched.length > 0 && (
                <div>
                    <h2 className="text-sm font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-[#2E7D32]" /> Matched to Auctions ({matched.length})
                    </h2>
                    <div className="space-y-3">
                        {matched.map((item, i) => (
                            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + i * 0.05 }}
                                className="bg-white rounded-2xl border border-[#E5E5E0] p-4 hover:shadow-md transition-all">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                                            <Package size={16} className="text-[#4A6741]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-[#1A1A1A] truncate">{item.productName}</p>
                                            <p className="text-[10px] text-[#9CA38C]">{item.category} · {item.quantity} units · Max: ${item.maxPrice}/unit</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs line-through text-[#C53030]">${item.maxPrice}</span>
                                                <ArrowRight size={10} className="text-[#9CA38C]" />
                                                <span className="text-sm font-bold text-[#2E7D32]">${item.matchedPrice}/unit</span>
                                            </div>
                                            <p className="text-[10px] text-[#4A6741] font-bold">Save {formatCurrency((item.savings || 0) * item.quantity)}</p>
                                        </div>
                                        <StatusBadge status="active" />
                                        <button onClick={() => removeItem(item.id)} className="p-1.5 rounded-lg hover:bg-[#FFEBEE] text-[#9CA38C] hover:text-[#C53030] transition-colors">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Unmatched Items */}
            {unmatched.length > 0 && (
                <div>
                    <h2 className="text-sm font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
                        <AlertCircle size={14} className="text-[#B8860B]" /> Waiting for Auctions ({unmatched.length})
                    </h2>
                    <div className="space-y-3">
                        {unmatched.map((item, i) => (
                            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + i * 0.03 }}
                                className="bg-white rounded-2xl border border-dashed border-[#E5E5E0] p-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#FFF8E1] flex items-center justify-center flex-shrink-0">
                                        <Package size={16} className="text-[#B8860B]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[#1A1A1A]">{item.productName}</p>
                                        <p className="text-[10px] text-[#9CA38C]">{item.quantity} units · Max: ${item.maxPrice}/unit</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] px-2 py-0.5 bg-[#FFF8E1] text-[#B8860B] font-bold rounded-full">No auction yet</span>
                                        <button onClick={() => removeItem(item.id)} className="p-1.5 rounded-lg hover:bg-[#FFEBEE] text-[#9CA38C] hover:text-[#C53030]"><Trash2 size={12} /></button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Checkout */}
            {matched.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                    className="bg-white rounded-2xl border border-[#E5E5E0] p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-bold text-[#1A1A1A]">Ready to join {matched.length} auctions</p>
                            <p className="text-xs text-[#9CA38C]">Total: {formatCurrency(totalCost)} · Saving: {formatCurrency(totalSavings)}</p>
                        </div>
                        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4A6741] to-[#6B8F71] text-white text-sm font-bold rounded-xl hover:from-[#3D5A35] hover:to-[#5A7D61] shadow-lg shadow-[#4A6741]/20">
                            <ShoppingCart size={16} /> Join All Matched Auctions
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Add Item Modal */}
            <AnimatePresence>
                {showAdd && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowAdd(false)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-base font-bold text-[#1A1A1A] mb-4">Add to Cart</h3>
                            <div className="space-y-3">
                                <div><label className="text-xs font-medium text-[#1A1A1A] block mb-1">Product Name</label><input type="text" value={newProduct} onChange={(e) => setNewProduct(e.target.value)} placeholder="e.g. Nestle Milo 400G" className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none focus:border-[#4A6741]" /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="text-xs font-medium text-[#1A1A1A] block mb-1">Quantity</label><input type="number" value={newQty} onChange={(e) => setNewQty(e.target.value)} placeholder="e.g. 100" className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none focus:border-[#4A6741]" /></div>
                                    <div><label className="text-xs font-medium text-[#1A1A1A] block mb-1">Max Price/Unit ($)</label><input type="number" value={newMax} onChange={(e) => setNewMax(e.target.value)} placeholder="e.g. 150" className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none focus:border-[#4A6741]" /></div>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-5">
                                <button onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2.5 border border-[#E5E5E0] text-sm font-medium text-[#6B7265] rounded-xl">Cancel</button>
                                <button onClick={() => { setCart(prev => [...prev, { id: `c${Date.now()}`, productName: newProduct, category: "General", quantity: Number(newQty), maxPrice: Number(newMax), matched: false }]); setShowAdd(false); setNewProduct(""); setNewQty(""); setNewMax(""); }}
                                    className="flex-1 px-4 py-2.5 bg-[#4A6741] text-white text-sm font-medium rounded-xl">Add Item</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
