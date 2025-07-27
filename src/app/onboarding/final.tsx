import { View, Dimensions, Pressable } from "react-native";
import { AppText } from "@/components/AppText";
import { useAuthStoreObserver } from "@/utils/authStoreLegend";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  useSharedValue,
  FadeInUp,
  FadeInDown,
  ZoomIn,
  BounceIn,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { router } from "expo-router";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function OnboardingFinalScreen() {
  const { completeOnboarding, hasCompletedOnboarding } = useAuthStoreObserver();
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0);

  // Rediriger vers la connexion une fois l'onboarding complété
  useEffect(() => {
    if (hasCompletedOnboarding) {
      console.log('✅ Onboarding completed, redirecting to sign-in...');
      router.replace('/sign-in');
    }
  }, [hasCompletedOnboarding]);

  const handleCompleteOnboarding = () => {
    console.log('🎯 Completing onboarding...');
    completeOnboarding();
  };

  useEffect(() => {
    // Démarrer les animations
    scale.value = withSpring(1, {
      damping: 12,
      stiffness: 100,
    });
    rotation.value = withSequence(
      withTiming(360, { duration: 1000 }),
      withTiming(0, { duration: 0 })
    );
    opacity.value = withDelay(300, withTiming(1, { duration: 800 }));
  }, []);

  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  const gradientStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const features = [
    {
      icon: "notifications-outline",
      title: "Notifications",
      description: "Restez informé en temps réel",
    },
    {
      icon: "analytics-outline",
      title: "Analytiques",
      description: "Suivez votre progression",
    },
    {
      icon: "settings-outline",
      title: "Personnalisation",
      description: "Adaptez l'app à vos besoins",
    },
  ];

  return (
    <AnimatedLinearGradient
      colors={["#1a1a2e", "#16213e", "#0f3460"]}
      style={[{ flex: 1 }, gradientStyle]}
    >
      <View className="flex-1 justify-center px-8">
        {/* Logo animé */}
        <Animated.View
          style={[iconStyle]}
          className="items-center mb-12"
        >
          <View className="w-32 h-32 bg-white/10 rounded-full items-center justify-center">
            <Ionicons name="rocket-outline" size={64} color="#e94560" />
          </View>
        </Animated.View>

        {/* Titre principal */}
        <Animated.View entering={FadeInUp.delay(400).duration(600)}>
          <AppText
            size="heading"
            className="text-white text-center mb-4 text-4xl font-bold"
          >
            Prêt à démarrer !
          </AppText>
        </Animated.View>

        {/* Sous-titre */}
        <Animated.View entering={FadeInUp.delay(600).duration(600)}>
          <AppText className="text-white/80 text-center mb-12 text-lg">
            Votre voyage commence maintenant
          </AppText>
        </Animated.View>

        {/* Liste des fonctionnalités */}
        <View className="mb-12">
          {features.map((feature, index) => (
            <Animated.View
              key={feature.icon}
              entering={FadeInUp.delay(800 + index * 100).duration(600)}
              className="flex-row items-center mb-6"
            >
              <View className="w-12 h-12 bg-white/10 rounded-full items-center justify-center mr-4">
                <Ionicons
                  name={feature.icon as any}
                  size={24}
                  color="#e94560"
                />
              </View>
              <View className="flex-1">
                <AppText className="text-white font-semibold mb-1">
                  {feature.title}
                </AppText>
                <AppText className="text-white/60 text-sm">
                  {feature.description}
                </AppText>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Bouton d'action */}
        <Animated.View
          entering={BounceIn.delay(1200).springify()}
          className="mb-8"
        >
          <Pressable
            onPress={handleCompleteOnboarding}
            className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-full overflow-hidden"
          >
            <LinearGradient
              colors={["#e94560", "#8e44ad"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="px-8 py-4 rounded-full"
            >
              <AppText className="text-white text-center font-bold text-lg">
                Commencer l'aventure
              </AppText>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Particules animées en arrière-plan */}
        {[...Array(6)].map((_, i) => (
          <Animated.View
            key={i}
            entering={ZoomIn.delay(i * 200).springify()}
            style={{
              position: "absolute",
              width: 10 + i * 5,
              height: 10 + i * 5,
              borderRadius: 50,
              backgroundColor: `rgba(233, 69, 96, ${0.1 + i * 0.05})`,
              top: Math.random() * SCREEN_HEIGHT,
              left: Math.random() * SCREEN_WIDTH,
            }}
          />
        ))}
      </View>
    </AnimatedLinearGradient>
  );
}
