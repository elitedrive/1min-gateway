import { Hono } from "hono";
import type { HonoEnv } from "../types/hono";

const app = new Hono<HonoEnv>();

app.get("/", (c) => {
  return c.html(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VeroDesk 1min Gateway</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
    .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); max-width: 400px; width: 100%; text-align: center; }
    h1 { margin-top: 0; color: #1f2937; font-size: 1.5rem; }
    p { color: #4b5563; line-height: 1.5; }
    .status { display: inline-block; padding: 0.25rem 0.75rem; background-color: #dcfce7; color: #166534; border-radius: 9999px; font-weight: 500; font-size: 0.875rem; margin-top: 1rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>VeroDesk Gateway</h1>
    <p>API Gateway is running.</p>
    <div class="status">Online & Protected</div>
    <p style="margin-top: 1.5rem; font-size: 0.875rem; color: #6b7280;">Access to the control panel requires authorization.</p>
  </div>
</body>
</html>`
  );
});

export default app;
