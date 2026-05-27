// // src/hooks/useAuth.ts
// import { useState, useEffect, useCallback } from 'react';
// import { authApi } from '../services/authApi';
// import type { User, UserRole } from '../types/index';

// export const useAuth = () => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const init = () => {
//       const currentUser = authApi.getCurrentUser();
//       setUser(currentUser);
//       setIsLoading(false);
//     };
//     init();
//   }, []);

//   const login = useCallback(async (email: string, password: string) => {
//     const user = await authApi.login({ email, password });
//     setUser(user);
//     return user;
//   }, []);

//   const logout = useCallback(() => {
//     authApi.logout();
//     setUser(null);
//   }, []);

//   const hasRole = useCallback((role: UserRole | UserRole[]): boolean => {
//     if (!user) return false;
//     const roles = Array.isArray(role) ? role : [role];
//     return roles.includes(user.role);
//   }, [user]);

//   return {
//     user,
//     isLoading,
//     isAuthenticated: !!user,
//     isAdmin: user?.role === 'admin',
//     isClient: user?.role === 'client',
//     isTeacher: user?.role === 'teacher',
//     entityId: user?.entityId,
//     login,
//     logout,
//     hasRole,
//   };
// };

// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/authApi';
import type { User, UserRole } from '../types/index';

export const useAuth = () => {
  // ← Исправлено: читаем из localStorage сразу, а не null
  const [user, setUser] = useState<User | null>(() => authApi.getCurrentUser());
  const [isLoading, setIsLoading] = useState(false); // ← false, т.к. уже загрузили

  // Для обновления при смене вкладки/возврате
  useEffect(() => {
    const handleStorage = () => {
      setUser(authApi.getCurrentUser());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const user = await authApi.login({ email, password });
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, []);

  const hasRole = useCallback((role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  }, [user]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isClient: user?.role === 'client',
    isTeacher: user?.role === 'teacher',
    entityId: user?.entityId,
    login,
    logout,
    hasRole,
  };
};