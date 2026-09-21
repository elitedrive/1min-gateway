
import { Hono } from "hono";
import type { HonoEnv } from "../types/hono";
import { renderDashboardHtml } from "../ui/dashboard";

const app = new Hono<HonoEnv>();

app.get("/", (c) => {
  const origin = new URL(c.req.url).origin;
  return c.html(renderDashboardHtml(origin));
});

export default app;
