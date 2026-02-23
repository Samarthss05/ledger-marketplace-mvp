"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Users, MapPin, ThumbsUp, MessageCircle, Plus, ArrowRight, Send,
    UserPlus, Share2, Star, ChevronRight, Globe, ShoppingBag, Package, RefreshCw, Clock, AlertCircle
} from "lucide-react";
import { products } from "../../lib/products-db";
import { formatCurrency } from "../../lib/mock-data";

const nearbyShops = [
    { id: 1, name: "Kedai Muthu", distance: "0.3km", auctions: 4, savings: "$3,200", joined: true },
    { id: 2, name: "Ah Kow Store Sari-Sari", distance: "0.5km", auctions: 3, savings: "$2,800", joined: true },
    { id: 3, name: "Lucky Express Mart", distance: "0.8km", auctions: 6, savings: "$5,100", joined: false },
    { id: 4, name: "Kuya Ben Store", distance: "1.2km", auctions: 2, savings: "$1,500", joined: false },
    { id: 5, name: "Golden Mini Mart", distance: "1.5km", auctions: 5, savings: "$4,200", joined: false },
];

const p_monster = products.find(p => p.name.includes("Monster Energy 355ML")) || products[5];
const p_wash = products.find(p => p.name.includes("Feminine Wash") || p.category.includes("Personal Care")) || products[6];
const p_sardines = products.find(p => p.name.includes("Sardines")) || products[7];
const p_coffee = products.find(p => p.name.includes("Coffee")) || products[8];
const p_shampoo = products.find(p => p.name.includes("Shampoo")) || products[9];
const p_oil = products.find(p => p.category.includes("Oil")) || products[10];
const p_rice = products.find(p => p.name.includes("Basmati Rice 1KG")) || products[1];
const p_oyster = products.find(p => p.name.includes("Oyster Sauce 770G")) || products[2];

const demandVotes = [
    { id: "v1", product: p_monster.name, votes: 12, target: 15, category: p_monster.category, status: "almost", myVote: true },
    { id: "v2", product: p_wash.name, votes: 5, target: 10, category: p_wash.category, status: "active", myVote: false },
    { id: "v3", product: p_sardines.name, votes: 18, target: 15, category: p_sardines.category, status: "ready", myVote: true },
    { id: "v4", product: p_coffee.name, votes: 8, target: 20, category: p_coffee.category, status: "active", myVote: false },
    { id: "v5", product: p_shampoo.name, votes: 3, target: 10, category: p_shampoo.category, status: "active", myVote: false },
];

const chatMessages = [
    { id: 1, user: "Ah Kow Store", msg: `Anyone else want to co-buy ${p_oil.name}? I need 20 cases`, time: "10 min ago", avatar: "AN" },
    { id: 2, user: "Mang Juan", msg: "I'm in! Put me down for 15 cases", time: "8 min ago", avatar: "MJ" },
    { id: 3, user: "Kuya Ben", msg: "Same here, 10 cases for me. Let's hit the volume discount!", time: "5 min ago", avatar: "KB" },
    { id: 4, user: "You", msg: "Count me in for 20 cases — we should be able to get a much better price", time: "2 min ago", avatar: "SS" },
];

const groupBuyInvites = [
    { id: "g1", product: p_rice.name, organizer: "Ah Kow Store", shops: 5, targetShops: 8, qty: 350, savings: "~12%", expires: "2d" },
    { id: "g2", product: p_oyster.name, organizer: "Mang Juan", shops: 3, targetShops: 5, qty: 120, savings: "~15%", expires: "5d" },
];

const stockExchangeItems = [
    { id: "se1", type: "selling", shop: "Lucky Express Mart", product: "Downy Expert 1.4L", qty: 25, price: 5.50, originalPrice: 6.80, reason: "Overstock clearance", distance: "0.8km", posted: "2h ago" },
    { id: "se2", type: "buying", shop: "Kedai Muthu", product: p_oyster.name, qty: 12, targetPrice: p_oyster.price + 0.20, reason: "Emergency stockout pending delivery", distance: "0.3km", posted: "30m ago" },
    { id: "se3", type: "selling", shop: "Ah Kow Store Sari-Sari", product: p_monster.name, qty: 48, price: 1.80, originalPrice: 2.20, reason: "Shelf space needed", distance: "0.5km", posted: "5h ago" },
];

