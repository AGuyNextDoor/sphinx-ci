import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const team = await prisma.team.findUnique({ where: { id } });
  if (!team || team.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete associated quizzes first, then the team
  await prisma.quiz.deleteMany({ where: { teamId: id } });
  await prisma.team.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
