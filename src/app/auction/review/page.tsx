"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    LoaderCircle,
    LockKeyhole,
    RefreshCw,
    Scale,
    ShieldCheck,
} from "lucide-react";
import { BrandLockup } from "@/components/brand-lockup";
import { useAuth } from "../components/auth-context";
import { timelineEventCopy } from "../lib/display-copy";
import { supabase } from "../lib/supabase";

interface ReviewProof {
    id: string;
    actor_type: "supplier" | "retailer";
    signed_url?: string;
    quantity: number;
    note: string;
    condition: string;
    captured_at: string;
}

interface ReviewEvent {
    id: string;
    title: string;
    detail: string;
    occurred_at: string;
}

interface ReviewDispute {
    id: string;
    reference: string;
    reason: string;
    details: string;
    automated_assessment: string;
    opened_at: string;
    order: {
        id: string;
        reference: string;
        retailer_alias: string;
        supplier_alias: string;
        product_summary: string;
        quantity: number;
        courier_status: string;
        courier_last_scan: string;
        total_price: number;
        restock_delivery_proofs: ReviewProof[];
        restock_fulfillment_events: ReviewEvent[];
    };
}

function conditionLabel(condition: string) {
    return {
        sealed: "Packed and sealed",
        good: "Everything is correct",
        damaged: "Some items are damaged",
        short: "Some items are missing",
        wrong_items: "Wrong items arrived",
        other: "Another issue",
    }[condition] ?? condition.replaceAll("_", " ");
}

async function invoke<T>(body: Record<string, unknown>) {
    const { data, error } = await supabase.functions.invoke("restock-workflow", { body });
    if (error) {
        const context = error.context as Response | undefined;
        if (context) {
            try {
                const payload = (await context.clone().json()) as { error?: string };
                if (payload.error) throw new Error(payload.error);
            } catch (cause) {
                if (cause instanceof Error && cause.message !== "Unexpected end of JSON input") {
                    throw cause;
                }
            }
        }
        throw new Error(error.message);
    }
    if (data?.error) throw new Error(String(data.error));
    return data.data as T;
}

