import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Holding, PriceAlert } from '../types';

interface PortfolioState {
  holdings: Holding[];
  alerts: PriceAlert[];
  addHolding: (holding: Holding) => void;
  removeHolding: (id: string) => void;
  updateHolding: (id: string, updates: Partial<Holding>) => void;
  setHoldings: (holdings: Holding[]) => void;
  addAlert: (alert: PriceAlert) => void;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      holdings: [],
      alerts: [],

      addHolding: (holding) =>
        set((state) => {
          // Prevent duplicate tickers
          const exists = state.holdings.find(
            (h) => h.ticker === holding.ticker
          );
          if (exists) return state;
          return { holdings: [...state.holdings, holding] };
        }),

      removeHolding: (id) =>
        set((state) => ({
          holdings: state.holdings.filter((h) => h.id !== id),
        })),

      updateHolding: (id, updates) =>
        set((state) => ({
          holdings: state.holdings.map((h) =>
            h.id === id ? { ...h, ...updates } : h
          ),
        })),

      setHoldings: (holdings) => set({ holdings }),

      addAlert: (alert) =>
        set((state) => ({ alerts: [...state.alerts, alert] })),

      removeAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== id),
        })),

      toggleAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, isActive: !a.isActive } : a
          ),
        })),
    }),
    {
      name: 'portfolioiq-store',
    }
  )
);
