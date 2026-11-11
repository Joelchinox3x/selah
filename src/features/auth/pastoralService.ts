import AsyncStorage from '@react-native-async-storage/async-storage';
import { PastoralMember, PastoralOverviewStats, UserRole } from './types';

const MEMBERS_KEY = '@selah_pastoral_members_v2';
const PIN_KEY = '@selah_pastoral_pin_v1';
const DEFAULT_PIN = '7777';

const INITIAL_MEMBERS: PastoralMember[] = [
  {
    id: 'pastor-guillermo-001',
    name: 'Ps. Guillermo Quispe C.',
    email: 'pastor.guillermo@comunidadselah.org',
    role: 'pastor',
    isVerified: true,
    isPastor: true,
    isModerator: true,
    status: 'active',
    provider: 'google',
    lastActiveAt: 'Ahora mismo',
    joinedAt: '2025-01-15',
    reflectionsCount: 142,
    blessingsCount: 890,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    notes: 'Pastor principal de la comunidad Selah',
  },
  {
    id: 'member-david-002',
    name: 'David Morales',
    email: 'david.morales.biblia@gmail.com',
    role: 'moderador',
    isVerified: true,
    isPastor: false,
    isModerator: true,
    status: 'active',
    provider: 'google',
    lastActiveAt: 'Hace 12 min',
    joinedAt: '2025-02-01',
    reflectionsCount: 45,
    blessingsCount: 230,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    notes: 'Líder del ministerio de jóvenes',
  },
  {
    id: 'member-maria-003',
    name: 'María Elena Vargas',
    email: 'maria.elena.v@gmail.com',
    role: 'verificado',
    isVerified: true,
    isPastor: false,
    isModerator: false,
    status: 'active',
    provider: 'google',
    lastActiveAt: 'Hace 45 min',
    joinedAt: '2025-02-18',
    reflectionsCount: 28,
    blessingsCount: 114,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    notes: 'Comunidad de oración matutina',
  },
  {
    id: 'member-carlos-004',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza.peru@gmail.com',
    role: 'verificado',
    isVerified: true,
    isPastor: false,
    isModerator: false,
    status: 'active',
    provider: 'google',
    lastActiveAt: 'Hoy, 09:30',
    joinedAt: '2025-03-02',
    reflectionsCount: 19,
    blessingsCount: 87,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'member-ruth-005',
    name: 'Ruth Alarcón',
    email: 'ruth.alarcon.fe@gmail.com',
    role: 'verificado',
    isVerified: true,
    isPastor: false,
    isModerator: false,
    status: 'active',
    provider: 'google',
    lastActiveAt: 'Ayer',
    joinedAt: '2025-03-10',
    reflectionsCount: 12,
    blessingsCount: 65,
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'member-mateo-006',
    name: 'Mateo Silva',
    email: 'mateo.silva92@gmail.com',
    role: 'miembro',
    isVerified: false,
    isPastor: false,
    isModerator: false,
    status: 'active',
    provider: 'guest',
    lastActiveAt: 'Hace 3 días',
    joinedAt: '2025-04-01',
    reflectionsCount: 4,
    blessingsCount: 15,
  },
];

export async function getPastoralPin(): Promise<string> {
  const pin = await AsyncStorage.getItem(PIN_KEY);
  return pin || DEFAULT_PIN;
}

export async function setPastoralPin(newPin: string): Promise<void> {
  await AsyncStorage.setItem(PIN_KEY, newPin.trim());
}

export async function verifyPastoralPin(attempt: string): Promise<boolean> {
  const current = await getPastoralPin();
  return current === attempt.trim();
}

