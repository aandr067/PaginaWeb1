import { create } from "zustand";
import { apiLogin, clearToken, getStoredUser, setToken, storeUser, type PortalUser } from "@/lib/api";

/** Sesión del portal: identidad + token JWT. Aislamiento real lo aplica el backend. */
interface AuthState {
  user: PortalUser | null;
  status: "idle" | "loading" | "error";
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: getStoredUser(),
  status: "idle",
  error: null,
  login: async (email, password) => {
    set({ status: "loading", error: null });
    try {
      const { token, user } = await apiLogin(email, password);
      setToken(token);
      storeUser(user);
      set({ user, status: "idle", error: null });
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "error";
      set({ status: "error", error: msg });
      return false;
    }
  },
  logout: () => {
    clearToken();
    set({ user: null, status: "idle", error: null });
  },
}));
