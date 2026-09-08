export type PostType = "mededeling" | "sociaal" | "sponsor";

export interface Post {
  id: string;
  type: PostType;
  title: string;
  content: string;
  author: string;
  date: string; // ISO date string
  approved: boolean;
}

export interface DonationGoal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
}
