import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Läuft bewusst über den Service-Role-Client statt direkt aus dem Browser:
// der "documents"-Storage-Bucket hat (Migration 0003) nur Policies für
// SELECT/INSERT/DELETE, keine für UPDATE — ein erneuter Upload auf denselben
// Pfad (z.B. immer "<user_id>/avatar.png", wie es der Foto-Zuschneiden-Dialog
// konsequent tut) ist storage-intern ein UPDATE und schlug daher mit einem
// RLS-Fehler fehl. Identität wird trotzdem über die normale, cookie-basierte
// Session geprüft — der Admin-Client wird ausschließlich auf den eigenen
// "user.id"-Ordner angewendet, nie auf nutzerkontrollierte Pfade.
export async function POST(request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "file_required" }, { status: 400 });
  }

  const ext = (file.type?.split("/")[1] || "jpg").toLowerCase();
  const path = `${user.id}/avatar.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const admin = createAdminClient();
  const { data: existingProfile } = await admin.from("profiles").select("avatar_url").eq("id", user.id).single();

  const { error: uploadError } = await admin.storage
    .from("documents")
    .upload(path, buffer, { upsert: true, contentType: file.type || "image/png" });
  if (uploadError) {
    return NextResponse.json({ error: "upload_failed", message: uploadError.message }, { status: 500 });
  }

  const { error: updateError } = await admin.from("profiles").update({ avatar_url: path }).eq("id", user.id);
  if (updateError) {
    return NextResponse.json({ error: "update_failed", message: updateError.message }, { status: 500 });
  }

  // Altes Foto unter anderer Dateiendung (z.B. von vor dem Zuschneiden-Dialog)
  // aufräumen, damit es nicht verwaist im Bucket liegen bleibt.
  if (existingProfile?.avatar_url && existingProfile.avatar_url !== path) {
    await admin.storage.from("documents").remove([existingProfile.avatar_url]);
  }

  return NextResponse.json({ avatar_url: path });
}

export async function DELETE() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("avatar_url").eq("id", user.id).single();
  if (profile?.avatar_url) {
    await admin.storage.from("documents").remove([profile.avatar_url]);
  }

  const { error } = await admin.from("profiles").update({ avatar_url: null }).eq("id", user.id);
  if (error) {
    return NextResponse.json({ error: "update_failed", message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
