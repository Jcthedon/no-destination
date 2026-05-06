import { type Profile, type Country, ANSWER_SCORES, ARCHETYPES, COUNTRIES } from "./data";

const WEIGHTS: Record<keyof Profile, number> = {
  pace: 1.5,
  environment: 1.5,
  culture: 1.5,
  adventure: 2,
  food: 1,
  budget: 2,
  climate: 1,
};

const DIMS = Object.keys(WEIGHTS) as (keyof Profile)[];

const MAX_DIST = Math.sqrt(
  DIMS.reduce((sum, dim) => sum + WEIGHTS[dim] * 100 * 100, 0)
);

export function computeProfile(answers: (number | undefined)[]): Profile {
  const totals: Partial<Record<keyof Profile, number[]>> = {};

  answers.forEach((answer, qIndex) => {
    if (answer === undefined || answer === null) return;
    const scores = ANSWER_SCORES[qIndex]?.[answer] ?? {};
    for (const [dim, val] of Object.entries(scores)) {
      const key = dim as keyof Profile;
      if (!totals[key]) totals[key] = [];
      totals[key]!.push(val as number);
    }
  });

  const profile: Profile = {
    pace: 50,
    environment: 50,
    culture: 50,
    adventure: 50,
    food: 50,
    budget: 50,
    climate: 50,
  };

  for (const [dim, vals] of Object.entries(totals)) {
    const key = dim as keyof Profile;
    profile[key] = Math.round(
      (vals as number[]).reduce((a, b) => a + b, 0) / (vals as number[]).length
    );
  }

  return profile;
}

export function getArchetype(profile: Profile): string {
  if (profile.adventure > 65 && profile.pace < 50) return "Backpacker Spirit";
  if (profile.culture > 65 && profile.pace > 50) return "Culture Hunter";
  if (profile.environment > 60) return "City Nomad";
  return "Slow Wanderer";
}

export function matchScore(user: Profile, country: Profile): number {
  const dist = Math.sqrt(
    DIMS.reduce(
      (sum, dim) => sum + WEIGHTS[dim] * Math.pow(user[dim] - country[dim], 2),
      0
    )
  );
  return Math.round((1 - dist / MAX_DIST) * 100);
}

export function getMatches(profile: Profile): Country[] {
  return COUNTRIES.map((c) => ({
    ...c,
    matchScore: matchScore(profile, c.profile),
  })).sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
}

export function getArchetypeInfo(profile: Profile) {
  const archetypeName = getArchetype(profile);
  return { ...ARCHETYPES[archetypeName] };
}

export function getGroupMatches(profiles: Profile[]): Country[] {
  if (profiles.length === 0) return [];
  if (profiles.length === 1) return getMatches(profiles[0]);

  const avg = Object.fromEntries(
    DIMS.map((k) => [k, Math.round(profiles.reduce((s, p) => s + p[k], 0) / profiles.length)])
  ) as Profile;

  return COUNTRIES.map((country) => {
    const avgScore = matchScore(avg, country.profile);
    // Penalize destinations where any one person gets a poor fit
    const minScore = Math.min(...profiles.map((p) => matchScore(p, country.profile)));
    const score = Math.round(0.65 * avgScore + 0.35 * minScore);
    return { ...country, matchScore: score };
  }).sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
}
