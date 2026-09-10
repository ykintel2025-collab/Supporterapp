export interface FirestorePost {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string | null;
  text: string;
  mediaUrl: string | null;
  mediaType: "image" | "video" | null;
  likes: string[];
  status: "pending" | "published";
  postedAsBestuur: boolean;
  createdAt: Date | null;
}

export interface UserProfile {
  displayName: string;
  email: string;
  role: "lid" | "bestuur";
  approved: boolean;
  emailVerified: boolean;
  bio?: string;
  photoURL?: string | null;
  // Lidmaatschapsbijdrage — voorlopig handmatig bijgehouden door het bestuur
  // (zie src/lib/config.ts), tot er een betaalprovider is gekoppeld.
  membershipFee?: number;
  membershipPaid?: boolean;
}

export interface MemberProfile extends UserProfile {
  id: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  participantPhotoURLs: Record<string, string | null>;
  lastMessage: string;
  lastMessageAt: Date | null;
  lastMessageSenderId?: string | null;
  // Per gebruiker het moment waarop die het gesprek voor het laatst heeft
  // geopend — gebruikt om "ongelezen"-indicators te tonen (zie Navbar.tsx).
  lastReadAt?: Record<string, Date | null>;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: Date | null;
}

export interface DonationGoal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
}

export interface Sponsor {
  id: string;
  name: string;
  logoUrl: string | null;
  linkUrl: string;
  active: boolean;
}
