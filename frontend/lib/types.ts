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
  companyType: string;
  location: string;
  dates: string;
  description: string;
  rating: number;
  photoUrl: string;
}