import React, { useState } from 'react';
import { Sparkles, RefreshCcw } from 'lucide-react';
import useFinanceStore from '../../store/financeStore';
import { cn } from '../../utils/cn';

const AIFinanceCard = () => {
    const { fetchInsights } = useFinanceStore();
    const [loading, setLoading] = useState(false);
    const [insights, setInsights] = useState(null);

    const handleGetInsights = async () => {
        setLoading(true);
        const result = await fetchInsights();
        setInsights(result);
        setLoading(false);
    };

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">AI Financial Insights</h3>
                </div>
                {!insights && (
                    <button
                        onClick={handleGetInsights}
                        disabled={loading}
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Analyzing...' : 'Analyze'}
                    </button>
                )}
            </div>

            {insights ? (
                <div className="space-y-4">
                    <div className="prose dark:prose-invert text-sm text-gray-700 dark:text-gray-300 max-w-none whitespace-pre-line">
                        {insights}
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={handleGetInsights}
                            disabled={loading}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            title="Refresh Analysis"
                        >
                            <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
                        </button>
                    </div>
                </div>
            ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    Get personalized spending trends and saving tips based on your recent transactions.
                </p>
            )}
        </div>
    );
};

export default AIFinanceCard;
