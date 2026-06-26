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
  sessionReady: boolean;
  setSession: (user: AuthUser, accessToken: string) => void;
  setSessionReady: (ready: boolean) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  sessionReady: false,
  setSession: (user, accessToken) => {
    setAccessToken(accessToken);
    set({ user, sessionReady: true });
  },
  setSessionReady: (sessionReady) => set({ sessionReady }),
  logout: () => {
    setAccessToken(null);
    set({ user: null, sessionReady: true });
  },
}));
