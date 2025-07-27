import { View } from "react-native";
import { AppText } from "@/components/AppText";
import * as Form from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import * as AC from "@bacons/apple-colors";
import { useAuthStoreObserver } from "@/utils/authStoreLegend";
import { NotificationSettings } from "@/types";
import i18n from "@/utils/i18n";

// Default notification settings
const getDefaultNotificationSettings = (): NotificationSettings => ({
  lowMood: true,
  missedCalls: true,
  newTopics: true,
});

export default function ModalScreenScreen() {
  const { user, updateNotificationSettings, isLoadingUser } = useAuthStoreObserver();

  // Initialize state from store or defaults
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>(getDefaultNotificationSettings());
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasLoadedFromUser, setHasLoadedFromUser] = useState(false);

  // Load settings from store on mount and when user changes
  useEffect(() => {
    console.log('🔄 Notification settings effect triggered:', {
      isLoadingUser,
      hasUser: !!user,
      hasNotificationSettings: !!user?.notificationSettings,
      isInitialized,
      hasLoadedFromUser
    });
    
    // Attendre que l'utilisateur soit chargé
    if (!isLoadingUser && user && !hasLoadedFromUser) {
      if (user.notificationSettings) {
        console.log('🔄 Loading notification settings from user:', user.notificationSettings);
        setNotificationSettings(user.notificationSettings);
      } else {
        // Si l'utilisateur est chargé mais n'a pas de notification settings, utiliser les défauts
        console.log('🔄 No notification settings found, using defaults');
        setNotificationSettings(getDefaultNotificationSettings());
      }
      setIsInitialized(true);
      setHasLoadedFromUser(true);
    }
  }, [user, isLoadingUser, hasLoadedFromUser]);

  // Save settings to store whenever they change (only after initialization)
  useEffect(() => {
    if (isInitialized && user && hasLoadedFromUser) {
      console.log('💾 Saving notification settings:', notificationSettings);
      updateNotificationSettings(notificationSettings);
    }
  }, [notificationSettings, updateNotificationSettings, isInitialized, user, hasLoadedFromUser]);

  // Show loading state while user is being loaded
  if (isLoadingUser) {
    return (
      <View className="flex-1 p-4 justify-center items-center" style={{ backgroundColor: AC.systemGroupedBackground }}>
        <AppText>Chargement des paramètres...</AppText>
      </View>
    );
  }

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
            <View style={{ gap: 4, maxWidth: "80%"}}>
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
            <View style={{ gap: 4, maxWidth: "80%" }}>
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
            <View style={{ gap: 4, maxWidth: "80%" }}>
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
