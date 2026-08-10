import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { syllabusText, targetRole, difficulty, persona } = await request.json();

    if (!syllabusText || syllabusText.trim().length === 0) {
      return NextResponse.json(
        { error: "Syllabus content is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key missing." },
        { status: 500 }
      );
    }

    const extractionPrompt = `
You are an expert technical curriculum designer. Analyze the following syllabus/study material and output a structured JSON object representing an Exam Blueprint for an oral viva.

Target Role: ${targetRole || "Application Security Engineer"}
Difficulty Level: ${difficulty || "Intermediate"}
Examiner Persona Style: ${persona || "STRICT_PROFESSOR"}

Syllabus Content:
"""
${syllabusText}
"""

Return ONLY a valid JSON object matching this schema (no markdown formatting, no code fences):
{
  "subjectTitle": "Extracted or inferred main title",
  "coreModules": [
    {
      "moduleName": "Module Name",
      "keyConcepts": ["Concept 1", "Concept 2"],
      "probingQuestions": ["Specific scenario question 1", "Specific scenario question 2"]
    }
  ],
  "mustTestKeywords": ["keyword1", "keyword2"],
  "formattedSystemInstruction": "A detailed, complete system instruction string written in the first person for Gemini Live AI Examiner incorporating the extracted modules, persona traits, and viva rules."
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: extractionPrompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    const data = await response.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log(`Type-> (${typeof(rawContent)})`, rawContent)
    if (!rawContent) {
      throw new Error("Failed to generate Exam Blueprint from Gemini.");
    }

    const blueprint = JSON.parse(rawContent);
    return NextResponse.json({ success: true, blueprint });
  } catch (err) {
    console.error("Syllabus Parse Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to parse syllabus" },
      { status: 500 }
    );
  }
}