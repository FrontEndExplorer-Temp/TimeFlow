import { create } from 'zustand';
import api from '../services/api';
import toast from 'react-hot-toast';

const useFinanceStore = create((set, get) => ({
    transactions: [],
    budgets: [],
    monthlyStats: null,
    isLoading: false,
    error: null,

    fetchTransactions: async (startDate, endDate) => {
        set({ isLoading: true });
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const response = await api.get('/transactions', { params });
            set({ transactions: response.data, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    addTransaction: async (transactionData) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/transactions', transactionData);

            set((state) => ({
                transactions: [response.data, ...state.transactions],
                isLoading: false
            }));

            // Refresh stats
            const date = new Date(transactionData.date);
            const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            get().fetchMonthlyStats(monthStr);

            toast.success('Transaction added');
            return true;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            toast.error('Failed to add transaction');
            return false;
        }
    },

    deleteTransaction: async (id) => {
        try {
            set((state) => ({
                transactions: state.transactions.filter((t) => t._id !== id)
            }));
            await api.delete(`/transactions/${id}`);

            // Refresh stats
            const today = new Date();
            const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
            get().fetchMonthlyStats(monthStr);

            toast.success('Transaction deleted');
        } catch (error) {
            console.error('Delete failed', error);
            get().fetchTransactions();
            toast.error('Failed to delete transaction');
        }
    },

    updateTransaction: async (id, transactionData) => {
        set({ isLoading: true });
        try {
            const response = await api.put(`/transactions/${id}`, transactionData);

            set((state) => ({
                transactions: state.transactions.map((t) => (t._id === id ? response.data : t)),
                isLoading: false
            }));

            // Refresh stats
            const date = new Date(transactionData.date);
            const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            get().fetchMonthlyStats(monthStr);

            toast.success('Transaction updated');
            return true;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            toast.error('Failed to update transaction');
            return false;
        }
    },

    fetchInsights: async () => {
        try {
            const response = await api.post('/ai/finance-insights');
            return response.data.insights;
        } catch (error) {
            console.error('Failed to fetch AI insights', error);
            return null;
        }
    },

    fetchMonthlyStats: async (month) => {
        try {
            const response = await api.get(`/transactions/stats/${month}`);
            set({ monthlyStats: response.data });
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    },

    fetchBudgets: async (month) => {
        try {
            const response = await api.get('/budgets', { params: { month } });
            set({ budgets: response.data });
        } catch (error) {
            console.error('Failed to fetch budgets', error);
        }
    },

    setBudget: async (budgetData) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/budgets', budgetData);
            set((state) => {
                // Check if budget for this category already exists and update it, or add new
                const existingIndex = state.budgets.findIndex(b => b.category === budgetData.category);
                let newBudgets;
                if (existingIndex >= 0) {
                    newBudgets = [...state.budgets];
                    newBudgets[existingIndex] = response.data;
                } else {
                    newBudgets = [...state.budgets, response.data];
                }
                return { budgets: newBudgets, isLoading: false };
            });
            toast.success('Budget saved');
            return true;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            toast.error('Failed to save budget');
            return false;
        }
    },

    deleteBudget: async (id) => {
        try {
            set((state) => ({
                budgets: state.budgets.filter((b) => b._id !== id)
            }));
            await api.delete(`/budgets/${id}`);
            toast.success('Budget deleted');
        } catch (error) {
            console.error('Delete budget failed', error);
            toast.error('Failed to delete budget');
        }
    },

    reset: () => set({ transactions: [], budgets: [], monthlyStats: null, isLoading: false, error: null }),
}));

export default useFinanceStore;
