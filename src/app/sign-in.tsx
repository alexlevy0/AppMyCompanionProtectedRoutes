import { View, TextInput, Alert, TouchableOpacity, Animated, Dimensions } from "react-native";
import { AppText } from "@/components/AppText";
import { Link } from "expo-router";
import { Button } from "@/components/Button";
import { useAuthStore } from "@/utils/authStore";
import { useState, useEffect, useRef } from "react";
import { useI18n } from "@/utils/I18nContext";
import * as AC from "@bacons/apple-colors";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

export default function SignInScreen() {
  const { logIn, logInAsVip } = useAuthStore();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('error'), t('pleaseFillAllFields'));
      return;
    }

    setIsLoading(true);
    try {
      const result = await logIn(email, password);

      if (result.success) {
        Alert.alert(t('success'), t('connectionSuccessful'));
      } else {
        Alert.alert(t('error'), result.error || t('connectionFailed'));
      }
    } catch (error) {
      Alert.alert(t('error'), t('anErrorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  const getInputStyle = (fieldName: string) => ({
    borderWidth: 2,
    borderColor: focusedField === fieldName ? '#007AFF' : AC.separator,
    borderRadius: 16,
    padding: 16,
    paddingRight: fieldName === 'password' ? 50 : 16,
    backgroundColor: AC.secondarySystemGroupedBackground,
    color: AC.label,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: focusedField === fieldName ? 0.1 : 0.05,
    shadowRadius: 8,
    elevation: focusedField === fieldName ? 4 : 2,
    transform: [{ scale: focusedField === fieldName ? 1.02 : 1 }],
    transition: 'all 0.2s ease',
  });

  return (
    <View 
      className="justify-center flex-1 p-6"
      style={{ 
        backgroundColor: AC.systemGroupedBackground,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      {/* Background decorative elements */}
      <View 
        style={{
          position: 'absolute',
          top: 100,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: 'rgba(0, 122, 255, 0.1)',
        }} 
      />
      <View 
        style={{
          position: 'absolute',
          bottom: 150,
          left: -80,
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: 'rgba(118, 75, 162, 0.08)',
        }} 
      />

      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ],
        }}
      >
        {/* Header Section */}
        <View className="items-center mb-12">
          <View 
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#007AFF',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
              shadowColor: '#007AFF',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Ionicons name="lock-closed" size={32} color="white" />
          </View>
          <AppText center size="heading" className="mb-2" style={{ fontSize: 28, fontWeight: 'bold' }}>
            {t('connection')}
          </AppText>
          <AppText center style={{ color: AC.secondaryLabel, fontSize: 16 }}>
            Welcome back! Please sign in to continue
          </AppText>
        </View>

        {/* Form Container */}
        <View 
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 24,
            padding: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.1,
            shadowRadius: 24,
            elevation: 8,
            marginBottom: 24,
          }}
        >
          <View className="space-y-6">
            {/* Email Input */}
            <View>
              <AppText className="mb-3" style={{ fontSize: 16, fontWeight: '600', color: AC.label }}>
                <Ionicons name="mail" size={16} color={AC.secondaryLabel} /> {t('email')}
              </AppText>
              <Animated.View>
                <TextInput
                  style={getInputStyle('email')}
                  placeholder={`Enter your ${t('email').toLowerCase()}`}
                  placeholderTextColor={AC.tertiaryLabel}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </Animated.View>
            </View>

            {/* Password Input */}
            <View>
              <AppText className="mb-3" style={{ fontSize: 16, fontWeight: '600', color: AC.label }}>
                <Ionicons name="key" size={16} color={AC.secondaryLabel} /> {t('password')}
              </AppText>
              <View style={{ position: 'relative' }}>
                <Animated.View>
                  <TextInput
                    style={getInputStyle('password')}
                    placeholder={`Enter your ${t('password').toLowerCase()}`}
                    placeholderTextColor={AC.tertiaryLabel}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField('')}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </Animated.View>
                
                {/* Password Reveal Button */}
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: 16,
                    padding: 4,
                    borderRadius: 12,
                    backgroundColor: 'rgba(0, 122, 255, 0.1)',
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#007AFF" 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Enhanced Login Button */}
        <View style={{ marginBottom: 20 }}>
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            style={{
              backgroundColor: isLoading ? '#999' : '#007AFF',
              borderRadius: 16,
              padding: 18,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#007AFF',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 6,
              transform: [{ scale: isLoading ? 0.98 : 1 }],
            }}
            activeOpacity={0.8}
          >
            {isLoading && (
              <Animated.View style={{ marginRight: 12 }}>
                <Ionicons name="hourglass" size={20} color="white" />
              </Animated.View>
            )}
            <AppText style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
              {isLoading ? t('sending') : t('signIn')}
            </AppText>
            {!isLoading && (
              <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
            )}
          </TouchableOpacity>
        </View>

        {/* Secondary Actions */}
        <View className="space-y-3">
          <Link asChild href="/register-modal">
            <TouchableOpacity
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 16,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: AC.separator,
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="person-add" size={18} color="#007AFF" style={{ marginRight: 8 }} />
              <AppText style={{ color: '#007AFF', fontSize: 16, fontWeight: '600' }}>
                {t('signUp')}
              </AppText>
            </TouchableOpacity>
          </Link>

          {/* VIP Login Option */}
          <TouchableOpacity
            onPress={logInAsVip}
            style={{
              backgroundColor: 'rgba(255, 215, 0, 0.1)',
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: 'rgba(255, 215, 0, 0.3)',
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="diamond" size={18} color="#FFD700" style={{ marginRight: 8 }} />
            <AppText style={{ color: '#B8860B', fontSize: 16, fontWeight: '600' }}>
              Sign in as VIP 👑
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="items-center mt-8">
          <AppText style={{ color: AC.tertiaryLabel, fontSize: 14 }}>
            Secure • Encrypted • Protected
          </AppText>
        </View>
      </Animated.View>
    </View>
  );
}
