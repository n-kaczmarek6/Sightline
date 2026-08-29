"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useApp } from "@/context/AppContext";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[äÄ]/g, "ae")
    .replace(/[öÖ]/g, "oe")
    .replace(/[üÜ]/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function emptyForm() {
  return {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image_url: "",
    meta_title: "",
    meta_description: "",
    published: false,
  };
}

function BlogPostForm({ post, onCancel, t }) {
  const { createBlogPost, updateBlogPost, uploadBlogCoverImage, savingBlogPost } = useApp();
  const [form, setForm] = useState(post ? { ...post } : emptyForm());
  const [slugTouched, setSlugTouched] = useState(!!post);
  const [uploading, setUploading] = useState(false);

  const setField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleTitleChange = (value) => {
    setField("title", value);
    if (!slugTouched) setField("slug", slugify(value));
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadBlogCoverImage(file);
    setUploading(false);
    if (url) setField("cover_image_url", url);
    e.target.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) return;
    if (post?.id) {
      await updateBlogPost(post.id, form);
    } else {
      await createBlogPost(form);
    }
    onCancel();
  };

  return (
    <form className="glass profile-section" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 12 }} onSubmit={handleSubmit}>
      <div>
        <div className="field-lbl">{t("form.title")}</div>
        <input className="profile-input" required value={form.title} onChange={(e) => handleTitleChange(e.target.value)} />
      </div>
      <div>
        <div className="field-lbl">{t("form.slug")}</div>
        <input
          className="profile-input"
          required
          value={form.slug}
          onChange={(e) => {
            setSlugTouched(true);
            setField("slug", slugify(e.target.value));
          }}
        />
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>{t("form.slugHint")}</p>
      </div>
      <div>
        <div className="field-lbl">{t("form.excerpt")}</div>
        <textarea className="profile-input" style={{ width: "100%", resize: "vertical" }} rows={2} value={form.excerpt || ""} onChange={(e) => setField("excerpt", e.target.value)} />
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>{t("form.excerptHint")}</p>
      </div>
      <div>
        <div className="field-lbl">{t("form.content")}</div>
        <textarea className="profile-input" style={{ width: "100%", resize: "vertical", fontFamily: "monospace" }} rows={16} required value={form.content} onChange={(e) => setField("content", e.target.value)} />
      </div>
      <div>
        <div className="field-lbl">{t("form.coverImage")}</div>
        {form.cover_image_url && (
          <img src={form.cover_image_url} alt="" style={{ width: "100%", maxWidth: 320, borderRadius: 12, marginBottom: 8, display: "block" }} />
        )}
        <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer", margin: 0 }}>
          {uploading ? "…" : form.cover_image_url ? t("form.coverImageChange") : t("form.coverImageUpload")}
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleCoverUpload} disabled={uploading} />
        </label>
      </div>
      <div>
        <div className="field-lbl">{t("form.metaTitle")}</div>
        <input className="profile-input" value={form.meta_title || ""} onChange={(e) => setField("meta_title", e.target.value)} />
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>{t("form.metaTitleHint")}</p>
      </div>
      <div>
        <div className="field-lbl">{t("form.metaDescription")}</div>
        <textarea className="profile-input" style={{ width: "100%", resize: "vertical" }} rows={2} value={form.meta_description || ""} onChange={(e) => setField("meta_description", e.target.value)} />
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>{t("form.metaDescriptionHint")}</p>
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
        <input type="checkbox" checked={!!form.published} onChange={(e) => setField("published", e.target.checked)} />
        {t("form.published")}
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" className="btn btn-primary btn-sm" disabled={savingBlogPost}>
          {savingBlogPost ? t("form.saving") : t("form.save")}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>{t("form.cancel")}</button>
      </div>
    </form>
  );
}

export default function BlogAdminPanel() {
  const { blogPosts, deleteBlogPost, selectedBlogPostId, setSelectedBlogPostId } = useApp();
  const t = useTranslations("blogAdmin");
  const [showForm, setShowForm] = useState(false);

  const editingPost = selectedBlogPostId ? blogPosts.find((p) => p.id === selectedBlogPostId) : null;

  if (showForm || editingPost) {
    return (
      <div className="panel">
        <div className="panel-head">
          <a href="#" onClick={(e) => { e.preventDefault(); setShowForm(false); setSelectedBlogPostId(null); }}>{t("back")}</a>
        </div>
        <BlogPostForm
          post={editingPost}
          t={t}
          onCancel={() => { setShowForm(false); setSelectedBlogPostId(null); }}
        />
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-head panel-head-row">
        <div><h1>{t("title")}</h1><p>{t("subtitle")}</p></div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>{t("newPost")}</button>
      </div>

      {blogPosts.length === 0 ? (
        <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>{t("empty")}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {blogPosts.map((post) => (
            <div key={post.id} className="glass profile-section" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700 }}>{post.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  /{post.slug} · <span className={`badge ${post.published ? "badge-mint" : "badge-warning"}`}>{post.published ? t("published") : t("draft")}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedBlogPostId(post.id)}>{t("edit")}</button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => { if (window.confirm(t("deleteConfirm"))) deleteBlogPost(post.id); }}
                >
                  {t("delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
