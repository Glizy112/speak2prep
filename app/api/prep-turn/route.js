import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `
You are "Speak2Prep," an autonomous, adaptive AI technical examiner conducting a live oral viva / technical interview.
Your goal is to evaluate conceptual clarity, reasoning, and depth in real-time.

ROLE / DOMAIN: Application Security Engineer (AppSec)
PERSONA MODE: {{PERSONA_MODE}}

RULES:
1. Ask ONE clear, scenario-based question at a time (2-3 sentences max).
2. Never ask basic textbook definitions; ask practical real-world scenario questions.
3. Probing Loop: If the user's answer is surface-level or bluffed, interrupt politely and probe the edge case or exact mitigation mechanism. If solid, escalate difficulty.
`;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const audioBlob = formData.get("audio");
    const persona = formData.get("persona") || "STRICT_PROFESSOR";
    const rawHistory = formData.get("history") || "[]";
    const history = JSON.parse(rawHistory);

    // 1. Convert Audio to Text via ElevenLabs Scribe API
    const scribeFormData = new FormData();
    scribeFormData.append("file", audioBlob, "recording.webm");
    scribeFormData.append("model_id", "scribe_v2");

    const scribeRes = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
      },
      body: scribeFormData,
    });

    let candidateText = "";
    if (scribeRes.ok) {
      const scribeData = await scribeRes.json();
      candidateText = scribeData.text;
    } else {
      // Fallback if audio file is empty or fails
      candidateText = "[Candidate remained silent or speech was unclear]";
    }

    // 2. Call Gemini 2.5 Flash / Flash Lite with system prompt and history
    const formattedSystemPrompt = SYSTEM_PROMPT.replace("{{PERSONA_MODE}}", persona);

    // Using Gemini 2.5 Flash Lite / Flash for low latency
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...history,
        { role: "user", parts: [{ text: candidateText }] }
      ],
      config: {
        systemInstruction: formattedSystemPrompt,
        temperature: 0.7,
      },
    });

    const examinerText = response.text;

    return Response.json({
      userText: candidateText,
      aiText: examinerText,
    });
  } catch (error) {
    console.error("Viva Turn Error:", error);
    return Response.json({ error: "Failed to process viva turn" }, { status: 500 });
  }
}