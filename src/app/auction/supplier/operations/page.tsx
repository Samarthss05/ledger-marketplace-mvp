"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Package, Truck, MapPin, CheckCircle2, Clock, ArrowRight, AlertTriangle,
    Navigation, BarChart3, Calendar, Eye, Camera, FileText, Zap,
} from "lucide-react";
import { formatCurrency } from "../../lib/mock-data";
import { products } from "../../lib/products-db";

const fulfillmentPipeline = [
    { stage: "Won", count: 3, color: "bg-[#4A6741]", icon: CheckCircle2 },
    { stage: "Preparing", count: 2, color: "bg-[#F57F17]", icon: Package },
    { stage: "Shipped", count: 4, color: "bg-[#1565C0]", icon: Truck },
    { stage: "Delivered", count: 12, color: "bg-[#2E7D32]", icon: CheckCircle2 },
    { stage: "Paid", count: 10, color: "bg-[#B8860B]", icon: CheckCircle2 },
];

const p_milo = products.find(p => p.name.includes("Milo") && p.name.includes("400G")) || products[0];
const p_rice = products.find(p => p.name.includes("Basmati Rice 1KG")) || products[1];
const p_indomie = products.find(p => p.name.includes("Mi Goreng") && !p.name.includes("Carton")) || products[3];

const deliveries = [
    { id: "d1", product: p_milo.name, shops: ["RK Minimart", "Kedai Muthu", "Ah Kow Store"], qty: 600, status: "in_transit", eta: "2:30 PM", driver: "Juan D.", progress: 65 },
    { id: "d2", product: p_rice.name, shops: ["Lucky Express Mart", "Golden Mini Mart"], qty: 200, status: "preparing", eta: "Tomorrow", driver: "—", progress: 20 },
    { id: "d3", product: p_indomie.name, shops: ["RK Minimart", "Kuya Ben Store", "Ah Kow Store", "Lucky Express"], qty: 1200, status: "delivered", eta: "Done", driver: "Maria L.", progress: 100 },
];

const routeStops = [
    { shop: "RK Minimart", distance: "0km", time: "Start", items: 3, status: "next" },
    { shop: "Kedai Muthu", distance: "1.2km", time: "+8min", items: 2, status: "pending" },
    { shop: "Ah Kow Store Sari-Sari", distance: "2.4km", time: "+15min", items: 2, status: "pending" },
    { shop: "Lucky Express Mart", distance: "4.1km", time: "+25min", items: 4, status: "pending" },
    { shop: "Golden Mini Mart", distance: "5.8km", time: "+35min", items: 1, status: "pending" },
];

const capacity = {
    warehouse: { used: 72, total: 100, unit: "pallets" },
    vehicles: { used: 3, total: 5, unit: "trucks" },
    weekly: { used: 8, total: 12, unit: "deliveries" },
    items: { active: 5, maxConcurrent: 8 },
};

