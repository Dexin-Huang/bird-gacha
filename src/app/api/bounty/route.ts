import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const url   = new URL(req.url);
  const state = url.searchParams.get("state") ?? "Connecticut";

  const { data, error } = await supabase.rpc("get_state_bounty", { p_state: state });
  return error
    ? new Response(error.message, { status: 500 })
    : Response.json(data, { headers: { "cache-control": "s-maxage=3600" } });
}
