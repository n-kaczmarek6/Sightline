import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { marked } from "marked";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

async function getPost(slug) {
  const supabase = createClient();
  const { data } = await supabase.from("blog_posts").select("*").eq("slug", slug).eq("published", true).single();
  return data;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  const title = post.meta_title || post.title;
  const description = post.meta_description || post.excerpt || undefined;
  return {
    title: `${title} — Sightline`,
    description,
    openGraph: {
      title,
      description,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const post = await getPost(slug);
  if (!post) notFound();

  const wordCount = post.content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(wordCount / 200));
  // Inhalt wird ausschließlich von Admins geschrieben (RLS beschränkt INSERT/
  // UPDATE auf blog_posts.is_admin) — dangerouslySetInnerHTML ist hier bewusst
  // vertretbar, kein nutzergenerierter Content.
  const html = marked.parse(post.content);

  return (
    <div id="screen-landing">
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <Link href="/" className="logo"><div className="logo-mark"></div>Sightline</Link>
        </div>
      </nav>

      <article style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>
        <Link href="/blog" style={{ fontSize: 13.5, color: "var(--text-muted)" }}>{t("backToList")}</Link>

        <h1 style={{ fontSize: 34, margin: "16px 0 8px" }}>{post.title}</h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
          {new Date(post.published_at || post.created_at).toLocaleDateString(locale === "en" ? "en-US" : "de-DE")}
          {" · "}{t("minuteRead", { minutes })}
        </p>

        {post.cover_image_url && (
          <img src={post.cover_image_url} alt="" style={{ width: "100%", borderRadius: 16, marginBottom: 28 }} />
        )}

        <div className="blog-content" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </div>
  );
}
