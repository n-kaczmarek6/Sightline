import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdf-parse pulls in pdfjs-dist's legacy build, which breaks when webpack bundles it
  // for the server/RSC layer (Object.defineProperty called on non-object). Keeping it
  // external makes Next load it via plain require() instead.
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "pdfjs-dist"],
  },
};
export default withNextIntl(nextConfig);
