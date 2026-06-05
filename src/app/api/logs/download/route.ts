import { auth } from "@/auth";
import { db } from "@/db";
import { uploads } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { downloadFromR2 } from "@/lib/r2";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const uploadId = req.nextUrl.searchParams.get("uploadId");

  if (!uploadId) {
    return NextResponse.json({ error: "Upload ID required" }, { status: 400 });
  }

  try {
    const [upload] = await db
      .select()
      .from(uploads)
      .where(and(eq(uploads.id, uploadId), eq(uploads.userId, userId)))
      .limit(1);

    if (!upload) {
      return NextResponse.json({ error: "Log file not found" }, { status: 404 });
    }

    if (!upload.r2Key) {
      return NextResponse.json({ error: "Log file content was not archived on Cloudflare R2" }, { status: 404 });
    }

    const fileBytes = await downloadFromR2(upload.r2Key);
    if (!fileBytes) {
      return NextResponse.json({ error: "Failed to download log file from storage" }, { status: 500 });
    }

    return new Response(Buffer.from(fileBytes), {
      headers: {
        "Content-Type": upload.mimeType || "text/plain",
        "Content-Disposition": `attachment; filename="${upload.originalName}"`,
      },
    });
  } catch (error) {
    console.error("Log download API error:", error);
    return NextResponse.json({ error: "Log download failed" }, { status: 500 });
  }
}
