import { prisma } from "./db";

export async function validateApiKey(apiKey: string | null) {
  if (!apiKey) return null;

  const team = await prisma.team.findUnique({
    where: { apiKey },
  });

  return team;
}
