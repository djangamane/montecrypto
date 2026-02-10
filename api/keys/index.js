import { supabase } from "../_lib/supabase.js";
import crypto from "crypto";

/**
 * API Key Management Endpoints
 * GET - List user's API keys
 * POST - Create new API key
 * DELETE - Revoke API key
 */

// Tier configurations based on entitlements
const TIER_CONFIG = {
  free: { daily_limit: 10, max_keys: 2 },
  monthly: { daily_limit: 50, max_keys: 3 },
  yearly: { daily_limit: 100, max_keys: 5 },
  lifetime: { daily_limit: 200, max_keys: 10 },
};

/**
 * Get user's tier from entitlements table
 */
async function getUserTier(userId) {
  const { data: entitlements } = await supabase
    .from("entitlements")
    .select("product")
    .eq("user_id", userId)
    .in("status", ["active", "past_due"]);

  if (!entitlements || entitlements.length === 0) {
    return "free";
  }

  const products = entitlements.map((e) => e.product);

  if (products.includes("lifetime_access")) return "lifetime";
  if (products.includes("scam_likely_yearly")) return "yearly";
  if (products.includes("scam_likely_monthly")) return "monthly";

  return "free";
}

/**
 * Generate a secure API key
 */
function generateApiKey() {
  const prefix = "acr_";
  const random = crypto.randomBytes(24).toString("base64url");
  return prefix + random;
}

/**
 * Hash API key for storage
 */
function hashApiKey(key) {
  return crypto.createHash("sha256").update(key).digest("hex");
}

/**
 * Get user from auth header
 */
async function getUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user;
}

export default async function handler(req, res) {
  // Authenticate user
  const user = await getUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Check user's subscription tier from entitlements
  const tier = await getUserTier(user.id);
  const tierConfig = TIER_CONFIG[tier] || TIER_CONFIG.free;

  if (req.method === "GET") {
    // List user's API keys
    const { data: keys, error } = await supabase
      .from("api_keys")
      .select("id, key_prefix, name, tier, daily_limit, calls_today, calls_total, is_active, created_at, last_used_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: "Failed to fetch API keys" });
    }

    return res.status(200).json({
      keys,
      tier,
      daily_limit: tierConfig.daily_limit,
      max_keys: tierConfig.max_keys,
    });
  }

  if (req.method === "POST") {
    const { name = "Default" } = req.body || {};

    // Check how many keys user has
    const { count } = await supabase
      .from("api_keys")
      .select("id", { count: "exact" })
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (count >= tierConfig.max_keys) {
      return res.status(400).json({
        error: `Maximum ${tierConfig.max_keys} active API keys allowed for ${tier} tier`,
      });
    }

    // Generate new key
    const rawKey = generateApiKey();
    const keyHash = hashApiKey(rawKey);
    const keyPrefix = rawKey.substring(0, 12) + "...";

    // Store in database
    const { data: newKey, error } = await supabase
      .from("api_keys")
      .insert({
        user_id: user.id,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        name,
        tier,
        daily_limit: tierConfig.daily_limit,
      })
      .select("id, key_prefix, name, tier, daily_limit, created_at")
      .single();

    if (error) {
      console.error("Failed to create API key:", error);
      return res.status(500).json({ error: "Failed to create API key" });
    }

    // Return the raw key ONCE - it cannot be retrieved again
    return res.status(201).json({
      message: "API key created successfully. Save it now - it cannot be shown again.",
      key: rawKey,
      id: newKey.id,
      name: newKey.name,
      tier: newKey.tier,
      daily_limit: newKey.daily_limit,
    });
  }

  if (req.method === "DELETE") {
    const { keyId } = req.body || {};

    if (!keyId) {
      return res.status(400).json({ error: "keyId required" });
    }

    // Deactivate the key (soft delete)
    const { error } = await supabase
      .from("api_keys")
      .update({ is_active: false })
      .eq("id", keyId)
      .eq("user_id", user.id);

    if (error) {
      return res.status(500).json({ error: "Failed to revoke API key" });
    }

    return res.status(200).json({ message: "API key revoked" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
