import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '@/data/mockData';

// ─── Sub-account types ────────────────────────────────────────────────────────

export interface WalletData {
  balance: number;
  transactions: Transaction[];
}

export interface ShipperProfile {
  id: string;
  freightCount: number;
  rating: number;
  wallet: WalletData;
}

export type CarrierStatus = 'pending' | 'corrections' | 'approved' | 'rejected';

export interface CarrierProfile {
  id: string;
  missionCount: number;
  rating: number;
  status: CarrierStatus;
  vehicle?: string;
  wallet: WalletData;
}

// ─── Top-level user ───────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  /** Which account is currently active in the UI */
  activeAccount: 'shipper' | 'carrier';
  shipper: ShipperProfile;
  carrier?: CarrierProfile;
}

// ─── Context type ─────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Switch the active account between shipper and carrier */
  switchAccount: (type: 'shipper' | 'carrier') => void;
  /** Start the KYC process — creates a pending carrier profile */
  submitCarrierRequest: () => void;
  /** Mark carrier as approved (used by admin/test flows) */
  approveCarrier: () => void;
  updateUser: (updates: Partial<User>) => void;
}

// ─── Default wallets ─────────────────────────────────────────────────────────

const DEFAULT_SHIPPER_WALLET: WalletData = {
  balance: 245000,
  transactions: [
    { id: 'st1', type: 'debit',  amount: -180000, description: 'Paiement fret Abidjan → Bouaké',        date: '05/07/2026', status: 'completed' },
    { id: 'st2', type: 'credit', amount: 95000,   description: 'Remboursement fret annulé',              date: '01/07/2026', status: 'completed' },
    { id: 'st3', type: 'debit',  amount: -350000, description: 'Paiement fret Yopougon → San Pedro',    date: '28/06/2026', status: 'pending' },
    { id: 'st4', type: 'debit',  amount: -95000,  description: 'Paiement fret Cocody → Yamoussoukro',   date: '20/06/2026', status: 'completed' },
  ],
};

const DEFAULT_CARRIER_WALLET: WalletData = {
  balance: 446250,
  transactions: [
    { id: 'ct1', type: 'credit',     amount: 185000,  description: 'Mission Abidjan → Yamoussoukro',   date: '01/07/2026', status: 'completed' },
    { id: 'ct2', type: 'commission', amount: -9250,   description: 'Commission FretConnect (5%)',        date: '01/07/2026', status: 'completed' },
    { id: 'ct3', type: 'credit',     amount: 320000,  description: 'Mission Abidjan → Korhogo',         date: '28/06/2026', status: 'completed' },
    { id: 'ct4', type: 'debit',      amount: -50000,  description: 'Retrait vers Mobile Money',         date: '25/06/2026', status: 'completed' },
    { id: 'ct5', type: 'credit',     amount: 95000,   description: 'Mission Abidjan → Daloa',           date: '20/06/2026', status: 'pending' },
    { id: 'ct6', type: 'commission', amount: -4750,   description: 'Commission FretConnect (5%)',        date: '20/06/2026', status: 'pending' },
  ],
};

function buildNewUser(id: string, name: string, email: string, phone: string): User {
  return {
    id,
    name,
    email,
    phone,
    activeAccount: 'shipper',
    shipper: {
      id: `${id}_shipper`,
      freightCount: 0,
      rating: 5.0,
      wallet: { balance: 0, transactions: [] },
    },
  };
}

function buildTestUser(email: string): User {
  return {
    id: 'user_test',
    name: 'Kofi Mensah',
    email,
    phone: '+225 07 12 34 56',
    activeAccount: 'shipper',
    shipper: {
      id: 'user_test_shipper',
      freightCount: 24,
      rating: 4.8,
      wallet: DEFAULT_SHIPPER_WALLET,
    },
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);
const STORAGE_KEY = '@fretconnect_user_v2';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadUser(); }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch (_) {
    } finally {
      setIsLoading(false);
    }
  };

  const persist = async (u: User) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  };

  const login = async (email: string, _password: string) => {
    await new Promise(r => setTimeout(r, 900));
    await persist(buildTestUser(email));
  };

  const register = async (name: string, email: string, phone: string, _password: string) => {
    await new Promise(r => setTimeout(r, 900));
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 8);
    await persist(buildNewUser(id, name, email, phone));
  };

  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const switchAccount = (type: 'shipper' | 'carrier') => {
    if (!user) return;
    if (type === 'carrier' && !user.carrier) return;
    persist({ ...user, activeAccount: type });
  };

  const submitCarrierRequest = () => {
    if (!user) return;
    const carrierId = `${user.id}_carrier`;
    const pending: CarrierProfile = {
      id: carrierId,
      missionCount: 0,
      rating: 5.0,
      status: 'pending',
      wallet: { balance: 0, transactions: [] },
    };
    persist({ ...user, carrier: pending });
  };

  const approveCarrier = () => {
    if (!user?.carrier) return;
    persist({
      ...user,
      activeAccount: 'carrier',
      carrier: {
        ...user.carrier,
        status: 'approved',
        missionCount: 18,
        rating: 4.8,
        wallet: DEFAULT_CARRIER_WALLET,
      },
    });
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    persist({ ...user, ...updates });
  };

  return (
    <AuthContext.Provider value={{
      user, isLoading, isAuthenticated: !!user,
      login, register, logout,
      switchAccount, submitCarrierRequest, approveCarrier,
      updateUser,
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
