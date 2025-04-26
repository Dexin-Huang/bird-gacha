// ‼ never import this module in client-side code (contains Service Role key)
import { createClient } from '@supabase/supabase-js';

// Use Service Role key for server-side operations
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { global: { fetch } }
);