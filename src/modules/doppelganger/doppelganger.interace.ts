export interface IDoppelganger {
  id: number;
  fullName?: string;
  avatar?: string;
  backstory?: string;
  isPublic?: boolean;
  isModified?: boolean;
  twitterRefreshToken?: string;
  twitterUsername?: string;
  twitterUserId?: string;
}
