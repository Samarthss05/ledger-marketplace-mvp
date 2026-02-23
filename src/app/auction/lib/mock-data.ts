// ─── Mock Data for Ledger Demand Auction Module ───

export interface Supplier {
  id: string;
  companyName: string;
  location: { country: string; state: string; city: string };
  productCategories: string[];
  monthlyCapacity: number;
  certifications: string[];
  performanceScore: number;
  onTimeDeliveryRate: number;
  qualityScore: number;
  averageBidPrice: number;
  totalAuctionsWon: number;
  totalRevenue: number;
  preferredSupplierStatus: boolean;
  avatar: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  supplierId: string;
  supplierName: string;
  pricePerUnit: number;
  totalPrice: number;
  deliveryDate: string;
  paymentTerms: string;
  minimumOrderQuantity: number;
  submittedAt: string;
  status: "active" | "withdrawn" | "won" | "lost";
}

export interface Auction {
  id: string;
  productName: string;
  productCategory: string;
  aggregatedDemandId: string;
  auctionType: "sealed" | "english" | "dutch";
  startTime: string;
  endTime: string;
  status: "pending" | "active" | "closed" | "awarded";
  bids: Bid[];
  winningBidId?: string;
  reservePrice: number;
  totalQuantity: number;
  participatingShops: number;
  estimatedValue: number;
  createdBy: "system" | "manual";
}

export interface AggregatedDemand {
  id: string;
  productId: string;
  productName: string;
  category: string;
  totalQuantity: number;
  targetQuantity: number;
  participatingShops: { name: string; quantity: number }[];
  deliveryDate: string;
  createdAt: string;
  status: "open" | "bidding" | "awarded" | "fulfilled";
  minBidPrice: number;
  estimatedValue: number;
}

export interface ShopOrder {
  id: string;
  shopName: string;
  auctionId: string;
  supplierName: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  deliveryDate: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
}

export interface Activity {
  id: string;
  type: "bid" | "auction" | "order" | "supplier" | "demand";
  message: string;
  timestamp: string;
  icon: string;
}

// ── Suppliers ──
export const suppliers: Supplier[] = [
  {
    id: "SUP-001",
    companyName: "Pacific Foods Distribution",
    location: { country: "Singapore", state: "Central", city: "Toa Payoh" },
    productCategories: ["Beverages", "Confectionery", "Ice Cream"],
    monthlyCapacity: 50000,
    certifications: ["ISO 9001", "HACCP", "SFA Approved"],
    performanceScore: 94,
    onTimeDeliveryRate: 97,
    qualityScore: 92,
    averageBidPrice: 3.20,
    totalAuctionsWon: 47,
    totalRevenue: 284000,
    preferredSupplierStatus: true,
    avatar: "PF",
  },
  {
    id: "SUP-002",
    companyName: "Golden Harvest Trading",
    location: { country: "Singapore", state: "East", city: "Bedok" },
    productCategories: ["Rice & Grains", "Cooking Oil", "Sauces"],
    monthlyCapacity: 75000,
    certifications: ["ISO 22000", "Halal Certified"],
    performanceScore: 89,
    onTimeDeliveryRate: 91,
    qualityScore: 93,
    averageBidPrice: 4.50,
    totalAuctionsWon: 38,
    totalRevenue: 192000,
    preferredSupplierStatus: true,
    avatar: "GH",
  },
  {
    id: "SUP-003",
    companyName: "ASEAN Supply Co.",
    location: { country: "Singapore", state: "West", city: "Jurong" },
    productCategories: ["Beverages", "Personal Care", "Household"],
    monthlyCapacity: 35000,
    certifications: ["ISO 9001", "GMP"],
    performanceScore: 82,
    onTimeDeliveryRate: 85,
    qualityScore: 88,
    averageBidPrice: 5.60,
    totalAuctionsWon: 22,
    totalRevenue: 98000,
    preferredSupplierStatus: false,
    avatar: "AS",
  },
  {
    id: "SUP-004",
    companyName: "Metro Fresh Industries",
    location: { country: "Singapore", state: "North", city: "Woodlands" },
    productCategories: ["Eggs & Dairy", "Frozen Foods", "Yoghurt"],
    monthlyCapacity: 25000,
    certifications: ["HACCP", "SFA Licensed"],
    performanceScore: 91,
    onTimeDeliveryRate: 94,
    qualityScore: 96,
    averageBidPrice: 3.80,
    totalAuctionsWon: 31,
    totalRevenue: 156000,
    preferredSupplierStatus: true,
    avatar: "MF",
  },
  {
    id: "SUP-005",
    companyName: "Island Goods Corp.",
    location: { country: "Singapore", state: "Central", city: "Ang Mo Kio" },
    productCategories: ["Snacks", "Confectionery", "Chips"],
    monthlyCapacity: 40000,
    certifications: ["ISO 9001", "SFA Approved"],
    performanceScore: 78,
    onTimeDeliveryRate: 82,
    qualityScore: 80,
    averageBidPrice: 3.40,
    totalAuctionsWon: 15,
    totalRevenue: 62000,
    preferredSupplierStatus: false,
    avatar: "IG",
  },
  {
    id: "SUP-006",
    companyName: "Sunrise Wholesale Hub",
    location: { country: "Singapore", state: "East", city: "Tampines" },
    productCategories: ["Rice & Grains", "Spices", "Sauces", "Instant Noodles"],
    monthlyCapacity: 90000,
    certifications: ["ISO 22000", "Halal Certified", "HACCP"],
    performanceScore: 96,
    onTimeDeliveryRate: 98,
    qualityScore: 95,
    averageBidPrice: 2.80,
    totalAuctionsWon: 63,
    totalRevenue: 423000,
    preferredSupplierStatus: true,
    avatar: "SH",
  },
];

