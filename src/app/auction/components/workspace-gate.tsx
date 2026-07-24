"use client";

import { useState } from "react";
import {
    ArrowRight,
    Building2,
    CheckCircle2,
    LoaderCircle,
    LockKeyhole,
    ShieldCheck,
    Store,
    Truck,
} from "lucide-react";
import { BrandLockup } from "@/components/brand-lockup";
import { type AccountType, useAuth } from "./auth-context";

const supplierCategories = [
    "Beverages",
    "Dry goods",
    "Cooking essentials",
    "Snacks",
    "Household",
    "Personal care",
];

function LoadingWorkspace() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F7F9F5]">
            <div className="text-center">
                <LoaderCircle className="mx-auto animate-spin text-[#4F6F56]" size={28} />
                <p className="mt-3 text-sm font-semibold text-[#4A514A]">
                    Securing your workspace…
                </p>
            </div>
        </div>
    );
}

function AuthScreen() {
    const { signIn, signUp, error: sessionError } = useAuth();
    const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSubmitting(true);
        setFormError(null);
        setMessage(null);
        try {
            if (mode === "sign-in") {
                await signIn(email, password);
            } else {
                const result = await signUp(email, password);
                if (result === "check-email") {
                    setMessage("Check your email to confirm your account, then sign in.");
                }
            }
        } catch (error) {
            setFormError(error instanceof Error ? error.message : "Authentication failed.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(111,146,119,0.14),transparent_34%),linear-gradient(145deg,#F7F9F5,#FFFFFF)] px-4 py-8">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
                <div className="grid w-full overflow-hidden rounded-[32px] border border-[#DDE5DC] bg-white shadow-[0_40px_100px_-60px_rgba(43,74,52,0.65)] lg:grid-cols-[1.05fr_0.95fr]">
                    <section className="bg-[#365845] p-8 text-white sm:p-12">
                        <BrandLockup
                            size="lg"
                            priority
                            className="rounded-xl bg-white px-3 py-2"
                        />
                        <p className="mt-14 text-[11px] font-bold tracking-[0.18em] text-[#CFE0D1] uppercase">
                            Production workspace
                        </p>
                        <h1 className="mt-3 max-w-lg text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
                            Procurement with a verifiable chain of custody.
                        </h1>
                        <p className="mt-5 max-w-xl text-sm leading-7 text-[#E4ECE4]">
                            Every quote, award, Ninja Van scan, delivery photo, and dispute action
                            is stored against an authenticated business account.
                        </p>
                        <div className="mt-10 space-y-4">
                            {[
                                "Business identities stay private between counterparties",
                                "Evidence is stored privately with row-level access controls",
                                "Payouts remain protected until delivery verification",
                            ].map((item) => (
                                <div key={item} className="flex items-start gap-3">
                                    <CheckCircle2 className="mt-0.5 text-[#BCD3BE]" size={17} />
                                    <span className="text-sm text-[#F2F6F1]">{item}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="p-8 sm:p-12">
                        <div className="mx-auto max-w-md">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EDF3EC] text-[#4F6F56]">
                                <LockKeyhole size={20} />
                            </div>
                            <h2 className="mt-5 text-2xl font-bold text-[#2F312F]">
                                {mode === "sign-in" ? "Sign in to ReStock" : "Create your account"}
                            </h2>
                            <p className="mt-2 text-sm text-[#707670]">
                                {mode === "sign-in"
                                    ? "Use your business account to continue."
                                    : "Start with your work email. Business setup comes next."}
                            </p>

                            <form className="mt-8 space-y-4" onSubmit={submit}>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-[#414641]">
                                        Work email
                                    </span>
                                    <input
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        className="w-full rounded-xl border border-[#D7DFD5] bg-[#FAFBF9] px-4 py-3 text-sm outline-none transition focus:border-[#6F9277] focus:ring-2 focus:ring-[#6F9277]/10"
                                    />
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-[#414641]">
                                        Password
                                    </span>
                                    <input
                                        type="password"
                                        autoComplete={
                                            mode === "sign-in" ? "current-password" : "new-password"
                                        }
                                        minLength={10}
                                        required
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        className="w-full rounded-xl border border-[#D7DFD5] bg-[#FAFBF9] px-4 py-3 text-sm outline-none transition focus:border-[#6F9277] focus:ring-2 focus:ring-[#6F9277]/10"
                                    />
                                </label>

                                {formError || sessionError ? (
                                    <p role="alert" className="rounded-xl bg-[#FFF2EF] px-3 py-2 text-xs text-[#A33A2B]">
                                        {formError ?? sessionError}
                                    </p>
                                ) : null}
                                {message ? (
                                    <p className="rounded-xl bg-[#EDF6EC] px-3 py-2 text-xs text-[#365845]">
                                        {message}
                                    </p>
                                ) : null}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4F6F56] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#3F6047] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submitting ? (
                                        <LoaderCircle className="animate-spin" size={16} />
                                    ) : (
                                        <ArrowRight size={16} />
                                    )}
                                    {mode === "sign-in" ? "Sign in securely" : "Create account"}
                                </button>
                            </form>

                            <button
                                type="button"
                                onClick={() => {
                                    setMode(mode === "sign-in" ? "sign-up" : "sign-in");
                                    setFormError(null);
                                    setMessage(null);
                                }}
                                className="mt-5 w-full text-center text-xs font-semibold text-[#4F6F56]"
                            >
                                {mode === "sign-in"
                                    ? "New to ReStock? Create an account"
                                    : "Already have an account? Sign in"}
                            </button>
                            <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-[#8A918A]">
                                <ShieldCheck size={12} />
                                Authenticated by Supabase · encrypted in transit
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function OnboardingScreen() {
    const { registerOrganization, signOut } = useAuth();
    const [accountType, setAccountType] = useState<AccountType>("retailer");
    const [legalName, setLegalName] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [categories, setCategories] = useState<string[]>([]);
    const [contactName, setContactName] = useState("");
    const [phoneE164, setPhoneE164] = useState("+65");
    const [addressLine1, setAddressLine1] = useState("");
    const [addressLine2, setAddressLine2] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [deliveryInstructions, setDeliveryInstructions] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSubmitting(true);
        setFormError(null);
        try {
            await registerOrganization({
                legalName,
                displayName,
                accountType,
                categories,
                contactName,
                phoneE164,
                addressLine1,
                addressLine2,
                postalCode,
                deliveryInstructions,
            });
        } catch (error) {
            setFormError(error instanceof Error ? error.message : "Business setup failed.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F9F5] px-4 py-10">
            <div className="mx-auto max-w-3xl">
                <div className="flex items-center justify-between">
                    <BrandLockup size="md" priority />
                    <button onClick={() => void signOut()} className="text-xs font-semibold text-[#667066]">
                        Sign out
                    </button>
                </div>
                <form
                    onSubmit={submit}
                    className="mt-10 rounded-[30px] border border-[#DDE5DC] bg-white p-6 shadow-[0_28px_80px_-55px_rgba(43,74,52,0.55)] sm:p-9"
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EDF3EC] text-[#4F6F56]">
                        <Building2 size={22} />
                    </div>
                    <p className="mt-5 text-[10px] font-bold tracking-[0.17em] text-[#6F9277] uppercase">
                        Business setup
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#2F312F]">
                        Create your verified workspace
                    </h1>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-[#707670]">
                        Legal names are used internally for account verification. Counterparties only
                        receive your protected ReStock alias.
                    </p>

                    <div className="mt-7 grid gap-3 sm:grid-cols-2">
                        {([
                            ["retailer", Store, "Retailer", "Create RFQs and receive stock"],
                            ["supplier", Truck, "Supplier", "Quote, fulfill, and submit proof"],
                        ] as const).map(([type, Icon, label, detail]) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setAccountType(type)}
                                className={`rounded-2xl border p-4 text-left transition ${
                                    accountType === type
                                        ? "border-[#6F9277] bg-[#F2F7F1]"
                                        : "border-[#DDE5DC] bg-white"
                                }`}
                            >
                                <Icon size={18} className="text-[#4F6F56]" />
                                <p className="mt-3 text-sm font-bold text-[#2F312F]">{label}</p>
                                <p className="mt-1 text-xs text-[#7B817B]">{detail}</p>
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <label>
                            <span className="mb-1.5 block text-xs font-semibold text-[#414641]">
                                Registered legal name
                            </span>
                            <input
                                required
                                minLength={2}
                                maxLength={160}
                                value={legalName}
                                onChange={(event) => setLegalName(event.target.value)}
                                className="w-full rounded-xl border border-[#D7DFD5] bg-[#FAFBF9] px-4 py-3 text-sm outline-none focus:border-[#6F9277]"
                            />
                        </label>
                        <label>
                            <span className="mb-1.5 block text-xs font-semibold text-[#414641]">
                                Workspace display name
                            </span>
                            <input
                                required
                                minLength={2}
                                maxLength={80}
                                value={displayName}
                                onChange={(event) => setDisplayName(event.target.value)}
                                className="w-full rounded-xl border border-[#D7DFD5] bg-[#FAFBF9] px-4 py-3 text-sm outline-none focus:border-[#6F9277]"
                            />
                        </label>
                    </div>

                    <div className="mt-7 border-t border-[#E8ECE7] pt-6">
                        <p className="text-xs font-bold text-[#2F312F]">
                            Private logistics contact
                        </p>
                        <p className="mt-1 text-[10px] leading-5 text-[#7B817B]">
                            ReStock and Ninja Van use these details for pickup or delivery.
                            Counterparties never receive them.
                        </p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <label>
                                <span className="mb-1.5 block text-xs font-semibold text-[#414641]">
                                    Contact name
                                </span>
                                <input
                                    required
                                    minLength={2}
                                    maxLength={100}
                                    autoComplete="name"
                                    value={contactName}
                                    onChange={(event) => setContactName(event.target.value)}
                                    className="w-full rounded-xl border border-[#D7DFD5] bg-[#FAFBF9] px-4 py-3 text-sm outline-none focus:border-[#6F9277]"
                                />
                            </label>
                            <label>
                                <span className="mb-1.5 block text-xs font-semibold text-[#414641]">
                                    Phone · international format
                                </span>
                                <input
                                    required
                                    pattern="^\+[1-9][0-9]{7,14}$"
                                    autoComplete="tel"
                                    value={phoneE164}
                                    onChange={(event) => setPhoneE164(event.target.value)}
                                    placeholder="+6591234567"
                                    className="w-full rounded-xl border border-[#D7DFD5] bg-[#FAFBF9] px-4 py-3 text-sm outline-none focus:border-[#6F9277]"
                                />
                            </label>
                            <label className="sm:col-span-2">
                                <span className="mb-1.5 block text-xs font-semibold text-[#414641]">
                                    {accountType === "supplier" ? "Pickup address" : "Delivery address"}
                                </span>
                                <input
                                    required
                                    minLength={3}
                                    maxLength={180}
                                    autoComplete="address-line1"
                                    value={addressLine1}
                                    onChange={(event) => setAddressLine1(event.target.value)}
                                    className="w-full rounded-xl border border-[#D7DFD5] bg-[#FAFBF9] px-4 py-3 text-sm outline-none focus:border-[#6F9277]"
                                />
                            </label>
                            <label>
                                <span className="mb-1.5 block text-xs font-semibold text-[#414641]">
                                    Unit / building
                                </span>
                                <input
                                    maxLength={180}
                                    autoComplete="address-line2"
                                    value={addressLine2}
                                    onChange={(event) => setAddressLine2(event.target.value)}
                                    className="w-full rounded-xl border border-[#D7DFD5] bg-[#FAFBF9] px-4 py-3 text-sm outline-none focus:border-[#6F9277]"
                                />
                            </label>
                            <label>
                                <span className="mb-1.5 block text-xs font-semibold text-[#414641]">
                                    Singapore postal code
                                </span>
                                <input
                                    required
                                    pattern="^[0-9]{6}$"
                                    inputMode="numeric"
                                    autoComplete="postal-code"
                                    value={postalCode}
                                    onChange={(event) => setPostalCode(event.target.value)}
                                    className="w-full rounded-xl border border-[#D7DFD5] bg-[#FAFBF9] px-4 py-3 text-sm outline-none focus:border-[#6F9277]"
                                />
                            </label>
                            <label className="sm:col-span-2">
                                <span className="mb-1.5 block text-xs font-semibold text-[#414641]">
                                    Courier instructions
                                </span>
                                <textarea
                                    rows={2}
                                    maxLength={500}
                                    value={deliveryInstructions}
                                    onChange={(event) => setDeliveryInstructions(event.target.value)}
                                    placeholder="Loading bay, operating hours, access notes"
                                    className="w-full resize-none rounded-xl border border-[#D7DFD5] bg-[#FAFBF9] px-4 py-3 text-sm outline-none focus:border-[#6F9277]"
                                />
                            </label>
                        </div>
                    </div>

                    {accountType === "supplier" ? (
                        <div className="mt-5">
                            <p className="text-xs font-semibold text-[#414641]">Supply categories</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {supplierCategories.map((category) => {
                                    const selected = categories.includes(category);
                                    return (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() =>
                                                setCategories(
                                                    selected
                                                        ? categories.filter((item) => item !== category)
                                                        : [...categories, category]
                                                )
                                            }
                                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                                                selected
                                                    ? "bg-[#4F6F56] text-white"
                                                    : "border border-[#DDE5DC] text-[#667066]"
                                            }`}
                                        >
                                            {category}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : null}

                    {formError ? (
                        <p role="alert" className="mt-5 rounded-xl bg-[#FFF2EF] px-3 py-2 text-xs text-[#A33A2B]">
                            {formError}
                        </p>
                    ) : null}

                    <button
                        type="submit"
                        disabled={submitting || (accountType === "supplier" && categories.length === 0)}
                        className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4F6F56] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
                    >
                        {submitting ? <LoaderCircle className="animate-spin" size={16} /> : <ArrowRight size={16} />}
                        Create secure workspace
                    </button>
                </form>
            </div>
        </div>
    );
}

export function WorkspaceGate({
    requiredRole,
    children,
}: {
    requiredRole: AccountType;
    children: React.ReactNode;
}) {
    const { session, organization, loading, error, signOut } = useAuth();

    if (loading) return <LoadingWorkspace />;
    if (!session) return <AuthScreen />;
    if (!organization) return <OnboardingScreen />;

    if (organization.status !== "active") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F7F9F5] px-4">
                <div className="max-w-md rounded-3xl border border-[#E3D9D4] bg-white p-8 text-center">
                    <LockKeyhole className="mx-auto text-[#A45F48]" size={28} />
                    <h1 className="mt-4 text-xl font-bold text-[#2F312F]">Workspace unavailable</h1>
                    <p className="mt-2 text-sm text-[#707670]">
                        This business account is {organization.status}. Contact ReStock support for review.
                    </p>
                    <button onClick={() => void signOut()} className="mt-5 text-sm font-semibold text-[#4F6F56]">
                        Sign out
                    </button>
                </div>
            </div>
        );
    }

    if (organization.accountType !== requiredRole) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F7F9F5] px-4">
                <div className="max-w-md rounded-3xl border border-[#DDE5DC] bg-white p-8 text-center">
                    <ShieldCheck className="mx-auto text-[#4F6F56]" size={30} />
                    <h1 className="mt-4 text-xl font-bold text-[#2F312F]">
                        {organization.accountType === "retailer" ? "Retailer" : "Supplier"} account
                    </h1>
                    <p className="mt-2 text-sm text-[#707670]">
                        Your authenticated organization cannot open the {requiredRole} workspace.
                    </p>
                    <button onClick={() => void signOut()} className="mt-5 text-sm font-semibold text-[#4F6F56]">
                        Sign out and use another account
                    </button>
                </div>
            </div>
        );
    }

    return <>{error ? <span className="sr-only">{error}</span> : null}{children}</>;
}
