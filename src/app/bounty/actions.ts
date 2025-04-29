// src/app/bounty/actions.ts
"use server";

// Assuming you have a central place for your Supabase client, otherwise initialize here
// import { supabase } from '@/lib/supabaseClient'; // Example import
import { createClient } from '@supabase/supabase-js'; // Or initialize directly

// Define the expected return type from your Supabase RPC
export interface BountyBird {
    com_name: string;
    tier: string; // Global tier (S, A, B, C, D, X, E)
    n_local: number; // Local records count
    // species_code?: string; // Optional: Include if needed for linking/details
}

// Ensure Supabase env vars are available
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Supabase environment variables SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
    // Throwing error during module load might be too aggressive, handle in function
}

export async function fetchBounty(state: string): Promise<BountyBird[]> {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error("Supabase environment variables are not configured.");
    }
    // Initialize Supabase client for server-side use
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    if (!state) {
        console.warn("fetchBounty called without a state.");
        return []; // Return empty if no state provided
    }

    try {
        console.log(`Fetching bounty for state: ${state}`); // Server-side log
        const { data, error } = await supabase.rpc('get_state_bounty', { p_state: state });

        if (error) {
            console.error('Supabase RPC Error (get_state_bounty):', error);
            throw new Error(`Failed to fetch bounty for ${state}: ${error.message}`);
        }

        console.log(`Fetched ${data?.length ?? 0} bounty birds for ${state}`);

        // Ensure data matches the expected structure, or return empty array
        return (data as BountyBird[] || []);

    } catch (err) {
        // Log the specific error caught
        if (err instanceof Error) {
             console.error(`Error in fetchBounty for ${state}:`, err.message);
        } else {
             console.error(`Unknown error fetching bounty for ${state}:`, err);
        }
        // Depending on desired frontend behavior, you might re-throw or return empty
        // Returning empty allows the frontend to show "No bounty found" gracefully
        return [];
    }
}