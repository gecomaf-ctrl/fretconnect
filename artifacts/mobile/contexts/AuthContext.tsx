import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserMode = 'shipper' | 'carrier';
export type CarrierStatus = 'none' | 'pending' | 'corrections' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  mode: UserMode;
  carrierStatus: CarrierStatus;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  switchMode: (mode: UserMode) => void;
  submitCarrierRequest: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
const STORAGE_KEY = '@fretconnect_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch (_) {
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async (u: User) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  };

  const login = async (email: string, _password: string) => {
    await new Promise(r => setTimeout(r, 900));
    const u: User = {
      id: 'user_1',
      name: 'Kofi Mensah',
      email,
      phone: '+225 07 12 34 56',
      mode: 'shipper',
      carrierStatus: 'none',
    };
    await saveUser(u);
  };

  const register = async (name: string, email: string, phone: string, _password: string) => {
    await new Promise(r => setTimeout(r, 900));
    const u: User = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
      name,
      email,
      phone,
      mode: 'shipper',
      carrierStatus: 'none',
    };
    await saveUser(u);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const switchMode = (mode: UserMode) => {
    if (!user) return;
    saveUser({ ...user, mode });
  };

  const submitCarrierRequest = () => {
    if (!user) return;
    saveUser({ ...user, carrierStatus: 'pending' });
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    saveUser({ ...user, ...updates });
  };

  return (
    <AuthContext.Provider value={{
      user, isLoading, isAuthenticated: !!user,
      login, register, logout, switchMode, submitCarrierRequest, updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
