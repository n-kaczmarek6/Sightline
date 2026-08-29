import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { generatePdf } from "@/lib/cv-export/pdf";
import { generateDocx } from "@/lib/cv-export/docx";

function sanitizeFilenamePart(value) {
  return (value || "CV").replace(/[^\w-]+/g, "_").replace(/_+/g, "_").slice(0, 60);
}

function headerTagline(label) {
  if (!label) return "";
  // Das Label enthält oft "Titel — Firma" (siehe CvDraftSchema.label) zur
  // Identifikation in der CV-Builder-Liste — im Kopfbereich des Lebenslaufs
  // wird nur der Titel als Tagline unter dem Namen gezeigt, ohne Firma.
  return label.split(" — ")[0].trim();
}

function buildContactLine(profile, email) {
  const location = profile?.location?.trim();
  const country = profile?.country?.trim();
  const parts = [];
  if (location) parts.push(location);
  if (country && !(location && location.toLowerCase().includes(country.toLowerCase()))) {
    parts.push(country);
  }
  if (profile?.phone) parts.push(profile.phone);
  if (profile?.linkedin_url) parts.push(profile.linkedin_url);
  parts.push(email);
  return parts.join(" · ");
}

export async function GET(request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const versionId = searchParams.get("versionId");
  const type = searchParams.get("type");
  if (!versionId || !["pdf", "docx"].includes(type)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const [{ data: version }, { data: profile }] = await Promise.all([
    supabase.from("cv_versions").select("*").eq("id", versionId).eq("user_id", user.id).single(),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
  ]);

  if (!version) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const locale = profile?.locale || "de";
  const t = await getTranslations({ locale, namespace: "builder" });

  // avatar_url speichert einen Pfad im privaten "documents"-Bucket (nicht wirklich
  // eine URL) — direkt über den authentifizierten Server-Client herunterladen statt
  // über eine öffentliche URL, siehe uploadAvatar in AppContext.js für den Hintergrund.
  let avatarBase64 = null;
  let avatarBuffer = null;
  let avatarDocxType = null;
  if (profile?.avatar_url) {
    try {
      const { data: avatarBlob, error: avatarError } = await supabase.storage
        .from("documents")
        .download(profile.avatar_url);
      if (!avatarError && avatarBlob) {
        const contentType = avatarBlob.type || "image/png";
        const bytes = Buffer.from(await avatarBlob.arrayBuffer());
        avatarBuffer = bytes;
        avatarBase64 = `data:${contentType};base64,${bytes.toString("base64")}`;
        avatarDocxType = contentType.includes("jpeg") || contentType.includes("jpg") ? "jpg" : "png";
      }
    } catch {
      // Foto konnte nicht geladen werden — Export läuft trotzdem ohne Foto weiter.
    }
  }

  const cvData = {
    name: profile?.full_name || user.email,
    contact: buildContactLine(profile, user.email),
    label: headerTagline(version.label),
    summary: version.summary,
    experience: version.experience_text,
    education: version.education_text,
    skills: version.skills_text,
    achievements: version.achievements_text,
    languages: (profile?.languages || []).join(", "),
    avatarBase64,
    avatarBuffer,
    avatarDocxType,
    labels: {
      summary: t("sections.summary"),
      experience: t("sections.experience"),
      education: t("sections.education"),
      skills: t("sections.skills"),
      achievements: t("sections.achievements"),
      languages: t("sections.languages"),
    },
  };

  const fileNameBase = `${sanitizeFilenamePart(cvData.name)}_${sanitizeFilenamePart(version.label)}`;

  if (type === "pdf") {
    const buffer = await generatePdf(cvData);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileNameBase}.pdf"`,
      },
    });
  }

  const buffer = await generateDocx(cvData);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${fileNameBase}.docx"`,
    },
  });
}
