import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Läuft server-seitig über den Service-Role-Client, genau wie /api/profile/avatar:
// weder der "avatars"- noch der "avatars2"-Bucket haben aktuell funktionierende
// RLS-Policies für INSERT (beide liefern "new row violates row-level security
// policy" bei einem Upload direkt aus dem Browser) — vermutlich nie sauber
// über die Migrationen angewendet. Statt die Policies zu reparieren (bräuchte
// wieder manuellen Zugriff auf den SQL-Editor), umgeht dieser Weg das
// Problem komplett. Admin-Check erfolgt hier, weil es keine RLS-Policy gibt,
// die das für uns übernimmt.
export async function POST(request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "file_required" }, { status: 400 });
  }

  const ext = (file.type?.split("/")[1] || "jpg").toLowerCase();
  const path = `blog/${user.id}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage
    .from("avatars2")
    .upload(path, buffer, { upsert: true, contentType: file.type || "image/png" });
  if (uploadError) {
    return NextResponse.json({ error: "upload_failed", message: uploadError.message }, { status: 500 });
  }

  const { data } = admin.storage.from("avatars2").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
