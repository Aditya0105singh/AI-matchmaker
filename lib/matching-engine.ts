import type { Profile, MatchScore } from "@/types";

// Weights must sum to 100
const WEIGHTS = {
  kidsPreference: 20,
  locationCompatibility: 10,
  educationCompatibility: 10,
  religionAlignment: 10,
  lifestyleCompatibility: 15,
  careerCompatibility: 10,
  familyValues: 10,
  incomeExpectations: 5,
  personalityFit: 10,
} as const;

function scoreKids(client: Profile, candidate: Profile): number {
  if (client.wantKids === candidate.wantKids) return 100;
  if (client.wantKids === "maybe" || candidate.wantKids === "maybe") return 60;
  return 10; // yes vs no is a dealbreaker
}

function scoreLocation(client: Profile, candidate: Profile): number {
  if (client.city === candidate.city) return 100;
  if (client.state === candidate.state) return 75;
  if (client.openToRelocate === "yes" || candidate.openToRelocate === "yes") return 65;
  if (client.openToRelocate === "maybe" || candidate.openToRelocate === "maybe") return 45;
  if (client.partnerCityPref.includes(candidate.city) || client.partnerCityPref.includes("Any")) return 80;
  return 20;
}

function scoreEducation(client: Profile, candidate: Profile): number {
  let score = 50;
  const topInstitutions = ["IIT", "IIM", "BITS", "AIIMS", "NLU"];
  const clientTop = topInstitutions.some((i) => client.undergraduateCollege.includes(i));
  const candTop = topInstitutions.some((i) => candidate.undergraduateCollege.includes(i));
  if (clientTop && candTop) score = 100;
  else if (clientTop || candTop) score = 70;
  if (client.partnerEducationPref.includes("Any") || client.partnerEducationPref.includes(candidate.degree)) score = Math.min(100, score + 20);
  return score;
}

function scoreReligion(client: Profile, candidate: Profile): number {
  if (client.religion === candidate.religion) {
    if (client.caste === candidate.caste) return 100;
    return 80;
  }
  if (client.partnerReligionPref.includes("Any")) return 70;
  if (client.partnerReligionPref.includes(candidate.religion)) return 75;
  return 25;
}

function scoreLifestyle(client: Profile, candidate: Profile): number {
  let score = 0;
  let factors = 0;

  // Diet compatibility
  const dietGroups = {
    vegetarian: ["vegetarian", "jain", "vegan"],
    nonveg: ["non_vegetarian", "eggetarian"],
  };
  const cDiet = dietGroups.vegetarian.includes(client.diet) ? "veg" : "nonveg";
  const pDiet = dietGroups.vegetarian.includes(candidate.diet) ? "veg" : "nonveg";
  score += cDiet === pDiet ? 100 : 30;
  factors++;

  // Smoking
  if (client.smoking === candidate.smoking) { score += 100; }
  else if (client.smoking === "no" && candidate.smoking !== "no") { score += 10; }
  else { score += 60; }
  factors++;

  // Drinking
  if (client.drinking === candidate.drinking) { score += 100; }
  else if (Math.abs(["no", "occasionally", "yes"].indexOf(client.drinking) - ["no", "occasionally", "yes"].indexOf(candidate.drinking)) === 1) { score += 65; }
  else { score += 20; }
  factors++;

  // Fitness
  const fitnessLevels = ["sedentary", "light", "moderate", "active", "very_active"];
  const diff = Math.abs(fitnessLevels.indexOf(client.fitnessLevel) - fitnessLevels.indexOf(candidate.fitnessLevel));
  score += Math.max(0, 100 - diff * 25);
  factors++;

  return score / factors;
}

function scoreCareer(client: Profile, candidate: Profile): number {
  // For female profiles: career compatibility matters more (education + industry alignment)
  if (client.gender === "female") {
    let score = 50;
    if (client.industry === candidate.industry) score += 25;
    if (Math.abs(client.experienceYears - candidate.experienceYears) <= 3) score += 25;
    return Math.min(100, score);
  }
  // For male profiles: basic compatibility
  const industryMatch = client.industry === candidate.industry ? 30 : 0;
  const expDiff = Math.abs(client.experienceYears - candidate.experienceYears);
  const expScore = Math.max(0, 70 - expDiff * 5);
  return Math.min(100, industryMatch + expScore);
}

function scoreFamilyValues(client: Profile, candidate: Profile): number {
  if (client.familyValues === candidate.familyValues) return 100;
  if (client.familyType === candidate.familyType) return 75;
  const valuesOrder = ["traditional", "moderate", "liberal"];
  const diff = Math.abs(valuesOrder.indexOf(client.familyValues) - valuesOrder.indexOf(candidate.familyValues));
  return diff === 1 ? 60 : 20;
}

function scoreIncome(client: Profile, candidate: Profile): number {
  if (client.gender === "male") {
    // Traditional: female's income <= male is preferred but not required
    if (candidate.annualIncomeINR <= client.annualIncomeINR) return 100;
    const ratio = client.annualIncomeINR / candidate.annualIncomeINR;
    return Math.max(20, ratio * 100);
  } else {
    // Female: prefers higher income partner
    if (candidate.annualIncomeINR >= client.partnerIncomeMinLPA) return 100;
    const ratio = candidate.annualIncomeINR / client.partnerIncomeMinLPA;
    return Math.max(10, ratio * 100);
  }
}