import { products } from "./products-db";

const p1 = products.find(p => p.name.includes("Milo") && p.name.includes("400G")) || products[0];
const p2 = products.find(p => p.name.includes("Basmati Rice 1KG")) || products[1];
const p3 = products.find(p => p.name.includes("Oyster Sauce 770G")) || products[2];
const p4 = products.find(p => p.name.includes("Mi Goreng") && p.name.includes("Carton")) || products.find(p => p.name.includes("Mi Goreng")) || products[3];
const p5 = products.find(p => p.name.includes("Egg 12 Pcs")) || products[4];
const p6 = products.find(p => p.name.includes("Pringles") && p.name.includes("149G")) || products[5];
const p7 = products.find(p => p.name.includes("Darlie") && p.name.includes("75G")) || products[6];
const p8 = products.find(p => p.name.includes("Lipton") && p.name.includes("25 Tea Bags")) || products[7];

// ── Auctions ──
export const auctions: Auction[] = [
  {
    id: "AUC-1001",
    productName: p1.name,
    productCategory: p1.category,
    aggregatedDemandId: "DEM-001",
    auctionType: "sealed",
    startTime: "2026-02-20T08:00:00",
    endTime: "2026-02-22T08:00:00",
    status: "active",
    reservePrice: p1.price,
    totalQuantity: 2400,
    participatingShops: 18,
    estimatedValue: p1.price * 2400,
    createdBy: "system",
    bids: [
      { id: "BID-101", auctionId: "AUC-1001", supplierId: "SUP-001", supplierName: "Pacific Foods Distribution", pricePerUnit: p1.cost + 0.2, totalPrice: (p1.cost + 0.2) * 2400, deliveryDate: "2026-02-23", paymentTerms: "Net 30", minimumOrderQuantity: 500, submittedAt: "2026-02-20T09:15:00", status: "active" },
      { id: "BID-102", auctionId: "AUC-1001", supplierId: "SUP-003", supplierName: "ASEAN Supply Co.", pricePerUnit: p1.cost + 0.3, totalPrice: (p1.cost + 0.3) * 2400, deliveryDate: "2026-02-24", paymentTerms: "Net 15", minimumOrderQuantity: 200, submittedAt: "2026-02-20T10:30:00", status: "active" },
      { id: "BID-103", auctionId: "AUC-1001", supplierId: "SUP-005", supplierName: "Island Goods Corp.", pricePerUnit: p1.cost + 0.5, totalPrice: (p1.cost + 0.5) * 2400, deliveryDate: "2026-02-23", paymentTerms: "Net 30", minimumOrderQuantity: 300, submittedAt: "2026-02-20T11:45:00", status: "active" },
    ],
  },
  {
    id: "AUC-1002",
    productName: p2.name,
    productCategory: p2.category,
    aggregatedDemandId: "DEM-002",
    auctionType: "english",
    startTime: "2026-02-19T10:00:00",
    endTime: "2026-02-21T10:00:00",
    status: "active",
    reservePrice: p2.price,
    totalQuantity: 800,
    participatingShops: 24,
    estimatedValue: p2.price * 800,
    createdBy: "system",
    bids: [
      { id: "BID-201", auctionId: "AUC-1002", supplierId: "SUP-002", supplierName: "Golden Harvest Trading", pricePerUnit: p2.cost + 0.22, totalPrice: (p2.cost + 0.22) * 800, deliveryDate: "2026-02-22", paymentTerms: "Net 30", minimumOrderQuantity: 100, submittedAt: "2026-02-19T11:00:00", status: "active" },
      { id: "BID-202", auctionId: "AUC-1002", supplierId: "SUP-006", supplierName: "Sunrise Wholesale Hub", pricePerUnit: p2.cost + 0.12, totalPrice: (p2.cost + 0.12) * 800, deliveryDate: "2026-02-22", paymentTerms: "Net 15", minimumOrderQuantity: 200, submittedAt: "2026-02-19T14:00:00", status: "active" },
      { id: "BID-203", auctionId: "AUC-1002", supplierId: "SUP-002", supplierName: "Golden Harvest Trading", pricePerUnit: p2.cost + 0.02, totalPrice: (p2.cost + 0.02) * 800, deliveryDate: "2026-02-22", paymentTerms: "Net 30", minimumOrderQuantity: 100, submittedAt: "2026-02-20T08:30:00", status: "active" },
    ],
  },
  {
    id: "AUC-1003",
    productName: p3.name,
    productCategory: p3.category,
    aggregatedDemandId: "DEM-003",
    auctionType: "dutch",
    startTime: "2026-02-20T06:00:00",
    endTime: "2026-02-20T18:00:00",
    status: "active",
    reservePrice: p3.price,
    totalQuantity: 1500,
    participatingShops: 32,
    estimatedValue: p3.price * 1500,
    createdBy: "system",
    bids: [
      { id: "BID-301", auctionId: "AUC-1003", supplierId: "SUP-006", supplierName: "Sunrise Wholesale Hub", pricePerUnit: p3.cost + 0.15, totalPrice: (p3.cost + 0.15) * 1500, deliveryDate: "2026-02-21", paymentTerms: "Net 15", minimumOrderQuantity: 300, submittedAt: "2026-02-20T07:00:00", status: "active" },
    ],
  },
  {
    id: "AUC-1004",
    productName: p4.name,
    productCategory: p4.category,
    aggregatedDemandId: "DEM-004",
    auctionType: "sealed",
    startTime: "2026-02-18T08:00:00",
    endTime: "2026-02-20T08:00:00",
    status: "awarded",
    reservePrice: p4.price,
    totalQuantity: 3000,
    participatingShops: 42,
    estimatedValue: 10800,
    createdBy: "system",
    winningBidId: "BID-401",
    bids: [
      { id: "BID-401", auctionId: "AUC-1004", supplierId: "SUP-001", supplierName: "Pacific Foods Distribution", pricePerUnit: 2.60, totalPrice: 7800, deliveryDate: "2026-02-21", paymentTerms: "Net 30", minimumOrderQuantity: 500, submittedAt: "2026-02-18T12:00:00", status: "won" },
      { id: "BID-402", auctionId: "AUC-1004", supplierId: "SUP-005", supplierName: "Island Goods Corp.", pricePerUnit: 2.80, totalPrice: 8400, deliveryDate: "2026-02-22", paymentTerms: "Net 15", minimumOrderQuantity: 200, submittedAt: "2026-02-18T15:00:00", status: "lost" },
      { id: "BID-403", auctionId: "AUC-1004", supplierId: "SUP-003", supplierName: "ASEAN Supply Co.", pricePerUnit: 2.90, totalPrice: 8700, deliveryDate: "2026-02-22", paymentTerms: "Net 30", minimumOrderQuantity: 300, submittedAt: "2026-02-19T09:00:00", status: "lost" },
    ],
  },
  {
    id: "AUC-1005",
    productName: p6.name,
    productCategory: p6.category,
    aggregatedDemandId: "DEM-005",
    auctionType: "sealed",
    startTime: "2026-02-21T08:00:00",
    endTime: "2026-02-23T08:00:00",
    status: "pending",
    reservePrice: p6.price,
    totalQuantity: 500,
    participatingShops: 15,
    estimatedValue: p6.price * 500,
    createdBy: "manual",
    bids: [],
  },
  {
    id: "AUC-1006",
    productName: p5.name,
    productCategory: p5.category,
    aggregatedDemandId: "DEM-006",
    auctionType: "dutch",
    startTime: "2026-02-17T06:00:00",
    endTime: "2026-02-17T18:00:00",
    status: "closed",
    reservePrice: 4.40,
    totalQuantity: 2000,
    participatingShops: 28,
    estimatedValue: 8800,
    createdBy: "system",
    winningBidId: "BID-601",
    bids: [
      { id: "BID-601", auctionId: "AUC-1006", supplierId: "SUP-004", supplierName: "Metro Fresh Industries", pricePerUnit: 3.75, totalPrice: 7500, deliveryDate: "2026-02-18", paymentTerms: "COD", minimumOrderQuantity: 100, submittedAt: "2026-02-17T08:30:00", status: "won" },
    ],
  },
];

