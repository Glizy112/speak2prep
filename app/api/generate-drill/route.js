import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { criticalGaps, topicName } = await request.json();

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key missing" }, { status: 500 });
    }

    const drillPrompt = `
You are an AI Cyber Security & Software Engineering Instructor designing an interactive remediation drill for a candidate who struggled in a viva exam.

Target Topic: "${topicName || "Application Security"}"
Identified Technical Gaps: ${JSON.stringify(criticalGaps || ["General Implementation Details"])}

Create a targeted practice drill. Output ONLY a valid JSON object matching this schema:
{
  "drillTitle": "Title of the Remediation Drill",
  "conceptExplanation": "Clear, concise 2-sentence explanation of the core concept to patch the knowledge gap.",
  "exerciseType": "CODE_FIX" | "CONCEPT_EXPLANATION" | "SCENARIO_ANALYSIS",
  "vulnerableCodeSnippet": "Provide a small flawed code snippet if CODE_FIX, else null",
  "drillInstructions": "Step-by-step instructions for what the candidate needs to fix or explain.",
  "modelSolution": "The correct secure implementation or ideal concept explanation."
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: drillPrompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    const data = await response.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawContent) {
      throw new Error("Failed to generate remediation drill");
    }

    const drill = JSON.parse(rawContent);
    return NextResponse.json({ success: true, drill });
  } catch (err) {
    console.error("Remediation Agent Error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate drill" }, { status: 500 });
  }
}