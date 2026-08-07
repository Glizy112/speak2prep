import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const persona = searchParams.get("persona") || "STRICT_PROFESSOR";

  const sessionConfig = {
    model: "models/gemini-3.1-flash-live-preview",
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: "Puck", // Puck, Charon, Kore, Fenrir, Aoede
          },
        },
      },
    },
    systemInstruction: {
      parts: [
        {
          text: `You are Speak2Prep, an autonomous AI technical examiner conducting a live oral viva for an Application Security (AppSec) Engineer role. 
Persona Mode: ${persona}.
Ask precise, scenario-based technical questions one at a time. Keep spoken answers concise (2 to 3 sentences max) so it feels like a real phone call. If the candidate's answer is weak, probe deeper into mitigations or edge cases.`,
        },
      ],
    },
  };

  return NextResponse.json({ config: sessionConfig });
}