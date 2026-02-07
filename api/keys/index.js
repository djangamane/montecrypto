import { supabase } from "../_lib/supabase.js";
import crypto from "crypto";

/**
 * API Key Management Endpoints
 * GET - List user's API keys
 * POST - Create new API key
 * DELETE - Revoke API key
 */

// Tier configurations
const TIER_LIMITS = {
  free: 10,
  pro: 100,
  enterprise: null, // unlimited
};

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

  // Check user's subscription tier
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  const tier = profile?.subscription_tier || "free";

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
      limits: TIER_LIMITS,
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

    const maxKeys = tier === "enterprise" ? 10 : tier === "pro" ? 5 : 2;
    if (count >= maxKeys) {
      return res.status(400).json({
        error: `Maximum ${maxKeys} active API keys allowed for ${tier} tier`,
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
        daily_limit: TIER_LIMITS[tier],
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
