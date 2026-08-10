import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { studentResponse, currentQuestion, blueprint } = await request.json();

    if (!studentResponse || !studentResponse.trim()) {
      return NextResponse.json({ error: "Empty student response" }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key missing" }, { status: 500 });
    }

    const evalPrompt = `
You are an expert AI Viva Evaluator analyzing a candidate's real-time spoken answer.

Syllabus Blueprint Topics: ${JSON.stringify(blueprint?.coreModules || "AppSec Basics")}
Current Question Asked: "${currentQuestion}"
Candidate Spoken Answer: "${studentResponse}"

Analyze the answer and output ONLY a valid JSON object matching this schema (no markdown, no backticks):
{
  "technicalAccuracy": 8, // Score out of 10
  "isBluffingOrVague": false, // true if candidate uses buzzwords without explaining mechanisms
  "missingKeyPoints": ["List of critical missing details, if any"],
  "evaluationSummary": "Brief 1-sentence assessment of their response",
  "recommendedAction": "PROBE_DEEPER" | "MOVE_NEXT_TOPIC" | "CORRECT_MISCONCEPTION",
  "suggestedFollowUp": "A direct, sharp follow-up question prompt to inject into the examiner if recommendedAction is PROBE_DEEPER or CORRECT_MISCONCEPTION"
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: evalPrompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    const data = await response.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawContent) {
      throw new Error("Failed to generate evaluation");
    }

    const evaluation = JSON.parse(rawContent);
    return NextResponse.json({ success: true, evaluation });
  } catch (err) {
    console.error("Evaluation Agent Error:", err);
    return NextResponse.json({ error: err.message || "Failed to evaluate turn" }, { status: 500 });
  }
}