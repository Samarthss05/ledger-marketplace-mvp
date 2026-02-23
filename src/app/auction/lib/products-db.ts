// ─── RK Minimart Product Database (from MASTER LIST RK MINIMART 2025) ───
// 1,898 total products across 34 categories — curated subset for UI

export interface Product {
    id: string;
    name: string;
    price: number;     // Sell price (SGD)
    cost: number;      // Unit cost (SGD)
    category: string;
    barcode: string;
    margin: number;    // % margin
}

export const categories = [
    "Beer & Alcohol", "Biscuits & Cookies", "Bread & Bakery", "Cakes & Pastries",
    "Canned Food", "Pet Food", "Confectionery", "Beverages & Drinks",
    "Sauces & Condiments", "Dried Goods & Pulses", "Household Cleaning",
    "Instant Noodles & Pasta", "Eggs", "Feminine Care", "Flour & Baking",
    "General Merchandise", "Ice Cream & Frozen", "Spirits & Wine",
    "Dairy & Yoghurt", "Health & Medicine", "Indian Snacks",
    "Pickles & Preserves", "Prayer Items", "Rice & Grains",
    "Hair Care", "Energy Drinks", "Spices & Masala", "Sugar & Salt",
    "Chips & Snacks", "Oral Care", "Flowers", "Tissue & Paper",
] as const;

function p(id: string, name: string, price: number, cost: number, category: string, barcode: string): Product {
    return { id, name, price, cost, category, barcode, margin: price > 0 ? Math.round(((price - cost) / price) * 100) : 0 };
}

