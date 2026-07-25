import type { AccountType } from "../components/auth-context";

type DemoAccount = {
    accountType: AccountType;
    email: string;
    password: string;
    destination: string;
};

// These credentials belong to shared, non-production demo organizations.
// They are intentionally public so the landing page can provide one-click access.
export const demoAccounts: Record<AccountType, DemoAccount> = {
    retailer: {
        accountType: "retailer",
        email: "samarthagarwal1385+restock-shop@gmail.com",
        password: "ReStockDemo!2026Shop",
        destination: "/auction/shop",
    },
    supplier: {
        accountType: "supplier",
        email: "samarthagarwal1385+restock-supplier@gmail.com",
        password: "ReStockDemo!2026Supply",
        destination: "/auction/supplier",
    },
};
