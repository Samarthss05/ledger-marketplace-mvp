"use client";

import { createClient } from "@supabase/supabase-js";

const projectUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    "https://mlhjwbzxqvszfizaxzex.supabase.co";
const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    "sb_publishable_LFCUz6APyUiWv0ur_RbMmA_JE9iBCEQ";

export const supabase = createClient(projectUrl, publishableKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
    realtime: {
        params: {
            eventsPerSecond: 5,
        },
    },
});

export const DELIVERY_EVIDENCE_BUCKET = "restock-delivery-evidence";
