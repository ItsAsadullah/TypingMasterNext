import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, createdAt: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const records = await prisma.typingRecord.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { lesson: { select: { title: true, difficulty: true } } },
  });

  const totalTests = records.length;

  if (totalTests === 0) {
    return NextResponse.json({
      totalTests: 0,
      bestWpm: 0,
      avgWpm: 0,
      avgAccuracy: 0,
      totalMinutes: 0,
      streak: 0,
      recentRecords: [],
      wpmHistory: [],
      user: { name: user.name, createdAt: user.createdAt },
    });
  }

  const bestWpm = Math.max(...records.map((r) => r.wpm));
  const avgWpm = Math.round(records.reduce((s, r) => s + r.wpm, 0) / totalTests);
  const avgAccuracy = Math.round(
    records.reduce((s, r) => s + r.accuracy, 0) / totalTests
  );
  const totalMinutes = Math.round(
    records.reduce((s, r) => s + r.timeSpent, 0) / 60
  );

  // Streak: consecutive days with at least one record
  const days = new Set(
    records.map((r) => new Date(r.createdAt).toDateString())
  );
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (days.has(d.toDateString())) streak++;
    else break;
  }

  // Last 14 records for WPM sparkline (chronological)
  const wpmHistory = records
    .slice(0, 14)
    .reverse()
    .map((r) => ({ wpm: r.wpm, date: r.createdAt }));

  const recentRecords = records.slice(0, 8).map((r) => ({
    id: r.id,
    wpm: r.wpm,
    accuracy: r.accuracy,
    timeSpent: r.timeSpent,
    lessonTitle: r.lesson.title,
    difficulty: r.lesson.difficulty,
    createdAt: r.createdAt,
  }));

  return NextResponse.json({
    totalTests,
    bestWpm,
    avgWpm,
    avgAccuracy,
    totalMinutes,
    streak,
    recentRecords,
    wpmHistory,
    user: { name: user.name, createdAt: user.createdAt },
  });
}
