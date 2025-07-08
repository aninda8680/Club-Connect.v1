export interface Club {
  id: string;
  name: string;
  description: string;
  logoURL?: string;
  tag?: string;
  membersCount: number;
  achievementsCount: number;
  achievementImages?: string[];
  socials?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  clubName: string;
  clubId: string;
}

export interface MousePosition {
  x: number;
  y: number;
}