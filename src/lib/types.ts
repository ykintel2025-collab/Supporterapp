export interface FirestorePost {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  mediaUrl: string | null;
  mediaType: "image" | "video" | null;
  likes: string[];
  createdAt: Date | null;
}

export interface UserProfile {
  displayName: string;
  email: string;
  role: "lid" | "bestuur";
}

export interface DonationGoal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
}
