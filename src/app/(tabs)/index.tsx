import { View, Text, TouchableOpacity, Alert } from "react-native";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { useAuthStoreObserver } from "@/utils/authStoreLegend";
import * as Form from "@/components/ui/form";
import { Link } from "expo-router";
import { Rounded } from "@/components/ui/rounded";
import { Image } from "@/components/ui/img";
import { useI18n } from "@/utils/I18nContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { TranslationTest } from "@/components/TranslationTest";
import { DaysOfWeekTest } from "@/components/DaysOfWeekTest";
import { Stack } from "expo-router";
import { useAnimatedRef, useScrollViewOffset } from "react-native-reanimated";
import { useAnimatedStyle, interpolate } from "react-native-reanimated";
import Animated from "react-native-reanimated";
import * as AC from "@bacons/apple-colors";
import { Ionicons } from "@expo/vector-icons";

export default function IndexScreen() {
  const { t } = useI18n();
  const { user, removeSelectedContact } = useAuthStoreObserver();

  const handleRemoveContact = () => {
    Alert.alert(
      t('removeContact'),
      `${t('confirmRemoveContact')} ${user?.selectedContact?.name} ?`,
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('remove'),
          style: 'destructive',
          onPress: removeSelectedContact,
        },
      ]
    );
  };

  const ref = useAnimatedRef();
  const scroll = useScrollViewOffset(ref);
  const style = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scroll.value, [0, 30], [0, 1], "clamp"),
      transform: [
        { translateY: interpolate(scroll.value, [0, 30], [5, 0], "clamp") },
      ],
    };
  });

  return (
    <View style={{ flex: 1, backgroundColor: AC.systemBackground }}>
      <Stack.Screen
        options={{
          headerLargeTitle: false,
          headerTitle() {
            if (process.env.EXPO_OS === "web") {
              return (
                <Animated.View
                  style={[
                    style,
                    { flexDirection: "row", gap: 12, alignItems: "center" },
                  ]}
                >
                  <Image
                    source={{ uri: "https://github.com/alexlevy0/getmycompanion.com/blob/main/android-chrome-512x512.png?raw=true" }}
                    style={[
                      {
                        aspectRatio: 1,
                        height: 30,
                        borderRadius: 8,
                        borderWidth: 0.5,
                        borderColor: AC.separator,
                      },
                    ]}
                  />
                  <Text
                    style={{
                      fontSize: 20,
                      color: AC.label,
                      fontWeight: "bold",
                    }}
                  >
                    {t('appName')}
                  </Text>
                </Animated.View>
              );
            }
            return (
              <Animated.Image
                source={{ uri: "https://github.com/alexlevy0/getmycompanion.com/blob/main/android-chrome-512x512.png?raw=true" }}
                style={[
                  style,
                  {
                    aspectRatio: 1,
                    height: 30,
                    borderRadius: 8,
                    borderWidth: 0.5,
                    borderColor: AC.separator,
                  },
                ]}
              />
            );
          },
        }}
      />
      <Form.List ref={ref} navigationTitle="Home">
        <Form.Section>
          <Rounded padding style={{ alignItems: "center", gap: 8, flex: 1 }}>
            <Image
              source={{ uri: "https://github.com/alexlevy0/getmycompanion.com/blob/main/android-chrome-512x512.png?raw=true" }}
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
              {t('appDescription')}{" "}
              <Form.Link
                style={{
                  color: AC.link,
                  fontSize: 14,
                }}
                href="/info"
              >
                {t('learnMore')}
              </Form.Link>
            </Form.Text>
          </Rounded>
        </Form.Section>

        {/* Section Contact sélectionné */}
        <Form.Section title={t('selectedContact')}>
          {user?.selectedContact ? (
            <Rounded padding style={{ alignItems: "center", gap: 8 }}>
              <View style={{ position: "relative", width: "100%" }}>
                {/* Bouton de suppression */}
                <TouchableOpacity
                  onPress={handleRemoveContact}
                  style={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    zIndex: 1,
                    backgroundColor: AC.systemRed,
                    borderRadius: 12,
                    width: 24,
                    height: 24,
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}
                  accessibilityLabel={t('removeContact')}
                  accessibilityHint="Double-tap pour supprimer le contact sélectionné"
                >
                  <Ionicons name="close" size={16} color="#FFFFFF" />
                </TouchableOpacity>
                
                <View style={{ alignItems: "center", gap: 8 }}>
                  <Image
                    source="sf:person.circle.fill"
                    style={{
                      aspectRatio: 1,
                      height: 48,
                      borderRadius: 24,
                      tintColor: AC.systemBlue,
                    }}
                  />
                  <View style={{ alignItems: "center" }}>
                    <Form.Text
                      style={{
                        fontSize: 18,
                        fontWeight: "600",
                        color: AC.label,
                      }}
                    >
                      {user.selectedContact.name}
                    </Form.Text>
                    {user.selectedContact.selectedPhoneNumber && (
                      <Form.Text
                        style={{
                          fontSize: 16,
                          color: AC.systemBlue,
                          fontWeight: "500",
                        }}
                      >
                        {user.selectedContact.selectedPhoneNumber.number}
                      </Form.Text>
                    )}
                  </View>
                </View>
              </View>
            </Rounded>
          ) : (
            <Form.Link href="/modal">
              <View style={{ alignItems: "center", padding: 16 }}>
                <Image
                  source="sf:person.badge.plus"
                  style={{
                    aspectRatio: 1,
                    height: 32,
                    tintColor: AC.systemBlue,
                  }}
                />
                                  <Form.Text
                    style={{
                      fontSize: 16,
                      color: AC.systemBlue,
                      marginTop: 8,
                    }}
                  >
                    {t('selectContact')}
                  </Form.Text>
              </View>
            </Form.Link>
          )}
        </Form.Section>        
      </Form.List>
    </View>
  );
}


