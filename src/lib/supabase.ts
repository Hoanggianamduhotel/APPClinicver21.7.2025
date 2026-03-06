import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// 1. Export cho Client (Dùng cho giao diện DoctorView, ReceptionistView)
export const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Thêm hàm này để sửa lỗi Build (Dùng cho các file API trong thư mục src/app/api/)
export const createServerSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseKey);
};
