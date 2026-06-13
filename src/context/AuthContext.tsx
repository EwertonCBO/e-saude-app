import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'demo_session_user_id';
const ONBOARDING_KEY = 'onboarding_completed';

interface AuthContextValue {
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  userId: number | null;
  completeOnboarding: () => Promise<void>;
  signIn: (userId: number) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    async function restoreSession() {
      const [onboarding, session] = await Promise.all([
        SecureStore.getItemAsync(ONBOARDING_KEY),
        SecureStore.getItemAsync(SESSION_KEY),
      ]);
      setHasCompletedOnboarding(onboarding === 'true');
      setUserId(session ? Number(session) : null);
      setIsLoading(false);
    }

    restoreSession();
  }, []);

  const completeOnboarding = useCallback(async () => {
    await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
    setHasCompletedOnboarding(true);
  }, []);

  const signIn = useCallback(async (nextUserId: number) => {
    await SecureStore.setItemAsync(SESSION_KEY, String(nextUserId));
    setUserId(nextUserId);
  }, []);

  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    setUserId(null);
  }, []);

  const value = useMemo(
    () => ({
      isLoading,
      hasCompletedOnboarding,
      userId,
      completeOnboarding,
      signIn,
      signOut,
    }),
    [
      completeOnboarding,
      hasCompletedOnboarding,
      isLoading,
      signIn,
      signOut,
      userId,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