export default function OperationsPage() {
    const [view, setView] = useState<"fulfillment" | "delivery" | "route" | "capacity">("fulfillment");

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#1A1A1A]">Operations Hub</h1>
                    <p className="text-sm text-[#6B7265] mt-0.5">Fulfillment pipeline, delivery tracking, route optimization, and capacity</p>
                </div>
                <div className="flex bg-white border border-[#E5E5E0] rounded-xl overflow-hidden">
                    {(["fulfillment", "delivery", "route", "capacity"] as const).map(t => (
                        <button key={t} onClick={() => setView(t)} className={`px-3 py-2 text-xs font-medium ${view === t ? "bg-[#2C432D] text-white" : "text-[#6B7265]"}`}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
            </motion.div>

            {view === "fulfillment" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    {/* Pipeline */}
                    <div className="bg-white rounded-2xl border border-[#E5E5E0] p-5">
                        <h2 className="text-sm font-bold text-[#1A1A1A] mb-4">Fulfillment Pipeline</h2>
                        <div className="flex items-center gap-2">
                            {fulfillmentPipeline.map((step, i) => (
                                <div key={step.stage} className="flex items-center gap-2 flex-1">
                                    <div className="flex-1 text-center">
                                        <div className={`w-14 h-14 rounded-2xl ${step.color} mx-auto mb-2 flex items-center justify-center text-white`}>
                                            <div className="text-center"><p className="text-lg font-bold">{step.count}</p></div>
                                        </div>
                                        <p className="text-[10px] font-medium text-[#6B7265]">{step.stage}</p>
                                    </div>
                                    {i < fulfillmentPipeline.length - 1 && <ArrowRight size={14} className="text-[#E5E5E0] flex-shrink-0 mb-4" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Active deliveries */}
                    <div className="space-y-3">
                        {deliveries.map((del, i) => (
                            <motion.div key={del.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="bg-white rounded-2xl border border-[#E5E5E0] p-5 hover:shadow-md transition-all">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${del.status === "delivered" ? "bg-[#E8F5E9]" : del.status === "in_transit" ? "bg-[#E3F2FD]" : "bg-[#FFF8E1]"
                                            }`}>
                                            {del.status === "delivered" ? <CheckCircle2 size={18} className="text-[#2E7D32]" /> :
                                                del.status === "in_transit" ? <Truck size={18} className="text-[#1565C0]" /> : <Package size={18} className="text-[#F57F17]" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-[#1A1A1A]">{del.product}</p>
                                            <p className="text-[10px] text-[#9CA38C]">{del.qty} units → {del.shops.length} shops · Driver: {del.driver}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        <div className="w-32">
                                            <div className="flex justify-between text-[9px] text-[#9CA38C] mb-1"><span>{del.progress}%</span><span>ETA: {del.eta}</span></div>
                                            <div className="h-2 bg-[#F0F0EC] rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${del.status === "delivered" ? "bg-[#2E7D32]" : del.status === "in_transit" ? "bg-[#1565C0]" : "bg-[#F57F17]"}`}
                                                    style={{ width: `${del.progress}%` }} />
                                            </div>
                                        </div>
                                        <span className={`text-[9px] font-bold px-2 py-1 rounded ${del.status === "delivered" ? "bg-[#E8F5E9] text-[#2E7D32]" : del.status === "in_transit" ? "bg-[#E3F2FD] text-[#1565C0]" : "bg-[#FFF8E1] text-[#F57F17]"
                                            }`}>{del.status === "in_transit" ? "In Transit" : del.status.charAt(0).toUpperCase() + del.status.slice(1)}</span>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-[#F0F0EC] flex flex-wrap gap-1.5">
                                    {del.shops.map(shop => (
                                        <span key={shop} className="text-[9px] px-2 py-0.5 bg-[#F7F7F5] text-[#6B7265] rounded-full">{shop}</span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {view === "delivery" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="bg-white rounded-2xl border border-[#E5E5E0] p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-[#1565C0] animate-pulse" />
                            <h2 className="text-sm font-bold text-[#1A1A1A]">Live Delivery: Nestle Milo 400G</h2>
                            <span className="text-[9px] px-1.5 py-0.5 bg-[#E3F2FD] text-[#1565C0] rounded font-bold">IN TRANSIT</span>
                        </div>
                        <div className="bg-[#F7F7F5] rounded-xl p-8 mb-4 text-center">
                            <Navigation size={32} className="text-[#1565C0] mx-auto mb-2" />
                            <p className="text-sm text-[#6B7265]">Live GPS tracking map would render here</p>
                            <p className="text-xs text-[#9CA38C] mt-1">Driver: Juan D. · Vehicle: Truck #3 · ETA: 2:30 PM</p>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: "Shops Remaining", value: "2/3", icon: MapPin },
                                { label: "Items Delivered", value: "200/600", icon: Package },
                                { label: "Time Remaining", value: "45 min", icon: Clock },
                            ].map(s => (
                                <div key={s.label} className="bg-[#F7F7F5] rounded-xl p-3 text-center">
                                    <s.icon size={14} className="text-[#9CA38C] mx-auto mb-1" />
                                    <p className="text-sm font-bold text-[#1A1A1A]">{s.value}</p>
                                    <p className="text-[9px] text-[#9CA38C]">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-[#E5E5E0] p-5">
                        <h3 className="text-sm font-bold text-[#1A1A1A] mb-3">Proof of Delivery</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {["Photo Capture", "E-Signature", "Timestamp"].map(item => (
                                <div key={item} className="bg-[#F7F7F5] rounded-xl p-4 text-center">
                                    <Camera size={16} className="text-[#9CA38C] mx-auto mb-2" />
                                    <p className="text-xs font-medium text-[#6B7265]">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {view === "route" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-[#E3F2FD] to-[#E8F5E9] rounded-2xl border border-[#1565C0]/10">
                        <Zap size={14} className="text-[#1565C0] mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-[#1A1A1A]">AI-Optimized Route: 5 shops, 5.8km, ~35 minutes</p>
                            <p className="text-[10px] text-[#6B7265] mt-0.5">This route saves 12km and 40 minutes compared to the default delivery order.</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-[#E5E5E0] p-5">
                        <h2 className="text-sm font-bold text-[#1A1A1A] mb-4">Optimized Stop Order</h2>
                        <div className="space-y-0">
                            {routeStops.map((stop, i) => (
                                <div key={stop.shop} className="flex items-center gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${stop.status === "next" ? "bg-[#2C432D] text-white" : "bg-[#F7F7F5] text-[#6B7265]"
                                            }`}>{i + 1}</div>
                                        {i < routeStops.length - 1 && <div className="w-0.5 h-8 bg-[#E5E5E0]" />}
                                    </div>
                                    <div className={`flex-1 p-3 rounded-xl ${stop.status === "next" ? "bg-[#E8F5E9] border border-[#4A6741]/20" : "bg-[#F7F7F5]"}`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-bold text-[#1A1A1A]">{stop.shop}</p>
                                                <p className="text-[10px] text-[#9CA38C]">{stop.distance} · {stop.time} · {stop.items} items</p>
                                            </div>
                                            {stop.status === "next" && <span className="text-[8px] px-1.5 py-0.5 bg-[#4A6741] text-white rounded font-bold">NEXT</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {view === "capacity" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {[
                            { ...capacity.warehouse, label: "Warehouse", icon: Package, color: "bg-[#4A6741]" },
                            { ...capacity.vehicles, label: "Vehicles", icon: Truck, color: "bg-[#1565C0]" },
                            { ...capacity.weekly, label: "Weekly Deliveries", icon: Calendar, color: "bg-[#B8860B]" },
                        ].map((cap) => {
                            const pct = (cap.used / cap.total) * 100;
                            return (
                                <div key={cap.label} className="bg-white rounded-2xl border border-[#E5E5E0] p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <cap.icon size={14} className="text-[#9CA38C]" />
                                        <h3 className="text-sm font-bold text-[#1A1A1A]">{cap.label}</h3>
                                    </div>
                                    <p className="text-2xl font-bold text-[#1A1A1A]">{cap.used}<span className="text-sm text-[#9CA38C]">/{cap.total} {cap.unit}</span></p>
                                    <div className="mt-2 h-3 bg-[#F0F0EC] rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${pct >= 80 ? "bg-[#C53030]" : pct >= 60 ? "bg-[#F57F17]" : "bg-[#4A6741]"}`} style={{ width: `${pct}%` }} />
                                    </div>
                                    <p className="text-[10px] text-[#9CA38C] mt-1">{pct.toFixed(0)}% utilized · {cap.total - cap.used} {cap.unit} available</p>
                                </div>
                            );
                        })}
                    </div>
                    <div className="bg-white rounded-2xl border border-[#E5E5E0] p-5">
                        <h3 className="text-sm font-bold text-[#1A1A1A] mb-2">Capacity Recommendation</h3>
                        <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-[#F3E5F5] to-[#E8F5E9] rounded-xl">
                            <Zap size={14} className="text-[#7B1FA2] mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-[#1A1A1A]">You can take on {capacity.items.maxConcurrent - capacity.items.active} more auctions this week</p>
                                <p className="text-[10px] text-[#6B7265] mt-0.5">Based on your warehouse ({100 - capacity.warehouse.used}% free), vehicle ({capacity.vehicles.total - capacity.vehicles.used} available), and delivery capacity ({capacity.weekly.total - capacity.weekly.used} slots).</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
