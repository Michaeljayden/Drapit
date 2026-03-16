/**
 * SupportChat.server-example.js
 *
 * Backend proxy voor de SupportChat component.
 * Houdt je Anthropic API key veilig op de server.
 *
 * Vereisten:
 *   npm install express @anthropic-ai/sdk
 *
 * Gebruik:
 *   Voeg deze route toe aan je bestaande Express app.
 *   Stel de ANTHROPIC_API_KEY in als environment variable.
 */

import Anthropic from "@anthropic-ai/sdk";
import express from "express";

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * POST /api/support-chat
 *
 * Body:
 *   {
 *     system:     string,           // System prompt (van de frontend)
 *     messages:   Message[],        // Claude-formaat messages array
 *     model:      string,           // bijv. "claude-opus-4-6"
 *     max_tokens: number            // bijv. 1500
 *   }
 *
 * Response:
 *   { content: [{ type: "text", text: "..." }] }
 */
router.post("/api/support-chat", async (req, res) => {
  try {
    const { system, messages, model = "claude-opus-4-6", max_tokens = 1500 } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages is required and must be an array" });
    }

    const response = await anthropic.messages.create({
      model,
      max_tokens,
      system,
      messages,
    });

    res.json({ content: response.content });
  } catch (error) {
    console.error("[support-chat] Error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

// ─── Next.js App Router variant (pages/api/support-chat.js) ──────────────────
//
// import Anthropic from "@anthropic-ai/sdk";
//
// const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
//
// export default async function handler(req, res) {
//   if (req.method !== "POST") return res.status(405).end();
//   const { system, messages, model = "claude-opus-4-6", max_tokens = 1500 } = req.body;
//   const response = await anthropic.messages.create({ model, max_tokens, system, messages });
//   res.json({ content: response.content });
// }
