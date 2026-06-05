import { auth } from "@/auth";
import { db } from "@/db";
import { chatHistory } from "@/db/schema";
import { streamChatWithAssistant } from "@/lib/ai/gemini";
import { NextRequest } from "next/server";
import { eq, asc } from "drizzle-orm";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { message, sessionId } = await req.json();

  if (!message?.trim()) {
    return new Response("Message required", { status: 400 });
  }

  const userId = session.user.id as string;
  const sid = sessionId || `session_${Date.now()}`;

  // Load conversation history from DB
  const historyRows = await db
    .select()
    .from(chatHistory)
    .where(eq(chatHistory.sessionId, sid))
    .orderBy(asc(chatHistory.createdAt))
    .limit(20);

  const history = historyRows.map(row => ({
    role: row.role as "user" | "model",
    parts: [{ text: row.content }],
  }));

  // Save user message
  await db.insert(chatHistory).values({
    userId: userId,
    sessionId: sid,
    role: "user",
    content: message,
  });

  // Stream response
  const encoder = new TextEncoder();
  let fullResponse = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamChatWithAssistant(message, history)) {
          fullResponse += chunk;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk, sessionId: sid })}\n\n`));
        }

        // Save assistant response to DB
        await db.insert(chatHistory).values({
          userId: userId,
          sessionId: sid,
          role: "model",
          content: fullResponse,
        });

        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      } catch (error) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "AI response failed" })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return Response.json([]);
  }

  const history = await db
    .select()
    .from(chatHistory)
    .where(eq(chatHistory.sessionId, sessionId))
    .orderBy(asc(chatHistory.createdAt));

  return Response.json(history);
}
