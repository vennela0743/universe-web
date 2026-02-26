export interface Participant {
  userId: string;
  displayName: string;
}

export interface Conversation {
  id: string;
  participants: Participant[];
  lastMessageText: string | null;
  lastMessageAt: string | null;
  createdAt: string;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderUserId: string;
  senderDisplayName: string;
  content: string;
  createdAt: string;
}

export interface UserSearchResult {
  userId: string;
  displayName: string;
  email: string;
}