// ── Aggregated Demand ──
export const demandItems: AggregatedDemand[] = [
  {
    id: "DEM-001",
    productId: p1.id,
    productName: p1.name,
    category: p1.category,
    totalQuantity: 2400,
    targetQuantity: 3000,
    participatingShops: [
      { name: "RK Minimart", quantity: 200 },
      { name: "Mini Mart Express", quantity: 350 },
      { name: "QuickStop Bedok", quantity: 180 },
      { name: "Kedai Runcit Amira", quantity: 120 },
      { name: "Metro Convenience", quantity: 400 },
      { name: "Island Grocery Hub", quantity: 250 },
    ],
    deliveryDate: "2026-02-23",
    createdAt: "2026-02-18T08:00:00",
    status: "bidding",
    minBidPrice: 3.60,
    estimatedValue: 13200,
  },
  {
    id: "DEM-002",
    productId: p2.id,
    productName: p2.name,
    category: p2.category,
    totalQuantity: 800,
    targetQuantity: 1000,
    participatingShops: [
      { name: "Kedai Runcit Muthu", quantity: 50 },
      { name: "Neighborhood Store Co.", quantity: 80 },
      { name: "Fresh Market Jurong", quantity: 120 },
      { name: "Valley Grocers", quantity: 100 },
    ],
    deliveryDate: "2026-02-22",
    createdAt: "2026-02-17T10:00:00",
    status: "bidding",
    minBidPrice: 4.68,
    estimatedValue: 5200,
  },
  {
    id: "DEM-003",
    productId: p3.id,
    productName: p3.name,
    category: p3.category,
    totalQuantity: 1500,
    targetQuantity: 1500,
    participatingShops: [
      { name: "QuickStop Tampines", quantity: 200 },
      { name: "RK Minimart", quantity: 150 },
      { name: "Metro Convenience", quantity: 300 },
      { name: "Island Grocery Hub", quantity: 250 },
      { name: "Fresh Market Jurong", quantity: 180 },
    ],
    deliveryDate: "2026-02-21",
    createdAt: "2026-02-19T06:00:00",
    status: "bidding",
    minBidPrice: 3.65,
    estimatedValue: 8700,
  },
  {
    id: "DEM-007",
    productId: p7.id,
    productName: p7.name,
    category: p7.category,
    totalQuantity: 450,
    targetQuantity: 1000,
    participatingShops: [
      { name: "RK Minimart", quantity: 100 },
      { name: "Mini Mart Express", quantity: 150 },
      { name: "Kedai Runcit Amira", quantity: 200 },
    ],
    deliveryDate: "2026-02-28",
    createdAt: "2026-02-20T08:00:00",
    status: "open",
    minBidPrice: 1.00,
    estimatedValue: 450,
  },
  {
    id: "DEM-008",
    productId: p8.id,
    productName: p8.name,
    category: p8.category,
    totalQuantity: 1800,
    targetQuantity: 2000,
    participatingShops: [
      { name: "Metro Convenience", quantity: 400 },
      { name: "QuickStop Bedok", quantity: 300 },
      { name: "Valley Grocers", quantity: 250 },
      { name: "Island Grocery Hub", quantity: 350 },
      { name: "Neighborhood Store Co.", quantity: 200 },
    ],
    deliveryDate: "2026-02-25",
    createdAt: "2026-02-19T14:00:00",
    status: "open",
    minBidPrice: 1.60,
    estimatedValue: 5760,
  },
];

