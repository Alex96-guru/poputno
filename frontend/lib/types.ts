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

/** Another traveller's profile, as anyone may see it. */
export interface PublicUser {
  id: string;
  name: string;
  username: string;
  city: string;
  bio: string;
  /** null when unset or when the owner hid it. */
  age: number | null;
  avatarUrl: string;
  interests: string[];
  languages: string[];
  smoking: string;
  height: number | null;
  maritalStatus: string;
  children: string;
  pets: string;
  university: string;
  profession: string;
  music: string;
  rating: number;
  reviewsCount: number;
  createdAt: string;
}

/** The slice of a poster's profile that travels with their listing. */
export interface ListingAuthor {
  id: string;
  name: string;
  username: string;
  age: number | null;
  avatarUrl: string;
  city: string;
  interests: string[];
  rating: number;
  reviewsCount: number;
}

/** What the create form collects. */
export interface ListingDraft {
  /** Which of the three shelves the listing belongs to. */
  category: string;
  authorKind: string;
  seeking: string;
  origin: string;
  destinations: string[];
  description: string;
  /** ISO dates, or "" while the traveller has not settled on them. */
  startDate: string;
  endDate: string;
  finance: string;
  tripType: string;
  smoking: string;
  /** Centimetres; 0 means "not stated". */
  height: number;
  languages: string[];
  remind: boolean;
  /** "Встречи": what to do together and who is wanted along. */
  interests: string[];
  /** 0 means no bound. */
  ageMin: number;
  ageMax: number;
  nearby: boolean;
  /** "В гости": which side of the visit the author is on. */
  hostingRole: string;
}

export interface Listing extends ListingDraft {
  id: string;
  author: ListingAuthor;
  createdAt: string;
  /** Origin resolved to a point; null when the city is not in the city table. */
  originLat: number | null;
  originLon: number | null;
}

/** A city the radius filter can measure from. */
export interface City {
  name: string;
  lat: number;
  lon: number;
}

/** The four kinds of listing the home page curates into separate shelves. */
export type TopGroupKey = "trips" | "meetups" | "hosting" | "friends";

export interface TopListing {
  id: string;
  name: string;
  age: number;
  rating: number;
  photoUrl: string;
  /** One-line pitch. The interest-based shelf shows interests instead. */
  description?: string;
  online?: boolean;
  /** Draws the gold "ТОП" badge over the photo. */
  featured?: boolean;
  location?: string;
  /** Small line beside the action button: dates, timing, availability. */
  meta?: string;
  /** Hosting shelf only. */
  status?: "Принимаю" | "Ищу приём";
  /** Interest shelf only. */
  interests?: string[];
  commonInterests?: number;
}

export interface TopGroup {
  key: TopGroupKey;
  title: string;
  caption: string;
  listings: TopListing[];
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
  languages: string[];
  smoking: string;
  /** Centimetres, or null when the user has not stated it. */
  height: number | null;
  maritalStatus: string;
  children: string;
  pets: string;
  university: string;
  profession: string;
  music: string;
  /** "мужчина" | "женщина"; empty on accounts made before it was asked. */
  gender: string;
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
  languages?: string[];
  smoking?: string;
  /** Centimetres; 0 clears the field. */
  height?: number;
  maritalStatus?: string;
  children?: string;
  pets?: string;
  university?: string;
  profession?: string;
  music?: string;
  gender?: string;
}