"use client";

import { useCallback, useEffect, useState } from "react";
import type { Auction, Bid } from "./mock-data";

const STORAGE_KEY = "restock-supplier-bids-v1";
const BIDS_UPDATED_EVENT = "restock:supplier-bids-updated";

function readStoredBids(): Bid[] {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);

        if (!stored) {
            return [];
        }

        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function persistBids(bids: Bid[]) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bids));
    window.dispatchEvent(new Event(BIDS_UPDATED_EVENT));
}

export function mergeAuctionBids(auction: Auction, storedBids: Bid[]) {
    const auctionStoredBids = storedBids.filter((bid) => bid.auctionId === auction.id);
    const storedSuppliers = new Set(auctionStoredBids.map((bid) => bid.supplierId));

    return [
        ...auction.bids.filter((bid) => !storedSuppliers.has(bid.supplierId)),
        ...auctionStoredBids,
    ];
}

export function useSupplierBidStore() {
    const [bids, setBids] = useState<Bid[]>([]);

    useEffect(() => {
        const refresh = () => setBids(readStoredBids());

        refresh();
        window.addEventListener("storage", refresh);
        window.addEventListener(BIDS_UPDATED_EVENT, refresh);

        return () => {
            window.removeEventListener("storage", refresh);
            window.removeEventListener(BIDS_UPDATED_EVENT, refresh);
        };
    }, []);

    const submitBid = useCallback((bid: Bid) => {
        const current = readStoredBids();
        const next = [
            bid,
            ...current.filter(
                (candidate) =>
                    candidate.auctionId !== bid.auctionId ||
                    candidate.supplierId !== bid.supplierId
            ),
        ];

        persistBids(next);
        setBids(next);
    }, []);

    return { bids, submitBid };
}
