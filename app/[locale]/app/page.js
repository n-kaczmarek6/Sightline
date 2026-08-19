import { Suspense } from "react";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Sightline — App",
};

export default async function AppPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware garantiert bereits eine Session für /app — hier holen wir
  // nur noch die Daten des eingeloggten Nutzers.
  const [{ data: profile }, { data: workExperience }, { data: skills }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("work_experience").select("*").eq("profile_id", user.id).order("sort_order"),
    supabase.from("skills").select("*").eq("profile_id", user.id).order("created_at"),
  ]);

  return (
    <Suspense fallback={null}>
      <AppShell
        userEmail={user.email}
        initialProfile={profile}
        initialWorkExperience={workExperience ?? []}
        initialSkills={skills ?? []}
      />
    </Suspense>
  );
}
