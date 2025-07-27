import { View } from "react-native";
import * as Form from "@/components/ui/form";
import { Pressable } from "react-native";
import * as AC from "@bacons/apple-colors";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Switch } from "@/components/ui/switch";
import { useAuthStoreObserver } from "@/utils/authStoreLegend";
import { TimeSlot, DaySchedule, CallSettings } from "@/types";
import { useI18n } from "@/utils/I18nContext";
import { AppText } from "@/components/AppText";

// Constants
const TIME_SLOTS = [
  { value: "9:00-12:00", label: "9:00 - 12:00" },
  { value: "12:00-15:00", label: "12:00 - 15:00" },
  { value: "15:00-18:00", label: "15:00 - 18:00" },
] as const;

// Les jours de la semaine seront définis dans le composant pour se mettre à jour avec la langue

// Default timezone
const DEFAULT_TIMEZONE = "Paris, France";

// Default schedules - sera défini dans le composant

// Components
const RadioButton = ({
  selected,
  onPress,
  label,
}: {
  selected: boolean;
  onPress: () => void;
  label: string;
}) => (
  <Pressable
    onPress={onPress}
    style={{
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 4,
      paddingVertical: 8,
      paddingHorizontal: 12,
    }}
  >
    <View
      style={{
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: selected ? AC.systemGreen : AC.systemGray3,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
      }}
    >
      {selected && (
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: AC.systemGreen,
          }}
        />
      )}
    </View>
    <Form.Text>{label}</Form.Text>
  </Pressable>
);

const DayScheduleItem = ({
  day,
  schedule,
  onToggle,
  onTimeSelect,
}: {
  day: string;
  schedule: DaySchedule | undefined;
  onToggle: (enabled: boolean) => void;
  onTimeSelect: (time: TimeSlot) => void;
}) => {
  // Si le schedule n'existe pas, on utilise des valeurs par défaut
  const defaultSchedule: DaySchedule = { name: day, enabled: false, timeSlot: "9:00-12:00" };
  const currentSchedule = schedule || defaultSchedule;
  
  return (
    <>
      <Form.HStack>
        <Form.Text>{day}</Form.Text>
        <View style={{ flex: 1 }} />
        <Switch onValueChange={onToggle} value={currentSchedule.enabled} />
      </Form.HStack>
      {currentSchedule.enabled && (
        <View style={{ marginLeft: 20, marginTop: 8 }}>
          {TIME_SLOTS.map((slot) => (
            <RadioButton
              key={slot.value}
              selected={currentSchedule.timeSlot === slot.value}
              onPress={() => onTimeSelect(slot.value as TimeSlot)}
              label={slot.label}
            />
          ))}
        </View>
      )}
    </>
  );
};

