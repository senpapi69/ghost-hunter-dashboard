import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Business, BuildJob, CallLog, DailyStats } from '@/types/business';

interface AppState {
  selectedBusiness: Business | null;
  buildJobs: BuildJob[];
  callLogs: CallLog[];
  dailyStats: DailyStats;
  
  // Actions
  setSelectedBusiness: (business: Business | null) => void;
  addBuildJob: (job: BuildJob) => void;
  updateBuildJob: (id: string, updates: Partial<BuildJob>) => void;
  addCallLog: (log: CallLog) => void;
  incrementStat: (stat: keyof DailyStats) => void;
  resetDailyStats: () => void;
}

const getInitialStats = (): DailyStats => ({
  leadsToday: 0,
  callsMade: 0,
  conversions: 0,
  sitesBuilt: 0,
});

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedBusiness: null,
      buildJobs: [],
      callLogs: [],
      dailyStats: getInitialStats(),

      setSelectedBusiness: (business) => set({ selectedBusiness: business }),

      addBuildJob: (job) =>
        set((state) => ({
          buildJobs: [job, ...state.buildJobs],
        })),

      updateBuildJob: (id, updates) =>
        set((state) => ({
          buildJobs: state.buildJobs.map((job) =>
            job.id === id ? { ...job, ...updates } : job
          ),
        })),

      addCallLog: (log) =>
        set((state) => ({
          callLogs: [log, ...state.callLogs],
          dailyStats: {
            ...state.dailyStats,
            callsMade: state.dailyStats.callsMade + 1,
          },
        })),

      incrementStat: (stat) =>
        set((state) => ({
          dailyStats: {
            ...state.dailyStats,
            [stat]: state.dailyStats[stat] + 1,
          },
        })),

      resetDailyStats: () => set({ dailyStats: getInitialStats() }),
    }),
    {
      name: 'ghost-hunter-storage',
      partialize: (state) => ({
        buildJobs: state.buildJobs,
        callLogs: state.callLogs,
        dailyStats: state.dailyStats,
      }),
    }
  )
);
