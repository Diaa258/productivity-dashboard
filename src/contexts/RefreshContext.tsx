'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface RefreshContextType {
  isRefreshing: boolean;
  refreshAll: () => Promise<void>;
  triggerRefresh: () => void;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export function RefreshProvider({ children }: { children: ReactNode }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Trigger a refresh by incrementing the trigger value
      setRefreshTrigger(prev => prev + 1);
      // Give some time for components to re-fetch their data
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <RefreshContext.Provider value={{
      isRefreshing,
      refreshAll,
      triggerRefresh
    }}>
      {children}
    </RefreshContext.Provider>
  );
}

export function useRefresh() {
  const context = useContext(RefreshContext);
  if (context === undefined) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
}
