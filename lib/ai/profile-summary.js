export function buildProfileSummary(profile, workExperience, skills) {
  const lines = [];
  if (profile?.full_name) lines.push(`Name: ${profile.full_name}`);
  if (profile?.location || profile?.country) {
    lines.push(`Standort: ${[profile.location, profile.country].filter(Boolean).join(", ")}`);
  }
  if (profile?.target_roles?.length) lines.push(`Zielrollen: ${profile.target_roles.join(", ")}`);
  if (profile?.work_model) lines.push(`Bevorzugtes Arbeitsmodell: ${profile.work_model}`);
  if (profile?.languages?.length) lines.push(`Sprachen: ${profile.languages.join(", ")}`);

  lines.push("");
  lines.push("BERUFSERFAHRUNG:");
  if (!workExperience?.length) lines.push("(keine angegeben)");
  for (const exp of workExperience || []) {
    lines.push(`- ${exp.title} bei ${exp.company} (${exp.start_date || "?"} – ${exp.end_date || "heute"})`);
    for (const b of exp.bullets || []) lines.push(`  • ${b}`);
  }

  lines.push("");
  lines.push(`SKILLS: ${skills?.length ? skills.map((s) => s.name).join(", ") : "(keine angegeben)"}`);

  return lines.join("\n");
}
