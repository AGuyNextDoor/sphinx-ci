import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { repo: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.repo || typeof body.repo !== "string") {
    return NextResponse.json(
      { error: "Missing repo field" },
      { status: 400 }
    );
  }

  // Check if already configured
  const existing = await prisma.team.findFirst({
    where: { name: body.repo, userId: session.user.id },
  });

  if (existing) {
    return NextResponse.json(
      { error: "This repo is already configured", apiKey: existing.apiKey },
      { status: 409 }
    );
  }

  const apiKey = `spx_${randomBytes(24).toString("hex")}`;

  const team = await prisma.team.create({
    data: {
      name: body.repo,
      apiKey,
      userId: session.user.id,
    },
  });

  return NextResponse.json(
    { id: team.id, apiKey: team.apiKey, repo: team.name },
    { status: 201 }
  );
}