export default function CallSettingsScreen() {
  const { user, updateCallSettings, isLoadingUser } = useAuthStoreObserver();
  const { t } = useI18n();
  
  // Définir les jours de la semaine avec les traductions
  const DAYS_OF_WEEK = useMemo(() => [
    t('monday'),
    t('tuesday'),
    t('wednesday'),
    t('thursday'),
    t('friday'),
    t('saturday'),
    t('sunday'),
  ], [t]);
  
  // Fonction pour obtenir les schedules par défaut - stabilisée avec useCallback
  const getDefaultSchedules = useCallback((): Record<string, DaySchedule> => {
    // Utiliser des clés numériques pour éviter les problèmes de traduction
    const numericSchedules: Record<string, DaySchedule> = {};
    DAYS_OF_WEEK.forEach((day, index) => {
      numericSchedules[index.toString()] = { 
        name: day, 
        enabled: false, 
        timeSlot: "9:00-12:00" 
      };
    });
    return numericSchedules;
  }, [DAYS_OF_WEEK]);

  // Fonction pour convertir les schedules avec noms en schedules numériques
  const convertToNumericSchedules = useCallback((namedSchedules: Record<string, DaySchedule>): Record<string, DaySchedule> => {
    const numericSchedules: Record<string, DaySchedule> = {};
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    dayOrder.forEach((dayName, index) => {
      // Trouver le schedule correspondant dans les anciennes données
      const oldKey = Object.keys(namedSchedules).find(key => 
        key.toLowerCase().includes(dayName.toLowerCase()) || dayName.toLowerCase().includes(key.toLowerCase())
      );
      
      if (oldKey && namedSchedules[oldKey]) {
        numericSchedules[index.toString()] = {
          ...namedSchedules[oldKey],
          name: DAYS_OF_WEEK[index] // Utiliser le nom traduit actuel
        };
      } else {
        numericSchedules[index.toString()] = {
          name: DAYS_OF_WEEK[index],
          enabled: false,
          timeSlot: "9:00-12:00"
        };
      }
    });
    
    return numericSchedules;
  }, [DAYS_OF_WEEK]);

  // Initialize state from store or defaults
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);
  const [schedules, setSchedules] = useState<Record<string, DaySchedule>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasLoadedFromUser, setHasLoadedFromUser] = useState(false);

  // Fonction pour obtenir le schedule d'un jour par son index
  const getScheduleByIndex = useCallback((index: number): DaySchedule | undefined => {
    return schedules[index.toString()];
  }, [schedules]);

  // Load settings from store on mount and when user changes
  useEffect(() => {
    console.log('🔄 Call settings effect triggered:', {
      isLoadingUser,
      hasUser: !!user,
      hasCallSettings: !!user?.callSettings,
      daysOfWeekLength: DAYS_OF_WEEK.length,
      isInitialized,
      hasLoadedFromUser
    });
    
    // Attendre que l'utilisateur soit chargé et que les jours soient disponibles
    if (!isLoadingUser && user && DAYS_OF_WEEK.length > 0 && !hasLoadedFromUser) {
      if (user.callSettings) {
        console.log('🔄 Loading call settings from user:', user.callSettings);
        setTimezone(user.callSettings.timezone || DEFAULT_TIMEZONE);
        
        // Vérifier si les schedules sont déjà au format numérique
        const existingSchedules = user.callSettings.schedules;
        const hasNumericKeys = Object.keys(existingSchedules).every(key => !isNaN(parseInt(key)));
        
        if (hasNumericKeys) {
          // Les schedules sont déjà au format numérique, les utiliser directement
          console.log('🔄 Schedules already in numeric format, using directly');
          setSchedules(existingSchedules);
        } else {
          // Convertir les anciens schedules nommés en schedules numériques
          console.log('🔄 Converting named schedules to numeric format');
          const numericSchedules = convertToNumericSchedules(existingSchedules);
          console.log('🔄 Converted to numeric schedules:', numericSchedules);
          setSchedules(numericSchedules);
        }
      } else {
        // Si l'utilisateur est chargé mais n'a pas de call settings, initialiser avec les défauts
        console.log('🔄 No call settings found, initializing with defaults');
        setSchedules(getDefaultSchedules());
      }
      setIsInitialized(true);
      setHasLoadedFromUser(true);
    }
  }, [user, isLoadingUser, DAYS_OF_WEEK, getDefaultSchedules, convertToNumericSchedules, hasLoadedFromUser]);

  // Save settings to store whenever they change (only after initialization)
  useEffect(() => {
    if (isInitialized && Object.keys(schedules).length > 0 && user && hasLoadedFromUser) {
      const callSettings: CallSettings = {
        timezone,
        schedules,
      };
      console.log('💾 Saving call settings:', callSettings);
      updateCallSettings(callSettings);
    }
  }, [timezone, schedules, updateCallSettings, isInitialized, user, hasLoadedFromUser]);

  // Update schedules when days of week change (language change) - now using numeric keys
  useEffect(() => {
    if (isInitialized && DAYS_OF_WEEK.length > 0 && hasLoadedFromUser) {
      // Mettre à jour les noms des jours dans les schedules existants
      const updatedSchedules: Record<string, DaySchedule> = {};
      Object.keys(schedules).forEach(key => {
        const index = parseInt(key);
        if (!isNaN(index) && DAYS_OF_WEEK[index]) {
          updatedSchedules[key] = {
            ...schedules[key],
            name: DAYS_OF_WEEK[index] // Mettre à jour le nom traduit
          };
        }
      });
      
      if (JSON.stringify(updatedSchedules) !== JSON.stringify(schedules)) {
        console.log('🔄 Updating day names in schedules:', updatedSchedules);
        setSchedules(updatedSchedules);
      }
    }
  }, [DAYS_OF_WEEK, isInitialized, hasLoadedFromUser, schedules]);

  // Show loading state while user is being loaded
  if (isLoadingUser) {
    return (
      <View className="flex-1 p-4 justify-center items-center" style={{ backgroundColor: AC.systemGroupedBackground }}>
        <AppText>Chargement des paramètres...</AppText>
      </View>
    );
  }

  // Handlers
  const handleToggleDay = (dayIndex: number, enabled: boolean) => {
    setSchedules((prev) => ({
      ...prev,
      [dayIndex.toString()]: {
        ...prev[dayIndex.toString()],
        enabled,
      },
    }));
  };

  const handleTimeSelect = (dayIndex: number, timeSlot: TimeSlot) => {
    setSchedules((prev) => ({
      ...prev,
      [dayIndex.toString()]: { ...prev[dayIndex.toString()], timeSlot },
    }));
  };

  return (
    <View
      className="flex-1 p-4"
      style={{ backgroundColor: AC.systemGroupedBackground }}
    >
      <Form.List navigationTitle="Home">
      <Form.Section title={t('yourSelfTimezone')}>
        <Form.Link href="/timezones-settings" hint={timezone}>
          {t('timezone')}
        </Form.Link>
      </Form.Section>
      <Form.Section title={t('daysOfWeek')}>
        {DAYS_OF_WEEK.map((day, index) => (
          <DayScheduleItem
            key={day}
            day={day}
            schedule={schedules[index.toString()]}
            onToggle={(enabled) => handleToggleDay(index, enabled)}
            onTimeSelect={(time) => handleTimeSelect(index, time)}
          />
          ))}
        </Form.Section>
      </Form.List>
    </View>
  );
}
