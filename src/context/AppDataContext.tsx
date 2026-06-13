import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface AppDataContextValue {
  revision: number;
  notifyDataChanged: () => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: React.PropsWithChildren) {
  const [revision, setRevision] = useState(0);
  const notifyDataChanged = useCallback(() => {
    setRevision((current) => current + 1);
  }, []);
  const value = useMemo(
    () => ({ revision, notifyDataChanged }),
    [revision, notifyDataChanged],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used inside AppDataProvider');
  }
  return context;
}
