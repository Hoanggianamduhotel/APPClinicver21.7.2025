import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Dùng cho giao diện (Client)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Dùng cho API (Server) - Đây là thứ file route.ts của bạn đang tìm
export const createServerSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseKey);
};
