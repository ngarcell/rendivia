import { createServerClient } from "@/lib/supabase/server";
import { createHash, randomBytes } from "crypto";

const PREFIX = "rnd_";
const KEY_BYTES = 32;

export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const secret = randomBytes(KEY_BYTES).toString("base64url");
  const key = `${PREFIX}${secret}`;
  const hash = createHash("sha256").update(key).digest("hex");
  const prefix = key.slice(0, PREFIX.length + 8);
  return { key, prefix, hash };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function getKeyPrefix(key: string): string {
  return key.slice(0, PREFIX.length + 8);
}

export async function validateApiKey(
  key: string
): Promise<{ userId: string | null; teamId: string | null } | null> {
  if (!key.startsWith(PREFIX) || key.length < 40) return null;
  const supabase = createServerClient();
  const hash = hashApiKey(key);
  const { data, error } = await supabase
    .from("api_keys")
    .select("user_id, team_id")
    .eq("key_hash", hash)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as { user_id: string | null; team_id: string | null };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("key_hash", hash);
  return { userId: row.user_id ?? null, teamId: row.team_id ?? null };
}

export async function createApiKeyForUser(
  userId: string,
  name?: string
): Promise<{ key: string; id: string }> {
  const supabase = createServerClient();
  const { key, prefix, hash } = generateApiKey();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("api_keys")
    .insert({ user_id: userId, key_prefix: prefix, key_hash: hash, name })
    .select("id")
    .single();
  if (error) throw error;
  return { key, id: (data as { id: string }).id };
}
