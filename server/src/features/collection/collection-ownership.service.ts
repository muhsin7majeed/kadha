import { Prisma } from '@prisma/client';

export async function transferCollectionOwnership(
  tx: Prisma.TransactionClient,
  collectionId: string,
  currentOwnerId: string,
  newOwnerUserId: string,
) {
  const member = await tx.collectionMember.findUnique({
    where: {
      collectionId_userId: {
        collectionId,
        userId: newOwnerUserId,
      },
    },
    select: { id: true },
  });

  if (!member) return false;

  const updated = await tx.collection.updateMany({
    where: {
      id: collectionId,
      userId: currentOwnerId,
    },
    data: {
      userId: newOwnerUserId,
    },
  });

  if (updated.count !== 1) return false;

  await tx.collectionMember.delete({ where: { id: member.id } });
  return true;
}
