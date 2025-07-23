import { useAuthStore } from "@/utils/authStore";
import { Tabs } from "expo-router";
import Animated from "react-native-reanimated";
import { Image } from "expo-image";
import * as AC from "@bacons/apple-colors";
import { Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  const { isVip } = useAuthStore();
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
          title: "Accueil",
          headerTitle() {
            if (process.env.EXPO_OS === "web") {
              return (
                <Animated.View
                  style={[
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
      <Tabs.Protected guard={isVip}>
        <Tabs.Screen
          name="vip"
          options={{
            title: "VIP",
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? "diamond" : "diamond-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Tabs.Protected>
      <Tabs.Screen
        name="settings"
        options={{
          title: "Paramètres",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}