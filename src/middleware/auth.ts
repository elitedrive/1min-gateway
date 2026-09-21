
import { createMiddleware } from "hono/factory";
import type { HonoEnv } from "../types/hono";
import { AuthenticationError } from "../utils/errors";
import { getGatewayConfig } from "../admin/store";

export const authMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  // Support both OpenAI-style Bearer token and Anthropic-style x-api-key
  const incomingKey =
    c.req.header("Authorization")?.replace("Bearer ", "") ||
    c.req.header("x-api-key");

  if (!incomingKey) {
    throw new AuthenticationError("API key is required");
  }

  let finalApiKey = incomingKey;

  // Load config from KV (fallback to env)
  const cfg = await getGatewayConfig(c.env);
  const masterToken = (cfg.authToken && cfg.authToken.trim()) || c.env.AUTH_TOKEN;
  const upstreamApiKey = (cfg.oneMinApiKey && cfg.oneMinApiKey.trim()) || c.env.ONE_MIN_API_KEY;

  if (masterToken) {
    if (incomingKey === masterToken) {
      if (!upstreamApiKey) {
        throw new AuthenticationError(
          "AUTH_TOKEN validated, but ONE_MIN_API_KEY is not configured in KV or Worker variables."
        );
      }
      finalApiKey = upstreamApiKey;
    } else if (incomingKey !== upstreamApiKey) {
      throw new AuthenticationError("Invalid API key");
    }
  }

  c.set("apiKey", finalApiKey);
  await next();
});
