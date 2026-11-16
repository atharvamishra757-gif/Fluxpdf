import { NextRequest, NextResponse } from "next/server";

const MODEL =
  process.env.OPENROUTER_MODEL ||
  "meta-llama/llama-3.3-70b-instruct:free";

function demoResponse(action: string, body: any): string {
  if (action === "summarize") {
    const text = body.text || "";
    return `Summary of "${text.substring(0, 60)}${text.length > 60 ? "..." : ""}":

• Main topic: Document content analysis
• Key points:
  - The document contains structured information
  - Multiple sections are present
  - Content is organized logically
• Conclusion: This is a demo summary.

To get real AI-powered summarization, configure a valid OPENROUTER_API_KEY in .env.local.`;
  }

  if (action === "translate") {
    return `[Demo Translation to ${body.language || "target language"}]\n\n${body.text || ""}\n\n---\nNote: This is a demo translation. Configure your OPENROUTER_API_KEY for real AI translation.`;
  }

  if (action === "chat-pdf") {
    const doc = body.document || "";
    return `Based on the document you provided:

"${doc.substring(0, 120)}${doc.length > 120 ? "..." : ""}"

Regarding your question: "${body.message || ""}"

This is a demo response. The document appears to contain relevant content. To get real AI answers, configure your OPENROUTER_API_KEY in .env.local.`;
  }

  return "Demo response - API key not configured.";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, text, message, language, document } = body;

    const apiKey = process.env.OPENROUTER_API_KEY;

    // If no API key configured, use demo mode
    if (!apiKey) {
      const result = demoResponse(action, { text, message, language, document });
      return NextResponse.json({ success: true, result, demo: true });
    }

    // Build prompt based on action
    let prompt = "";

    if (action === "summarize") {
      if (!text?.trim()) {
        return NextResponse.json({ error: "PDF text is required" }, { status: 400 });
      }
      prompt = `Summarize this PDF in a clear and organized format.\nInclude:\n1. Main topic\n2. Important points\n3. Key information\n4. Final conclusion\n\nPDF CONTENT:\n${text}`;
    } else if (action === "translate") {
      if (!text?.trim() || !language?.trim()) {
        return NextResponse.json({ error: "Text and target language are required" }, { status: 400 });
      }
      prompt = `Translate the following document into ${language}.\nPreserve its original meaning, headings and structure.\nReturn only the translated content.\n\nCONTENT:\n${text}`;
    } else if (action === "chat-pdf") {
      if (!document?.trim() || !message?.trim()) {
        return NextResponse.json({ error: "Document and question are required" }, { status: 400 });
      }
      prompt = `You are FluxPDF's intelligent PDF assistant.\n\nAnswer the user's question using the supplied PDF.\nDo not invent information.\nIf the answer is missing, say so.\n\nPDF:\n${document}\n\nQUESTION:\n${message}`;
    } else {
      return NextResponse.json({ error: "Invalid AI action" }, { status: 400 });
    }

    // Try OpenRouter API
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "FluxPDF"
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 3000
        })
      });

      const result = await response.json();

      if (!response.ok) {
        // OpenRouter returned an error (invalid key, rate limit, etc.)
        // Fall back to demo mode
        const demoResult = demoResponse(action, { text, message, language, document });
        return NextResponse.json({
          success: true,
          result: demoResult,
          demo: true,
          note: "Using demo mode - OpenRouter API error: " + (result.error?.message || response.status)
        });
      }

      return NextResponse.json({
        success: true,
        result: result.choices?.[0]?.message?.content,
        demo: false
      });
    } catch (fetchErr) {
      // Network error - fall back to demo
      const demoResult = demoResponse(action, { text, message, language, document });
      return NextResponse.json({
        success: true,
        result: demoResult,
        demo: true,
        note: "Using demo mode - could not reach OpenRouter"
      });
    }

  } catch (error) {
    console.error("FluxPDF AI error:", error);
    return NextResponse.json(
      { error: "Something went wrong with AI processing" },
      { status: 500 }
    );
  }
}
