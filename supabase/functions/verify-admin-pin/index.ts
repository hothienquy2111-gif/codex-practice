import { createClient } from "jsr:@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

const readNamedKey = (envName: string) => {
  try {
    const keys = JSON.parse(Deno.env.get(envName) || "{}");
    return typeof keys.default === "string" ? keys.default : "";
  } catch {
    return "";
  }
};

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
};

const readJwtSessionId = (token: string) => {
  try {
    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(token.split(".")[1] || "")));
    const sessionId = typeof payload.session_id === "string" ? payload.session_id : "";
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId)
      ? sessionId
      : "";
  } catch {
    return "";
  }
};

const parsePinHash = (encoded: string) => {
  const [algorithm, iterationsText, saltText, digestText, extra] = encoded.split("$");
  const iterations = Number(iterationsText);
  if (
    algorithm !== "pbkdf2-sha256" ||
    extra !== undefined ||
    !Number.isInteger(iterations) ||
    iterations < 100_000 ||
    iterations > 1_000_000
  ) return null;

  try {
    const salt = decodeBase64Url(saltText);
    const digest = decodeBase64Url(digestText);
    if (salt.length < 16 || digest.length < 32) return null;
    return { iterations, salt, digest };
  } catch {
    return null;
  }
};

const verifyPin = async (pin: string, encodedHash: string) => {
  const parsed = parsePinHash(encodedHash);
  if (!parsed) throw new Error("PIN_SECRET_UNAVAILABLE");

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pin),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: parsed.salt, iterations: parsed.iterations },
    key,
    parsed.digest.length * 8,
  );
  const actual = new Uint8Array(bits);
  let difference = actual.length ^ parsed.digest.length;
  for (let index = 0; index < actual.length; index += 1) {
    difference |= actual[index] ^ (parsed.digest[index] ?? 0);
  }
  return difference === 0;
};

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ ok: false }, 405);

  const authorization = request.headers.get("Authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return json({ ok: false }, 401);

  const token = match[1];
  const sessionId = readJwtSessionId(token);
  if (!sessionId) return json({ ok: false }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const publishableKey = readNamedKey("SUPABASE_PUBLISHABLE_KEYS") || Deno.env.get("SUPABASE_ANON_KEY") || "";
  const secretKey = readNamedKey("SUPABASE_SECRET_KEYS") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!supabaseUrl || !publishableKey || !secretKey) return json({ ok: false }, 503);

  const userClient = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authorization } },
  });
  const adminClient = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    const user = userData?.user;
    if (userError || !user) return json({ ok: false }, 401);

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) return json({ ok: false }, 503);
    if (profile?.role !== "admin") return json({ ok: false }, 403);

    let payload: { action?: unknown; pin?: unknown } = {};
    try {
      payload = await request.json();
    } catch {
      return json({ ok: false }, 400);
    }
    const action = typeof payload.action === "string" ? payload.action : "";
    if (!new Set(["status", "verify", "revoke"]).has(action)) return json({ ok: false }, 400);

    const transition = async (stateAction: string, verifiedUntil: string | null = null) => {
      const { data, error } = await adminClient.rpc("admin_pin_security_transition", {
        p_user_id: user.id,
        p_session_id: sessionId,
        p_action: stateAction,
        p_verified_until: verifiedUntil,
      });
      if (error) throw new Error("PIN_STATE_UNAVAILABLE");
      return Array.isArray(data) ? data[0] : null;
    };

    if (action === "revoke") {
      await transition("revoke");
      return json({ ok: true, verified: false });
    }

    const currentState = await transition("status");
    const lockedUntil = currentState?.locked_until ? new Date(currentState.locked_until).getTime() : 0;
    if (action === "status") {
      return json({ ok: true, verified: Boolean(currentState?.is_verified) });
    }
    if (lockedUntil > Date.now()) return json({ ok: false }, 429);

    const pin = typeof payload.pin === "string" ? payload.pin : "";
    const pinHash = Deno.env.get("ADMIN_SECONDARY_PIN_HASH") || "";
    if (!parsePinHash(pinHash)) return json({ ok: false }, 503);

    const isValid = /^\d{6}$/.test(pin) && await verifyPin(pin, pinHash);
    if (!isValid) {
      const failedState = await transition("failure");
      const nextLockedUntil = failedState?.locked_until ? new Date(failedState.locked_until).getTime() : 0;
      return json({ ok: false }, nextLockedUntil > Date.now() ? 429 : 403);
    }

    await transition("success", new Date(Date.now() + 15 * 60 * 1000).toISOString());
    return json({ ok: true, verified: true });
  } catch {
    console.error("ADMIN_PIN_VERIFICATION_FAILED");
    return json({ ok: false }, 503);
  }
});