function scorePersonality(client: Profile, candidate: Profile): number {
  const introScore = Math.abs(client.introvertExtrovertScore - candidate.introvertExtrovertScore);
  const baseScore = Math.max(40, 100 - introScore * 10);

  // MBTI compatibility (simplified)
  if (!client.personalityType || !candidate.personalityType) return baseScore;
  const compatiblePairs: Record<string, string[]> = {
    INTJ: ["ENFP", "ENTP", "INFJ"],
    INFJ: ["ENFP", "ENTP", "INTJ"],
    ENFP: ["INTJ", "INFJ", "ENTJ"],
    ENTJ: ["INFP", "INTP", "ENFP"],
    INTP: ["ENTJ", "ESTJ", "ENFJ"],
    INFP: ["ENTJ", "ENFJ", "ESFJ"],
    ISTP: ["ESTJ", "ESFJ", "ENFJ"],
    ISFP: ["ESTJ", "ESFJ", "ENFJ"],
    ESTP: ["ISFJ", "ISTJ", "INFJ"],
    ESFP: ["ISFJ", "ISTJ", "INFJ"],
    ESTJ: ["ISTP", "ISFP", "INTP"],
    ESFJ: ["ISFP", "ISTP", "INFP"],
    ISTJ: ["ESTP", "ESFP", "ENFP"],
    ISFJ: ["ESTP", "ESFP", "ENFP"],
    ENFJ: ["INFP", "ISFP", "ISTP"],
    ENTP: ["INFJ", "INTJ", "ISFJ"],
  };
  const compatible = compatiblePairs[client.personalityType] || [];
  if (compatible.includes(candidate.personalityType)) return Math.min(100, baseScore + 20);
  return baseScore;
}

function ageCheck(client: Profile, candidate: Profile): boolean {
  if (client.gender === "male") {
    return candidate.age >= client.partnerAgeMin && candidate.age <= client.partnerAgeMax;
  }
  return candidate.age >= client.partnerAgeMin && candidate.age <= client.partnerAgeMax;
}

function heightCheck(client: Profile, candidate: Profile): boolean {
  return candidate.heightCm >= client.partnerHeightMinCm && candidate.heightCm <= client.partnerHeightMaxCm;
}

export function computeMatchScore(client: Profile, candidate: Profile): MatchScore {
  const breakdown = {
    kidsPreference: scoreKids(client, candidate),
    locationCompatibility: scoreLocation(client, candidate),
    educationCompatibility: scoreEducation(client, candidate),
    religionAlignment: scoreReligion(client, candidate),
    lifestyleCompatibility: scoreLifestyle(client, candidate),
    careerCompatibility: scoreCareer(client, candidate),
    familyValues: scoreFamilyValues(client, candidate),
    incomeExpectations: scoreIncome(client, candidate),
    personalityFit: scorePersonality(client, candidate),
  };

  const totalScore = Object.entries(breakdown).reduce((acc, [key, score]) => {
    return acc + (score * WEIGHTS[key as keyof typeof WEIGHTS]) / 100;
  }, 0);

  // Confidence drops if age/height are outside preferences
  let confidenceModifier = 1;
  if (!ageCheck(client, candidate)) confidenceModifier -= 0.15;
  if (!heightCheck(client, candidate)) confidenceModifier -= 0.10;
  const confidenceScore = Math.min(100, Math.max(0, totalScore * confidenceModifier));

  // Generate compatibility tags
  const tags: string[] = [];
  if (breakdown.kidsPreference >= 80) tags.push("Aligned on Family Planning");
  if (breakdown.locationCompatibility >= 75) tags.push("Location Compatible");
  if (breakdown.educationCompatibility >= 80) tags.push("Strong Educational Fit");
  if (breakdown.religionAlignment >= 80) tags.push("Cultural Alignment");
  if (breakdown.lifestyleCompatibility >= 75) tags.push("Lifestyle Match");
  if (breakdown.careerCompatibility >= 75) tags.push("Career Compatible");
  if (breakdown.familyValues >= 80) tags.push("Shared Family Values");
  if (breakdown.incomeExpectations >= 80) tags.push("Financial Compatibility");
  if (breakdown.personalityFit >= 75) tags.push("Personality Fit");
  if (totalScore >= 80) tags.push("High Potential Match");
  if (totalScore >= 90) tags.push("Exceptional Compatibility");

  return {
    profileId: client.id,
    candidateId: candidate.id,
    totalScore: Math.round(totalScore),
    confidenceScore: Math.round(confidenceScore),
    breakdown: Object.fromEntries(
      Object.entries(breakdown).map(([k, v]) => [k, Math.round(v)])
    ) as MatchScore["breakdown"],
    compatibilityTags: tags,
    status: "pending",
    matchedAt: new Date().toISOString(),
  };
}

export function getTopMatches(client: Profile, pool: Profile[], topN = 10): MatchScore[] {
  return pool
    .map((candidate) => computeMatchScore(client, candidate))
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, topN);
}
