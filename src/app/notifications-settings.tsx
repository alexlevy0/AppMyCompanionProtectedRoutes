import { View } from "react-native";
import { AppText } from "@/components/AppText";
import * as Form from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import * as AC from "@bacons/apple-colors";
import { useAuthStore } from "@/utils/authStore";
import { NotificationSettings } from "@/types";
import i18n from "@/utils/i18n";

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
      className="flex-1"
      style={{ backgroundColor: AC.systemGroupedBackground }}
    >
      <Form.List navigationTitle="Home">
        <Form.Section title={i18n.t('notifications')}>
          <Form.HStack>
            <View style={{ gap: 4 }}>
              <Form.Text>{i18n.t('ifWeNoticeLowMood')}</Form.Text>
              <Form.Text style={Form.FormFont.caption}>
                {i18n.t('ifWeDetectLowMood')}
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
              <Form.Text>{i18n.t('ifSeveralCallsMissed')}</Form.Text>
              <Form.Text style={Form.FormFont.caption}>
                {i18n.t('ifOurCallMissed')}
              </Form.Text>
            </View>
            <View style={{ flex: 1 }} />
            <Switch
              onValueChange={(value) =>
                handleToggleSetting("missedCalls", value)
              }
              value={notificationSettings.missedCalls}
            />
          </Form.HStack>
          <Form.HStack>
            <View style={{ gap: 4 }}>
              <Form.Text>{i18n.t('ifWeDetectNewTopic')}</Form.Text>
              <Form.Text style={Form.FormFont.caption}>
                {i18n.t('ifWeDetectNewTopicInterest')}
              </Form.Text>
            </View>
            <View style={{ flex: 1 }} />
            <Switch
              onValueChange={(value) => handleToggleSetting("newTopics", value)}
              value={notificationSettings.newTopics}
            />
          </Form.HStack>
        </Form.Section>
      </Form.List>
    </View>
  );
}
