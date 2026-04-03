import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as authApi from '../api/auth';
import type { AuthUser } from '../api/types';

const STORAGE_KEY = 'repositorio_auth';

type Stored = { token: string; user: AuthUser };

function loadStored(): Stored | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Stored;
  } catch {
    return null;
  }
}

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<Stored | null>(() =>
    typeof window !== 'undefined' ? loadStored() : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persist = useCallback((data: Stored | null) => {
    setStored(data);
    if (data) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setError(null);
      setLoading(true);
      try {
        const res = await authApi.login(email, password);
        persist({ token: res.token, user: res.user });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo iniciar sesión.');
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [persist]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setError(null);
      setLoading(true);
      try {
        const res = await authApi.register(name, email, password);
        persist({ token: res.token, user: res.user });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo registrar.');
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [persist]
  );

  const logout = useCallback(() => {
    persist(null);
    setError(null);
  }, [persist]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: stored?.user ?? null,
      token: stored?.token ?? null,
      loading,
      error,
      login,
      register,
      logout,
      clearError,
    }),
    [stored, loading, error, login, register, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
