import { auth } from "@/auth";
import { db } from "@/db";
import { threats } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const data = await db
      .select()
      .from(threats)
      .where(eq(threats.userId, userId))
      .orderBy(desc(threats.createdAt));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch threats:", error);
    return NextResponse.json(
      { error: "Failed to fetch threats list" },
      { status: 500 }
    );
  }
}
