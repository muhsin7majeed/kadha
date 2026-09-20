import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { BaseResponse } from "@/types/common";
import api from "@/lib/axios-instance";
import { notificationQueryKeys } from "@/lib/query-keys";

interface PushConfig {
  enabled: boolean;
  publicKey: string | null;
}

interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

const getPushConfig = async () => {
  const response = await api.get<BaseResponse<PushConfig>>(
    "/api/notifications/push/config",
  );
  return response.data.data;
};

const getPushServiceWorker = () =>
  navigator.serviceWorker.register("/push-sw.js", { scope: "/push/" });

const decodeBase64Url = (value: string) => {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = `${value.replace(/-/g, "+").replace(/_/g, "/")}${padding}`;
  const rawData = window.atob(base64);

  return Uint8Array.from(rawData, (character) => character.charCodeAt(0));
};

const getSubscriptionPayload = (
  subscription: PushSubscription,
): PushSubscriptionPayload => {
  const json = subscription.toJSON();

  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
    throw new Error("The browser returned an incomplete push subscription.");
  }

  return {
    endpoint: json.endpoint,
    keys: {
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
  };
};

const isPushSupported = () =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

const getCurrentSubscription = async () => {
  if (!isPushSupported()) return false;
  const registration = await getPushServiceWorker();
  return (await registration.pushManager.getSubscription()) !== null;
};

const enablePushNotifications = async (config: PushConfig | undefined) => {
  if (!isPushSupported())
    throw new Error("Push notifications are not supported by this browser.");
  if (!config?.enabled || !config.publicKey)
    throw new Error("Push notifications are not configured on this server.");

  const permission = await Notification.requestPermission();
  if (permission !== "granted")
    throw new Error("Browser notification permission was not granted.");

  const registration = await getPushServiceWorker();
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: decodeBase64Url(config.publicKey),
    }));

  await api.put(
    "/api/notifications/push/subscription",
    getSubscriptionPayload(subscription),
  );
};

export const removeCurrentPushSubscription = async () => {
  if (!isPushSupported()) return;

  const registration = await getPushServiceWorker();
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  try {
    await api.delete("/api/notifications/push/subscription", {
      data: getSubscriptionPayload(subscription),
    });
  } finally {
    await subscription.unsubscribe();
  }
};

const usePushNotifications = () => {
  const queryClient = useQueryClient();
  const configQuery = useQuery({
    queryKey: notificationQueryKeys.pushConfig,
    queryFn: getPushConfig,
  });
  const subscriptionQuery = useQuery({
    queryKey: notificationQueryKeys.pushSubscription,
    queryFn: getCurrentSubscription,
    enabled:
      isPushSupported() &&
      Notification.permission === "granted" &&
      configQuery.data?.enabled === true,
  });
  const refreshPushState = () => {
    void queryClient.invalidateQueries({
      queryKey: notificationQueryKeys.pushConfig,
    });
    void queryClient.invalidateQueries({
      queryKey: notificationQueryKeys.pushSubscription,
    });
  };
  const enableMutation = useMutation({
    mutationFn: () => enablePushNotifications(configQuery.data),
    onSuccess: refreshPushState,
  });
  const disableMutation = useMutation({
    mutationFn: removeCurrentPushSubscription,
    onSuccess: refreshPushState,
  });

  return {
    config: configQuery.data,
    isEnabled: subscriptionQuery.data === true,
    isLoading: configQuery.isLoading || subscriptionQuery.isLoading,
    isSupported: isPushSupported(),
    permission:
      typeof Notification === "undefined"
        ? "unsupported"
        : Notification.permission,
    enable: enableMutation.mutateAsync,
    disable: disableMutation.mutateAsync,
    isEnabling: enableMutation.isPending,
    isDisabling: disableMutation.isPending,
    error:
      enableMutation.error ??
      disableMutation.error ??
      configQuery.error ??
      subscriptionQuery.error,
  };
};

export default usePushNotifications;
