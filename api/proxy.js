// Vercel's same-origin API bridge keeps secure teacher cookies first-party.
export default async function handler(req, res) {
  const origin = process.env.SERVER_API_URL;
  if (!origin)
    return res
      .status(503)
      .json({ error: "The learning server has not been connected yet." });
  try {
    const base = new URL(origin);
    if (base.protocol !== "https:")
      throw new Error("SERVER_API_URL must use HTTPS.");
    const requestUrl = new URL(req.url, "https://local.invalid");
    const endpoint = requestUrl.searchParams.get("path") || "";
    if (!/^[a-zA-Z0-9_/-]*$/.test(endpoint) || endpoint.includes(".."))
      return res.status(400).json({ error: "Invalid API path." });
    const target = new URL(`/api/${endpoint}`, base.origin);
    const headers = { "Content-Type": "application/json" };
    if (req.headers.cookie) headers.cookie = req.headers.cookie;
    if (req.headers.origin) headers.origin = req.headers.origin;
    const response = await fetch(target, {
      method: req.method,
      headers,
      body: ["GET", "HEAD"].includes(req.method)
        ? undefined
        : JSON.stringify(req.body),
      redirect: "error",
      signal: AbortSignal.timeout(25000),
    });
    res.status(response.status);
    res.setHeader("Cache-Control", "no-store");
    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "application/json",
    );
    const cookies = response.headers.getSetCookie();
    if (cookies.length) res.setHeader("Set-Cookie", cookies);
    res.send(await response.text());
  } catch {
    res
      .status(502)
      .json({
        error:
          "The learning server is waking up or unavailable. Please try again shortly.",
      });
  }
}
