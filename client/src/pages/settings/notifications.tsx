import { Alert, Button, Card, Stack, Text } from "@chakra-ui/react";

import { APP_CONFIG } from "@/config/app-config";
import usePushNotifications from "@/features/notifications/api/use-push-notifications";
import SettingsSectionHeader from "./settings-section-header";

const NotificationsSettings = () => {
  const {
    config,
    error,
    isEnabled,
    isLoading,
    isSupported,
    permission,
    enable,
    disable,
    isEnabling,
    isDisabling,
  } = usePushNotifications();

  const errorMessage = error instanceof Error ? error.message : null;
  const pushUnavailable = !isSupported || config?.enabled === false;

  return (
    <Stack gap="6">
      <SettingsSectionHeader
        title="Notifications"
        description={`Choose whether ${APP_CONFIG.appName} can alert this device when something needs your attention.`}
      />

      <Card.Root variant="outline">
        <Card.Body gap="4">
          <Stack gap="1">
            <Card.Title>Browser notifications</Card.Title>
            <Card.Description>
              Get alerts for friend requests, collection updates, feedback
              updates, and other in-app notifications.
            </Card.Description>
          </Stack>

          {permission === "denied" && (
            <Alert.Root status="warning">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Notifications are blocked</Alert.Title>
                <Alert.Description>
                  Allow notifications for {APP_CONFIG.appName} in your browser or Android site
                  settings, then try again.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}

          {errorMessage && permission !== "denied" && (
            <Alert.Root status="error">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Could not update notifications</Alert.Title>
                <Alert.Description>{errorMessage}</Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}

          {!isSupported && (
            <Text color="fg.muted">
              This browser does not support web push notifications.
            </Text>
          )}
          {isSupported && config?.enabled === false && (
            <Text color="fg.muted">
              Push notifications are not configured on this {APP_CONFIG.appName} server.
            </Text>
          )}

          {!pushUnavailable && (
            <Button
              alignSelf="flex-start"
              colorPalette={isEnabled ? "gray" : "brand"}
              variant={isEnabled ? "outline" : "solid"}
              disabled={isLoading || permission === "denied"}
              loading={isEnabling || isDisabling}
              onClick={() => void (isEnabled ? disable() : enable())}
            >
              {isEnabled
                ? "Disable on this device"
                : "Enable browser notifications"}
            </Button>
          )}
        </Card.Body>
      </Card.Root>
    </Stack>
  );
};

export default NotificationsSettings;
