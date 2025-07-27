import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: {
          backgroundColor: "transparent",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="final"
        options={{
          animation: "fade_from_bottom",
          animationDuration: 600,
        }}
      />
    </Stack>
  );
}
