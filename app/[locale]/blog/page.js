import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return { title: `${t("title")} — Sightline` };
}

export default async function BlogListPage({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const supabase = createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, cover_image_url, published_at, created_at")
    .eq("published", true)
    .order("published_at", { ascending: false });

  return (
    <div id="screen-landing">
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <Link href="/" className="logo"><div className="logo-mark"></div>Sightline</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 80px" }}>
        <h1 style={{ fontSize: 32, marginBottom: 32 }}>{t("title")}</h1>

        {(!posts || posts.length === 0) ? (
          <p style={{ color: "var(--text-muted)" }}>{t("empty")}</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="glass"
                style={{ display: "block", padding: 22, textDecoration: "none", color: "inherit" }}
              >
                {post.cover_image_url && (
                  <img
                    src={post.cover_image_url}
                    alt=""
                    style={{ width: "100%", maxHeight: 260, objectFit: "cover", borderRadius: 14, marginBottom: 16 }}
                  />
                )}
                <h2 style={{ fontSize: 22, margin: "0 0 8px" }}>{post.title}</h2>
                {post.excerpt && <p style={{ color: "var(--text-muted)", margin: 0 }}>{post.excerpt}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
