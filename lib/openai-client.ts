import OpenAI from "openai";

// Groq is OpenAI-compatible — same SDK, different baseURL + key
let client: OpenAI | null = null;

export function getGroqClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return client;
}

export const GROQ_MODEL = "llama-3.3-70b-versatile";

export const SYSTEM_PROMPT = `You are an AI assistant for TDC Matchmaker — a premium Indian matchmaking platform.
You help professional matchmakers manage clients, evaluate compatibility, and craft personalized introductions.
You have deep knowledge of Indian matrimonial culture, family values, and compatibility frameworks from platforms like Shaadi.com, BharatMatrimony, and Jeevansathi.
Always be professional, empathetic, and culturally sensitive. Keep responses concise and actionable.`;