export const products: Product[] = [
    // ── Beer & Alcohol (D01) ──
    p("D01-001", "Tiger Large Beer 490ML", 3.80, 1.81, "Beer & Alcohol", "72890006349"),
    p("D01-002", "Heineken 330ML", 2.70, 1.20, "Beer & Alcohol", "86428430001"),
    p("D01-003", "Carlsberg Special Brew 490ML", 4.20, 2.10, "Beer & Alcohol", "85001234567"),
    p("D01-004", "Guinness Stout 320ML", 3.50, 1.80, "Beer & Alcohol", "85001234568"),
    p("D01-005", "Anchor Beer 323ML", 2.50, 1.30, "Beer & Alcohol", "85001234569"),

    // ── Biscuits & Cookies (D02) ──
    p("D02-001", "Khong Guan Cookies & Cream 260G", 3.20, 2.61, "Biscuits & Cookies", "84501224318"),
    p("D02-002", "Khong Guan Rose Assorted 700G", 8.90, 7.08, "Biscuits & Cookies", "84501637613"),
    p("D02-003", "Khong Guan Lemon Puff 260G", 3.20, 2.56, "Biscuits & Cookies", "84501283315"),
    p("D02-004", "Khong Guan Fancy Gems 110G", 1.80, 1.30, "Biscuits & Cookies", "84501032319"),
    p("D02-005", "Khong Guan Chocolate Wafer 110G", 2.00, 1.58, "Biscuits & Cookies", "84501835514"),
    p("D02-006", "Khong Guan Premium Marie 260G", 3.00, 2.20, "Biscuits & Cookies", "84501404314"),

    // ── Bread & Bakery (D03) ──
    p("D03-001", "Gardenia Whole Meal Bread", 3.20, 2.50, "Bread & Bakery", "93001234001"),
    p("D03-002", "Gardenia White Bread", 2.80, 2.10, "Bread & Bakery", "93001234002"),
    p("D03-003", "Sunshine Wholemeal Bread", 3.00, 2.30, "Bread & Bakery", "93001234003"),
    p("D03-004", "Bonjour Butter Croissant 5S", 4.50, 3.20, "Bread & Bakery", "93001234004"),

    // ── Cakes & Pastries (D04) ──
    p("D04-001", "Best One Pandan Pound Cake", 3.50, 2.72, "Cakes & Pastries", "94001234001"),
    p("D04-002", "Best One Marble Pound Cake", 3.50, 2.72, "Cakes & Pastries", "94001234002"),
    p("D04-003", "Best One Banana Cake", 3.50, 2.72, "Cakes & Pastries", "94001234003"),

    // ── Canned Food (D05) ──
    p("D05-001", "Tulip Pork Luncheon Meat 340G", 5.90, 3.72, "Canned Food", "45001234001"),
    p("D05-002", "Yifon Sliced Mushroom 284G", 1.20, 0.80, "Canned Food", "45001234002"),
    p("D05-003", "Narcissus Straw Mushroom 425G", 1.70, 1.20, "Canned Food", "45001234003"),
    p("D05-004", "Narcissus Pickle Lettuce 182G", 1.20, 0.70, "Canned Food", "45001234004"),

    // ── Pet Food (D06) ──
    p("D06-001", "Aatas Cat Tuna Anchovies 80G", 1.30, 0.70, "Pet Food", "46001234001"),
    p("D06-002", "Aatas Cat Tuna & Shrimp 80G", 1.30, 0.70, "Pet Food", "46001234002"),
    p("D06-003", "Aatas Cat Tuna & Beef 80G", 1.30, 0.70, "Pet Food", "46001234003"),

    // ── Confectionery (D07) ──
    p("D07-001", "Kinder Bueno", 1.80, 1.30, "Confectionery", "88"),
    p("D07-002", "Kinder Bueno White X2", 1.80, 1.41, "Confectionery", "89"),
    p("D07-003", "Mentos Spearmint 37.5G", 1.50, 0.65, "Confectionery", "73390000127"),
    p("D07-004", "Mentos Mix Grape 37.5G", 1.50, 0.65, "Confectionery", "73390000516"),
    p("D07-005", "Chupa Chups Lollipop 10G", 0.80, 0.25, "Confectionery", "90"),
    p("D07-006", "Ricola Original Herb 27.5G", 2.50, 1.60, "Confectionery", "73001234001"),

    // ── Beverages & Drinks (D09) ──
    p("D09-001", "Nestle Milo 400G", 5.50, 3.60, "Beverages & Drinks", "93001234009"),
    p("D09-002", "Lipton Yellow Label 200G", 6.50, 4.20, "Beverages & Drinks", "93001234010"),
    p("D09-003", "Lipton Yellow Label 25 Tea Bags", 3.20, 1.60, "Beverages & Drinks", "93001234011"),
    p("D09-004", "Orange Tang 500G", 3.80, 2.90, "Beverages & Drinks", "93001234012"),
    p("D09-005", "Basil Seeds 100G", 1.80, 1.44, "Beverages & Drinks", "93001234013"),

    // ── Sauces & Condiments (D10) ──
    p("D10-001", "LKK Brand Oyster Sauce 770G", 5.80, 3.65, "Sauces & Condiments", "78895129960"),
    p("D10-002", "Tabasco Pepper Sauce 60ML", 2.70, 1.70, "Sauces & Condiments", "10001234001"),
    p("D10-003", "Summer Palace Cooking Rice Wine 600ML", 2.80, 1.58, "Sauces & Condiments", "10001234002"),
    p("D10-004", "GJ Cold Pressed Mangesse Oil 150ML", 3.00, 1.80, "Sauces & Condiments", "10001234003"),

    // ── Dried Goods & Pulses (D11) ──
    p("D11-001", "SPM Channa Dhall 500G", 2.00, 1.20, "Dried Goods & Pulses", "11001234001"),
    p("D11-002", "SPM Black Channa 500G", 3.00, 1.00, "Dried Goods & Pulses", "11001234002"),
    p("D11-003", "SPM Green Peas 500G", 3.50, 2.30, "Dried Goods & Pulses", "11001234003"),
    p("D11-004", "SPM Urid Gota White 500G", 2.60, 2.08, "Dried Goods & Pulses", "11001234004"),

    // ── Household Cleaning (D12) ──
    p("D12-001", "Downy Expert 1.4L", 7.50, 6.10, "Household Cleaning", "12001234001"),
    p("D12-002", "CIF Cream Lemon 500ML", 3.00, 1.00, "Household Cleaning", "12001234002"),
    p("D12-003", "Dettol Liquid 500ML", 3.20, 1.00, "Household Cleaning", "12001234003"),
    p("D12-004", "Mosquito Repellent Coil", 1.80, 1.29, "Household Cleaning", "12001234004"),

    // ── Instant Noodles & Pasta (D13) ──
    p("D13-001", "Indomie Mi Goreng", 3.60, 2.60, "Instant Noodles & Pasta", "89686010947"),
    p("D13-002", "Indomie Mi Goreng (Small)", 2.50, 1.42, "Instant Noodles & Pasta", "89686180640"),
    p("D13-003", "Maggi Masala Festive Pack", 2.20, 1.35, "Instant Noodles & Pasta", "13001234001"),
    p("D13-004", "Bismi Soya Ball Meal Maker 200G", 1.60, 1.28, "Instant Noodles & Pasta", "13001234002"),

    // ── Eggs (D14) ──
    p("D14-001", "10 Eggs", 2.90, 2.18, "Eggs", "14001234001"),
    p("D14-002", "Farm Fresh Egg 12 Pcs", 4.40, 3.75, "Eggs", "14001234002"),

    // ── Feminine Care (D15) ──
    p("D15-001", "Whisper Wings Heavy Flow 8S", 4.80, 2.18, "Feminine Care", "15001234001"),
    p("D15-002", "Whisper Wings 20 Pads", 7.80, 3.25, "Feminine Care", "15001234002"),
    p("D15-003", "Laurier Super Slim Guard 20 Pads", 4.50, 3.10, "Feminine Care", "15001234003"),

    // ── Flour & Baking (D16) ──
    p("D16-001", "Birds Custard Powder 300G", 2.70, 2.00, "Flour & Baking", "16001234001"),
    p("D16-002", "Red Rice Flour 600G", 1.70, 1.10, "Flour & Baking", "16001234002"),
    p("D16-003", "Glutinous Rice Flour 600G", 2.20, 1.50, "Flour & Baking", "16001234003"),
    p("D16-004", "Pure Potato Starch 350G", 2.40, 1.70, "Flour & Baking", "16001234004"),

    // ── General Merchandise (D17) ──
    p("D17-001", "Baygon 300ML", 7.00, 4.25, "General Merchandise", "17001234001"),
    p("D17-002", "Maxwell CR2032 Battery", 2.00, 1.03, "General Merchandise", "17001234002"),
    p("D17-003", "Aluminium Foil 5M", 3.00, 1.00, "General Merchandise", "17001234003"),
    p("D17-004", "Best Choice Lighter", 2.50, 1.00, "General Merchandise", "17001234004"),

    // ── Ice Cream & Frozen (D18) ──
    p("D18-001", "Magnum Almond", 4.30, 2.10, "Ice Cream & Frozen", "18001234001"),
    p("D18-002", "Magnum Classic", 4.30, 2.33, "Ice Cream & Frozen", "18001234002"),
    p("D18-003", "Magnum Pecan Nut", 4.30, 2.30, "Ice Cream & Frozen", "18001234003"),
    p("D18-004", "Magnum Mini Cappuccino Almond 6 Pcs", 12.20, 1.00, "Ice Cream & Frozen", "18001234004"),
    p("D18-005", "Miami Ice Pop X10 Pack", 5.00, 1.00, "Ice Cream & Frozen", "18001234005"),

    // ── Spirits & Wine (D19) ──
    p("D19-001", "Chivas Regal 12 Years 375ML", 39.00, 36.40, "Spirits & Wine", "80432400388"),
    p("D19-002", "Chivas 12 YRS 70CL", 61.00, 50.14, "Spirits & Wine", "80432402931"),
    p("D19-003", "Jim Beam Whiskey 75CL", 48.50, 37.80, "Spirits & Wine", "80686001409"),
    p("D19-004", "Martell VSOP 70CL", 96.00, 86.40, "Spirits & Wine", "19001234001"),
    p("D19-005", "Hennessy VSOP 70CL", 100.00, 88.00, "Spirits & Wine", "19001234002"),

    // ── Dairy & Yoghurt (D20) ──
    p("D20-001", "Taj Mahal Yoghurt Blue 500G", 2.80, 2.28, "Dairy & Yoghurt", "20001234001"),
    p("D20-002", "Taj Mahal Butter Milk 1L", 4.40, 3.50, "Dairy & Yoghurt", "20001234002"),
    p("D20-003", "Yoghurt Low Fat Natural", 1.55, 1.50, "Dairy & Yoghurt", "20001234003"),
    p("D20-004", "Yoghurt Low Fat Mixed Berries", 1.50, 1.32, "Dairy & Yoghurt", "20001234004"),

    // ── Health & Medicine (D21) ──
    p("D21-001", "Vaseline Original Healing Jelly 49G", 2.20, 1.40, "Health & Medicine", "21001234001"),
    p("D21-002", "Hansaplast Elastic 20 Strips", 2.50, 1.00, "Health & Medicine", "21001234002"),
    p("D21-003", "Handyplast 20S Water-Resistant", 2.00, 1.30, "Health & Medicine", "21001234003"),

    // ── Indian Snacks (D22) ──
    p("D22-001", "SSR Peanut Candy Cubes 200G", 2.20, 1.41, "Indian Snacks", "22001234001"),
    p("D22-002", "SSR Mixture 100G", 1.60, 0.65, "Indian Snacks", "22001234002"),
    p("D22-003", "SSR Peanut Candy 100G", 1.60, 0.87, "Indian Snacks", "22001234003"),

    // ── Pickles & Preserves (D23) ──
    p("D23-001", "Priya Garlic Pickle 300G", 3.80, 1.00, "Pickles & Preserves", "23001234001"),
    p("D23-002", "Priya Green Chilli Pickle 300G", 2.00, 1.38, "Pickles & Preserves", "23001234002"),
    p("D23-003", "Priya Lime Pickle 300G", 3.80, 1.00, "Pickles & Preserves", "23001234003"),

    // ── Prayer Items (D24) ──
    p("D24-001", "Sri Vel Murugan Smokeless Camphor", 3.50, 1.90, "Prayer Items", "24001234001"),
    p("D24-002", "Sri Mahalakshmi Pooja Oil 1.25L", 3.60, 2.94, "Prayer Items", "24001234002"),
    p("D24-003", "Cow Urine 90ML", 1.20, 0.87, "Prayer Items", "24001234003"),

    // ── Rice & Grains (D25) ──
    p("D25-001", "India Gate Classic Basmati Rice 1KG", 6.50, 4.68, "Rice & Grains", "25001234001"),
    p("D25-002", "Bismi Royal Food Fryum Papad 200G", 1.50, 1.00, "Rice & Grains", "25001234002"),
    p("D25-003", "Bismi Royal Food Rice Stick 180G", 2.00, 1.40, "Rice & Grains", "25001234003"),
    p("D25-004", "Bismi Royal Food Poo Appalam 150G", 1.80, 1.30, "Rice & Grains", "25001234004"),

    // ── Hair Care (D26) ──
    p("D26-001", "Head & Shoulder Smooth Silky 330ML", 3.80, 1.00, "Hair Care", "26001234001"),
    p("D26-002", "Head & Shoulder Anti Dandruff 170ML", 3.50, 1.60, "Hair Care", "26001234002"),
    p("D26-003", "Pantene Total Damage Care 170ML", 3.00, 2.00, "Hair Care", "26001234003"),

    // ── Energy Drinks (D27) ──
    p("D27-001", "Monster Energy 355ML", 2.40, 1.62, "Energy Drinks", "27001234001"),
    p("D27-002", "Monster Zero 355ML", 2.40, 1.74, "Energy Drinks", "27001234002"),
    p("D27-003", "Monster Energy Ultra 355ML", 2.40, 1.62, "Energy Drinks", "27001234003"),

    // ── Spices & Masala (D28) ──
    p("D28-001", "MDH Kasoori Methi 25G", 1.50, 1.00, "Spices & Masala", "28001234001"),
    p("D28-002", "Bismi Black Pepper 100G", 2.00, 1.40, "Spices & Masala", "28001234002"),
    p("D28-003", "Pran Briyani Masala 50G", 1.60, 0.70, "Spices & Masala", "28001234003"),
    p("D28-004", "Pran Coriander 200G", 2.80, 1.35, "Spices & Masala", "28001234004"),

    // ── Sugar & Salt (D29) ──
    p("D29-001", "Sebas Jaggery Powder 500G", 2.20, 1.30, "Sugar & Salt", "29001234001"),
    p("D29-002", "Bismi Crystal Rock Salt", 2.30, 1.50, "Sugar & Salt", "29001234002"),
    p("D29-003", "Bismi Nattu Sakkari Sugar 500G", 2.50, 1.15, "Sugar & Salt", "29001234003"),

    // ── Chips & Snacks (D30) ──
    p("D30-001", "Pringles Original 149G", 3.50, 2.67, "Chips & Snacks", "30001234001"),
    p("D30-002", "Pringles Sour Cream Onion 134G", 3.50, 2.67, "Chips & Snacks", "30001234002"),
    p("D30-003", "Lays Classic 170G", 5.30, 4.27, "Chips & Snacks", "30001234003"),
    p("D30-004", "Lays BBQ 170G", 5.30, 4.27, "Chips & Snacks", "30001234004"),
    p("D30-005", "Kusuka BBQ 180G", 2.50, 1.47, "Chips & Snacks", "30001234005"),

    // ── Oral Care (D31) ──
    p("D31-001", "Darlie Double Action 75G", 1.80, 1.00, "Oral Care", "31001234001"),
    p("D31-002", "Darlie Double Action 260G", 3.60, 2.65, "Oral Care", "31001234002"),
    p("D31-003", "Sensodyne Deep Clean 100G", 6.20, 1.00, "Oral Care", "31001234003"),
    p("D31-004", "Colgate Fresh Cooling 160G", 2.50, 1.00, "Oral Care", "31001234004"),

    // ── Flowers (D32) ──
    p("D32-001", "Jasmine Small Garland", 6.00, 2.50, "Flowers", "32001234001"),
    p("D32-002", "Jasmine Big Garland", 15.00, 10.00, "Flowers", "32001234002"),
    p("D32-003", "Loose Flowers", 2.00, 0.50, "Flowers", "32001234003"),

    // ── Tissue & Paper (D34) ──
    p("D34-001", "Beautex Tissue 6x12 Pcs", 5.30, 4.58, "Tissue & Paper", "34001234001"),
    p("D34-002", "Beautex 3Ply 5 Box", 5.50, 4.25, "Tissue & Paper", "34001234002"),
    p("D34-003", "Beautex Toilet Paper", 5.80, 4.80, "Tissue & Paper", "34001234003"),
    p("D34-004", "Beautex Kitchen Towel", 4.90, 4.09, "Tissue & Paper", "34001234004"),
];

// ── Helpers ──
export function getProductsByCategory(category: string): Product[] {
    return products.filter(p => p.category === category);
}

export function searchProducts(query: string): Product[] {
    const q = query.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
}

export function getTopCategories(): { category: string; count: number; avgPrice: number }[] {
    const map: Record<string, { count: number; totalPrice: number }> = {};
    for (const p of products) {
        if (!map[p.category]) map[p.category] = { count: 0, totalPrice: 0 };
        map[p.category].count++;
        map[p.category].totalPrice += p.price;
    }
    return Object.entries(map)
        .map(([category, { count, totalPrice }]) => ({ category, count, avgPrice: Number((totalPrice / count).toFixed(2)) }))
        .sort((a, b) => b.count - a.count);
}

export function getRandomProducts(count: number, category?: string): Product[] {
    const pool = category ? products.filter(p => p.category === category) : products;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}
