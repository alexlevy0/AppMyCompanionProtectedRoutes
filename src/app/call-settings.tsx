import { View } from "react-native";
import * as Form from "@/components/ui/form";
import { Pressable } from "react-native";
import * as AC from "@bacons/apple-colors";
import { useState, useEffect, useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import { useAuthStoreObserver } from "@/utils/authStoreLegend";
import { TimeSlot, DaySchedule, CallSettings } from "@/types";
import { useI18n } from "@/utils/I18nContext";

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
  const { user, updateCallSettings } = useAuthStoreObserver();
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
  
  // Fonction pour obtenir les schedules par défaut
  const getDefaultSchedules = useMemo(() => (): Record<string, DaySchedule> =>
    DAYS_OF_WEEK.reduce(
      (acc, day) => ({
        ...acc,
        [day]: { name: day, enabled: false, timeSlot: "9:00-12:00" },
      }),
      {} as Record<string, DaySchedule>
    ), [DAYS_OF_WEEK]);
  
  // Initialize state from store or defaults
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);
  const [schedules, setSchedules] = useState<Record<string, DaySchedule>>(() => {
    // Initialiser avec des schedules par défaut dès le début
    return DAYS_OF_WEEK.length > 0 ? getDefaultSchedules() : {};
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialiser les schedules avec les valeurs par défaut dès que DAYS_OF_WEEK est disponible
  useEffect(() => {
    if (DAYS_OF_WEEK.length > 0 && Object.keys(schedules).length === 0) {
      setSchedules(getDefaultSchedules());
    }
  }, [DAYS_OF_WEEK, getDefaultSchedules]);

  // Load settings from store on mount (only once)
  useEffect(() => {
    if (!isInitialized) {
      if (user?.callSettings) {
        setTimezone(user.callSettings.timezone);
        setSchedules(user.callSettings.schedules);
      } else {
        // Initialize with default schedules if no settings exist
        setSchedules(getDefaultSchedules());
      }
      setIsInitialized(true);
    }
  }, [user?.callSettings, isInitialized, getDefaultSchedules]);

  // Save settings to store whenever they change (only after initialization)
  useEffect(() => {
    if (isInitialized && Object.keys(schedules).length > 0) {
      const callSettings: CallSettings = {
        timezone,
        schedules,
      };
      updateCallSettings(callSettings);
    }
  }, [timezone, schedules, updateCallSettings, isInitialized]);

  // Update schedules when days of week change (language change)
  useEffect(() => {
    if (isInitialized && DAYS_OF_WEEK.length > 0) {
      const currentDayKeys = Object.keys(schedules);
      const newSchedules: Record<string, DaySchedule> = {};
      
      // Vérifier si les clés ont changé (changement de langue)
      const hasChanged = DAYS_OF_WEEK.some((day, index) => {
        const oldDayKey = currentDayKeys[index];
        return oldDayKey !== day;
      });
      
      if (hasChanged) {
        // Migrer les schedules existants vers les nouveaux noms de jours
        DAYS_OF_WEEK.forEach((day, index) => {
          const oldDayKey = currentDayKeys[index];
          if (oldDayKey && schedules[oldDayKey]) {
            // Préserver les paramètres existants
            newSchedules[day] = {
              ...schedules[oldDayKey],
              name: day // Mettre à jour le nom avec la nouvelle langue
            };
          } else {
            // Créer un nouveau schedule par défaut
            newSchedules[day] = { name: day, enabled: false, timeSlot: "9:00-12:00" };
          }
        });
        
        setSchedules(newSchedules);
      }
    }
  }, [DAYS_OF_WEEK, isInitialized]);

  // Handlers
  const handleToggleDay = (day: string, enabled: boolean) => {
    setSchedules((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled,
      },
    }));
  };

  const handleTimeSelect = (day: string, timeSlot: TimeSlot) => {
    setSchedules((prev) => ({
      ...prev,
      [day]: { ...prev[day], timeSlot },
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
        {DAYS_OF_WEEK.map((day) => (
          <DayScheduleItem
            key={day}
            day={day}
            schedule={schedules[day]}
            onToggle={(enabled) => handleToggleDay(day, enabled)}
            onTimeSelect={(time) => handleTimeSelect(day, time)}
          />
          ))}
        </Form.Section>
      </Form.List>
    </View>
  );
}
