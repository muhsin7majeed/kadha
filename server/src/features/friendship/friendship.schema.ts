import { z } from 'zod';

const userIdSchema = z.string({ required_error: 'User id is required' }).uuid('Invalid user id');

export const sendFriendRequestSchema = z.object({
  receiverId: userIdSchema,
});

export const senderIdSchema = z.object({
  senderId: userIdSchema,
});

export const userIdBodySchema = z.object({
  userId: userIdSchema,
});
