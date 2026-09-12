// =============================================================================
// AgriCore Client Matching Engine
// Exact JavaScript implementation of PostgreSQL PL/pgSQL calculate_candidate_match_score()
// =============================================================================

export function calculateMatchScore(job, candidate) {
  if (!job || !candidate) return 50;

  // 1. Specialization Match (Weight: 30%)
  const jobSpecs = job.specializations || [];
  const candSpecs = candidate.specializations || [];
  let specScore = 1.0;
  if (jobSpecs.length > 0) {
    const matched = jobSpecs.filter(s => candSpecs.includes(s)).length;
    specScore = Math.min(1.0, matched / jobSpecs.length);
  }

  // 2. Skills Match (Weight: 25%)
  const jobSkills = job.skills || [];
  const candSkills = candidate.skills || [];
  let skillsScore = 1.0;
  if (jobSkills.length > 0) {
    const matched = jobSkills.filter(s => candSkills.includes(s)).length;
    skillsScore = Math.min(1.0, matched / jobSkills.length);
  }

  // 3. Experience Match (Weight: 20%)
  const candExp = candidate.experience_years || 0;
  const minExp = job.min_exp || 0;
  const maxExp = job.max_exp || 10;
  let expScore = 0.5;
  if (candExp >= minExp) {
    if (candExp <= maxExp + 1.5) {
      expScore = 1.0;
    } else {
      expScore = 0.85; // slightly overqualified
    }
  } else if (candExp >= minExp - 1) {
    expScore = 0.70;
  } else {
    expScore = Math.max(0.2, (candExp / Math.max(1, minExp)) * 0.7);
  }

  // 4. Location Match (Weight: 15%)
  let locScore = 0.40;
  const jobLoc = (job.location || "").toLowerCase().trim();
  const candLoc = (candidate.governorate || "").toLowerCase().trim();
  if (job.is_remote || jobLoc === candLoc) {
    locScore = 1.0;
  } else if (["cairo", "giza"].includes(jobLoc) && ["cairo", "giza"].includes(candLoc)) {
    locScore = 0.90; // Greater Cairo metro
  }

  // 5. Education Match (Weight: 10%)
  let eduScore = 1.0;
  const candEdu = (candidate.education_level || "bachelor").toLowerCase();
  const jobEdu = (job.min_edu || "bachelor").toLowerCase();
  if (candEdu === jobEdu || ["master", "phd"].includes(candEdu)) {
    eduScore = 1.0;
  } else {
    eduScore = 0.50;
  }

  // Weighted Sum
  const totalScore = Math.round(
    (specScore * 30.0) +
    (skillsScore * 25.0) +
    (expScore * 20.0) +
    (locScore * 15.0) +
    (eduScore * 10.0)
  );

  return Math.max(15, Math.min(99, totalScore));
}
