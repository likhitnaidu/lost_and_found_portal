export type ItemKind = "lost" | "found";

export type Category =
  | "Electronics"
  | "Wallets"
  | "Bags"
  | "ID Cards"
  | "Keys"
  | "Water Bottles"
  | "Books"
  | "Cycles"
  | "Wearables"
  | "Others";

export type Urgency = "normal" | "high" | "critical";

export type ItemStatus = "open" | "matched" | "claimed" | "returned";

export interface HiddenAttribute {
  label: string;
  value: string;
}

export interface Item {
  id: string;
  kind: ItemKind;
  title: string;
  category: Category;
  description: string;
  date: string; // ISO
  location: string;
  building: string;
  tags: string[];
  color: string;
  condition: string;
  urgency: Urgency;
  reward?: number;
  status: ItemStatus;
  postedBy: string; // user id
  createdAt: string; // ISO
  // private — used for verification only, never shown to public
  hidden: HiddenAttribute[];
}

export type Rank =
  | "New Member"
  | "Helper"
  | "Contributor"
  | "Trusted Member"
  | "Campus Hero"
  | "Campus Guardian"
  | "Legend";

export interface User {
  id: string;
  name: string;
  avatarColor: string;
  trustScore: number;
  karma: number;
  rank: Rank;
  itemsReturned: number;
  itemsReported: number;
  fraudRisk: "Low" | "Medium" | "High" | "Critical";
  badges: string[];
}

export interface VerificationQuestion {
  id: string;
  question: string;
  weight: number;
  expected: string; // normalized expected answer
}
