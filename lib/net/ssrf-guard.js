import dns from "node:dns/promises";
import net from "node:net";

function isPrivateIPv4(ip) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return true;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true; // link-local, incl. cloud metadata 169.254.169.254
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a >= 224) return true; // multicast / reserved
  return false;
}

function isPrivateIPv6(ip) {
  const lower = ip.toLowerCase();
  if (lower === "::1") return true;
  if (lower.startsWith("fe80:")) return true; // link-local
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local
  if (lower.startsWith("::ffff:")) {
    const v4 = lower.split(":").pop();
    if (net.isIPv4(v4)) return isPrivateIPv4(v4);
  }
  return false;
}

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) return isPrivateIPv4(ip);
  if (net.isIPv6(ip)) return isPrivateIPv6(ip);
  return true;
}

// Blocks fetches to loopback/private/link-local/metadata addresses (basic SSRF hygiene
// for the URL-import feature). Not resistant to DNS-rebinding between this check and the
// actual fetch a few ms later — acceptable for a single-tenant personal tool, not a
// guarantee against a determined attacker with control over their own DNS.
export async function assertPublicUrl(urlString) {
  let url;
  try {
    url = new URL(urlString);
  } catch {
    throw new Error("invalid_url");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("invalid_protocol");
  }
  if (url.username || url.password) {
    throw new Error("invalid_url");
  }
  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new Error("blocked_host");
  }

  let addresses;
  try {
    addresses = await dns.lookup(hostname, { all: true });
  } catch {
    throw new Error("dns_lookup_failed");
  }
  if (!addresses.length || addresses.some((a) => isPrivateIp(a.address))) {
    throw new Error("blocked_host");
  }

  return url;
}
