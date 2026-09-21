
import type { Env } from "../types";

export interface GatewayConfig {
  authToken?: string;
  oneMinApiKey?: string;
}

// In-memory cache for configuration (lives for the life of the worker isolate)
let memoryCache: GatewayConfig | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 5000;

export async function getGatewayConfig(env: Env): Promise<GatewayConfig> {
  const now = Date.now();
  if (memoryCache && now - lastCacheTime < CACHE_TTL_MS) {
    return memoryCache;
  }

  try {
    const raw = await env.RATE_LIMIT_STORE.get("GATEWAY_ADMIN_CONFIG");
    if (raw) {
      memoryCache = JSON.parse(raw);
      lastCacheTime = now;
      return memoryCache as GatewayConfig;
    }
  } catch (e) {
    console.error("Failed to read config from KV:", e);
  }

  return {};
}

export async function saveGatewayConfig(env: Env, config: GatewayConfig): Promise<void> {
  const current = await getGatewayConfig(env);
  const updated = { ...current, ...config };
  
  await env.RATE_LIMIT_STORE.put("GATEWAY_ADMIN_CONFIG", JSON.stringify(updated));
  memoryCache = updated;
  lastCacheTime = Date.now();
}
