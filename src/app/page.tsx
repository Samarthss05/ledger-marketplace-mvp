import AuctionLanding from "./auction/page";
import { AuthProvider } from "./auction/components/auth-context";

export default function HomePage() {
    return (
        <AuthProvider>
            <AuctionLanding />
        </AuthProvider>
    );
}
