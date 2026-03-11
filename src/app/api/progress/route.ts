import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── GET /api/progress ────────────────────────────────────────────────────────
// Returns { completedDrills: string[], lastPosition: {...} | null }
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [completed, position] = await Promise.all([
    prisma.drillProgress.findMany({
      where: { userId: user.id },
      select: { drillId: true, lessonId: true, modId: true, completedAt: true },
    }),
    prisma.userLastPosition.findUnique({
      where: { userId: user.id },
    }),
  ]);

  return NextResponse.json({
    completedDrills: completed.map((c) => c.drillId),
    lastPosition: position
      ? { drillId: position.drillId, lessonId: position.lessonId, modId: position.modId }
      : null,
  });
}

// ─── POST /api/progress ───────────────────────────────────────────────────────
// Body: { type: "complete", drillId, lessonId, modId }
//    or { type: "position", drillId, lessonId, modId }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json() as {
    type: "complete" | "position";
    drillId: string;
    lessonId: string;
    modId: string;
  };

  const { type, drillId, lessonId, modId } = body;

  if (type === "complete") {
    // Upsert drill completion
    await prisma.drillProgress.upsert({
      where: { userId_drillId: { userId: user.id, drillId } },
      create: { userId: user.id, drillId, lessonId, modId },
      update: { completedAt: new Date() },
    });
  }

  // Always update last position on any action
  await prisma.userLastPosition.upsert({
    where: { userId: user.id },
    create: { userId: user.id, drillId, lessonId, modId },
    update: { drillId, lessonId, modId },
  });

  return NextResponse.json({ ok: true });
}
