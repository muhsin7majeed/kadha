import { CollectionMember } from '../collections.types';

export const toCollectionMemberRowUser = (member: CollectionMember) => ({
  ...member.user,
  memberId: member.id,
  role: member.role,
});
