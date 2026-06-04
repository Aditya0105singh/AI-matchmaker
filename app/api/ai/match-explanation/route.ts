import { NextRequest, NextResponse } from "next/server";
import { getGroqClient, GROQ_MODEL, SYSTEM_PROMPT } from "@/lib/openai-client";
import type { Profile, MatchScore } from "@/types";

export async function POST(req: NextRequest) {
  const { client, candidate, matchScore } = (await req.json()) as {
    client: Profile;
    candidate: Profile;
    matchScore: MatchScore;
  };

  const profileSummary = (p: Profile) =>
    `${p.firstName} ${p.lastName}, ${p.age}, ${p.city}, ${p.designation} at ${p.currentCompany}, ${p.religion} ${p.caste}, ${p.wantKids === "yes" ? "wants kids" : p.wantKids === "no" ? "doesn't want kids" : "open to kids"}, ${p.openToRelocate === "yes" ? "open to relocate" : "prefers to stay in " + p.city}, income: ₹${p.annualIncomeINR}L, diet: ${p.diet}, smoking: ${p.smoking}, drinking: ${p.drinking}, family values: ${p.familyValues}`;

  // Check if OpenAI key is configured
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your_groq_api_key_here") {
    return NextResponse.json({
      explanation: getFallbackExplanation(client, candidate, matchScore),
      intro: getFallbackIntro(client, candidate, matchScore),
    });
  }

  try {
    const groq = getGroqClient();

    const [explanationRes, introRes] = await Promise.all([
      groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Analyze this matchmaking compatibility between two people and provide a structured assessment.

CLIENT: ${profileSummary(client)}
CANDIDATE: ${profileSummary(candidate)}
COMPATIBILITY SCORE: ${matchScore.totalScore}/100
COMPATIBILITY TAGS: ${matchScore.compatibilityTags.join(", ")}

Respond with a JSON object with exactly these fields:
{
  "summary": "2-3 sentence overall assessment",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "concerns": ["concern 1", "concern 2"],
  "conversationStarters": ["question 1", "question 2", "question 3"]
}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 600,
      }),

      groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Write a warm, personalized introduction email from a matchmaker to ${client.firstName} about a potential match ${candidate.firstName} ${candidate.lastName}.

CLIENT: ${profileSummary(client)}
CANDIDATE: ${profileSummary(candidate)}
MATCH SCORE: ${matchScore.totalScore}/100
STRENGTHS: ${matchScore.compatibilityTags.slice(0, 3).join(", ")}

Write a 3-paragraph professional yet warm introduction (150-200 words). Do not use generic language. Reference specific compatibility points. Sign off as "Riya Kapoor, The Date Crew".`,
          },
        ],
        temperature: 0.8,
        max_tokens: 400,
      }),
    ]);

    const explanationText = explanationRes.choices[0].message.content || "{}";
    const explanation = JSON.parse(explanationText);
    explanation.generatedAt = new Date().toISOString();

    const intro = introRes.choices[0].message.content || getFallbackIntro(client, candidate, matchScore);

    return NextResponse.json({ explanation, intro });
  } catch (err) {
    console.error("OpenAI error:", err);
    return NextResponse.json({
      explanation: getFallbackExplanation(client, candidate, matchScore),
      intro: getFallbackIntro(client, candidate, matchScore),
    });
  }
}

function getFallbackExplanation(client: Profile, candidate: Profile, match: MatchScore) {
  return {
    summary: `${candidate.firstName} and ${client.firstName} show ${match.totalScore >= 80 ? "strong" : match.totalScore >= 60 ? "good" : "moderate"} compatibility at ${match.totalScore}%. They share aligned views on ${match.compatibilityTags.slice(0, 2).join(" and ").toLowerCase()}, which are key pillars for a lasting relationship.`,
    strengths: match.compatibilityTags.slice(0, 3).map((t) => t),
    concerns: [
      "Different cities may require relocation discussions",
      "Lifestyle differences should be explored in the first meeting",
    ],
    conversationStarters: [
      "What does your ideal weekend look like?",
      "How important is proximity to family for you?",
      "What are your career goals for the next 5 years?",
    ],
    generatedAt: new Date().toISOString(),
  };
}

function getFallbackIntro(client: Profile, candidate: Profile, match: MatchScore): string {
  return `Dear ${client.firstName},

I'm delighted to share a match I've thoughtfully selected for you — ${candidate.firstName} ${candidate.lastName}. Based on your preferences and compatibility analysis, this pairing shows ${match.totalScore >= 80 ? "exceptional" : "strong"} potential with a ${match.totalScore}% compatibility score.

${candidate.firstName} is a ${candidate.age}-year-old ${candidate.designation} at ${candidate.currentCompany}, based in ${candidate.city}. ${candidate.gender === "female" ? "She" : "He"} shares your values around ${match.compatibilityTags.slice(0, 2).join(" and ").toLowerCase()}, making this a particularly promising introduction.

I'd love to facilitate this introduction when you're ready. Please let me know your thoughts, and I'll coordinate from there.

Warm regards,
Riya Kapoor
The Date Crew`;
}