export async function getPastoralMembers(): Promise<PastoralMember[]> {
  try {
    const raw = await AsyncStorage.getItem(MEMBERS_KEY);
    if (!raw) {
      await AsyncStorage.setItem(MEMBERS_KEY, JSON.stringify(INITIAL_MEMBERS));
      return INITIAL_MEMBERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    await AsyncStorage.setItem(MEMBERS_KEY, JSON.stringify(INITIAL_MEMBERS));
    return INITIAL_MEMBERS;
  } catch {
    return INITIAL_MEMBERS;
  }
}

export async function savePastoralMembers(members: PastoralMember[]): Promise<void> {
  await AsyncStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
}

export async function registerOrUpdatePastoralMember(member: PastoralMember): Promise<PastoralMember[]> {
  const members = await getPastoralMembers();
  const index = members.findIndex((m) => m.id === member.id || (member.email && m.email === member.email));
  let updated: PastoralMember[];

  if (index >= 0) {
    updated = [...members];
    updated[index] = {
      ...members[index],
      ...member,
      lastActiveAt: 'Ahora mismo',
      // Preserve pastor status if previously elevated
      role: members[index].role === 'pastor' ? 'pastor' : member.role,
      isPastor: members[index].isPastor || member.isPastor,
    };
  } else {
    updated = [member, ...members];
  }

  await savePastoralMembers(updated);
  return updated;
}

export const KNOWN_PASTORAL_EMAILS: Record<string, UserRole> = {
  'pastor.guillermo@comunidadselah.org': 'pastor',
  'pastor.guillermo@gmail.com': 'pastor',
  'guillermo.quispe@gmail.com': 'pastor',
  'david.morales.biblia@gmail.com': 'moderador',
};

export async function resolveRoleForUser(email: string, requestedRole?: UserRole): Promise<UserRole> {
  const cleanEmail = email.trim().toLowerCase();
  if (KNOWN_PASTORAL_EMAILS[cleanEmail]) {
    return KNOWN_PASTORAL_EMAILS[cleanEmail];
  }
  const members = await getPastoralMembers();
  const found = members.find((m) => m.email && m.email.toLowerCase() === cleanEmail);
  if (found && (found.role === 'pastor' || found.role === 'moderador')) {
    return found.role;
  }
  return requestedRole || 'verificado';
}

export async function updateMemberRole(memberId: string, newRole: UserRole): Promise<PastoralMember[]> {
  const members = await getPastoralMembers();
  const updated = members.map((m) => {
    if (m.id === memberId) {
      return {
        ...m,
        role: newRole,
        isPastor: newRole === 'pastor',
        isModerator: newRole === 'moderador' || newRole === 'pastor',
        isVerified: newRole !== 'miembro',
      };
    }
    return m;
  });
  await savePastoralMembers(updated);
  return updated;
}

export async function toggleMemberSuspension(memberId: string): Promise<{ updated: PastoralMember[]; newStatus: 'active' | 'suspended' }> {
  const members = await getPastoralMembers();
  let newStatus: 'active' | 'suspended' = 'active';
  const updated = members.map((m) => {
    if (m.id === memberId) {
      newStatus = m.status === 'active' ? 'suspended' : 'active';
      return {
        ...m,
        status: newStatus,
      };
    }
    return m;
  });
  await savePastoralMembers(updated);
  return { updated, newStatus };
}

export async function deletePastoralMember(memberId: string): Promise<PastoralMember[]> {
  const members = await getPastoralMembers();
  const filtered = members.filter((m) => m.id !== memberId);
  await savePastoralMembers(filtered);
  return filtered;
}

export async function isMemberSuspended(identifier: string): Promise<boolean> {
  if (!identifier) return false;
  const members = await getPastoralMembers();
  const found = members.find(
    (m) =>
      m.id === identifier ||
      (m.email && m.email.toLowerCase() === identifier.toLowerCase()) ||
      m.name.toLowerCase() === identifier.toLowerCase()
  );
  return found ? found.status === 'suspended' : false;
}

export async function getPastoralStats(): Promise<PastoralOverviewStats> {
  const members = await getPastoralMembers();
  return {
    totalMembers: members.length,
    activeToday: members.filter((m) => m.status === 'active' && (m.lastActiveAt.includes('Ahora') || m.lastActiveAt.includes('min') || m.lastActiveAt.includes('Hoy'))).length,
    verifiedCount: members.filter((m) => m.isVerified).length,
    pastorsCount: members.filter((m) => m.role === 'pastor').length,
    suspendedCount: members.filter((m) => m.status === 'suspended').length,
  };
}

export async function suspendAuthorByName(name: string): Promise<boolean> {
  const cleanName = (name || '').trim();
  if (!cleanName) return false;
  const members = await getPastoralMembers();
  let found = false;
  const updated = members.map((m) => {
    if (m.name.trim().toLowerCase() === cleanName.toLowerCase()) {
      found = true;
      return { ...m, status: 'suspended' as const };
    }
    return m;
  });
  if (!found) {
    updated.push({
      id: `suspended-${Date.now()}`,
      name: cleanName,
      email: `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}@comunidad.local`,
      role: 'miembro',
      isVerified: false,
      isPastor: false,
      isModerator: false,
      status: 'suspended',
      provider: 'guest',
      lastActiveAt: 'Reciente',
      joinedAt: new Date().toISOString().split('T')[0],
      reflectionsCount: 1,
      blessingsCount: 0,
      notes: 'Suspendido desde moderación pastoral in-situ',
    });
  }
  await savePastoralMembers(updated);
  return true;
}

