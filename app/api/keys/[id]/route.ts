import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";

export async function PUT(
  request: NextRequest,
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

  let body: {
    anthropicApiKey?: string;
    config?: {
      numQuestions?: number;
      passingScore?: number;
      maxAttempts?: number;
      language?: "fr" | "en";
      keyword?: string;
    };
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};

  if (body.anthropicApiKey) {
    updateData.anthropicApiKey = body.anthropicApiKey;
  }

  if (body.config) {
    const currentConfig = (team.quizConfig as Record<string, unknown>) || {};
    updateData.quizConfig = { ...currentConfig, ...body.config };
  }

  const updated = await prisma.team.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ success: true, id: updated.id });
}

export async function PATCH(
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

  const newApiKey = `spx_${randomBytes(24).toString("hex")}`;

  await prisma.team.update({
    where: { id },
    data: { apiKey: newApiKey },
  });

  return NextResponse.json({ apiKey: newApiKey });
}

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

  await prisma.quiz.deleteMany({ where: { teamId: id } });
  await prisma.team.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
