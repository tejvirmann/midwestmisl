import type { VercelRequest, VercelResponse } from "@vercel/node";

// Stores "notify me when the map is back" emails in a Resend Audience.
// Env vars (server-only, set in Vercel -> Settings -> Environment Variables):
//   RESEND_API_KEY      Resend dashboard -> API Keys (needs "Full access" or contacts access)
//   RESEND_AUDIENCE_ID  Resend dashboard -> Audiences -> your audience -> ID

const hits = new Map<string, number[]>();
function isRateLimited(ip: string, limit = 10, windowMs = 60 * 60 * 1000) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > limit;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = String(req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  if (body.website) return res.json({ success: true }); // honeypot

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!apiKey || !audienceId) {
    console.error("RESEND_API_KEY or RESEND_AUDIENCE_ID not set");
    return res.status(500).json({ error: "Sign-ups are temporarily unavailable." });
  }

  try {
    const r = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email, unsubscribed: false }),
    });
    if (!r.ok) {
      console.error("Resend error", r.status, await r.text());
      return res.status(502).json({ error: "Could not save your email. Please try again." });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("Resend request failed", err);
    return res.status(502).json({ error: "Could not save your email. Please try again." });
  }
}
