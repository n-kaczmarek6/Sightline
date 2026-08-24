import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractCvText } from "@/lib/cv-import/extract-text";

export async function POST(request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "invalid_form_data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!file || typeof file !== "object" || file.size === 0) {
    return NextResponse.json({ error: "file_required" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractCvText(buffer, file.name);
    return NextResponse.json({ text });
  } catch (err) {
    return NextResponse.json({ error: "file_unreadable", message: err.message }, { status: 400 });
  }
}
