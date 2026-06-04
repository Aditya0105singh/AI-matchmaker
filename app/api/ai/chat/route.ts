import { NextRequest, NextResponse } from "next/server";
import { getGroqClient, GROQ_MODEL, SYSTEM_PROMPT } from "@/lib/openai-client";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(req: NextRequest) {
  const { messages, context } = (await req.json()) as {
    messages: ChatMessage[];
    context?: string;
  };

  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your_groq_api_key_here") {
    const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
    return NextResponse.json({ message: getFallbackResponse(lastMsg) });
  }

  try {
    const groq = getGroqClient();

    const systemContent = context
      ? `${SYSTEM_PROMPT}\n\nCURRENT CONTEXT:\n${context}`
      : SYSTEM_PROMPT;

    const res = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemContent },
        ...messages.slice(-10),
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    const message = res.choices[0].message.content || "I'm sorry, I couldn't process that request.";
    return NextResponse.json({ message });
  } catch (err) {
    console.error("OpenAI chat error:", err);
    const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
    return NextResponse.json({ message: getFallbackResponse(lastMsg) });
  }
}

function getFallbackResponse(userMessage: string): string {
  if (userMessage.includes("top") || userMessage.includes("best") || userMessage.includes("match")) {
    return "Based on the matching algorithm, I'd recommend prioritizing clients with relationship readiness scores above 80. For male clients, look for female candidates who share religion, have compatible kids preferences, and are open to relocation. For female clients, career compatibility and emotional alignment are key factors.\n\nWould you like me to analyze a specific client's matches?";
  }
  if (userMessage.includes("summary") || userMessage.includes("profile")) {
    return "I can generate a detailed profile summary for any client. Navigate to their profile page and click the 'AI Insights' tab, then hit 'Generate Summary'. This will create a comprehensive matchmaker's briefing with personality insights, lifestyle analysis, and key compatibility factors.";
  }
  if (userMessage.includes("concern") || userMessage.includes("risk")) {
    return "Common concerns I look for in profiles:\n\n• **Relocation rigidity** — clients unwilling to relocate significantly limit their match pool\n• **Income disparity expectations** — unrealistic income requirements narrow options\n• **Low profile completeness** — missing fields reduce match accuracy\n• **No follow-up engagement** — clients who don't respond to matches within 48 hours often churn\n\nWould you like me to flag at-risk clients on your dashboard?";
  }
  if (userMessage.includes("relocat") || userMessage.includes("city")) {
    return "I can filter candidates by relocation preference. Clients marked 'Open to Relocate: Yes' have the broadest match pool. For city-specific matching, I recommend checking the Location Compatibility score in each match breakdown — scores above 75 indicate strong geographic alignment.";
  }
  return "I'm your TDC Matchmaker AI Copilot. I can help you:\n\n• **Explain matches** — Why is a specific candidate ranked highly?\n• **Filter candidates** — Find profiles by education, income, or relocation flexibility\n• **Summarize profiles** — Get a quick briefing on any client\n• **Detect risks** — Flag clients needing urgent attention\n• **Generate introductions** — Draft personalized match emails\n\nWhat would you like to know?";
}
