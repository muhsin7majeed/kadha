import webpush from "web-push";
import { PushDeliveryStatus, type NotificationType } from "@prisma/client";

import { envConfig } from "@/config/env";
import { prisma } from "@/lib/prisma";
import type { PushSubscriptionInput } from "./push.schema";

const WORKER_INTERVAL_MS = 2_000;
const MAX_ATTEMPTS = 5;
const LOCK_TIMEOUT_MS = 5 * 60 * 1000;

const isConfigured = () =>
  Boolean(
    envConfig.vapidSubject &&
    envConfig.vapidPublicKey &&
    envConfig.vapidPrivateKey,
  );

if (isConfigured()) {
  webpush.setVapidDetails(
    envConfig.vapidSubject,
    envConfig.vapidPublicKey,
    envConfig.vapidPrivateKey,
  );
}

export const isPushConfigured = isConfigured;

export const getPushPublicKey = () =>
  isConfigured() ? envConfig.vapidPublicKey : null;

export async function savePushSubscription(
  userId: string,
  input: PushSubscriptionInput,
) {
  if (!isConfigured()) return false;

  await prisma.pushSubscription.upsert({
    where: { endpoint: input.endpoint },
    create: {
      userId,
      endpoint: input.endpoint,
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
    },
    update: {
      userId,
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
    },
  });

  return true;
}

export async function removePushSubscription(userId: string, endpoint: string) {
  const result = await prisma.pushSubscription.deleteMany({
    where: { userId, endpoint },
  });
  return result.count > 0;
}

const getRetryDate = (attempts: number) => {
  const delayMs = Math.min(
    60 * 60 * 1000,
    5_000 * 2 ** Math.max(attempts - 1, 0),
  );
  return new Date(Date.now() + delayMs);
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message.slice(0, 500)
    : "Unknown push delivery failure";

const getStatusCode = (error: unknown) => {
  if (!error || typeof error !== "object" || !("statusCode" in error))
    return null;
  const statusCode = error.statusCode;
  return typeof statusCode === "number" ? statusCode : null;
};

const buildNotificationPayload = (notification: {
  type: NotificationType;
  entityId: string | null;
  metadata: string | null;
  actor: { username: string } | null;
}) => {
  let metadata: Record<string, unknown> = {};

  if (notification.metadata) {
    try {
      const parsed: unknown = JSON.parse(notification.metadata);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        metadata = parsed as Record<string, unknown>;
      }
    } catch {
      metadata = {};
    }
  }

  const subject =
    typeof metadata.subject === "string" ? metadata.subject : null;
  const collectionName =
    typeof metadata.collectionName === "string"
      ? metadata.collectionName
      : null;
  const actorName = notification.actor?.username ?? "Someone";
  const feedbackUrl = notification.entityId
    ? `/app/admin/feedback/${notification.entityId}`
    : "/app/admin/feedback";
  const feedbackUserUrl = notification.entityId
    ? `/app/feedback/${notification.entityId}`
    : "/app/feedback";
  const collectionUrl = notification.entityId
    ? `/app/collections/${notification.entityId}`
    : "/app/collections";

  switch (notification.type) {
    case "FEEDBACK_SUBMITTED":
      return {
        title: "New feedback received",
        body: subject
          ? `${actorName}: ${subject}`
          : `${actorName} submitted feedback`,
        url: feedbackUrl,
      };
    case "FEEDBACK_STATUS_CHANGED":
      return {
        title: "Feedback updated",
        body: subject
          ? `Your feedback “${subject}” was updated`
          : "Your feedback was updated",
        url: feedbackUserUrl,
      };
    case "FRIEND_REQUEST_RECEIVED":
      return {
        title: "New friend request",
        body: `${actorName} sent you a friend request`,
        url: "/app/friends/received",
      };
    case "FRIEND_REQUEST_ACCEPTED":
      return {
        title: "Friend request accepted",
        body: `${actorName} accepted your friend request`,
        url: `/app/profile/${encodeURIComponent(actorName)}`,
      };
    case "COLLECTION_INVITE":
      return {
        title: "Collection invitation",
        body: collectionName
          ? `You were invited to ${collectionName}`
          : "You were invited to a collection",
        url: collectionUrl,
      };
    case "COLLECTION_OWNERSHIP_RECEIVED":
    case "COLLECTION_OWNERSHIP_CHANGED":
    case "SHARED_COLLECTIONS_REMOVED":
    case "COLLECTION_COLLABORATOR_DEPARTED":
      return {
        title: "Collection update",
        body: collectionName
          ? `There is an update to ${collectionName}`
          : "There is an update to one of your collections",
        url: collectionUrl,
      };
    default:
      return {
        title: `${envConfig.appName} notification`,
        body: "You have a new notification",
        url: "/app/notifications",
      };
  }
};

