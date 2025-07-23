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
  View
} from "react-native";

export default function IndexScreen() {
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

  const [show, setShow] = React.useState(false);

  return (
    <View style={{ flex: 1 }}>
      {/* {show && <GlurryList setShow={setShow} />} */}
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
                    MyCompanion
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
      <Form.List ref={ref} navigationTitle="Components">
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
              MyCompanion
            </Form.Text>
            <Form.Text style={{ textAlign: "center", fontSize: 14 }}>
              MyCompanion calls your Senior daily and keeps you informed.{" "}
              <Form.Link
                style={{
                  color: AC.link,
                  fontSize: 14,
                }}
                href="/info"
              >
                Learn more...
              </Form.Link>
            </Form.Text>
          </Rounded>
        </Form.Section>

        {/* <FontSection /> */}
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


        <Form.Section>
          <Form.HStack style={{ alignItems: "stretch", gap: 12 }}>
            <TripleItemTest />
          </Form.HStack>
        </Form.Section>

        {/* <Switches /> */}

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
              <Form.Text style={Form.FormFont.default}>Evan's iPhone</Form.Text>
              <Form.Text style={Form.FormFont.caption}>
                This iPhone 16 Pro Max
              </Form.Text>
            </View>

            <View style={{ flex: 1 }} />

            <Image
              source="sf:person.fill.badge.plus"
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

        {/* <HTMLPictureExample /> */}

        <Form.Section
          title="Links"
          footer={
            <Text>
              Help improve Search by allowing Apple to store the searches you
              enter into Safari, Siri, and Spotlight in a way that is not linked
              to you.{"\n\n"}Searches include lookups of general knowledge, and
              requests to do things like play music and get directions.{"\n"}
              <Link style={{ color: AC.link }} href="/two">
                About Search & Privacy...
              </Link>
            </Text>
          }
        >
          {/* <Link href="/two">Next</Link> */}

          <Form.Link target="_blank" href="https://evanbacon.dev">
            Target _blank
          </Form.Link>

          <Link href="/two">
            <View style={{ gap: 4 }}>
              <Form.Text>Evan's iPhone</Form.Text>
              <Text style={Form.FormFont.caption}>This iPhone 16 Pro Max</Text>
            </View>
          </Link>

          {/* <Link href="https://expo.dev">Expo</Link> */}

          {/* <Form.Link href="/two" hint="Normal">
            Hint + Link
          </Form.Link> */}
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


  return (
    <View style={{ flex: 1 }}>
      <Segments defaultValue="account">
        <SegmentsList>
          <SegmentsTrigger value="connexion">Connexion</SegmentsTrigger>
          <SegmentsTrigger value="inscription">Inscription</SegmentsTrigger>
        </SegmentsList>

        <SegmentsContent value="connexion">
          <Form.Section title="">
            <TextInput placeholder="Email" />
            <Form.TextField placeholder="Mot de passe" />
          </Form.Section>
        </SegmentsContent>
        <SegmentsContent value="inscription">
          <Form.Section title="">
            <TextInput placeholder="Email" />
            <Form.TextField placeholder="Mot de passe" />
            <Form.TextField placeholder="Mot de passe" />
          </Form.Section>
        </SegmentsContent>
      </Segments>
    </View>
  );
}

function TripleItemTest() {
  return (
    <>
      <HorizontalItem title="Expires" badge="88" subtitle="Days" />

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
        title="Developer"
        badge={
          <Image
            name="sf:person.text.rectangle"
            size={28}
            weight="bold"
            animationSpec={{
              effect: {
                type: "pulse",
              },
              repeating: true,
            }}
            tintColor={AC.secondaryLabel}
          />
        }
        subtitle="Evan Bacon"
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

      <HorizontalItem title="Version" badge="3.6" subtitle="Build 250" />
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
