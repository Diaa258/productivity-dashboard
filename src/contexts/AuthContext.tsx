'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, baseUrl: string) => Promise<boolean>;
  logout: () => void;
  credentials: {
    username: string;
    password: string;
    baseUrl: string;
  } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [credentials, setCredentials] = useState<{
    username: string;
    password: string;
    baseUrl: string;
  } | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const sessionData = localStorage.getItem('jiraSession');
        if (sessionData) {
          const session = JSON.parse(sessionData);
          const now = new Date().getTime();
          
          // Check if session is still valid (24 hours = 86400000 ms)
          if (session.expiry && now < session.expiry) {
            setCredentials(session.credentials);
            setIsAuthenticated(true);
          } else {
            // Session expired, clear it
            localStorage.removeItem('jiraSession');
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem('jiraSession');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string, baseUrl: string): Promise<boolean> => {
    try {
      // Test credentials with Jira API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          baseUrl,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Create session with 24-hour expiry
          const sessionData = {
            credentials: { username, password, baseUrl },
            expiry: new Date().getTime() + (24 * 60 * 60 * 1000), // 24 hours
          };
          
          localStorage.setItem('jiraSession', JSON.stringify(sessionData));
          setCredentials({ username, password, baseUrl });
          setIsAuthenticated(true);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('jiraSession');
    setCredentials(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
        credentials,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