const claimNextDelivery = async () => {
  const now = new Date();
  const staleLock = new Date(now.getTime() - LOCK_TIMEOUT_MS);
  const delivery = await prisma.pushDelivery.findFirst({
    where: {
      availableAt: { lte: now },
      OR: [
        { status: PushDeliveryStatus.PENDING },
        { status: PushDeliveryStatus.PROCESSING, lockedAt: { lt: staleLock } },
      ],
    },
    orderBy: [{ availableAt: "asc" }, { createdAt: "asc" }],
  });

  if (!delivery) return null;

  const claimed = await prisma.pushDelivery.updateMany({
    where: {
      id: delivery.id,
      OR: [
        { status: PushDeliveryStatus.PENDING },
        { status: PushDeliveryStatus.PROCESSING, lockedAt: { lt: staleLock } },
      ],
    },
    data: { status: PushDeliveryStatus.PROCESSING, lockedAt: now },
  });

  if (claimed.count === 0) return null;

  return prisma.pushDelivery.findUnique({
    where: { id: delivery.id },
    include: {
      subscription: true,
      notification: { include: { actor: { select: { username: true } } } },
    },
  });
};

const processDelivery = async (
  delivery: NonNullable<Awaited<ReturnType<typeof claimNextDelivery>>>,
) => {
  try {
    const payload = buildNotificationPayload(delivery.notification);
    await webpush.sendNotification(
      {
        endpoint: delivery.subscription.endpoint,
        keys: {
          p256dh: delivery.subscription.p256dh,
          auth: delivery.subscription.auth,
        },
      },
      JSON.stringify(payload),
    );

    await prisma.pushDelivery.update({
      where: { id: delivery.id },
      data: {
        status: PushDeliveryStatus.SENT,
        sentAt: new Date(),
        lockedAt: null,
        lastError: null,
      },
    });
  } catch (error) {
    const statusCode = getStatusCode(error);

    if (statusCode === 404 || statusCode === 410) {
      await prisma.pushSubscription
        .delete({ where: { id: delivery.subscriptionId } })
        .catch(() => undefined);
      return;
    }

    const attempts = delivery.attempts + 1;
    await prisma.pushDelivery.update({
      where: { id: delivery.id },
      data: {
        status:
          attempts >= MAX_ATTEMPTS
            ? PushDeliveryStatus.FAILED
            : PushDeliveryStatus.PENDING,
        attempts,
        availableAt:
          attempts >= MAX_ATTEMPTS
            ? delivery.availableAt
            : getRetryDate(attempts),
        lockedAt: null,
        lastError: getErrorMessage(error),
      },
    });
  }
};

export const processNextPushDelivery = async () => {
  if (!isConfigured()) return false;

  const delivery = await claimNextDelivery();
  if (!delivery) return false;

  await processDelivery(delivery);
  return true;
};

export const startPushDeliveryWorker = () => {
  if (!isConfigured()) return () => undefined;

  let processing = false;

  const processAvailableDelivery = async () => {
    if (processing) return;
    processing = true;

    try {
      await processNextPushDelivery();
    } catch (error) {
      console.error("Push delivery worker failed", error);
    } finally {
      processing = false;
    }
  };

  void processAvailableDelivery();
  const interval = setInterval(
    () => void processAvailableDelivery(),
    WORKER_INTERVAL_MS,
  );
  interval.unref();

  return () => clearInterval(interval);
};
