import prisma from "./prisma";

export async function assertWeddingMember(
  userId: string,
  weddingId: string
): Promise<void> {
  const member = await prisma.weddingMember.findUnique({
    where: {
      weddingId_userId: {
        weddingId,
        userId,
      },
    },
  });

  if (!member) {
    throw new Error("FORBIDDEN");
  }
}
