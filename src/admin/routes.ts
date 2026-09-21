
import { Hono } from "hono";
import type { HonoEnv } from "../types/hono";
import { getGatewayConfig, saveGatewayConfig } from "./store";

const adminApi = new Hono<HonoEnv>();

// Middleware to protect admin routes
adminApi.use("*", async (c, next) => {
  const token = c.req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return c.json({ error: "Unauthorized" }, 401);

  const cfg = await getGatewayConfig(c.env);
  const masterToken = (cfg.authToken && cfg.authToken.trim()) || c.env.AUTH_TOKEN;

  // Extremely basic protection - only masterToken can access
  if (token !== masterToken) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
});

adminApi.get("/config", async (c) => {
  const cfg = await getGatewayConfig(c.env);
  return c.json({
    authTokenPresent: !!cfg.authToken,
    oneMinApiKeyPresent: !!cfg.oneMinApiKey,
    envAuthTokenPresent: !!c.env.AUTH_TOKEN,
    envOneMinApiKeyPresent: !!c.env.ONE_MIN_API_KEY,
    // Provide masked view of the actual keys
    maskedAuthToken: (cfg.authToken || c.env.AUTH_TOKEN || "").substring(0, 4) + "...",
    maskedOneMinApiKey: (cfg.oneMinApiKey || c.env.ONE_MIN_API_KEY || "").substring(0, 8) + "...",
  });
});

adminApi.post("/config", async (c) => {
  const body = await c.req.json();
  const newConfig: { authToken?: string; oneMinApiKey?: string } = {};

  if (typeof body.authToken === "string" && body.authToken.length >= 4) {
    newConfig.authToken = body.authToken.trim();
  }
  if (typeof body.oneMinApiKey === "string" && body.oneMinApiKey.length > 0) {
    newConfig.oneMinApiKey = body.oneMinApiKey.trim();
  }

  await saveGatewayConfig(c.env, newConfig);
  return c.json({ success: true, message: "Configuration saved to KV successfully." });
});

export default adminApi;
