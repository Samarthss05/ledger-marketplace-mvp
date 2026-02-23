"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Clock, Users, Gavel, ArrowRight, ShoppingBag, TrendingDown,
    CheckCircle2, X, Star, Eye, LayoutGrid, List, SlidersHorizontal, Share2, Package, Sparkles, Truck, ShieldCheck
} from "lucide-react";
import StatusBadge from "../../components/status-badge";
import { auctions, formatCurrency, type Auction } from "../../lib/mock-data";
import { products } from "../../lib/products-db";

type TypeFilter = "all" | "sealed" | "english" | "dutch";
type SortOption = "ending" | "price" | "savings" | "quantity";

export default function ShopMarketplace() {
    const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
    const [catFilter, setCatFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
    const [joinedAuctions, setJoinedAuctions] = useState<Set<string>>(new Set());
    const [favorites, setFavorites] = useState<Set<string>>(new Set(["AUC-003"]));
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [sortBy, setSortBy] = useState<SortOption>("ending");
    const [compareMode, setCompareMode] = useState(false);
    const [compareList, setCompareList] = useState<string[]>([]);
    const [procurementMode, setProcurementMode] = useState<"auction" | "direct">("auction");
    const [showRfqModal, setShowRfqModal] = useState(false);

    const marketAuctions = auctions.filter((a) => a.status === "active" || a.status === "pending");
    const categories = [...new Set(marketAuctions.map((a) => a.productCategory))];

    const filtered = marketAuctions
        .filter((a) => {
            if (typeFilter !== "all" && a.auctionType !== typeFilter) return false;
            if (catFilter !== "all" && a.productCategory !== catFilter) return false;
            if (searchQuery && !a.productName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === "price") {
                const aPrice = a.bids.length ? Math.min(...a.bids.map(bi => bi.pricePerUnit)) : a.reservePrice;
                const bPrice = b.bids.length ? Math.min(...b.bids.map(bi => bi.pricePerUnit)) : b.reservePrice;
                return aPrice - bPrice;
            }
            if (sortBy === "savings") {
                const aSav = a.bids.length ? (a.reservePrice - Math.min(...a.bids.map(bi => bi.pricePerUnit))) / a.reservePrice : 0;
                const bSav = b.bids.length ? (b.reservePrice - Math.min(...b.bids.map(bi => bi.pricePerUnit))) / b.reservePrice : 0;
                return bSav - aSav;
            }
            if (sortBy === "quantity") return b.totalQuantity - a.totalQuantity;
            return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
        });

    const filteredProducts = products
        .filter((p) => {
            if (catFilter !== "all" && p.category !== catFilter) return false;
            if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === "price") return a.price - b.price;
            return a.name.localeCompare(b.name);
        });

    const handleJoin = (auctionId: string) => {
        setJoinedAuctions((prev) => new Set([...prev, auctionId]));
        setSelectedAuction(null);
    };
    const toggleFav = (id: string) => setFavorites(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    const toggleCompare = (id: string) => {
        setCompareList(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-[#1A1A1A]">
                        {procurementMode === "auction" ? "Auction Marketplace" : "Direct Buy Catalog"}
                    </h1>
                    <p className="text-sm text-[#6B7265] mt-0.5">
                        {procurementMode === "auction" ? `${filtered.length} auctions available` : `${filteredProducts.length} products available for direct purchase`}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {procurementMode === "auction" && (
                        <button onClick={() => { setCompareMode(!compareMode); setCompareList([]); }}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl transition-all ${compareMode ? "bg-[#4A6741] text-white" : "bg-white border border-[#E5E5E0] text-[#6B7265]"}`}>
                            <Eye size={12} /> Compare
                        </button>
                    )}
                    <button onClick={() => setShowRfqModal(true)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all bg-[#F0F4EE] text-[#4A6741] hover:bg-[#E2EBE0]">
                        <Share2 size={12} /> Create RFQ
                    </button>
                    <div className="flex bg-white border border-[#E5E5E0] rounded-xl overflow-hidden ml-1">
                        <button onClick={() => setViewMode("grid")} className={`p-2 ${viewMode === "grid" ? "bg-[#4A6741] text-white" : "text-[#9CA38C]"}`}><LayoutGrid size={14} /></button>
                        <button onClick={() => setViewMode("list")} className={`p-2 ${viewMode === "list" ? "bg-[#4A6741] text-white" : "text-[#9CA38C]"}`}><List size={14} /></button>
                    </div>
                </div>
            </motion.div>

            {/* Procurement Mode Toggle */}
            <div className="flex bg-white border border-[#E5E5E0] rounded-xl overflow-hidden self-start p-1.5 w-full md:w-auto mt-2">
                <button
                    onClick={() => setProcurementMode("auction")}
                    className={`flex-1 flex justify-center items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${procurementMode === "auction" ? "bg-[#4A6741] text-white shadow-sm" : "text-[#6B7265] hover:bg-[#F7F7F5]"}`}
                >
                    <Gavel size={16} /> Live Auctions
                </button>
                <button
                    onClick={() => setProcurementMode("direct")}
                    className={`flex-1 flex justify-center items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${procurementMode === "direct" ? "bg-[#1A1A1A] text-white shadow-sm" : "text-[#6B7265] hover:bg-[#F7F7F5]"}`}
                >
                    <Package size={16} /> Direct Buy
                </button>
            </div>

            {/* Search + Sort */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="flex flex-col sm:flex-row gap-3 mt-4">
                <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-[#E5E5E0]">
                    <Search size={16} className="text-[#9CA38C]" />
                    <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-sm text-[#1A1A1A] placeholder:text-[#9CA38C] outline-none w-full" />
                </div>
                <div className="flex items-center gap-1 bg-white border border-[#E5E5E0] rounded-xl px-3">
                    <SlidersHorizontal size={14} className="text-[#9CA38C]" />
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="bg-transparent text-sm text-[#6B7265] outline-none py-2.5 pr-2">
                        <option value="ending">Ending Soon</option>
                        <option value="price">Lowest Price</option>
                        <option value="savings">Highest Savings</option>
                        <option value="quantity">Largest Volume</option>
                    </select>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="flex flex-wrap gap-2">
                <button onClick={() => setCatFilter("all")} className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${catFilter === "all" ? "bg-[#4A6741] text-white" : "bg-white text-[#6B7265] border border-[#E5E5E0] hover:bg-[#F7F7F5]"}`}>
                    All Products
                </button>
                {categories.map((cat) => (
                    <button key={cat} onClick={() => setCatFilter(cat)} className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${catFilter === cat ? "bg-[#4A6741] text-white" : "bg-white text-[#6B7265] border border-[#E5E5E0] hover:bg-[#F7F7F5]"}`}>
                        {cat}
                    </button>
                ))}
                {procurementMode === "auction" && (
                    <>
                        <div className="w-px h-6 bg-[#E5E5E0] self-center mx-1" />
                        {(["all", "sealed", "english", "dutch"] as TypeFilter[]).map((t) => (
                            <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wide transition-all ${typeFilter === t ? "bg-[#1A1A1A] text-white" : "bg-white text-[#9CA38C] border border-[#E5E5E0]"}`}>
                                {t === "all" ? "All Types" : t}
                            </button>
                        ))}
                    </>
                )}
            </motion.div>

            {/* Compare Bar */}
            <AnimatePresence>
                {compareMode && compareList.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="bg-white rounded-2xl border border-[#4A6741]/30 p-4 overflow-hidden">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-bold text-[#1A1A1A]">Comparing {compareList.length} auctions (select up to 3)</p>
                            <button onClick={() => setCompareList([])} className="text-xs text-[#9CA38C]">Clear</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {compareList.map(id => {
                                const a = auctions.find(x => x.id === id)!;
                                const low = a.bids.length ? Math.min(...a.bids.map(b => b.pricePerUnit)) : null;
                                return (
                                    <div key={id} className="bg-[#F7F7F5] rounded-xl p-3 space-y-1.5">
                                        <p className="text-xs font-bold text-[#1A1A1A]">{a.productName}</p>
                                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                                            <div><span className="text-[#9CA38C]">Best Price:</span> <span className="font-bold text-[#4A6741]">{low ? `$${low}` : "N/A"}</span></div>
                                            <div><span className="text-[#9CA38C]">Reserve:</span> <span className="font-bold">${a.reservePrice}</span></div>
                                            <div><span className="text-[#9CA38C]">Quantity:</span> <span className="font-bold">{a.totalQuantity.toLocaleString()}</span></div>
                                            <div><span className="text-[#9CA38C]">Shops:</span> <span className="font-bold">{a.participatingShops}</span></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Grid */}
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3"}>
                {procurementMode === "auction" && filtered.map((auction, i) => {
                    const lowestBid = auction.bids.length > 0 ? Math.min(...auction.bids.map(b => b.pricePerUnit)) : null;
                    const savings = lowestBid ? ((auction.reservePrice - lowestBid) / auction.reservePrice * 100).toFixed(0) : null;
                    const joined = joinedAuctions.has(auction.id);
                    const isFav = favorites.has(auction.id);
                    const isCompared = compareList.includes(auction.id);

                    if (viewMode === "list") {
                        return (
                            <motion.div key={auction.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }}
                                className={`bg-white rounded-xl border ${isCompared ? "border-[#4A6741]" : "border-[#E5E5E0]"} p-4 hover:shadow-md transition-all`}>
                                <div className="flex items-center gap-4">
                                    {compareMode && <input type="checkbox" checked={isCompared} onChange={() => toggleCompare(auction.id)} className="accent-[#4A6741] w-4 h-4" />}
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4A6741] to-[#6B8F71] flex items-center justify-center text-white flex-shrink-0"><ShoppingBag size={16} /></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-[#1A1A1A]">{auction.productName}</p>
                                            <StatusBadge status={auction.status} />
                                            <StatusBadge status={auction.auctionType} />
                                        </div>
                                        <p className="text-[10px] text-[#9CA38C] mt-0.5">{auction.totalQuantity.toLocaleString()} units · {auction.participatingShops} shops · {auction.bids.length} bids</p>
                                    </div>
                                    <CountdownTimer endTime={auction.endTime} />
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-[#1A1A1A]">{lowestBid ? `$${lowestBid}` : `$${auction.reservePrice}`}/unit</p>
                                        {savings && <span className="text-[10px] font-bold text-[#4A6741]">-{savings}%</span>}
                                    </div>
                                    <button onClick={() => toggleFav(auction.id)} className="p-1.5"><Star size={14} className={isFav ? "fill-[#B8860B] text-[#B8860B]" : "text-[#9CA38C]"} /></button>
                                    {joined ? <span className="text-[10px] font-bold text-[#4A6741]">✓ Joined</span> : (
                                        <button onClick={() => setSelectedAuction(auction)} className="px-3 py-1.5 bg-[#4A6741] text-white text-xs font-medium rounded-lg hover:bg-[#3D5A35]">Join</button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    }

                    return (
                        <motion.div key={auction.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.05 * i }}
                            className={`bg-white rounded-2xl border ${isCompared ? "border-[#4A6741] ring-1 ring-[#4A6741]/20" : "border-[#E5E5E0]"} overflow-hidden hover:shadow-xl hover:shadow-[#4A6741]/8 hover:border-[#4A6741]/20 transition-all duration-300 group`}>
                            <div className={`h-1 w-full ${auction.status === "active" ? "bg-gradient-to-r from-[#4A6741] to-[#6B8F71]" : "bg-[#E5E5E0]"}`} />
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-1.5">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <h3 className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#4A6741] transition-colors">{auction.productName}</h3>
                                        <p className="text-[10px] text-[#9CA38C] mt-0.5">{auction.productCategory}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {compareMode && <input type="checkbox" checked={isCompared} onChange={() => toggleCompare(auction.id)} className="accent-[#4A6741] w-3.5 h-3.5" />}
                                        <button onClick={() => toggleFav(auction.id)} className="p-1"><Star size={13} className={isFav ? "fill-[#B8860B] text-[#B8860B]" : "text-[#9CA38C]"} /></button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 mb-3"><StatusBadge status={auction.status} /><StatusBadge status={auction.auctionType} /><CountdownTimer endTime={auction.endTime} /></div>
                                <div className="grid grid-cols-3 gap-3 mb-4 py-3 border-y border-[#F0F0EC]">
                                    {[
                                        { icon: Gavel, label: "Bids", value: auction.bids.length },
                                        { icon: Users, label: "Shops", value: auction.participatingShops },
                                        { icon: ShoppingBag, label: "Qty", value: auction.totalQuantity.toLocaleString() },
                                    ].map(s => (
                                        <div key={s.label} className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-[10px] text-[#9CA38C] mb-0.5"><s.icon size={9} /><span>{s.label}</span></div>
                                            <p className="text-sm font-bold text-[#1A1A1A]">{s.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-end justify-between mb-4">
                                    <div>
                                        <p className="text-[10px] text-[#9CA38C] uppercase tracking-wide mb-0.5">{lowestBid ? "Best Price" : "Reserve"}</p>
                                        <span className="text-xl font-bold text-[#1A1A1A]">${lowestBid ? lowestBid.toLocaleString() : auction.reservePrice.toLocaleString()}</span>
                                        <span className="text-xs text-[#9CA38C]">/unit</span>
                                    </div>
                                    {savings && (
                                        <div className="flex items-center gap-1 px-2.5 py-1 bg-[#E8F5E9] rounded-lg">
                                            <TrendingDown size={10} className="text-[#2E7D32]" />
                                            <span className="text-xs font-bold text-[#2E7D32]">{savings}% off</span>
                                        </div>
                                    )}
                                </div>
                                {joined ? (
                                    <div className="flex items-center justify-center gap-2 py-2.5 bg-[#E8F5E9] text-[#2E7D32] text-sm font-medium rounded-xl">
                                        <CheckCircle2 size={14} /> Joined
                                    </div>
                                ) : (
                                    <button onClick={() => setSelectedAuction(auction)}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#4A6741] text-white text-sm font-medium rounded-xl hover:bg-[#3D5A35] transition-colors shadow-sm">
                                        <ShoppingBag size={14} /> Join Auction
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
                {procurementMode === "direct" && filteredProducts.map((product, i) => {
                    const isFav = favorites.has(product.id);
                    const supplier = ["Metro Foods", "RK Wholesale", "Pacific Distributors", "Golden Supply Co"][i % 4];
                    const isVerified = i % 2 === 0;
                    const tag = i % 5 === 0 ? "🔥 Bestseller" : i % 3 === 0 ? "💰 Bulk Discount" : null;
                    const delivery = ["Tomorrow", "2 Days", "3 Days"][i % 3];
                    const moq = [10, 50, 100, 20][i % 4];
                    const discountTier = [5, 10, 15, 8][i % 4];

                    if (viewMode === "list") {
                        return (
                            <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }}
                                className={`bg-white rounded-xl border ${tag ? "border-[#B8860B]/30" : "border-[#E5E5E0]"} p-4 hover:shadow-md transition-all relative overflow-hidden group`}>
                                {tag && <div className="absolute top-0 right-0 bg-gradient-to-l from-[#FFF8E1] to-transparent pl-8 pr-4 py-1 text-[9px] font-bold text-[#F57F17]">{tag}</div>}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F7F7F5] to-[#E5E5E0] flex items-center justify-center text-[#1A1A1A] flex-shrink-0 border border-[#E5E5E0]/50 shadow-inner group-hover:scale-105 transition-transform"><Package size={20} className="text-[#6B7265]" /></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#4A6741] transition-colors">{product.name}</p>
                                            {isVerified && <ShieldCheck size={12} className="text-[#2E7D32]" />}
                                        </div>
                                        <p className="text-[10px] text-[#9CA38C] mb-2">{product.category}</p>
                                        <div className="flex flex-wrap items-center gap-3 text-[10px]">
                                            <span className="flex items-center gap-1 text-[#6B7265] bg-[#F7F7F5] px-1.5 py-0.5 rounded border border-[#E5E5E0]/50"><Truck size={10} /> Delivery: {delivery}</span>
                                            <span className="text-[#9CA38C]">MOQ: <strong className="text-[#6B7265]">{moq}</strong> units</span>
                                            <span className="text-[#4A6741] font-medium bg-[#E8F5E9] px-1.5 py-0.5 rounded">Save {discountTier}% on {moq * 5}+ units</span>
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right flex-shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center mt-3 sm:mt-0 gap-2 sm:gap-0">
                                        <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
                                            <p className="text-lg font-bold text-[#1A1A1A] leading-none sm:mb-1">{formatCurrency(product.price)}<span className="text-[10px] text-[#9CA38C] font-normal">/unit</span></p>
                                            <span className="text-[9px] font-bold text-[#2E7D32] uppercase tracking-wider bg-[#E8F5E9] px-1.5 py-0.5 rounded sm:bg-transparent sm:p-0">In Stock</span>
                                        </div>
                                        <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:ml-4 sm:border-l sm:border-[#F0F0EC] sm:pl-4">
                                            <button onClick={() => toggleFav(product.id)} className="p-1.5 rounded-lg border border-[#E5E5E0] sm:border-transparent hover:bg-[#F7F7F5] transition-colors"><Star size={14} className={isFav ? "fill-[#B8860B] text-[#B8860B]" : "text-[#9CA38C]"} /></button>
                                            <button className="px-5 py-2 bg-[#1A1A1A] text-white text-xs font-bold rounded-xl hover:bg-black hover:shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 shrink-0">Add to Cart</button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    }
                    return (
                        <motion.div key={product.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.05 * i }}
                            className={`bg-white rounded-2xl border ${tag ? "border-[#B8860B]/30" : "border-[#E5E5E0]"} overflow-hidden hover:shadow-xl hover:shadow-[#4A6741]/5 hover:border-[#4A6741]/30 transition-all duration-300 group flex flex-col relative`}>
                            {tag && <div className="absolute top-3 left-3 bg-[#FFF8E1] text-[#F57F17] text-[9px] font-bold px-2.5 py-1 rounded-md border border-[#F57F17]/20 shadow-sm z-10">{tag}</div>}

                            <div className={`h-24 w-full flex flex-col justify-end p-4 relative ${tag ? "bg-gradient-to-br from-[#FFF8E1]/40 to-white" : "bg-gradient-to-br from-[#F7F7F5] to-white"}`}>
                                <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                                    <button onClick={() => toggleFav(product.id)} className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white shadow-sm transition-all text-[#9CA38C] border border-[#E5E5E0]/50"><Star size={14} className={isFav ? "fill-[#B8860B] text-[#B8860B]" : ""} /></button>
                                </div>
                                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-[#E5E5E0] flex items-center justify-center mx-auto absolute -bottom-7 left-5 z-10 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                                    <Package size={24} className="text-[#4A6741]" />
                                </div>
                            </div>

                            <div className="p-5 pt-10 flex flex-col flex-1 relative z-0">
                                <div className="flex-1 min-w-0 mb-4">
                                    <div className="flex items-start gap-2 mb-1.5 pr-2">
                                        <h3 className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#4A6741] transition-colors leading-tight line-clamp-2">{product.name}</h3>
                                        {isVerified && <ShieldCheck size={14} className="text-[#2E7D32] flex-shrink-0 mt-0.5" />}
                                    </div>
                                    <p className="text-[10px] text-[#9CA38C]">{product.category}</p>

                                    <div className="mt-4 p-3 bg-[#F7F7F5] rounded-xl border border-[#E5E5E0]/60 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-medium text-[#6B7265] flex items-center gap-1.5"><Truck size={12} className="text-[#9CA38C]" /> Delivery Time</span>
                                            <span className="text-[10px] font-bold text-[#1A1A1A]">{delivery}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-[#E5E5E0] pt-2">
                                            <span className="text-[9px] text-[#9CA38C]">MOQ: <strong className="text-[#6B7265]">{moq}</strong></span>
                                            <span className="text-[9px] font-bold text-[#4A6741]">Bulk: -{discountTier}% (&gt;{moq * 5})</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-end justify-between mb-5">
                                    <div>
                                        <p className="text-[10px] text-[#9CA38C] uppercase tracking-wide mb-0.5 font-medium">Fixed Price</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-[#1A1A1A] tracking-tight">{formatCurrency(product.price)}</span>
                                            <span className="text-xs text-[#9CA38C] font-medium">/unit</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-[#2E7D32] bg-[#E8F5E9] px-2 py-1.5 rounded-lg border border-[#2E7D32]/10">In Stock</span>
                                </div>

                                <button className="w-full relative overflow-hidden group/btn flex items-center justify-center gap-2 py-3 bg-[#1A1A1A] text-white text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                                    <ShoppingBag size={14} className="group-hover/btn:scale-110 transition-transform" /> Add to Cart
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {procurementMode === "auction" && filtered.length === 0 && (
                <div className="text-center py-20 bg-[#F7F7F5]/50 rounded-3xl border border-[#E5E5E0]/60">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm border border-[#E5E5E0]">
                        <Search size={24} className="text-[#9CA38C]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">No active auctions found</h3>
                    <p className="text-sm text-[#6B7265] mb-8 max-w-md mx-auto">There are currently no live auctions matching your exact criteria. Don't worry, you have other options.</p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onClick={() => setShowRfqModal(true)} className="flex items-center gap-2 px-6 py-3 bg-[#4A6741] text-white text-sm font-bold rounded-xl hover:bg-[#3D5A35] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                            <Share2 size={16} /> Request for Quote (RFQ)
                        </button>
                        <button onClick={() => setProcurementMode("direct")} className="flex items-center gap-2 px-6 py-3 bg-white border border-[#E5E5E0] text-[#1A1A1A] text-sm font-bold rounded-xl hover:bg-[#F7F7F5] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                            <Package size={16} /> Check Direct Buy Catalog
                        </button>
                    </div>

                    {/* AI Substitutes */}
                    {searchQuery && (
                        <div className="mt-12 text-left border-t border-[#F0F0EC] p-6">
                            <h4 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2 mb-4">
                                <Sparkles size={14} className="text-[#B8860B]" /> AI Suggested Alternatives
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {products.filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3).map((sub, i) => (
                                    <div key={i} className="p-4 bg-[#F7F7F5] rounded-xl border border-[#E5E5E0]/50 hover:border-[#4A6741]/30 transition-colors">
                                        <p className="text-xs font-bold text-[#1A1A1A] mb-1">{sub.name}</p>
                                        <p className="text-[10px] text-[#9CA38C] mb-2">Based on your search</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-[#2C432D]">{formatCurrency(sub.price)}</span>
                                            <button className="text-[10px] font-bold text-[#4A6741] uppercase tracking-wide">View Options</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {procurementMode === "direct" && filteredProducts.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-[#E5E5E0]">
                    <Search size={32} className="text-[#9CA38C] mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">No products found</h3>
                    <p className="text-sm text-[#6B7265] mb-6 max-w-sm mx-auto">There are currently no direct buy listings matching your criteria.</p>
                    <button onClick={() => setProcurementMode("auction")} className="flex items-center gap-2 px-5 py-2.5 mx-auto bg-white border border-[#E5E5E0] text-[#1A1A1A] text-sm font-bold rounded-xl hover:bg-[#F7F7F5] transition-colors shadow-sm">
                        <Gavel size={16} /> Check Live Auctions
                    </button>
                </div>
            )}

            {/* RFQ Modal */}
            <AnimatePresence>
                {showRfqModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                        onClick={() => setShowRfqModal(false)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-start justify-between mb-4">
                                <div><h3 className="text-lg font-bold text-[#1A1A1A]">Create RFQ</h3><p className="text-xs text-[#9CA38C] mt-0.5">Alert suppliers of your demand</p></div>
                                <button onClick={() => setShowRfqModal(false)} className="p-1.5 rounded-lg hover:bg-[#F7F7F5]"><X size={16} className="text-[#9CA38C]" /></button>
                            </div>
                            <div className="mb-4">
                                <label className="text-xs font-medium text-[#1A1A1A] block mb-1.5">Product Name</label>
                                <input type="text" defaultValue={searchQuery} placeholder="What do you need?" className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none focus:border-[#4A6741] focus:ring-1 focus:ring-[#4A6741]/20" />
                            </div>
                            <div className="flex gap-4 mb-4">
                                <div className="flex-1">
                                    <label className="text-xs font-medium text-[#1A1A1A] block mb-1.5">Quantity</label>
                                    <input type="number" placeholder="500" className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none focus:border-[#4A6741] focus:ring-1 focus:ring-[#4A6741]/20" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-medium text-[#1A1A1A] block mb-1.5">Unit</label>
                                    <select className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none">
                                        <option>Cartons</option>
                                        <option>Pieces</option>
                                        <option>Pallets</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 accent-[#4A6741] rounded" defaultChecked />
                                    <span className="text-xs text-[#1A1A1A] font-medium">Post to Community Hub to attract group buying?</span>
                                </label>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowRfqModal(false)} className="flex-1 px-4 py-2.5 border border-[#E5E5E0] text-sm font-medium text-[#6B7265] rounded-xl hover:bg-[#F7F7F5]">Cancel</button>
                                <button onClick={() => setShowRfqModal(false)} className="flex-1 px-4 py-2.5 bg-[#4A6741] text-white text-sm font-medium rounded-xl hover:bg-[#3D5A35] shadow-sm">Submit RFQ</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Join Modal */}
            <AnimatePresence>
                {selectedAuction && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                        onClick={() => setSelectedAuction(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-start justify-between mb-4">
                                <div><h3 className="text-base font-bold text-[#1A1A1A]">Join Auction</h3><p className="text-xs text-[#9CA38C] mt-0.5">{selectedAuction.productName}</p></div>
                                <button onClick={() => setSelectedAuction(null)} className="p-1.5 rounded-lg hover:bg-[#F7F7F5]"><X size={16} className="text-[#9CA38C]" /></button>
                            </div>
                            <div className="bg-[#F7F7F5] rounded-xl p-4 mb-4 space-y-2">
                                {[
                                    { l: "Total Quantity", v: `${selectedAuction.totalQuantity.toLocaleString()} units` },
                                    { l: "Participating Shops", v: `${selectedAuction.participatingShops} shops` },
                                    { l: "Auction Type", v: selectedAuction.auctionType },
                                    { l: "Est. Value", v: formatCurrency(selectedAuction.estimatedValue) },
                                ].map(r => <div key={r.l} className="flex justify-between text-xs"><span className="text-[#9CA38C]">{r.l}</span><span className="font-medium text-[#1A1A1A] capitalize">{r.v}</span></div>)}
                            </div>
                            <div className="mb-4">
                                <label className="text-xs font-medium text-[#1A1A1A] block mb-1.5">How many units do you need?</label>
                                <input type="number" placeholder="e.g. 200" className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none focus:border-[#4A6741] focus:ring-1 focus:ring-[#4A6741]/20" />
                            </div>
                            <div className="mb-4">
                                <label className="text-xs font-medium text-[#1A1A1A] block mb-1.5">Preferred Delivery Date</label>
                                <input type="date" className="w-full px-4 py-2.5 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-sm outline-none focus:border-[#4A6741]" />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setSelectedAuction(null)} className="flex-1 px-4 py-2.5 border border-[#E5E5E0] text-sm font-medium text-[#6B7265] rounded-xl hover:bg-[#F7F7F5]">Cancel</button>
                                <button onClick={() => handleJoin(selectedAuction.id)} className="flex-1 px-4 py-2.5 bg-[#4A6741] text-white text-sm font-medium rounded-xl hover:bg-[#3D5A35] shadow-sm">Confirm & Join</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function CountdownTimer({ endTime }: { endTime: string }) {
    const [timeLeft, setTimeLeft] = useState("");
    useEffect(() => {
        const update = () => {
            const diff = new Date(endTime).getTime() - Date.now();
            if (diff <= 0) { setTimeLeft("Ended"); return; }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            setTimeLeft(h > 24 ? `${Math.floor(h / 24)}d ${h % 24}h` : `${h}h ${m}m`);
        };
        update();
        const interval = setInterval(update, 60000);
        return () => clearInterval(interval);
    }, [endTime]);
    return (
        <div className="flex items-center gap-1 px-2 py-0.5 bg-[#FFF8E1] rounded-lg">
            <Clock size={9} className="text-[#B8860B]" />
            <span className="text-[9px] font-bold text-[#B8860B]">{timeLeft}</span>
        </div>
    );
}
