import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { system, messages, model = "claude-opus-4-6", max_tokens = 1500 } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages is required" }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model,
      max_tokens,
      system,
      messages,
    });

    return NextResponse.json({ content: response.content });
  } catch (error) {
    console.error("[support-chat]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
