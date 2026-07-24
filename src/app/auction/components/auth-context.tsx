"use client";

import type { Session, User } from "@supabase/supabase-js";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { createReference } from "../lib/reference";
import { supabase } from "../lib/supabase";

export type AccountType = "retailer" | "supplier";

export interface RestockOrganization {
    id: string;
    legalName: string;
    displayName: string;
    accountType: AccountType;
    aliasCode: string;
    status: "active" | "suspended" | "closed";
    memberRole: "owner" | "manager" | "operator" | "viewer";
}

interface RegisterOrganizationInput {
    legalName: string;
    displayName: string;
    accountType: AccountType;
    categories: string[];
    contactName: string;
    phoneE164: string;
    addressLine1: string;
    addressLine2: string;
    postalCode: string;
    deliveryInstructions: string;
}

interface AuthContextValue {
    session: Session | null;
    user: User | null;
    organization: RestockOrganization | null;
    loading: boolean;
    error: string | null;
    signIn(email: string, password: string): Promise<void>;
    signUp(email: string, password: string): Promise<"signed-in" | "check-email">;
    signOut(): Promise<void>;
    registerOrganization(input: RegisterOrganizationInput): Promise<void>;
    refreshOrganization(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface MembershipRecord {
    member_role: RestockOrganization["memberRole"];
    organization:
        | {
              id: string;
              legal_name: string;
              display_name: string;
              account_type: AccountType;
              alias_code: string;
              status: RestockOrganization["status"];
          }
        | Array<{
              id: string;
              legal_name: string;
              display_name: string;
              account_type: AccountType;
              alias_code: string;
              status: RestockOrganization["status"];
          }>;
}

function mapMembership(record: MembershipRecord): RestockOrganization {
    const organization = Array.isArray(record.organization)
        ? record.organization[0]
        : record.organization;

    return {
        id: organization.id,
        legalName: organization.legal_name,
        displayName: organization.display_name,
        accountType: organization.account_type,
        aliasCode: organization.alias_code,
        status: organization.status,
        memberRole: record.member_role,
    };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [organization, setOrganization] = useState<RestockOrganization | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadOrganization = useCallback(async (activeSession: Session | null) => {
        if (!activeSession?.user) {
            setOrganization(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        const { data, error: membershipError } = await supabase
            .from("restock_organization_members")
            .select(
                "member_role, organization:restock_organizations(id, legal_name, display_name, account_type, alias_code, status)"
            )
            .eq("user_id", activeSession.user.id)
            .limit(1)
            .maybeSingle();

        if (membershipError) {
            setError("We could not load your business workspace. Please try again.");
            setOrganization(null);
        } else {
            setError(null);
            setOrganization(data ? mapMembership(data as MembershipRecord) : null);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        let active = true;
        const watchdog = window.setTimeout(() => {
            if (!active) return;
            setLoading(false);
            setError("Session check timed out. You can still sign in securely.");
        }, 5000);

        void supabase.auth
            .getSession()
            .then(async ({ data, error: sessionError }) => {
                if (!active) return;
                if (sessionError) {
                    window.clearTimeout(watchdog);
                    setError(sessionError.message);
                    setLoading(false);
                    return;
                }
                setSession(data.session);
                if (data.session) setLoading(true);
                await loadOrganization(data.session);
                window.clearTimeout(watchdog);
            })
            .catch(() => {
                if (!active) return;
                window.clearTimeout(watchdog);
                setError("Unable to restore your session. Please sign in again.");
                setLoading(false);
            });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            setSession(nextSession);
            queueMicrotask(() => {
                if (active) void loadOrganization(nextSession);
            });
        });

        return () => {
            active = false;
            window.clearTimeout(watchdog);
            subscription.unsubscribe();
        };
    }, [loadOrganization]);

    const signIn = useCallback(async (email: string, password: string) => {
        setError(null);
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
        });
        if (signInError) {
            throw new Error(signInError.message);
        }
    }, []);

    const signUp = useCallback(async (email: string, password: string) => {
        setError(null);
        const prefix =
            typeof window === "undefined"
                ? ""
                : window.location.pathname.split("/auction")[0];
        const { data, error: signUpError } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
            options: {
                emailRedirectTo:
                    typeof window === "undefined"
                        ? undefined
                        : `${window.location.origin}${prefix}/auction`,
            },
        });
        if (signUpError) {
            throw new Error(signUpError.message);
        }
        return data.session ? "signed-in" : "check-email";
    }, []);

    const signOut = useCallback(async () => {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) throw new Error(signOutError.message);
        setOrganization(null);
    }, []);

    const refreshOrganization = useCallback(
        async () => loadOrganization(session),
        [loadOrganization, session]
    );

    const registerOrganization = useCallback(
        async (input: RegisterOrganizationInput) => {
            if (!session?.user) throw new Error("You must be signed in.");

            setError(null);
            const organizationId = crypto.randomUUID();
            const aliasCode = createReference(input.accountType === "retailer" ? "RET" : "SUP");
            const { data, error: onboardingError } = await supabase.functions.invoke(
                "restock-workflow",
                {
                    body: {
                        action: "onboard_organization",
                        organizationId,
                        aliasCode,
                        legalName: input.legalName.trim(),
                        displayName: input.displayName.trim(),
                        accountType: input.accountType,
                        categories: input.categories,
                        contactName: input.contactName.trim(),
                        phoneE164: input.phoneE164.trim(),
                        addressLine1: input.addressLine1.trim(),
                        addressLine2: input.addressLine2.trim(),
                        postalCode: input.postalCode.trim(),
                        deliveryInstructions: input.deliveryInstructions.trim(),
                    },
                }
            );

            if (onboardingError) {
                let message = onboardingError.message;
                const context = onboardingError.context as Response | undefined;
                if (context) {
                    try {
                        const payload = (await context.clone().json()) as { error?: string };
                        if (payload.error) message = payload.error;
                    } catch {
                        // Preserve the network error when no JSON response is available.
                    }
                }
                throw new Error(message);
            }
            if (data?.error) throw new Error(String(data.error));

            await loadOrganization(session);
        },
        [loadOrganization, session]
    );

    const value = useMemo<AuthContextValue>(
        () => ({
            session,
            user: session?.user ?? null,
            organization,
            loading,
            error,
            signIn,
            signUp,
            signOut,
            registerOrganization,
            refreshOrganization,
        }),
        [
            error,
            loading,
            organization,
            refreshOrganization,
            registerOrganization,
            session,
            signIn,
            signOut,
            signUp,
        ]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider.");
    return context;
}
