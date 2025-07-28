import { View, Alert } from "react-native";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { useAuthStoreObserver } from "@/utils/authStoreLegend";
import * as Form from "@/components/ui/form";
import { Link } from "expo-router";
import { Text, Pressable } from "react-native";
import * as AC from "@bacons/apple-colors";
import { Rounded } from "@/components/ui/rounded";
import { Image } from "@/components/ui/img";
import { useI18n } from "@/utils/I18nContext";
import { LanguageSelector } from "@/components/LanguageSelector";

function HorizontalItem({
  title,
  badge,
  subtitle,
}: {
  title: string;
  badge: React.ReactNode;
  subtitle: string;
}) {
  return (
    <View style={{ alignItems: "center", gap: 4, flex: 1 }}>
      <Form.Text
        style={{
          textTransform: "uppercase",
          fontSize: 10,
          fontWeight: "600",
          color: AC.secondaryLabel,
        }}
      >
        {title}
      </Form.Text>
      {typeof badge === "string" ? (
        <Form.Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: AC.secondaryLabel,
          }}
        >
          {badge}
        </Form.Text>
      ) : (
        badge
      )}

      <Form.Text
        style={{
          fontSize: 12,
          color: AC.secondaryLabel,
        }}
      >
        {subtitle}
      </Form.Text>
    </View>
  );
}


export function TripleItemTest() {
  const { t } = useI18n();
  
  return (
    <>
      <HorizontalItem title={t('expires')} badge="88" subtitle={t('days')} />

      <View
        style={{
          backgroundColor: AC.separator,
          width: 0.5,
          maxHeight: "50%",
          minHeight: "50%",
          marginVertical: "auto",
        }}
      />

      <HorizontalItem
        title={t('designedWith')}
        badge="❤️"
        subtitle={t('forOurSeniors')}
      />

      <View
        style={{
          backgroundColor: AC.separator,
          width: 0.5,
          maxHeight: "50%",
          minHeight: "50%",
          marginVertical: "auto",
        }}
      />

      <HorizontalItem title={t('version')} badge="3.6" subtitle={`${t('build')} 250`} />
    </>
  );
}



export default function SettingsScreen() {
  const { logOut, resetOnboarding } = useAuthStoreObserver();
  const { t } = useI18n();

  return (
    <View
      className="flex-1 p-4"
      style={{ flex: 1, backgroundColor: AC.systemGroupedBackground }}
    >
      <Form.List navigationTitle="Home">
        <Form.Section>
          <Rounded padding style={{ alignItems: "center", gap: 8, flex: 1 }}>
            <Image
              source={{
                uri: "https://github.com/alexlevy0/getmycompanion.com/blob/main/android-chrome-512x512.png?raw=true",
              }}
              style={{
                aspectRatio: 1,
                height: 64,
                borderRadius: 8,
              }}
            />
            <Form.Text
              style={{
                fontSize: 20,
                fontFamily:
                  process.env.EXPO_OS === "ios" ? "ui-rounded" : undefined,
                fontWeight: "600",
              }}
            >
              {t('appName')}
            </Form.Text>
            <Form.Text style={{ textAlign: "center", fontSize: 14 }}>
              {t('appDescription')}
            </Form.Text>
          </Rounded>
        </Form.Section>
        <Form.Section title={t('settings')}>
          <Form.Link href="/call-settings">
            <View style={{ gap: 4 }}>
              <Form.Text>{t('callSettings')}</Form.Text>
            </View>
          </Form.Link>
          <Link href="/notifications-settings">
            <View style={{ gap: 4 }}>
              <Form.Text>{t('notifications')}</Form.Text>
            </View>
          </Link>
        </Form.Section>
        
        <Form.Section title={t('language')}>
          <LanguageSelector />
        </Form.Section>
{/*         
        <Form.Section title="Test des traductions">
          <TranslationTest />
        </Form.Section>
        
        <Form.Section title="Test des jours de la semaine">
          <DaysOfWeekTest />
        </Form.Section> */}
        <Form.Section title="App">
          <Form.Link href="/modal?deleteAccount=true">
            <View style={{ gap: 4 }}>
              <Form.Text>{t('deleteAccount')}</Form.Text>
            </View>
          </Form.Link>
          <Link target="_blank" href="https://getmycompanion.com">
            <View style={{ gap: 4 }}>
              <Form.Text>{t('contactSupport')}</Form.Text>
            </View>
          </Link>
          <Link href="/settings" asChild style={{ flex: 1 }}>
            <Pressable style={{ flex: 1, gap: 4 }} onPress={resetOnboarding}>
              <Form.Text>{t('resetOnboarding')}</Form.Text>
            </Pressable>
          </Link>
          <Link href="/settings" asChild>
            <Pressable style={{ flex: 1, gap: 4 }} onPress={logOut}>
              <Form.Text>{t('signOut')}</Form.Text>
            </Pressable>
          </Link>
        </Form.Section>
        <Form.Section title={t('status')}>
          <Form.HStack style={{ alignItems: "stretch", gap: 12 }}>
            <TripleItemTest />
          </Form.HStack>
        </Form.Section>
      </Form.List>
    </View>
  );
}
