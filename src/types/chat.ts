// src/types/chat.ts
// Create this new file to define shared TypeScript interfaces

export interface Message {
  id: string;
  text: string;
  createdAt: any;
  senderId: string;  // Updated to match your Firebase rules
  displayName: string;
  role: string;
  clubId: string;
}

export interface ClubMembership {
  role: 'admin' | 'leader' | 'member' | 'visitor' | null;
  isAllowedInChat: boolean;
  loading: boolean;
}

export type UserRole = 'admin' | 'leader' | 'member' | 'visitor';
