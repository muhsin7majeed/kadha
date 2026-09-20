self.addEventListener("push", (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {
      title: "Kadha notification",
      body: event.data?.text() || "You have a new notification",
    };
  }

  const title = payload.title || "Kadha notification";
  const options = {
    body: payload.body || "You have a new notification",
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    data: { url: payload.url || "/app/notifications" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(
    event.notification.data?.url || "/app/notifications",
    self.location.origin,
  ).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existingClient = clients.find(
          (client) => client.url === targetUrl,
        );
        if (existingClient) return existingClient.focus();
        return self.clients.openWindow(targetUrl);
      }),
  );
});
