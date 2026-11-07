import type { WordSet, UserStats } from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

export interface AuthUser {
  id: number;
  username: string;
  full_name: string;
  avatar: string;
  profile_image?: string | null;
}

export const api = {
  getToken(): string | null {
    return localStorage.getItem('soztop_token');
  },

  setToken(token: string | null) {
    if (token) {
      localStorage.setItem('soztop_token', token);
    } else {
      localStorage.removeItem('soztop_token');
    }
  },

  async register(username: string, password: string, fullName: string, avatar = '🦁'): Promise<{ success: boolean; token: string; user: AuthUser }> {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, full_name: fullName, avatar }),
      });
    } catch {
      // Truly unreachable (no network, server down, CORS blocked)
      throw new Error("Server bilan aloqa o'rnatib bo'lmadi. Internetni tekshiring.");
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Ro'yxatdan o'tishda xatolik yuz berdi");

    this.setToken(data.token);
    return data;
  },

  async login(username: string, password: string): Promise<{ success: boolean; token: string; user: AuthUser }> {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
    } catch {
      // Truly unreachable
      throw new Error("Server bilan aloqa o'rnatib bo'lmadi. Internetni tekshiring.");
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Username yoki parol noto'g'ri");

    this.setToken(data.token);
    return data;
  },

  async getMe(): Promise<{ user: AuthUser; stats: any } | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateProfile(updates: { full_name?: string; avatar?: string; profile_image?: string }): Promise<AuthUser> {
    const token = this.getToken();
    const res = await fetch(`${API_BASE}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Profilni yangilab bo‘lmadi');
    return data.user;
  },

  async syncSets(sets: WordSet[]): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const res = await fetch(`${API_BASE}/api/sets/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sets }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async syncStats(stats: UserStats): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const res = await fetch(`${API_BASE}/api/stats/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stars: stats.stars,
          games: stats.games,
          streak: stats.streak,
          played_modes: stats.playedModes,
          known_words: stats.knownWords,
          unlocked_badges: stats.unlockedBadges,
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
