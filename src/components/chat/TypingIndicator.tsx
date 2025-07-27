import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { AppText } from '@/components/AppText';
import * as AC from '@bacons/apple-colors';

interface TypingIndicatorProps {
  userName?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ userName = "L'assistant" }) => {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Dots animation
    const animateDot = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animations = Animated.parallel([
      animateDot(dot1Anim, 0),
      animateDot(dot2Anim, 150),
      animateDot(dot3Anim, 300),
    ]);

    animations.start();

    return () => {
      animations.stop();
    };
  }, []);

  const getDotStyle = (anim: Animated.Value) => ({
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -8],
        }),
      },
    ],
    opacity: anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.3, 1, 0.3],
    }),
  });

  return (
    <Animated.View 
      className="items-start mb-3"
      style={{ opacity: fadeAnim }}
    >
      <View
        className="px-4 py-3 rounded-2xl rounded-bl-md flex-row items-center"
        style={{
          backgroundColor: AC.secondarySystemGroupedBackground,
          borderColor: AC.separator,
          borderWidth: 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        <View className="flex-row items-center mr-2">
          <Animated.View
            className="w-2 h-2 rounded-full mx-0.5"
            style={[
              { backgroundColor: AC.systemBlue },
              getDotStyle(dot1Anim),
            ]}
          />
          <Animated.View
            className="w-2 h-2 rounded-full mx-0.5"
            style={[
              { backgroundColor: AC.systemBlue },
              getDotStyle(dot2Anim),
            ]}
          />
          <Animated.View
            className="w-2 h-2 rounded-full mx-0.5"
            style={[
              { backgroundColor: AC.systemBlue },
              getDotStyle(dot3Anim),
            ]}
          />
        </View>
        <AppText className="text-xs ml-1" color="secondary">
          {userName} est en train d'écrire
        </AppText>
      </View>
    </Animated.View>
  );
};