// ── Orders ──
export const orders: ShopOrder[] = [
  { id: "ORD-5001", shopName: "RK Minimart", auctionId: "AUC-1004", supplierName: "Pacific Foods Distribution", productName: p4.name, quantity: 300, unitPrice: p4.price, totalPrice: p4.price * 300, deliveryDate: "2026-02-21", status: "shipped", createdAt: "2026-02-20T08:00:00" },
  { id: "ORD-5002", shopName: "Mini Mart Express", auctionId: "AUC-1004", supplierName: "Pacific Foods Distribution", productName: p4.name, quantity: 500, unitPrice: p4.price, totalPrice: p4.price * 500, deliveryDate: "2026-02-21", status: "confirmed", createdAt: "2026-02-20T08:00:00" },
  { id: "ORD-5003", shopName: "QuickStop Bedok", auctionId: "AUC-1006", supplierName: "Metro Fresh Industries", productName: p5.name, quantity: 150, unitPrice: p5.price, totalPrice: p5.price * 150, deliveryDate: "2026-02-18", status: "delivered", createdAt: "2026-02-17T09:00:00" },
  { id: "ORD-5004", shopName: "Kedai Runcit Amira", auctionId: "AUC-1006", supplierName: "Metro Fresh Industries", productName: p5.name, quantity: 80, unitPrice: p5.price, totalPrice: p5.price * 80, deliveryDate: "2026-02-18", status: "delivered", createdAt: "2026-02-17T09:00:00" },
  { id: "ORD-5005", shopName: "Metro Convenience", auctionId: "AUC-1004", supplierName: "Pacific Foods Distribution", productName: p4.name, quantity: 600, unitPrice: p4.price, totalPrice: p4.price * 600, deliveryDate: "2026-02-21", status: "pending", createdAt: "2026-02-20T08:00:00" },
  { id: "ORD-5006", shopName: "Fresh Market Jurong", auctionId: "AUC-1006", supplierName: "Metro Fresh Industries", productName: p5.name, quantity: 200, unitPrice: p5.price, totalPrice: p5.price * 200, deliveryDate: "2026-02-18", status: "delivered", createdAt: "2026-02-17T09:00:00" },
  { id: "ORD-5007", shopName: "Valley Grocers", auctionId: "AUC-1004", supplierName: "Pacific Foods Distribution", productName: p4.name, quantity: 400, unitPrice: p4.price, totalPrice: p4.price * 400, deliveryDate: "2026-02-21", status: "confirmed", createdAt: "2026-02-20T08:00:00" },
  { id: "ORD-5008", shopName: "Island Grocery Hub", auctionId: "AUC-1004", supplierName: "Pacific Foods Distribution", productName: p4.name, quantity: 250, unitPrice: p4.price, totalPrice: p4.price * 250, deliveryDate: "2026-02-21", status: "shipped", createdAt: "2026-02-20T08:00:00" },
];

