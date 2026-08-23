import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Löscht den eingeloggten Account vollständig: auth.users-Zeile weg,
// alle abhängigen Tabellen (profiles, skills, work_experience, documents,
// applications, cv_versions, job_analyses, subscriptions) via "on delete
// cascade" ebenfalls weg. Storage-Dateien hängen NICHT an der FK-Kaskade,
// die räumen wir hier separat auf.
export async function DELETE() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: files } = await admin.storage.from("documents").list(user.id);
  if (files?.length) {
    const paths = files.map((f) => `${user.id}/${f.name}`);
    await admin.storage.from("documents").remove(paths);
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json({ error: "delete_failed", message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
