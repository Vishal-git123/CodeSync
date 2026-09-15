import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { prompt, code, language = "javascript" } = body;

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    const fullPrompt = `
You are an expert software engineer helping inside a browser IDE called CodeSync.

Programming language: ${language}

User request:
${prompt}

Current code:
\`\`\`${language}
${code ?? ""}
\`\`\`

Give a concise and practical answer.
When code changes are requested, provide the improved code.
`;

    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen2.5-coder:7b",
        prompt: fullPrompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      return NextResponse.json(
        {
          error: `Ollama request failed: ${errorText}`,
        },
        { status: 500 },
      );
    }

    const data = await response.json();

    return NextResponse.json({
      response: data.response,
    });
  } catch (error) {
    console.error("AI API error:", error);

    return NextResponse.json(
      {
        error: "Failed to connect to Ollama",
      },
      { status: 500 },
    );
  }
}