export default function CommunityPage() {
    const [chatInput, setChatInput] = useState("");
    const [votes, setVotes] = useState(demandVotes);
    const [activeTab, setActiveTab] = useState<"group_buy" | "exchange">("group_buy");

    const toggleVote = (id: string) => {
        setVotes(prev => prev.map(v => v.id === id ? { ...v, myVote: !v.myVote, votes: v.myVote ? v.votes - 1 : v.votes + 1 } : v));
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#1A1A1A]">Community Hub</h1>
                    <p className="text-sm text-[#6B7265] mt-0.5">Connect with nearby shops, group buy, and trade inventory</p>
                </div>
                <div className="flex bg-white border border-[#E5E5E0] rounded-xl overflow-hidden p-1">
                    <button onClick={() => setActiveTab("group_buy")} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === "group_buy" ? "bg-[#4A6741] text-white shadow-sm" : "text-[#6B7265] hover:bg-[#F7F7F5] hover:text-[#1A1A1A]"}`}>
                        <Users size={14} /> Group Buys & Demand
                    </button>
                    <button onClick={() => setActiveTab("exchange")} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === "exchange" ? "bg-[#4A6741] text-white shadow-sm" : "text-[#6B7265] hover:bg-[#F7F7F5] hover:text-[#1A1A1A]"}`}>
                        <RefreshCw size={14} /> Stock Exchange
                    </button>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { icon: Users, label: "Nearby Shops", value: nearbyShops.length.toString(), sub: "within 2km", color: "bg-[#4A6741]" },
                    { icon: UserPlus, label: "Group Buys", value: groupBuyInvites.length.toString(), sub: "active invites", color: "bg-[#3B6B9B]" },
                    { icon: ThumbsUp, label: "Demand Votes", value: votes.length.toString(), sub: "products requested", color: "bg-[#7B1FA2]" },
                    { icon: MessageCircle, label: "Messages", value: chatMessages.length.toString(), sub: "in co-buyer chat", color: "bg-[#B8860B]" },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-white rounded-2xl border border-[#E5E5E0] p-4">
                        <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center text-white mb-2`}><s.icon size={14} /></div>
                        <p className="text-lg font-bold text-[#1A1A1A]">{s.value}</p>
                        <p className="text-[10px] text-[#9CA38C]">{s.sub}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="lg:col-span-2 space-y-4">

                    {activeTab === "group_buy" ? (
                        <>
                            {/* Group Buy Invites */}
                            <div className="bg-white rounded-2xl border border-[#E5E5E0] p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <UserPlus size={14} className="text-[#4A6741]" />
                                        <h2 className="text-sm font-bold text-[#1A1A1A]">Group Buy Invites</h2>
                                    </div>
                                    <button className="flex items-center gap-1 text-xs font-bold text-[#4A6741]"><Plus size={12} /> Create</button>
                                </div>
                                <div className="space-y-3">
                                    {groupBuyInvites.map((invite) => (
                                        <div key={invite.id} className="p-4 bg-[#F7F7F5] rounded-xl hover:bg-[#F2F5F0] transition-all">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <p className="text-sm font-bold text-[#1A1A1A]">{invite.product}</p>
                                                    <p className="text-[10px] text-[#9CA38C]">Organized by {invite.organizer} · {invite.qty} total units</p>
                                                </div>
                                                <span className="text-sm font-bold text-[#4A6741]">{invite.savings}</span>
                                            </div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="flex-1 h-2 bg-[#E5E5E0] rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#4A6741] rounded-full" style={{ width: `${(invite.shops / invite.targetShops) * 100}%` }} />
                                                </div>
                                                <span className="text-[10px] font-bold text-[#6B7265]">{invite.shops}/{invite.targetShops} shops</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-[#9CA38C]">Expires in {invite.expires}</span>
                                                <button className="flex items-center gap-1 px-3 py-1.5 bg-[#4A6741] text-white text-[10px] font-bold rounded-lg hover:bg-[#3D5A35]">
                                                    Join Group <ArrowRight size={8} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Demand Voting */}
                            <div className="bg-white rounded-2xl border border-[#E5E5E0] p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <ThumbsUp size={14} className="text-[#7B1FA2]" />
                                        <h2 className="text-sm font-bold text-[#1A1A1A]">Demand Voting</h2>
                                        <span className="text-[9px] px-1.5 py-0.5 bg-[#F3E5F5] text-[#7B1FA2] rounded font-bold">Community</span>
                                    </div>
                                    <button className="flex items-center gap-1 text-xs font-bold text-[#4A6741]"><Plus size={12} /> Suggest</button>
                                </div>
                                <div className="space-y-3">
                                    {votes.map((vote) => (
                                        <div key={vote.id} className={`p-3 rounded-xl ${vote.status === "ready" ? "bg-[#E8F5E9] border border-[#4A6741]/20" : vote.status === "almost" ? "bg-[#FFF8E1]" : "bg-[#F7F7F5]"}`}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs font-bold text-[#1A1A1A]">{vote.product}</p>
                                                    {vote.status === "ready" && <span className="text-[8px] px-1.5 py-0.5 bg-[#4A6741] text-white rounded font-bold">AUCTION READY!</span>}
                                                    {vote.status === "almost" && <span className="text-[8px] px-1.5 py-0.5 bg-[#F57F17] text-white rounded font-bold">ALMOST!</span>}
                                                </div>
                                                <span className="text-[10px] text-[#9CA38C]">{vote.category}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-1.5 bg-[#E5E5E0] rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${vote.status === "ready" ? "bg-[#4A6741]" : vote.status === "almost" ? "bg-[#F57F17]" : "bg-[#9CA38C]"}`}
                                                        style={{ width: `${Math.min((vote.votes / vote.target) * 100, 100)}%` }} />
                                                </div>
                                                <span className="text-[10px] font-bold text-[#6B7265]">{vote.votes}/{vote.target}</span>
                                                <button onClick={() => toggleVote(vote.id)}
                                                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${vote.myVote ? "bg-[#4A6741] text-white" : "border border-[#E5E5E0] text-[#6B7265] hover:bg-[#F7F7F5]"}`}>
                                                    <ThumbsUp size={9} /> {vote.myVote ? "Voted" : "Vote"}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Stock Exchange */}
                            <div className="bg-white rounded-2xl border border-[#E5E5E0] p-5">
                                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <RefreshCw size={14} className="text-[#3B6B9B]" />
                                            <h2 className="text-lg font-bold text-[#1A1A1A]">P2P Stock Exchange</h2>
                                        </div>
                                        <p className="text-[10px] text-[#9CA38C] mt-1">Trade overstock or fulfill emergency requests from shops nearby.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E5E0] text-[10px] font-bold text-[#1A1A1A] rounded-lg shadow-sm hover:bg-[#F7F7F5]">
                                            <Package size={12} /> Post Overstock
                                        </button>
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF8E1] border border-[#F57F17]/30 text-[10px] font-bold text-[#F57F17] rounded-lg shadow-sm hover:bg-[#FFECB3]">
                                            <Clock size={12} /> Request Emergency Stock
                                        </button>
                                    </div>
                                </div>
                                {stockExchangeItems.map((item) => (
                                    <div key={item.id} className={`p-5 rounded-2xl border transition-all hover:shadow-md ${item.type === "selling" ? "bg-gradient-to-br from-[#F0F4EE]/50 to-white border-[#E5E5E0] hover:border-[#4A6741]/30" : "bg-gradient-to-br from-[#FFF8E1]/50 to-white border-[#F57F17]/20 hover:border-[#F57F17]/40"}`}>
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                                            <div className="flex items-start gap-4">
                                                <div className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm ${item.type === "selling" ? "bg-gradient-to-br from-[#4A6741] to-[#6B8F71]" : "bg-gradient-to-br from-[#F57F17] to-[#FFA000]"}`}>
                                                    {item.type === "selling" ? <Package size={20} /> : <AlertCircle size={20} />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wide ${item.type === "selling" ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#FFF8E1] text-[#F57F17]"}`}>
                                                            {item.type === "selling" ? "Selling Overstock" : "Needs Inventory"}
                                                        </span>
                                                        <span className="text-[10px] font-medium text-[#9CA38C]">{item.posted}</span>
                                                    </div>
                                                    <p className="text-base font-bold text-[#1A1A1A] mb-0.5">{item.qty}x {item.product}</p>
                                                    <div className="flex items-center gap-1.5 text-xs text-[#6B7265] italic">
                                                        <span className="text-[#1A1A1A] not-italic font-medium">{item.shop}</span> · "{item.reason}"
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-left sm:text-right pt-1 sm:pt-0">
                                                {item.type === "selling" ? (
                                                    <>
                                                        <p className="text-xl font-bold text-[#1A1A1A]">{formatCurrency(item.price!)}<span className="text-xs text-[#9CA38C] font-normal">/unit</span></p>
                                                        <p className="text-[10px] text-[#9CA38C] line-through decoration-[#9CA38C]/50">{formatCurrency(item.originalPrice!)} retail</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="text-[10px] text-[#9CA38C] font-semibold uppercase tracking-wide mb-0.5">Willing to pay up to</p>
                                                        <p className="text-xl font-bold text-[#1A1A1A]">{formatCurrency(item.targetPrice!)}<span className="text-xs text-[#9CA38C] font-normal">/unit</span></p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row flex-wrap sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-[#F0F0EC]">
                                            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#6B7265]">
                                                <div className="flex items-center gap-1.5"><MapPin size={12} className="text-[#9CA38C]" /> {item.distance} away</div>
                                                <div className="flex items-center gap-1.5"><Star size={12} className="text-[#B8860B] fill-[#B8860B]" /> 4.9 rating</div>
                                            </div>
                                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                                <button className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-[#E5E5E0] text-xs font-bold text-[#1A1A1A] rounded-xl hover:bg-[#F7F7F5] shadow-sm transition-colors">
                                                    <MessageCircle size={14} /> Message
                                                </button>
                                                <button className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-6 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all ${item.type === "selling" ? "bg-[#4A6741] hover:bg-[#3D5A35] hover:shadow-md" : "bg-[#F57F17] hover:bg-[#F9A825] hover:shadow-md"}`}>
                                                    {item.type === "selling" ? <><ShoppingBag size={14} /> Buy Now</> : <><Package size={14} /> Fulfill Info</>}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </motion.div>

                {/* Sidebar: Network Map + Chat */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="space-y-4">
                    {/* Shop Network */}
                    <div className="bg-white rounded-2xl border border-[#E5E5E0] p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Globe size={14} className="text-[#4A6741]" />
                            <h2 className="text-sm font-bold text-[#1A1A1A]">Nearby Shops</h2>
                        </div>
                        <div className="space-y-2.5">
                            {nearbyShops.map((shop) => (
                                <div key={shop.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F7F7F5] transition-colors">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${shop.joined ? "bg-[#E8F5E9] text-[#4A6741]" : "bg-[#F7F7F5] text-[#9CA38C]"}`}>
                                        {shop.name.charAt(0)}{shop.name.split(" ")[1]?.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-[#1A1A1A] truncate">{shop.name}</p>
                                        <p className="text-[9px] text-[#9CA38C]">{shop.distance} · {shop.auctions} auctions · {shop.savings} saved</p>
                                    </div>
                                    {shop.joined ? (
                                        <span className="text-[8px] font-bold text-[#4A6741]">Connected</span>
                                    ) : (
                                        <button className="text-[9px] font-bold text-[#4A6741] px-2 py-0.5 border border-[#4A6741]/30 rounded">Invite</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat */}
                    <div className="bg-white rounded-2xl border border-[#E5E5E0] p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <MessageCircle size={14} className="text-[#4A6741]" />
                            <h2 className="text-sm font-bold text-[#1A1A1A]">Co-Buyer Chat</h2>
                        </div>
                        <div className="space-y-3 max-h-64 overflow-y-auto mb-3 pr-1">
                            {chatMessages.map((msg) => (
                                <div key={msg.id} className={`flex gap-2 ${msg.user === "You" ? "flex-row-reverse" : ""}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0 ${msg.user === "You" ? "bg-[#4A6741] text-white" : "bg-[#F7F7F5] text-[#6B7265]"}`}>
                                        {msg.avatar}
                                    </div>
                                    <div className={`max-w-[80%] ${msg.user === "You" ? "text-right" : ""}`}>
                                        <p className="text-[9px] text-[#9CA38C] mb-0.5">{msg.user} · {msg.time}</p>
                                        <div className={`inline-block px-3 py-2 rounded-xl text-[11px] ${msg.user === "You" ? "bg-[#4A6741] text-white" : "bg-[#F7F7F5] text-[#1A1A1A]"}`}>
                                            {msg.msg}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Message..."
                                className="flex-1 px-3 py-2 bg-[#F7F7F5] border border-[#E5E5E0] rounded-xl text-xs outline-none focus:border-[#4A6741]" />
                            <button className="p-2 bg-[#4A6741] text-white rounded-xl hover:bg-[#3D5A35]"><Send size={12} /></button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
