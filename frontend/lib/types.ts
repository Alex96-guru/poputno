export type CompanyType =
  | "Только девушки"
  | "Только парни"
  | "Смешанная"
  | "Пара"
  | "Группа"
  | "Друзья"
  | "Одиночное путешествие";

export interface Person {
  id: string;
  name: string;
  /** null for cards that aren't one person (a couple, a group). */
  age: number | null;
  companyType: string;
  location: string;
  dates: string;
  description: string;
  rating: number;
  photoUrl: string;
}

export interface CompletenessItem {
  key: string;
  label: string;
  done: boolean;
}

export interface ProfileCompleteness {
  percent: number;
  items: CompletenessItem[];
}

export interface UserSettings {
  notifyMessages: boolean;
  notifyResponses: boolean;
  notifyEmailDigest: boolean;
  notifyNews: boolean;
  privacyOnline: boolean;
  privacyShowAge: boolean;
  privacyInSearch: boolean;
}

export type SettingsUpdate = Partial<UserSettings>;

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  city: string;
  bio: string;
  phone: string;
  /** ISO date, or "" for accounts created before the field existed. */
  birthDate: string;
  /** Computed by the server; null when birthDate is unset. */
  age: number | null;
  avatarUrl: string;
  interests: string[];
  rating: number;
  reviewsCount: number;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  completeness: ProfileCompleteness;
  settings: UserSettings;
}

export interface ProfileUpdate {
  name?: string;
  city?: string;
  bio?: string;
  phone?: string;
  birthDate?: string;
  avatarUrl?: string;
  interests?: string[];
}