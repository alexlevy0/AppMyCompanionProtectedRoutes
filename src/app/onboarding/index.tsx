import { View, Dimensions, Pressable } from "react-native";
import { AppText } from "@/components/AppText";
import { useRouter } from "expo-router";
import { Button } from "@/components/Button";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
  FadeInDown,
  FadeInUp,
  SlideInRight,
} from "react-native-reanimated";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: string[];
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    title: "Bienvenue",
    description: "Découvrez une nouvelle façon de gérer vos conversations",
    icon: "chatbubbles-outline",
    colors: ["#667eea", "#764ba2"],
  },
  {
    id: 2,
    title: "Restez Connecté",
    description: "Communiquez facilement avec vos contacts importants",
    icon: "people-outline",
    colors: ["#f093fb", "#f5576c"],
  },
  {
    id: 3,
    title: "Sécurisé",
    description: "Vos données sont protégées et cryptées",
    icon: "shield-checkmark-outline",
    colors: ["#4facfe", "#00f2fe"],
  },
];

export default function OnboardingFirstScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useSharedValue(0);
  const activeIndicator = useSharedValue(0);

  useEffect(() => {
    // Auto-play carousel
    const timer = setInterval(() => {
      if (currentIndex < slides.length - 1) {
        handleNext();
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const newIndex = currentIndex + 1;
      translateX.value = withSpring(-SCREEN_WIDTH * newIndex, {
        damping: 15,
        stiffness: 90,
      });
      activeIndicator.value = withTiming(newIndex);
      setCurrentIndex(newIndex);
    } else {
      router.push("/onboarding/final");
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      translateX.value = withSpring(-SCREEN_WIDTH * newIndex, {
        damping: 15,
        stiffness: 90,
      });
      activeIndicator.value = withTiming(newIndex);
      setCurrentIndex(newIndex);
    }
  };

  const handleSkip = () => {
    router.push("/onboarding/final");
  };

  const carouselStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View className="flex-1 bg-black">
      {/* Skip button */}
      <Animated.View
        entering={FadeInDown.delay(500)}
        className="absolute top-12 right-6 z-10"
      >
        <Pressable
          onPress={handleSkip}
          className="px-4 py-2 rounded-full bg-white/20"
        >
          <AppText className="text-white">Passer</AppText>
        </Pressable>
      </Animated.View>

      {/* Carousel */}
      <Animated.View
        style={[
          {
            flexDirection: "row",
            width: SCREEN_WIDTH * slides.length,
          },
          carouselStyle,
        ]}
        className="flex-1"
      >
        {slides.map((slide, index) => (
          <View key={slide.id} style={{ width: SCREEN_WIDTH }}>
            <LinearGradient
              colors={slide.colors}
              style={{ flex: 1 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View className="flex-1 justify-center items-center px-8">
                <Animated.View
                  entering={SlideInRight.delay(index * 100)}
                  className="mb-8"
                >
                  <View className="w-32 h-32 bg-white/20 rounded-full items-center justify-center mb-6">
                    <Ionicons
                      name={slide.icon}
                      size={64}
                      color="white"
                    />
                  </View>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(200)}>
                  <AppText
                    size="heading"
                    className="text-white text-center mb-4 text-4xl font-bold"
                  >
                    {slide.title}
                  </AppText>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(400)}>
                  <AppText
                    className="text-white/90 text-center text-lg leading-6"
                  >
                    {slide.description}
                  </AppText>
                </Animated.View>
              </View>
            </LinearGradient>
          </View>
        ))}
      </Animated.View>

      {/* Bottom controls */}
      <View className="absolute bottom-0 left-0 right-0 pb-12">
        {/* Indicators */}
        <View className="flex-row justify-center mb-8">
          {slides.map((_, index) => {
            const indicatorStyle = useAnimatedStyle(() => {
              const isActive = activeIndicator.value === index;
              return {
                width: withSpring(isActive ? 24 : 8),
                opacity: withSpring(isActive ? 1 : 0.5),
              };
            });

            return (
              <Animated.View
                key={index}
                style={[
                  {
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "white",
                    marginHorizontal: 4,
                  },
                  indicatorStyle,
                ]}
              />
            );
          })}
        </View>

        {/* Navigation buttons */}
        <View className="flex-row justify-between px-8">
          <Pressable
            onPress={handlePrevious}
            className={`px-6 py-3 rounded-full ${
              currentIndex === 0 ? "opacity-0" : "bg-white/20"
            }`}
            disabled={currentIndex === 0}
          >
            <AppText className="text-white">Précédent</AppText>
          </Pressable>

          <Pressable
            onPress={handleNext}
            className="px-8 py-3 rounded-full bg-white"
          >
            <AppText className="text-black font-semibold">
              {currentIndex === slides.length - 1 ? "Commencer" : "Suivant"}
            </AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