// ── Activity Feed ──
export const recentActivity: Activity[] = [
  { id: "ACT-1", type: "bid", message: "Pacific Foods submitted a bid of $3.80/unit on Nestle Milo 400G auction", timestamp: "2 min ago", icon: "💰" },
  { id: "ACT-2", type: "auction", message: "LKK Oyster Sauce auction entered Dutch phase — price dropping", timestamp: "8 min ago", icon: "🔥" },
  { id: "ACT-3", type: "demand", message: "Lipton Yellow Label demand reached 90% of target (1,800/2,000 units)", timestamp: "15 min ago", icon: "📈" },
  { id: "ACT-4", type: "order", message: "Metro Fresh shipped 200 trays of Farm Fresh Eggs", timestamp: "32 min ago", icon: "🚚" },
  { id: "ACT-5", type: "supplier", message: "Sunrise Wholesale Hub achieved Preferred Supplier status", timestamp: "1 hr ago", icon: "⭐" },
  { id: "ACT-6", type: "auction", message: "Indomie Mi Goreng auction awarded to Pacific Foods at $2.60/unit", timestamp: "2 hrs ago", icon: "🏆" },
  { id: "ACT-7", type: "bid", message: "Golden Harvest lowered bid to $4.70/unit on Basmati Rice", timestamp: "3 hrs ago", icon: "💰" },
  { id: "ACT-8", type: "demand", message: "Darlie Toothpaste demand aggregation started — 3 shops participating", timestamp: "4 hrs ago", icon: "🛒" },
];

