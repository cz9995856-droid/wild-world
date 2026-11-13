import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

export function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!supabaseConfigured()) return null;
  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
      {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { "X-Client-Info": "wildworld-museum/1.0" } },
      }
    );
  }
  return adminClient;
}

export function getSupabasePublic(): SupabaseClient | null {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
}

/**
 * Supabase 仓库适配说明：
 * 当前运行时默认使用 public/data 种子 + .data/content.json 覆盖层，以便在没有数据库的
 * 环境也能启动。数据库迁移（supabase/migrations/0001_init.sql）与种子（supabase/seed.sql）
 * 已完整提供。切换为 Supabase 读取需要将 repository 的读取函数替换为对 species /
 * media_assets / news_articles 等表的查询——本文件已提供客户端与配置检测，避免在没有
 * 真实连接时伪造状态。
 */
export async function supabaseHealth(): Promise<{
  configured: boolean;
  reachable: boolean | null;
  message: string;
}> {
  if (!supabaseConfigured()) {
    return {
      configured: false,
      reachable: null,
      message: "未配置 Supabase 环境变量。当前使用本地文件仓库。",
    };
  }
  const client = getSupabaseAdmin();
  if (!client) return { configured: false, reachable: null, message: "客户端初始化失败。" };
  try {
    const { error } = await client.from("species").select("id", { count: "exact", head: true });
    if (error) return { configured: true, reachable: false, message: `Supabase 已配置但查询失败：${error.message}` };
    return { configured: true, reachable: true, message: "Supabase 可访问。" };
  } catch (err) {
    return {
      configured: true,
      reachable: false,
      message: `Supabase 请求异常：${err instanceof Error ? err.message : String(err)}`,
    };
  }
}