import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/api.js';

/**
 * Auth Store (Zustand)
 * Holds user state. Tokens live in HTTP-only cookies managed by the backend.
 * We only persist non-sensitive data (user object) in localStorage.
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // Called after a successful login/register response
      setUser: (user) => set({ user, isAuthenticated: true }),

      // Hydrate user from /auth/me (on app load)
      hydrate: async () => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.getMe();
          set({ user: data.data.user, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // Always clear state even if request fails
        }
        set({ user: null, isAuthenticated: false });
      },

      clearAuth: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'rc-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
