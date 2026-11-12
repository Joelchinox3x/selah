export type UserRole = 'admin' | 'pastor' | 'moderador' | 'creyente' | 'verificado' | 'miembro';
export type AccountStatus = 'active' | 'suspended';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  isVerified: boolean;
  isPastor: boolean;
  isModerator: boolean;
  status: AccountStatus;
  provider: 'google' | 'guest';
  lastActiveAt: string;
  reflectionsCount: number;
  blessingsCount: number;
  bio?: string;
  favoriteVerse?: string;
  customAvatar?: boolean;
}

export interface PastoralMember extends AuthUser {
  joinedAt: string;
  notes?: string;
}

export interface PastoralOverviewStats {
  totalMembers: number;
  activeToday: number;
  verifiedCount: number;
  pastorsCount: number;
  suspendedCount: number;
}
