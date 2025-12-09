import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../services/api';
import toast from 'react-hot-toast';
import safeStorage from '../utils/safeStorage';

const useAiStore = create(
    persist(
        (set, get) => ({
            dailyPlan: null,
            taskSuggestions: [],
            habitInsights: [],
            financeInsights: null,
            isGenerating: false,
            error: null,
            lastUpdated: null,

            generateDailyPlan: async () => {
                set({ isGenerating: true, error: null });
                try {
                    const response = await api.post('/ai/daily-plan');
                    set({
                        dailyPlan: response.data,
                        isGenerating: false,
                        lastUpdated: new Date().toISOString()
                    });
                    toast.success('Daily plan generated');
                } catch (e) {
                    set({ error: e.message, isGenerating: false });
                    toast.error('Failed to generate plan');
                }
            },

            getTaskSuggestions: async () => {
                set({ isGenerating: true, error: null });
                try {
                    const response = await api.post('/ai/task-suggestions');
                    set({
                        taskSuggestions: response.data,
                        isGenerating: false,
                        lastUpdated: new Date().toISOString()
                    });
                    toast.success('Task suggestions updated');
                } catch (e) {
                    set({ error: e.message, isGenerating: false });
                    toast.error('Failed to get suggestions');
                }
            },

            getHabitInsights: async () => {
                set({ isGenerating: true, error: null });
                try {
                    const response = await api.post('/ai/habit-insights');
                    set({
                        habitInsights: response.data,
                        isGenerating: false,
                        lastUpdated: new Date().toISOString()
                    });
                    toast.success('Habit insights updated');
                } catch (e) {
                    set({ error: e.message, isGenerating: false });
                    toast.error('Failed to get insights');
                }
            },

            getFinanceInsights: async () => {
                set({ isGenerating: true, error: null });
                try {
                    const response = await api.post('/ai/finance-insights');
                    set({
                        financeInsights: response.data,
                        isGenerating: false,
                        lastUpdated: new Date().toISOString()
                    });
                    toast.success('Finance insights updated');
                } catch (e) {
                    set({ error: e.message, isGenerating: false });
                    toast.error('Failed to get finance insights');
                }
            },

            reset: () => set({
                dailyPlan: null,
                taskSuggestions: [],
                habitInsights: [],
                financeInsights: null,
                error: null,
                lastUpdated: null
            })
        }),
        {
            name: 'ai-storage',
            storage: createJSONStorage(() => safeStorage), // Use safeStorage for web persistence
        }
    )
);

export default useAiStore;