// ── Analytics Data ──
export const analyticsData = {
  weeklyGMV: [
    { week: "W1", value: 820000 },
    { week: "W2", value: 1150000 },
    { week: "W3", value: 980000 },
    { week: "W4", value: 1340000 },
    { week: "W5", value: 1520000 },
    { week: "W6", value: 1780000 },
    { week: "W7", value: 1650000 },
    { week: "W8", value: 2100000 },
  ],
  categoryBreakdown: [
    { category: "Beverages & Drinks", percentage: 24, value: 504000 },
    { category: "Rice & Grains", percentage: 18, value: 378000 },
    { category: "Instant Noodles", percentage: 16, value: 336000 },
    { category: "Sauces & Condiments", percentage: 14, value: 294000 },
    { category: "Chips & Snacks", percentage: 12, value: 252000 },
    { category: "Confectionery", percentage: 8, value: 168000 },
    { category: "Household & Personal Care", percentage: 8, value: 168000 },
  ],
  savingsVsRetail: 18.5,
  avgBidders: 4.2,
  auctionSuccessRate: 87,
  supplierRetention: 92,
};

// ── Stats ──
export const dashboardStats = {
  activeAuctions: 3,
  totalGMV: 2100000,
  avgSavings: 18.5,
  activeSuppliers: 6,
  totalShops: 156,
  auctionsThisWeek: 8,
  transactionFees: 63000,
  pendingOrders: 12,
};

// ── Helper ──
export function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 10000) return `$${(value / 1000).toFixed(0)}K`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  if (value >= 100 && value % 1 === 0) return `$${value.toFixed(0)}`;
  return `$${value.toFixed(2)}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString();
}
