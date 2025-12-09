// AI Store using Zustand
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const useAiStore = create(
    persist(
        (set, get) => ({
            dailyPlan: null,
            taskSuggestions: [],
            habitInsights: [],
            isGenerating: false,
            error: null,
            lastUpdated: null,

            // Generate daily plan
            generateDailyPlan: async () => {
                set({ isGenerating: true, error: null });
                try {
                    const response = await api.post('/ai/daily-plan');
                    set({
                        dailyPlan: response.data,
                        isGenerating: false,
                        lastUpdated: new Date().toISOString()
                    });
                } catch (e) {
                    set({ error: e.message, isGenerating: false });
                }
            },

            // Get task suggestions
            getTaskSuggestions: async () => {
                set({ isGenerating: true, error: null });
                try {
                    const response = await api.post('/ai/task-suggestions');
                    set({
                        taskSuggestions: response.data,
                        isGenerating: false,
                        lastUpdated: new Date().toISOString()
                    });
                } catch (e) {
                    set({ error: e.message, isGenerating: false });
                }
            },

            // Get habit insights
            getHabitInsights: async () => {
                set({ isGenerating: true, error: null });
                try {
                    const response = await api.post('/ai/habit-insights');
                    set({
                        habitInsights: response.data,
                        isGenerating: false,
                        lastUpdated: new Date().toISOString()
                    });
                } catch (e) {
                    set({ error: e.message, isGenerating: false });
                }
            },

            // Get finance insights
            getFinanceInsights: async () => {
                set({ isGenerating: true, error: null });
                try {
                    const response = await api.post('/ai/finance-insights');
                    set({
                        financeInsights: response.data,
                        isGenerating: false,
                        lastUpdated: new Date().toISOString()
                    });
                } catch (e) {
                    set({ error: e.message, isGenerating: false });
                }
            },

            // Check if data is expired (not from today)
            checkExpiration: () => {
                const { lastUpdated } = get();
                if (!lastUpdated) return;

                const today = new Date().toISOString().split('T')[0];
                const lastDate = lastUpdated.split('T')[0];

                if (today !== lastDate) {
                    get().reset();
                }
            },

            // Reset all AI data
            reset: () => set({
                dailyPlan: null,
                taskSuggestions: [],
                habitInsights: [],
                error: null,
                lastUpdated: null
            })
        }),
        {
            name: 'ai-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

export default useAiStore;
