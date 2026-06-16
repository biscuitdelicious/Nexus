import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setToken, setStoredUser, clearAuth, setUnauthorizedHandler } from '../../services/auth.native';

const MobileAuthContext = createContext(null);

export function MobileAuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback((userData) => {
    if (userData?.token) setToken(userData.token);
    setStoredUser(userData);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    // Defer unmount so nested navigators can close cleanly before showing login.
    requestAnimationFrame(() => setUser(null));
  }, []);

  const value = useMemo(
    () => ({ user, isAuthed: !!user, login, logout }),
    [user, login, logout]
  );

  return <MobileAuthContext.Provider value={value}>{children}</MobileAuthContext.Provider>;
}

export function useMobileAuth() {
  const ctx = useContext(MobileAuthContext);
  if (!ctx) throw new Error('useMobileAuth must be used within MobileAuthProvider');
  return ctx;
}
