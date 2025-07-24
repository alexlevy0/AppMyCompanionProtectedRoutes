import { View } from "react-native";
import * as Form from "@/components/ui/form";
import { Pressable } from "react-native";
import * as AC from "@bacons/apple-colors";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/utils/authStore";
import { TimeSlot, DaySchedule, CallSettings } from "@/types";

// Constants
const TIME_SLOTS = [
  { value: "9:00-12:00", label: "9:00 - 12:00" },
  { value: "12:00-15:00", label: "12:00 - 15:00" },
  { value: "15:00-18:00", label: "15:00 - 18:00" },
] as const;

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

// Default timezone
const DEFAULT_TIMEZONE = "Paris, France";

// Default schedules
const getDefaultSchedules = (): Record<string, DaySchedule> =>
  DAYS_OF_WEEK.reduce(
    (acc, day) => ({
      ...acc,
      [day]: { name: day, enabled: false, timeSlot: "9:00-12:00" },
    }),
    {} as Record<string, DaySchedule>
  );

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
  schedule: DaySchedule;
  onToggle: (enabled: boolean) => void;
  onTimeSelect: (time: TimeSlot) => void;
}) => (
  <>
    <Form.HStack>
      <Form.Text>{day}</Form.Text>
      <View style={{ flex: 1 }} />
      <Switch onValueChange={onToggle} value={schedule.enabled} />
    </Form.HStack>
    {schedule.enabled && (
      <View style={{ marginLeft: 20, marginTop: 8 }}>
        {TIME_SLOTS.map((slot) => (
          <RadioButton
            key={slot.value}
            selected={schedule.timeSlot === slot.value}
            onPress={() => onTimeSelect(slot.value as TimeSlot)}
            label={slot.label}
          />
        ))}
      </View>
    )}
  </>
);

export default function CallSettingsScreen() {
  const { user, updateCallSettings } = useAuthStore();
  
  // Initialize state from store or defaults
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);
  const [schedules, setSchedules] = useState<Record<string, DaySchedule>>(
    getDefaultSchedules()
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Load settings from store on mount (only once)
  useEffect(() => {
    if (user?.callSettings && !isInitialized) {
      setTimezone(user.callSettings.timezone);
      setSchedules(user.callSettings.schedules);
      setIsInitialized(true);
    } else if (!user?.callSettings && !isInitialized) {
      // If no settings exist, mark as initialized to avoid infinite loop
      setIsInitialized(true);
    }
  }, [user?.callSettings, isInitialized]);

  // Save settings to store whenever they change (only after initialization)
  useEffect(() => {
    if (isInitialized) {
      const callSettings: CallSettings = {
        timezone,
        schedules,
      };
      updateCallSettings(callSettings);
    }
  }, [timezone, schedules, updateCallSettings, isInitialized]);

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
      <Form.Section title="Your self timezone">
        <Form.Link href="/timezones-settings" hint={timezone}>
          Timezone
        </Form.Link>
      </Form.Section>
      <Form.Section title="Days">
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
    </View>
  );
}
