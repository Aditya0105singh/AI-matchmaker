import { NextRequest, NextResponse } from "next/server";
import { getGroqClient, GROQ_MODEL, SYSTEM_PROMPT } from "@/lib/openai-client";
import type { Profile } from "@/types";
import { formatCurrency } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const { profile } = (await req.json()) as { profile: Profile };

  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your_groq_api_key_here") {
    return NextResponse.json({ summary: getFallbackSummary(profile) });
  }

  try {
    const groq = getGroqClient();
    const res = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Write a professional matchmaker's profile summary for this client. Be insightful, warm, and highlight key matchmaking factors.

NAME: ${profile.firstName} ${profile.lastName}
AGE: ${profile.age} | GENDER: ${profile.gender} | CITY: ${profile.city}
EDUCATION: ${profile.degree} from ${profile.undergraduateCollege}${profile.mastersUniversity ? `, ${profile.mastersDegree} from ${profile.mastersUniversity}` : ""}
CAREER: ${profile.designation} at ${profile.currentCompany}, ${profile.industry}, ${formatCurrency(profile.annualIncomeINR)} LPA
RELIGION: ${profile.religion} | CASTE: ${profile.caste} | FAMILY: ${profile.familyValues} ${profile.familyType}
WANTS KIDS: ${profile.wantKids} | RELOCATE: ${profile.openToRelocate} | DIET: ${profile.diet}
SMOKING: ${profile.smoking} | DRINKING: ${profile.drinking}
PERSONALITY: ${profile.personalityType || "Unknown"}, ${profile.introvertExtrovertScore <= 4 ? "Introverted" : profile.introvertExtrovertScore >= 7 ? "Extroverted" : "Ambivert"}
PREFERENCES: Age ${profile.partnerAgeMin}-${profile.partnerAgeMax}, ${profile.partnerReligionPref.join("/")} religion preferred

Write 3-4 paragraphs covering: their professional background, personality and lifestyle, family and values, and what they're looking for in a partner. Keep it warm and professional, under 250 words.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const summary = res.choices[0].message.content || getFallbackSummary(profile);
    return NextResponse.json({ summary });
  } catch (err) {
    console.error("OpenAI error:", err);
    return NextResponse.json({ summary: getFallbackSummary(profile) });
  }
}

function getFallbackSummary(p: Profile): string {
  return `${p.firstName} ${p.lastName} is a ${p.age}-year-old ${p.designation} at ${p.currentCompany} based in ${p.city}. With a ${p.degree} from ${p.undergraduateCollege}, ${p.gender === "male" ? "he" : "she"} brings a strong educational foundation and earns ${formatCurrency(p.annualIncomeINR)} LPA.

${p.gender === "male" ? "He" : "She"} comes from a ${p.familyValues} ${p.familyType} family background with ${p.religion} values. ${p.siblings > 0 ? `Having grown up with ${p.siblings} sibling${p.siblings > 1 ? "s" : ""}, family bonds are important to ${p.gender === "male" ? "him" : "her"}.` : ""} ${p.gender === "male" ? "He" : "She"} identifies as ${p.introvertExtrovertScore <= 4 ? "introverted" : p.introvertExtrovertScore >= 7 ? "extroverted" : "an ambivert"} with a ${p.personalityType || "thoughtful"} personality.

On lifestyle, ${p.gender === "male" ? "he" : "she"} follows a ${p.diet} diet, ${p.smoking === "no" ? "doesn't smoke" : "smokes occasionally"}, and ${p.drinking === "no" ? "doesn't drink" : "drinks occasionally"}. ${p.travelFrequency === "frequently" ? `${p.gender === "male" ? "He" : "She"} loves to travel and explores new places frequently.` : ""} ${p.fitnessLevel !== "sedentary" ? `${p.gender === "male" ? "He" : "She"} maintains an active lifestyle with ${p.fitnessLevel} fitness activity.` : ""}

${p.gender === "male" ? "He" : "She"} is looking for a partner between ${p.partnerAgeMin}–${p.partnerAgeMax} years, ${p.openToRelocate === "yes" ? "open to relocating" : "preferring to stay in " + p.city}, who ${p.wantKids === "yes" ? "shares the desire to start a family" : p.wantKids === "no" ? "is comfortable not having children" : "is flexible about having children"}. Profile completeness: ${p.profileCompleteness}%.`;
}
