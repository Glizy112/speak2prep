import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { transcripts, blueprint } = await request.json();

    if (!transcripts || transcripts.length === 0) {
      return NextResponse.json({ error: "No transcripts data provided" }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key missing" }, { status: 500 });
    }

    const scorecardPrompt = `
You are an expert AI Viva Evaluator compiling an official Post-Exam Performance Assessment.

Syllabus Blueprint: ${JSON.stringify(blueprint || "General Web Security & AppSec")}
Full Call transcripts:
${JSON.stringify(transcripts, null, 2)}

Analyze the entire viva exchange and output ONLY a valid JSON object matching this schema (no markdown formatting, no backticks):
{
  "overallScore": 78, // Percentage out of 100
  "verdict": "PASS" | "NEEDS_REVISION" | "FAIL",
  "executiveSummary": "Concise 2-sentence summary of overall candidate standing.",
  "strengths": ["List of 2-3 demonstrated technical strengths"],
  "criticalGaps": ["List of 2-3 key technical concepts missed or answered vaguely"],
  "topicBreakdown": [
    {
      "topicName": "Topic Name from Blueprint",
      "score": 85, // 0-100
      "status": "MASTERED" | "PARTIAL" | "DEFICIENT",
      "feedback": "1-sentence specific observation"
    }
  ],
  "communicationMetrics": {
    "clarityScore": 8, // Out of 10
    "bluffCount": 1, // Number of times vague/buzzword-heavy answers were used
    "pacing": "CONFIDENT" | "HESITANT" | "RUSHY"
  }
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: scorecardPrompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    const data = await response.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawContent) {
      throw new Error("Failed to generate scorecard analysis");
    }

    const scorecard = JSON.parse(rawContent);
    return NextResponse.json({ success: true, scorecard });
  } catch (err) {
    console.error("Scorecard Agent Error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate scorecard" }, { status: 500 });
  }
}