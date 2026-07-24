import { AuthProvider } from "./components/auth-context";

export default function AuctionLayout({ children }: { children: React.ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
}
