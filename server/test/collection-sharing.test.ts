import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { authorization, registerTestUser, TestUser } from './helpers/auth';
import { acceptCollectionInvite, createTestCollection, inviteUserToCollection } from './helpers/collection';
import { getTestApp } from './helpers/app';

const getMemberId = async (owner: TestUser, collectionId: string, member: TestUser) => {
  const collectionResponse = await request(await getTestApp())
    .get(`/api/collection/${collectionId}`)
    .set('Authorization', authorization(owner))
    .expect(200);

  const memberRecord = collectionResponse.body.data.members.find(
    (candidate: { userId: string }) => candidate.userId === member.userId,
  ) as { id: string } | undefined;

  if (!memberRecord) {
    throw new Error('Expected accepted member to be present in collection details');
  }

  return memberRecord.id;
};

describe('collection sharing', () => {
  it('rejects duplicate pending invitations', async () => {
    const owner = await registerTestUser('duplicate-invite-owner');
    const invitee = await registerTestUser('duplicate-invite-user');
    const collection = await createTestCollection(owner, 'Duplicate invite list');

    await inviteUserToCollection(owner, collection.id, invitee, 'viewer');

    const response = await request(await getTestApp())
      .post(`/api/collection/${collection.id}/invites`)
      .set('Authorization', authorization(owner))
      .send({
        inviteeId: invitee.userId,
        role: 'viewer',
      })
      .expect(400);

    expect(response.body).toEqual({
      code: 'BAD_REQUEST',
      message: 'User already has a pending invitation',
      fieldErrors: {
        inviteeId: 'User already has a pending invitation',
      },
    });
  });

  it('prevents revoked invitations from being accepted', async () => {
    const owner = await registerTestUser('revoke-invite-owner');
    const invitee = await registerTestUser('revoke-invite-user');
    const collection = await createTestCollection(owner, 'Revoked invite list');
    const invite = await inviteUserToCollection(owner, collection.id, invitee, 'editor');

    const revokeResponse = await request(await getTestApp())
      .post(`/api/collection/${collection.id}/invites/${invite.id}/revoke`)
      .set('Authorization', authorization(owner))
      .expect(200);

    expect(revokeResponse.body.data).toMatchObject({
      id: invite.id,
      role: 'editor',
      status: 'revoked',
    });

    const acceptResponse = await request(await getTestApp())
      .post(`/api/collection/invites/${invite.id}/respond`)
      .set('Authorization', authorization(invitee))
      .send({ action: 'accept' })
      .expect(400);

    expect(acceptResponse.body).toEqual({
      code: 'BAD_REQUEST',
      message: 'Invitation is no longer available',
    });
  });

  it('removes member access when an owner removes a member', async () => {
    const owner = await registerTestUser('remove-member-owner');
    const member = await registerTestUser('remove-member-user');
    const collection = await createTestCollection(owner, 'Removed member list');
    const invite = await inviteUserToCollection(owner, collection.id, member, 'viewer');

    await acceptCollectionInvite(member, invite.id);

    await request(await getTestApp())
      .get(`/api/collection/${collection.id}`)
      .set('Authorization', authorization(member))
      .expect(200);

    const memberId = await getMemberId(owner, collection.id, member);

    const removeResponse = await request(await getTestApp())
      .delete(`/api/collection/${collection.id}/members/${memberId}`)
      .set('Authorization', authorization(owner))
      .expect(200);

    expect(removeResponse.body).toEqual({
      message: 'Member removed successfully',
    });

    const accessResponse = await request(await getTestApp())
      .get(`/api/collection/${collection.id}`)
      .set('Authorization', authorization(member))
      .expect(403);

    expect(accessResponse.body).toEqual({
      code: 'FORBIDDEN',
      message: 'You do not have access to this collection',
    });
  });

  it('lets members leave shared collections', async () => {
    const owner = await registerTestUser('leave-member-owner');
    const member = await registerTestUser('leave-member-user');
    const collection = await createTestCollection(owner, 'Member leave list');
    const invite = await inviteUserToCollection(owner, collection.id, member, 'viewer');

    await acceptCollectionInvite(member, invite.id);

    const leaveResponse = await request(await getTestApp())
      .post(`/api/collection/${collection.id}/leave`)
      .set('Authorization', authorization(member))
      .expect(200);

    expect(leaveResponse.body).toEqual({
      message: 'Left collection successfully',
    });

    const accessResponse = await request(await getTestApp())
      .get(`/api/collection/${collection.id}`)
      .set('Authorization', authorization(member))
      .expect(403);

    expect(accessResponse.body).toEqual({
      code: 'FORBIDDEN',
      message: 'You do not have access to this collection',
    });
  });

  it('prevents owners from leaving their own collections', async () => {
    const owner = await registerTestUser('owner-leave-owner');
    const collection = await createTestCollection(owner, 'Owner leave list');

    const response = await request(await getTestApp())
      .post(`/api/collection/${collection.id}/leave`)
      .set('Authorization', authorization(owner))
      .expect(400);

    expect(response.body).toEqual({
      code: 'BAD_REQUEST',
      message: 'Owners cannot leave their own collection',
    });
  });
});
