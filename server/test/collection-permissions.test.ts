import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { authorization, registerTestUser } from './helpers/auth';
import {
  acceptCollectionInvite,
  addMovieToCollection,
  createTestCollection,
  inviteUserToCollection,
} from './helpers/collection';
import { getTestApp } from './helpers/app';

describe('collection permissions', () => {
  it('keeps collections visible only to owners and members', async () => {
    const owner = await registerTestUser('collection-owner');
    const outsider = await registerTestUser('collection-outsider');
    const collection = await createTestCollection(owner, 'Owner only list');

    const ownerResponse = await request(await getTestApp())
      .get(`/api/collection/${collection.id}`)
      .set('Authorization', authorization(owner))
      .expect(200);

    expect(ownerResponse.body.data).toMatchObject({
      id: collection.id,
      access: {
        relationship: 'owner',
        role: 'owner',
        canEditItems: true,
        canManageSharing: true,
      },
    });

    const outsiderResponse = await request(await getTestApp())
      .get(`/api/collection/${collection.id}`)
      .set('Authorization', authorization(outsider))
      .expect(403);

    expect(outsiderResponse.body).toEqual({
      code: 'FORBIDDEN',
      message: 'You do not have access to this collection',
    });
  });

  it('allows accepted viewer members to view but not edit collection items', async () => {
    const owner = await registerTestUser('viewer-owner');
    const viewer = await registerTestUser('viewer-member');
    const collection = await createTestCollection(owner, 'Viewer shared list');
    const invite = await inviteUserToCollection(owner, collection.id, viewer, 'viewer');

    await acceptCollectionInvite(viewer, invite.id);

    const viewerResponse = await request(await getTestApp())
      .get(`/api/collection/${collection.id}`)
      .set('Authorization', authorization(viewer))
      .expect(200);

    expect(viewerResponse.body.data).toMatchObject({
      id: collection.id,
      access: {
        relationship: 'member',
        role: 'viewer',
        canEditItems: false,
        canManageSharing: false,
      },
    });

    const addResponse = await addMovieToCollection(viewer, collection.id, 991101, 403);

    expect(addResponse.body).toEqual({
      code: 'FORBIDDEN',
      message: 'You cannot edit items in this collection',
    });
  });

  it('allows accepted editor members to edit items but not manage sharing', async () => {
    const owner = await registerTestUser('editor-owner');
    const editor = await registerTestUser('editor-member');
    const invitee = await registerTestUser('editor-invitee');
    const collection = await createTestCollection(owner, 'Editor shared list');
    const invite = await inviteUserToCollection(owner, collection.id, editor, 'editor');

    await acceptCollectionInvite(editor, invite.id);

    const addResponse = await addMovieToCollection(editor, collection.id, 991201);

    expect(addResponse.body).toMatchObject({
      added: true,
      data: {
        addedByUserId: editor.userId,
        media_id: 991201,
        title: 'Test Movie 991201',
      },
    });

    const shareResponse = await request(await getTestApp())
      .post(`/api/collection/${collection.id}/invites`)
      .set('Authorization', authorization(editor))
      .send({
        inviteeId: invitee.userId,
        role: 'viewer',
      })
      .expect(404);

    expect(shareResponse.body).toEqual({
      code: 'NOT_FOUND',
      message: 'Collection not found',
    });
  });

  it('lets owners promote viewer members to editor access', async () => {
    const owner = await registerTestUser('role-owner');
    const member = await registerTestUser('role-member');
    const collection = await createTestCollection(owner, 'Role update list');
    const invite = await inviteUserToCollection(owner, collection.id, member, 'viewer');

    await acceptCollectionInvite(member, invite.id);

    const collectionResponse = await request(await getTestApp())
      .get(`/api/collection/${collection.id}`)
      .set('Authorization', authorization(owner))
      .expect(200);

    const memberRecord = collectionResponse.body.data.members.find(
      (candidate: { userId: string }) => candidate.userId === member.userId,
    ) as { id: string; role: string } | undefined;

    expect(memberRecord).toMatchObject({ role: 'viewer' });

    if (!memberRecord) {
      throw new Error('Expected accepted member to be present in collection details');
    }

    await request(await getTestApp())
      .patch(`/api/collection/${collection.id}/members/${memberRecord.id}`)
      .set('Authorization', authorization(owner))
      .send({ role: 'editor' })
      .expect(200);

    const addResponse = await addMovieToCollection(member, collection.id, 991301);

    expect(addResponse.body).toMatchObject({
      added: true,
      data: {
        addedByUserId: member.userId,
        media_id: 991301,
      },
    });
  });
});
