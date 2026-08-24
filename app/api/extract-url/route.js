import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertPublicUrl } from "@/lib/net/ssrf-guard";
import { htmlToText } from "@/lib/net/html-to-text";

const MAX_REDIRECTS = 3;
const FETCH_TIMEOUT_MS = 10000;
const MAX_HTML_CHARS = 2_000_000;
const MAX_TEXT_CHARS = 20000;

export async function POST(request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  let currentUrl = (body?.url || "").trim();
  if (!currentUrl) {
    return NextResponse.json({ error: "url_required" }, { status: 400 });
  }

  let response;
  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      const validated = await assertPublicUrl(currentUrl);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      try {
        response = await fetch(validated, {
          redirect: "manual",
          signal: controller.signal,
          headers: { "User-Agent": "Mozilla/5.0 (compatible; SightlineBot/1.0)" },
        });
      } finally {
        clearTimeout(timeout);
      }

      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location) throw new Error("redirect_without_location");
        currentUrl = new URL(location, validated).toString();
        continue;
      }
      break;
    }
  } catch (err) {
    return NextResponse.json({ error: "fetch_failed", message: err.message }, { status: 400 });
  }

  if (!response || !response.ok) {
    return NextResponse.json({ error: "fetch_failed" }, { status: 400 });
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("html") && !contentType.includes("text")) {
    return NextResponse.json({ error: "unsupported_content_type" }, { status: 400 });
  }

  let html;
  try {
    html = await response.text();
  } catch (err) {
    return NextResponse.json({ error: "fetch_failed", message: err.message }, { status: 400 });
  }
  if (html.length > MAX_HTML_CHARS) html = html.slice(0, MAX_HTML_CHARS);

  const text = htmlToText(html).slice(0, MAX_TEXT_CHARS);
  if (!text || text.length < 50) {
    return NextResponse.json({ error: "extraction_empty" }, { status: 400 });
  }

  return NextResponse.json({ text });
}
