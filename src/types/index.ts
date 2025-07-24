// Types
export type TimeSlot = "9:00-12:00" | "12:00-15:00" | "15:00-18:00";

export type DaySchedule = {
  name: string;
  enabled: boolean;
  timeSlot: TimeSlot;
};

export type CallSettings = {
  timezone: string;
  schedules: Record<string, DaySchedule>;
};

export type NotificationSettings = {
  lowMood: boolean;
  missedCalls: boolean;
  newTopics: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  callSettings?: CallSettings;
  notificationSettings?: NotificationSettings;
};

export type LoginResult = {
  success: boolean;
  user?: User;
  error?: string;
};

export type RegisterResult = {
  success: boolean;
  error?: string;
};

export type UserData = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

export type UserState = {
  isLoggedIn: boolean;
  shouldCreateAccount: boolean;
  hasCompletedOnboarding: boolean;
  isVip: boolean;
  _hasHydrated: boolean;
  user: User | null;
  logIn: (email: string, password: string) => Promise<LoginResult>;
  register: (userData: UserData) => Promise<RegisterResult>;
  logOut: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  logInAsVip: () => void;
  setHasHydrated: (value: boolean) => void;
  updateCallSettings: (settings: CallSettings) => void;
  updateNotificationSettings: (settings: NotificationSettings) => void;
};
