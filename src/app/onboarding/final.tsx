import { View } from "react-native";
import { AppText } from "@/components/AppText";
import { Button } from "@/components/Button";
import { useAuthStoreObserver, authState$ } from "@/utils/authStoreLegend";
import { router } from "expo-router";
import { observer } from '@legendapp/state/react';

export default observer(function OnboardingFinalScreen() {
  const { completeOnboarding } = useAuthStoreObserver();
  
  // Utiliser directement l'observable pour le test
  const hasCompletedOnboarding = authState$.hasCompletedOnboarding.get();

  const handleCompleteOnboarding = () => {
    console.log('Completing onboarding...');
    completeOnboarding();
    console.log('Onboarding completed, hasCompletedOnboarding:', hasCompletedOnboarding);
    
    // Forcer la redirection vers la page de login
    setTimeout(() => {
      console.log('Redirecting to sign-in...');
      router.replace('/sign-in');
    }, 100);
  };

  return (
    <View className="justify-center flex-1 p-4">
      <AppText center size="heading">
        Onboarding Screen 2
      </AppText>
      <AppText center size="medium" color="secondary">
        hasCompletedOnboarding: {hasCompletedOnboarding ? 'true' : 'false'}
      </AppText>
      <Button title="Complete onboarding" onPress={handleCompleteOnboarding} />
    </View>
  );
});
