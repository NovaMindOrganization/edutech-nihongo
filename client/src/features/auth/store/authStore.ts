import { create } from 'zustand';

import { setAccessToken } from '@/services/httpClient';

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  displayName?: string | null;
};

type AuthState = {
  user: AuthUser | null;
  setSession: (user: AuthUser, accessToken: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setSession: (user, accessToken) => {
    setAccessToken(accessToken);
    set({ user });
  },
  logout: () => {
    setAccessToken(null);
    set({ user: null });
  },
}));
