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
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    { data: profile },
    { data: workExperience },
    { data: education },
    { data: skills },
    { data: documents },
    { data: applications },
    { data: cvVersions },
    { data: latestAnalysisRows },
    { count: analysesUsed },
    { data: blogPosts },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("work_experience").select("*").eq("profile_id", user.id).order("sort_order"),
    supabase.from("education").select("*").eq("profile_id", user.id).order("sort_order"),
    supabase.from("skills").select("*").eq("profile_id", user.id).order("created_at"),
    supabase.from("documents").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("applications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("cv_versions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase
      .from("job_analyses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("job_analyses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth.toISOString()),
    supabase.from("blog_posts").select("*").order("created_at", { ascending: false }),
  ]);

  return (
    <Suspense fallback={null}>
      <AppShell
        userEmail={user.email}
        initialProfile={profile}
        initialWorkExperience={workExperience ?? []}
        initialEducation={education ?? []}
        initialSkills={skills ?? []}
        initialDocuments={documents ?? []}
        initialApplications={applications ?? []}
        initialCvVersions={cvVersions ?? []}
        initialAnalysis={latestAnalysisRows?.[0] ?? null}
        initialAnalysesUsed={analysesUsed ?? 0}
        initialBlogPosts={blogPosts ?? []}
      />
    </Suspense>
  );
}


