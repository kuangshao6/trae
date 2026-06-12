import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ Supabase 环境变量未配置，将使用本地 JSON 存储");
}

// 使用 service_role key 绕过 RLS，后端直接操作数据库
export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

export function isSupabaseAvailable(): boolean {
  return supabase !== null;
}
