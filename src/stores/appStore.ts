import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Business, CallLog, DailyStats, RevenueStats, Transaction, PaymentStatus } from '@/types/business';

interface AppState {
  selectedBusiness: Business | null;
  callLogs: CallLog[];
  transactions: Transaction[];
  dailyStats: DailyStats;
  revenueStats: RevenueStats;
  lastPaymentCount: number;
  showCelebration: boolean;
  celebrationData: { businessName: string; amount: number } | null;

  // Actions
  setSelectedBusiness: (business: Business | null) => void;
  addCallLog: (log: CallLog) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  incrementStat: (stat: keyof Omit<DailyStats, 'revenueToday' | 'pendingInvoices' | 'pendingInvoicesTotal'>) => void;
  addRevenue: (amount: number) => void;
  updateRevenueStats: (stats: Partial<RevenueStats>) => void;
  resetDailyStats: () => void;
  triggerCelebration: (businessName: string, amount: number) => void;
  hideCelebration: () => void;
  setLastPaymentCount: (count: number) => void;
}

const getInitialStats = (): DailyStats => ({
  leadsToday: 0,
  callsMade: 0,
  conversions: 0,
  sitesBuilt: 0,
  revenueToday: 0,
  pendingInvoices: 0,
  pendingInvoicesTotal: 0,
});

const getInitialRevenueStats = (): RevenueStats => ({
  totalRevenue: 0,
  thisMonth: 0,
  lastMonth: 0,
  thisWeek: 0,
  today: 0,
});

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedBusiness: null,
      callLogs: [],
      transactions: [],
      dailyStats: getInitialStats(),
      revenueStats: getInitialRevenueStats(),
      lastPaymentCount: 0,
      showCelebration: false,
      celebrationData: null,

      setSelectedBusiness: (business) => set({ selectedBusiness: business }),

      addCallLog: (log) =>
        set((state) => ({
          callLogs: [log, ...state.callLogs],
          dailyStats: {
            ...state.dailyStats,
            callsMade: state.dailyStats.callsMade + 1,
          },
        })),

      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [transaction, ...state.transactions],
        })),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      incrementStat: (stat) =>
        set((state) => ({
          dailyStats: {
            ...state.dailyStats,
            [stat]: state.dailyStats[stat] + 1,
          },
        })),

      addRevenue: (amount) =>
        set((state) => ({
          dailyStats: {
            ...state.dailyStats,
            revenueToday: state.dailyStats.revenueToday + amount,
          },
          revenueStats: {
            ...state.revenueStats,
            totalRevenue: state.revenueStats.totalRevenue + amount,
            thisMonth: state.revenueStats.thisMonth + amount,
            thisWeek: state.revenueStats.thisWeek + amount,
            today: state.revenueStats.today + amount,
          },
        })),

      updateRevenueStats: (stats) =>
        set((state) => ({
          revenueStats: { ...state.revenueStats, ...stats },
        })),

      resetDailyStats: () => set({ dailyStats: getInitialStats() }),

      triggerCelebration: (businessName, amount) =>
        set({
          showCelebration: true,
          celebrationData: { businessName, amount },
        }),

      hideCelebration: () =>
        set({
          showCelebration: false,
          celebrationData: null,
        }),

      setLastPaymentCount: (count) => set({ lastPaymentCount: count }),
    }),
    {
      name: 'ghost-hunter-storage-v2',
      partialize: (state) => ({
        callLogs: state.callLogs,
        transactions: state.transactions,
        dailyStats: state.dailyStats,
        revenueStats: state.revenueStats,
        lastPaymentCount: state.lastPaymentCount,
      }),
    }
  )
);
