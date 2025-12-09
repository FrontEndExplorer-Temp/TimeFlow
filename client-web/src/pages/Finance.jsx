import React, { useEffect, useState } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useFinanceStore from '../store/financeStore';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { cn } from '../utils/cn';
import { format } from 'date-fns';
import AIFinanceCard from '../components/finance/AIFinanceCard';

const Finance = () => {
    const {
        transactions,
        budgets,
        monthlyStats,
        fetchTransactions,
        fetchBudgets,
        fetchMonthlyStats,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        setBudget,
        deleteBudget,
        isLoading
    } = useFinanceStore();

    const [activeTab, setActiveTab] = useState('transactions');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
    const {
        register: registerBudget,
        handleSubmit: handleSubmitBudget,
        reset: resetBudget,
        formState: { errors: budgetErrors }
    } = useForm();

    useEffect(() => {
        const today = new Date();
        const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        fetchTransactions();
        fetchBudgets(monthStr);
        fetchMonthlyStats(monthStr);
    }, [fetchTransactions, fetchBudgets, fetchMonthlyStats]);

    const handleEditTransaction = (transaction) => {
        setEditingTransaction(transaction);
        setValue('type', transaction.type);
        setValue('amount', transaction.amount);
        setValue('paymentMethod', transaction.paymentMethod || 'Cash');
        setValue('category', transaction.category);
        setValue('date', new Date(transaction.date).toISOString().split('T')[0]);
        setValue('description', transaction.description);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTransaction(null);
        reset();
    };

    const onSubmit = async (data) => {
        let success;
        if (editingTransaction) {
            success = await updateTransaction(editingTransaction._id, {
                ...data,
                amount: parseFloat(data.amount)
            });
        } else {
            success = await addTransaction({
                ...data,
                amount: parseFloat(data.amount)
            });
        }

        if (success) {
            handleCloseModal();
        }
    };

    const onBudgetSubmit = async (data) => {
        const today = new Date();
        const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

        const success = await setBudget({
            ...data,
            month: monthStr,
            monthlyLimit: parseFloat(data.monthlyLimit)
        });

        if (success) {
            setIsBudgetModalOpen(false);
            resetBudget();
        }
    };

    const chartData = [
        { name: 'Income', amount: monthlyStats?.totalIncome || 0 },
        { name: 'Expense', amount: monthlyStats?.totalExpense || 0 },
    ];

    const getBudgetProgress = (category, limit) => {
        const spent = transactions
            .filter(t => t.category === category && t.type === 'Expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const percentage = Math.min((spent / limit) * 100, 100);
        const remaining = limit - spent;

        let color = 'bg-green-500';
        if (percentage >= 90) color = 'bg-red-500';
        else if (percentage >= 70) color = 'bg-yellow-500';

        return { spent, percentage, remaining, color };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Finance</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track your income and expenses</p>
                </div>
                <Button onClick={() => {
                    if (activeTab === 'transactions') {
                        setEditingTransaction(null);
                        reset();
                        setIsModalOpen(true);
                    } else {
                        setIsBudgetModalOpen(true);
                    }
                }}>
                    <Plus className="w-4 h-4 mr-2" />
                    {activeTab === 'transactions' ? 'New Transaction' : 'New Budget'}
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Income</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                ${monthlyStats?.totalIncome?.toFixed(2) || '0.00'}
                            </p>
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Expense</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                ${monthlyStats?.totalExpense?.toFixed(2) || '0.00'}
                            </p>
                        </div>
                        <TrendingDown className="w-5 h-5 text-red-600" />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Net Balance</p>
                            <p className={cn(
                                "text-2xl font-semibold",
                                (monthlyStats?.totalIncome - monthlyStats?.totalExpense) >= 0
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                            )}>
                                ${((monthlyStats?.totalIncome || 0) - (monthlyStats?.totalExpense || 0)).toFixed(2)}
                            </p>
                        </div>
                        <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('transactions')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                        activeTab === 'transactions'
                            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    )}
                >
                    Transactions
                </button>
                <button
                    onClick={() => setActiveTab('budgets')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                        activeTab === 'budgets'
                            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    )}
                >
                    Budgets
                </button>
            </div>

            {activeTab === 'transactions' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* AI Card */}
                        <AIFinanceCard />

                        {/* Recent Transactions List (Full) */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Transactions</h2>
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                {transactions.length === 0 ? (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">No transactions yet.</p>
                                ) : (
                                    transactions.map((t) => (
                                        <div key={t._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                            <div className="flex items-center space-x-3">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center",
                                                    t.type === 'Income'
                                                        ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                                        : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                                )}>
                                                    {t.type === 'Income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{t.category}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{format(new Date(t.date), 'MMM d, yyyy')} • {t.paymentMethod}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={cn(
                                                    "font-medium",
                                                    t.type === 'Income' ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                                )}>
                                                    {t.type === 'Income' ? '+' : '-'}${t.amount}
                                                </span>
                                                <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEditTransaction(t)}
                                                        className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 pointer-events-auto"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteTransaction(t._id)}
                                                        className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 pointer-events-auto"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Chart */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Overview</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                    <XAxis dataKey="name" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    />
                                    <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {budgets.length === 0 ? (
                        <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400">No budgets set for this month.</p>
                            <Button variant="outline" className="mt-4" onClick={() => setIsBudgetModalOpen(true)}>
                                Set First Budget
                            </Button>
                        </div>
                    ) : (
                        budgets.map((budget) => {
                            const { spent, percentage, remaining, color } = getBudgetProgress(budget.category, budget.monthlyLimit);
                            return (
                                <div key={budget._id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{budget.category}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Limit: ${budget.monthlyLimit}</p>
                                        </div>
                                        <button
                                            onClick={() => deleteBudget(budget._id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                                        <div
                                            className={`h-2.5 rounded-full ${color}`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-300 font-medium">${spent} spent</span>
                                        <span className="text-gray-500 dark:text-gray-400">
                                            {remaining >= 0 ? `$${remaining} left` : `$${Math.abs(remaining)} over`}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Transaction Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingTransaction ? "Edit Transaction" : "Add Transaction"}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Type
                            </label>
                            <select
                                {...register('type', { required: true })}
                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            >
                                <option value="Expense">Expense</option>
                                <option value="Income">Income</option>
                            </select>
                        </div>

                        <Input
                            label="Amount"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...register('amount', { required: 'Amount is required' })}
                            error={errors.amount?.message}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Payment Method
                        </label>
                        <select
                            {...register('paymentMethod', { required: 'Required' })}
                            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="UPI">UPI</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <Input
                        label="Category"
                        placeholder="e.g., Food, Salary, Rent"
                        {...register('category', { required: 'Category is required' })}
                        error={errors.category?.message}
                    />

                    <Input
                        label="Date"
                        type="date"
                        defaultValue={new Date().toISOString().split('T')[0]}
                        {...register('date', { required: 'Date is required' })}
                        error={errors.date?.message}
                    />

                    <Input
                        label="Description (Optional)"
                        placeholder="Add notes..."
                        {...register('description')}
                    />

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="ghost" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            {editingTransaction ? 'Save Changes' : 'Add Transaction'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Set Budget Modal */}
            <Modal
                isOpen={isBudgetModalOpen}
                onClose={() => setIsBudgetModalOpen(false)}
                title="Set Monthly Budget"
            >
                <form onSubmit={handleSubmitBudget(onBudgetSubmit)} className="space-y-4">
                    <Input
                        label="Category"
                        placeholder="e.g., Food, Transport"
                        {...registerBudget('category', { required: 'Category is required' })}
                        error={budgetErrors.category?.message}
                    />

                    <Input
                        label="Monthly Limit"
                        type="number"
                        step="1"
                        placeholder="0"
                        {...registerBudget('monthlyLimit', { required: 'Limit is required' })}
                        error={budgetErrors.monthlyLimit?.message}
                    />

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsBudgetModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            Save Budget
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Finance;
