// src/services/authApi.ts
import { apiClient } from './api';
import type { LoginDto, LoginResponse, RegisterDto, User, UserRole } from '../types/index';

// Нормализация роли: "Client" → "client"
const normalizeRole = (role: string): UserRole => {
  const map: Record<string, UserRole> = {
    'Client': 'client',
    'Teacher': 'teacher',
    'Admin': 'admin',
  };
  return map[role] || 'client';
};

// Декодер JWT payload (для проверки срока действия)
const decodeJwtPayload = (token: string): Record<string, any> | null => {
  try {
    const base64 = token.split('.')[1];
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

// Извлечение user из JWT claims (fallback)
const extractUserFromToken = (token: string): User | null => {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const roleClaim = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  const nameId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
  const userData = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/userdata'];
  const email = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];

  if (!nameId) return null;

  return {
    id: Number(nameId),
    email: email || '',
    fullName: payload.name || '',
    role: normalizeRole(roleClaim || 'Client'),
    entityId: userData ? Number(userData) : undefined,
  };
};

// export const authApi = {
//   login: async (credentials: LoginDto): Promise<User> => {
//     const { data } = await apiClient.post<LoginResponse>('/api/Auth/login', credentials);
    
//     localStorage.setItem('auth_token', data.token);
    
//     const user: User = {
//       id: 0, // будет заполнено из токена если нужно
//       email: data.email,
//       fullName: data.name,
//       role: normalizeRole(data.role),
//     };

//     // Пытаемся извлечь id из токена2
//     const fromToken = extractUserFromToken(data.token);
//     if (fromToken) {
//       user.id = fromToken.id;
//       user.entityId = fromToken.entityId;
//     }

//     localStorage.setItem('auth_user', JSON.stringify(user));
//     return user;
//   },

//   register: async (dto: RegisterDto): Promise<User> => {
//     const { data } = await apiClient.post<LoginResponse>('/api/Auth/register', dto);
    
//     localStorage.setItem('auth_token', data.token);
    
//     const user: User = {
//       id: 0,
//       email: data.email,
//       fullName: data.name,
//       role: normalizeRole(data.role),
//     };

//     const fromToken = extractUserFromToken(data.token);
//     if (fromToken) {
//       user.id = fromToken.id;
//       user.entityId = fromToken.entityId;
//     }

//     localStorage.setItem('auth_user', JSON.stringify(user));
//     return user;
//   },

//   // Опционально: если добавишь /api/Auth/me на бэкенде
//   getMe: async (): Promise<User> => {
//     const { data } = await apiClient.get<LoginResponse>('/api/Auth/me');
    
//     const user: User = {
//       id: 0,
//       email: data.email,
//       fullName: data.name,
//       role: normalizeRole(data.role),
//     };

//     const fromToken = extractUserFromToken(data.token);
//     if (fromToken) {
//       user.id = fromToken.id;
//       user.entityId = fromToken.entityId;
//     }

//     localStorage.setItem('auth_user', JSON.stringify(user));
//     return user;
//   },

//   logout: (): void => {
//     localStorage.removeItem('auth_token');
//     localStorage.removeItem('auth_user');
//     window.location.href = '/login';
//   },

//   getCurrentUser: (): User | null => {
//     const stored = localStorage.getItem('auth_user');
//     if (stored) {
//       try {
//         return JSON.parse(stored);
//       } catch {
//         localStorage.removeItem('auth_user');
//       }
//     }

//     const token = localStorage.getItem('auth_token');
//     if (!token) return null;

//     // Проверяем, не истёк ли токен
//     const payload = decodeJwtPayload(token);
//     if (payload?.exp && payload.exp * 1000 < Date.now()) {
//       authApi.logout();
//       return null;
//     }

//     return extractUserFromToken(token);
//   },

//   isAuthenticated: (): boolean => {
//     const token = localStorage.getItem('auth_token');
//     if (!token) return false;

//     const payload = decodeJwtPayload(token);
//     if (payload?.exp && payload.exp * 1000 < Date.now()) {
//       return false;
//     }

//     return true;
//   },

//   // Получение entityId (id_client или id_teacher) из токена
//   getEntityId: (): number | undefined => {
//     const user = authApi.getCurrentUser();
//     return user?.entityId;
//   },
// };

// src/services/authApi.ts

export const authApi = {
  login: async (credentials: LoginDto): Promise<User> => {
  const { data } = await apiClient.post<LoginResponse>('/api/Auth/login', credentials);
  
  localStorage.setItem('auth_token', data.token);
  
  // Извлекаем данные из токена
  const payload = decodeJwtPayload(data.token);
  console.log('Token payload:', payload); // Для отладки
  
  // Извлекаем roleId из NameIdentifier
  const roleId = payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
  const role = payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  
  const user: User = {
    id: data.userId || 0, // используем roleId как временный id
    email: data.email,
    fullName: data.name,
    role: normalizeRole(role || data.role),
    entityId: roleId ? Number(roleId) : undefined,
  };
  
  localStorage.setItem('auth_user', JSON.stringify(user));
  return user;
},

  // Упрощаем getCurrentUser - просто берем из localStorage
  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem('auth_user');
    if (!stored) return null;
    
    try {
      const user = JSON.parse(stored);
      
      // Проверяем, не истек ли токен
      const token = localStorage.getItem('auth_token');
      if (token) {
        const payload = decodeJwtPayload(token);
        if (payload?.exp && payload.exp * 1000 < Date.now()) {
          authApi.logout();
          return null;
        }
      }
      
      return user;
    } catch {
      localStorage.removeItem('auth_user');
      return null;
    }
  },

  // Остальные методы остаются без изменений...
  register: async (dto: RegisterDto): Promise<User> => {
    const { data } = await apiClient.post<LoginResponse>('/api/Auth/register', dto);
    //localStorage.setItem('auth_token', data.token);

    const payload = decodeJwtPayload(data.token);
    console.log('Token payload:', payload); // Для отладки
  
    // Извлекаем roleId из NameIdentifier
    const roleId = payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    
    const user: User = {
      id: data.userId || 0,
      email: data.email,
      fullName: data.name,
      role: normalizeRole(data.role),
      entityId: roleId ? Number(roleId) : undefined,
    };
    
    //localStorage.setItem('auth_user', JSON.stringify(user));
    return user;
  },

  logout: (): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.location.href = '/login';
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;

    const payload = decodeJwtPayload(token);
    if (payload?.exp && payload.exp * 1000 < Date.now()) {
      return false;
    }

    return true;
  },

  getEntityId: (): number | undefined => {
    const user = authApi.getCurrentUser();
    return user?.entityId;
  },
};