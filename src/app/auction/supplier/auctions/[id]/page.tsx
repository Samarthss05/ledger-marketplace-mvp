import { auctions } from "../../../lib/mock-data";
import SupplierBidPageClient from "./client-page";

export async function generateStaticParams() {
    return auctions.map((auction) => ({
        id: auction.id,
    }));
}

export default function SupplierBidPage({ params }: { params: Promise<{ id: string }> }) {
    return <SupplierBidPageClient params={params} />;
}
