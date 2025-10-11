export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const companyName = body?.companyName?.trim?.()
    console.log("API /api/reviews POST body:", body)

    if (!companyName) {
      console.log("Missing companyName")
      return new Response(JSON.stringify({ error: "companyName is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const upstreamUrl = "https://vercel-puppeteer-kappa.vercel.app/api/scrapeReviews"
    console.log("Forwarding request to upstream:", upstreamUrl, "companyName:", companyName)

    const upstreamRes = await fetch(upstreamUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName }),
    })

    const text = await upstreamRes.text()
    console.log("Upstream status:", upstreamRes.status)
    console.log("Upstream raw body:", text)

    // Try to parse JSON, fallback to plain text
    let json: any
    try {
      json = JSON.parse(text)
    } catch {
      json = { raw: text }
    }

    if (!upstreamRes.ok) {
      return new Response(JSON.stringify({ error: "Upstream error", details: json }), {
        status: upstreamRes.status,
        headers: { "Content-Type": "application/json" },
      })
    }

    // If upstream indicates no reviews, normalize to the required message
    // We pass through the upstream data; client will handle "no reviews" UI if counts resolve to 0.
    return new Response(JSON.stringify({ ...json, companyName }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (e: any) {
    console.log("/api/reviews unexpected error:", e?.message || e)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
