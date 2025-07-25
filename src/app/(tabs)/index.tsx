import { AppText } from "@/components/AppText";
import { Link } from "expo-router";
import { Button } from "@/components/Button";
import * as Form from "@/components/ui/form";
import React, { useEffect } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";

import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from "react-native-reanimated";
import Stack from "@/components/layout/stack";
import { Image } from "@/components/ui/img";
import { Rounded } from "@/components/ui/rounded";
import * as AC from "@bacons/apple-colors";
import {
  Segments,
  SegmentsContent,
  SegmentsList,
  SegmentsTrigger,
} from "@/components/ui/segments";
import {
  Appearance,
  OpaqueColorValue,
  Switch,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useI18n } from "@/utils/I18nContext";
import { useAuthStore } from "@/utils/authStore";

export default function IndexScreen() {
  const { t } = useI18n();
  const { user, removeSelectedContact } = useAuthStore();

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
        <Form.Section
          title=""
          footer=""
        >
          <SegmentsTest />
        </Form.Section>
        {process.env.EXPO_OS === "ios" && (
          <Form.Section title="Date">
            <Form.DatePicker value={new Date()} accentColor={AC.label}>
              Birthday
            </Form.DatePicker>
            <Form.DatePicker value={new Date()} mode="time">
              Birthday Minute
            </Form.DatePicker>

            <Form.Text
              hint={
                <DateTimePicker
                  mode="datetime"
                  accentColor={AC.systemTeal}
                  value={new Date()}
                />
              }
            >
              Manual
            </Form.Text>
          </Form.Section>
        )}
        <Form.Section >
          <Form.HStack style={{ alignItems: "stretch", gap: 12 }}>
            <TripleItemTest />
          </Form.HStack>
        </Form.Section>
        <Form.Section>
          <Form.HStack style={{ gap: 16 }}>
            <Image
              source={{ uri: "https://github.com/alexlevy0/getmycompanion.com/blob/main/android-chrome-512x512.png?raw=true" }}
              style={{
                aspectRatio: 1,
                height: 48,
                borderRadius: 999,
              }}
            />
            <View style={{ gap: 4 }}>
              <Form.Text style={Form.FormFont.default}>Alex's iPhone</Form.Text>
              <Form.Text style={Form.FormFont.caption}>
                This iPhone 16 Pro Max
              </Form.Text>
            </View>
            <View style={{ flex: 1 }} />
            <Image
              source={{ uri: "https://github.com/alexlevy0/getmycompanion.com/blob/main/android-chrome-512x512.png?raw=true" }}
              // source="sf:person.fill.badge.plus"
              style={{
                aspectRatio: 1,
                height: 48,
                borderRadius: 999,
              }}
              animationSpec={{
                effect: {
                  type: "pulse",
                },
                repeating: true,
              }}
            />
            <Image
              // source="sf:person.fill.badge.plus"
              source={{ uri: "https://github.com/alexlevy0/getmycompanion.com/blob/main/android-chrome-512x512.png?raw=true" }}
              tintColor={AC.systemBlue}
              size={24}
              animationSpec={{
                effect: {
                  type: "pulse",
                },
                repeating: true,
              }}
            />
          </Form.HStack>
        </Form.Section>
        <Form.Section
          title={t('links')}
          footer={
            <Text>
              Help improve Search by allowing Apple to store the searches you
              enter into Safari, Siri, and Spotlight in a way that is not linked
              to you.{"\n\n"}Searches include lookups of general knowledge, and
              requests to do things like play music and get directions.{"\n"}
              <Link style={{ color: AC.link }} href="/modal">
                {t('aboutSearchPrivacy')}
              </Link>
            </Text>
          }
        >
          <Form.Link target="_blank" href="https://getmycompanion.com">
            <Form.Text>Website</Form.Text>
          </Form.Link>
          <Form.Link href="/modal">
            <View style={{ gap: 4 }}>
              <Form.Text>Alex's iPhone</Form.Text>
              <Text style={Form.FormFont.caption}>This iPhone 16 Pro Max</Text>
            </View>
          </Form.Link>
          <Link href="/modal">
            <View style={{ gap: 4 }}>
              <Form.Text>Alex's iPhone</Form.Text>
              <Text style={Form.FormFont.caption}>This iPhone 16 Pro Max</Text>
            </View>
          </Link>
        </Form.Section>
      </Form.List>
    </View>
  );
  // return (
  //   <View className="justify-center flex-1 p-4">
  //     <AppText center size="heading">
  //       Home Screen
  //     </AppText>
  //     <Link asChild push href="/modal">
  //       <Button title="Open modal" />
  //     </Link>
  //   </View>
  // );
}
function SegmentsTest() {
  const { t } = useI18n();

  return (
    <View style={{ flex: 1 }}>
      <Segments defaultValue="account">
        <SegmentsList>
          <SegmentsTrigger value="connexion">{t('connection')}</SegmentsTrigger>
          <SegmentsTrigger value="inscription">{t('registration')}</SegmentsTrigger>
        </SegmentsList>

        <SegmentsContent value="connexion">
          <Form.Section title="">
            <TextInput placeholder={t('email')} />
            <Form.TextField placeholder={t('password')} />
          </Form.Section>
        </SegmentsContent>
        <SegmentsContent value="inscription">
          <Form.Section title="">
            <TextInput placeholder={t('email')} />
            <Form.TextField placeholder={t('password')} />
            <Form.TextField placeholder={t('confirmPassword')} />
          </Form.Section>
        </SegmentsContent>
      </Segments>
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