export default function IndependentReviewPage() {
    const { session, loading: authLoading, signIn, signOut } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [queue, setQueue] = useState<ReviewDispute[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<ReviewDispute | null>(null);
    const [resolution, setResolution] = useState<"refund_buyer" | "release_supplier">(
        "refund_buyer"
    );
    const [note, setNote] = useState("");

    const loadQueue = useCallback(async () => {
        if (!session) return;
        setLoading(true);
        setError(null);
        try {
            setQueue(await invoke<ReviewDispute[]>({ action: "review_queue" }));
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Unable to load review queue.");
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => {
        void loadQueue();
    }, [loadQueue]);

    if (authLoading) {
        return <div className="flex min-h-screen items-center justify-center bg-[#F7F9F5]"><LoaderCircle className="animate-spin text-[#4F6F56]" /></div>;
    }

    if (!session) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F7F9F5] px-4">
                <form
                    onSubmit={async (event) => {
                        event.preventDefault();
                        setSubmitting(true);
                        setError(null);
                        try {
                            await signIn(email, password);
                        } catch (cause) {
                            setError(cause instanceof Error ? cause.message : "Sign-in failed.");
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                    className="w-full max-w-md rounded-3xl border border-[#DDE5DC] bg-white p-7"
                >
                    <BrandLockup size="md" priority />
                    <Scale className="mt-10 text-[#4F6F56]" size={25} />
                    <h1 className="mt-4 text-2xl font-bold text-[#2F312F]">Independent review</h1>
                    <p className="mt-2 text-sm text-[#707670]">For approved ReStock reviewers only.</p>
                    <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Reviewer email" className="mt-6 w-full rounded-xl border border-[#D7DFD5] px-4 py-3 text-sm" />
                    <input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className="mt-3 w-full rounded-xl border border-[#D7DFD5] px-4 py-3 text-sm" />
                    {error ? <p role="alert" className="mt-3 text-xs text-[#A33A2B]">{error}</p> : null}
                    <button disabled={submitting} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#365845] px-4 py-3 text-sm font-bold text-white">{submitting ? <LoaderCircle className="animate-spin" size={15} /> : <LockKeyhole size={15} />} Sign in</button>
                </form>
            </div>
        );
    }

    const resolve = async () => {
        if (!selected || note.trim().length < 10) return;
        setSubmitting(true);
        setError(null);
        try {
            await invoke({
                action: "resolve_dispute",
                disputeId: selected.id,
                resolution,
                note: note.trim(),
            });
            setSelected(null);
            setNote("");
            await loadQueue();
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Unable to resolve dispute.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F9F5]">
            <header className="border-b border-[#DDE5DC] bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
                    <div className="flex items-center gap-4"><BrandLockup size="sm" priority /><span className="rounded-lg bg-[#EDF3EC] px-2.5 py-1 text-[9px] font-bold text-[#4F6F56] uppercase">Independent review</span></div>
                    <div className="flex items-center gap-3"><button type="button" onClick={() => void loadQueue()} className="rounded-xl p-2 text-[#667066]" aria-label="Refresh"><RefreshCw size={15} /></button><button type="button" onClick={() => void signOut()} className="text-xs font-semibold text-[#667066]">Sign out</button></div>
                </div>
            </header>
            <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
                <h1 className="text-3xl font-bold tracking-[-0.03em] text-[#2F312F]">Delivery issues to review</h1>
                <p className="mt-2 text-sm text-[#707670]">Compare the supplier and retailer photos with Ninja Van updates before making a final decision.</p>
                {error ? <p role="alert" className="mt-5 rounded-xl bg-[#FFF2EF] px-4 py-3 text-xs text-[#A33A2B]">{error}</p> : null}
                {loading ? <div className="flex justify-center py-20 text-[#6F9277]"><LoaderCircle className="animate-spin" size={24} /></div> : (
                    <div className="mt-7 space-y-5">
                        {queue.map((dispute) => (
                            <article key={dispute.id} className="rounded-3xl border border-[#DDE5DC] bg-white p-5 sm:p-6">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div><div className="flex items-center gap-2"><AlertTriangle size={17} className="text-[#A96838]" /><h2 className="text-sm font-bold text-[#2F312F]">{dispute.reference} · {dispute.order.reference}</h2></div><p className="mt-2 text-xs text-[#707670]">{dispute.order.product_summary} · {dispute.order.quantity} units · {dispute.order.retailer_alias} ↔ {dispute.order.supplier_alias}</p><p className="mt-3 max-w-3xl text-xs leading-6 text-[#5E685E]">{dispute.automated_assessment}</p></div>
                                    <button type="button" onClick={() => { setSelected(dispute); setNote(""); }} className="rounded-xl bg-[#365845] px-4 py-2.5 text-xs font-bold text-white">Review issue</button>
                                </div>
                            </article>
                        ))}
                        {queue.length === 0 ? <div className="rounded-3xl border border-dashed border-[#C9D4C6] bg-white py-16 text-center"><CheckCircle2 size={27} className="mx-auto text-[#4F6F56]" /><p className="mt-3 text-sm font-semibold text-[#2F312F]">No delivery issues need review</p></div> : null}
                    </div>
                )}
            </main>

            {selected ? (
                <div className="fixed inset-0 z-[90] overflow-y-auto bg-[#142016]/60 p-4 backdrop-blur-sm">
                    <div className="mx-auto my-6 max-w-4xl rounded-3xl bg-white p-6">
                        <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold tracking-[0.15em] text-[#6F9277] uppercase">Final decision</p><h2 className="mt-1 text-xl font-bold text-[#2F312F]">{selected.reference}</h2></div><button type="button" onClick={() => setSelected(null)} className="text-xs font-semibold text-[#667066]">Close</button></div>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            {selected.order.restock_delivery_proofs.map((proof) => (
                                <div key={proof.id} className="rounded-2xl border border-[#DDE5DC] p-4"><p className="text-xs font-bold text-[#2F312F]">{proof.actor_type === "supplier" ? "Supplier dispatch photo" : "Retailer delivery photo"}</p>{proof.signed_url ? <div className="relative mt-3 h-64 overflow-hidden rounded-xl"><Image src={proof.signed_url} alt={proof.actor_type === "supplier" ? "Supplier dispatch photo" : "Retailer delivery photo"} fill unoptimized className="object-cover" /></div> : null}<p className="mt-3 text-[10px] text-[#667066]">{proof.quantity} units · {conditionLabel(proof.condition)}</p><p className="mt-1 text-[10px] text-[#8A918A]">{proof.note || "No note added"}</p></div>
                            ))}
                        </div>
                        <div className="mt-5 rounded-2xl bg-[#F7F9F5] p-4"><p className="text-xs font-bold text-[#2F312F]">Delivery timeline</p><div className="mt-3 space-y-3">{selected.order.restock_fulfillment_events.map((event) => { const copy = timelineEventCopy(event); return <div key={event.id} className="flex items-start gap-3"><span className="mt-1.5 h-2 w-2 rounded-full bg-[#6F9277]" /><div><p className="text-xs font-semibold text-[#414641]">{copy.title}</p><p className="text-[10px] text-[#7B817B]">{copy.detail}</p></div></div>; })}</div></div>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">{(["refund_buyer", "release_supplier"] as const).map((value) => <button type="button" key={value} onClick={() => setResolution(value)} className={`rounded-2xl border p-4 text-left ${resolution === value ? "border-[#6F9277] bg-[#F1F6F0]" : "border-[#DDE5DC]"}`}><p className="text-xs font-bold text-[#2F312F]">{value === "refund_buyer" ? "Refund retailer" : "Pay supplier"}</p><p className="mt-1 text-[10px] text-[#7B817B]">{value === "refund_buyer" ? "The delivery photos and records support the retailer’s report." : "The delivery photos and records show the order was completed correctly."}</p></button>)}</div>
                        <label className="mt-4 block"><span className="mb-1.5 block text-xs font-semibold text-[#414641]">Decision notes</span><textarea rows={4} minLength={10} maxLength={3000} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Explain how the photos and delivery updates support this decision." className="w-full resize-none rounded-xl border border-[#D7DFD5] bg-[#FAFBF9] px-4 py-3 text-sm" /></label>
                        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#F3F7F2] p-4"><ShieldCheck size={17} className="mt-0.5 text-[#4F6F56]" /><p className="text-xs leading-5 text-[#5E685E]">Your name, decision, notes, and time are saved with the order and shared with both businesses.</p></div>
                        <button type="button" onClick={() => void resolve()} disabled={submitting || note.trim().length < 10} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#365845] px-4 py-3 text-sm font-bold text-white disabled:opacity-40">{submitting ? <LoaderCircle className="animate-spin" size={16} /> : <Scale size={16} />} Save final decision</button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
