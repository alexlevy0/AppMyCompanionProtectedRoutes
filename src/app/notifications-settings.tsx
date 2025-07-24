import { View } from "react-native";
import { AppText } from "@/components/AppText";
import * as Form from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import * as AC from "@bacons/apple-colors";
import { useAuthStore } from "@/utils/authStore";
import { NotificationSettings } from "@/types";

// Default notification settings
const getDefaultNotificationSettings = (): NotificationSettings => ({
  lowMood: true,
  missedCalls: true,
  newTopics: true,
});

export default function ModalScreenScreen() {
  const { user, updateNotificationSettings } = useAuthStore();

  // Initialize state from store or defaults
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>(getDefaultNotificationSettings());
  const [isInitialized, setIsInitialized] = useState(false);

  // Load settings from store on mount (only once)
  useEffect(() => {
    if (user?.notificationSettings && !isInitialized) {
      setNotificationSettings(user.notificationSettings);
      setIsInitialized(true);
    } else if (!user?.notificationSettings && !isInitialized) {
      // If no settings exist, mark as initialized to avoid infinite loop
      setIsInitialized(true);
    }
  }, [user?.notificationSettings, isInitialized]);

  // Save settings to store whenever they change (only after initialization)
  useEffect(() => {
    if (isInitialized) {
      updateNotificationSettings(notificationSettings);
    }
  }, [notificationSettings, updateNotificationSettings, isInitialized]);

  // Handlers
  const handleToggleSetting = (
    setting: keyof NotificationSettings,
    value: boolean
  ) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  return (
    <View
      className="flex-1 p-4"
      style={{ backgroundColor: AC.systemGroupedBackground }}
    >
      <Form.Section title="Notifications">
        <Form.HStack>
          <View style={{ gap: 4 }}>
            <Form.Text>If we notice a low mood</Form.Text>
            <Form.Text style={Form.FormFont.caption}>
              If we detect that your self seems down, we'll notify you so that
              you can offer prompt support.
            </Form.Text>
          </View>
          <View style={{ flex: 1 }} />
          <Switch
            onValueChange={(value) => handleToggleSetting("lowMood", value)}
            value={notificationSettings.lowMood}
          />
        </Form.HStack>
        <Form.HStack>
          <View style={{ gap: 4 }}>
            <Form.Text>If several calls are missed</Form.Text>
            <Form.Text style={Form.FormFont.caption}>
              If our call is missed, we'll try again every hour. If none of the
              calls are answered, we'll notify you to keep you informed of
              potential issues.
            </Form.Text>
          </View>
          <View style={{ flex: 1 }} />
          <Switch
            onValueChange={(value) => handleToggleSetting("missedCalls", value)}
            value={notificationSettings.missedCalls}
          />
        </Form.HStack>
        <Form.HStack>
          <View style={{ gap: 4 }}>
            <Form.Text>If we detect a new topic to discuss</Form.Text>
            <Form.Text style={Form.FormFont.caption}>
              If we detect a new topic of interest during the calls, we'll share
              it with you, providing conversation starts for your next
              conversation with your self.
            </Form.Text>
          </View>
          <View style={{ flex: 1 }} />
          <Switch
            onValueChange={(value) => handleToggleSetting("newTopics", value)}
            value={notificationSettings.newTopics}
          />
        </Form.HStack>
      </Form.Section>
    </View>
  );
}
