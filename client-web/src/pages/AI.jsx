import React from 'react';
import { Sparkles, Calendar, CheckSquare, TrendingUp, DollarSign } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import useAiStore from '../store/aiStore';
import Button from '../components/ui/Button';

const AISkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col animate-pulse">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 w-full">
                <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            </div>
            <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
    </div>
);



const AICardContent = ({ data, children, isLoading }) => {
    if (isLoading && !data) return <AISkeleton />;
    if (!data) return (
        <div className="flex items-center justify-center h-full text-gray-400 text-xs italic">
            Click generate to get AI insights
        </div>
    );
    return typeof data === 'string' ? <ReactMarkdown>{data}</ReactMarkdown> : children;
};

const AICard = ({ title, icon: Icon, onGenerate, data, isLoading, children }) => {
    if (isLoading && !data) return <AISkeleton />;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                        <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                </div>
                <Button size="sm" onClick={onGenerate} isLoading={isLoading} variant="outline">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate
                </Button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-[200px] text-sm text-gray-600 dark:text-gray-300 prose dark:prose-invert max-w-none">
                {typeof data === 'string' ? <ReactMarkdown>{data}</ReactMarkdown> : (children || data)}
                {!data && (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs italic">
                        Click generate to get AI insights
                    </div>
                )}
            </div>
        </div>
    );
};

const AI = () => {
    const {
        dailyPlan,
        taskSuggestions,
        habitInsights,
        financeInsights,
        generateDailyPlan,
        getTaskSuggestions,
        getHabitInsights,
        getFinanceInsights,
        isGenerating
    } = useAiStore();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
                    <p className="text-gray-500 dark:text-gray-400">Smart insights to optimize your life</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Plan */}
                <AICard
                    title="Daily Plan"
                    icon={Calendar}
                    onGenerate={generateDailyPlan}
                    data={dailyPlan?.plan}
                    isLoading={isGenerating}
                />

                {/* Task Suggestions */}
                <AICard
                    title="Task Suggestions"
                    icon={CheckSquare}
                    onGenerate={getTaskSuggestions}
                    data={taskSuggestions}
                    isLoading={isGenerating}
                >
                    <ul className="space-y-2">
                        {Array.isArray(taskSuggestions) && taskSuggestions.map((suggestion, i) => (
                            <li key={i} className="flex items-start space-x-2">
                                <span className="text-purple-500 mt-1">•</span>
                                <span>{suggestion}</span>
                            </li>
                        ))}
                    </ul>
                </AICard>

                {/* Habit Insights */}
                <AICard
                    title="Habit Insights"
                    icon={TrendingUp}
                    onGenerate={getHabitInsights}
                    data={habitInsights}
                    isLoading={isGenerating}
                >
                    <ul className="space-y-2">
                        {Array.isArray(habitInsights) && habitInsights.map((insight, i) => (
                            <li key={i} className="flex items-start space-x-2">
                                <span className="text-green-500 mt-1">•</span>
                                <span>{insight}</span>
                            </li>
                        ))}
                    </ul>
                </AICard>

                {/* Finance Insights */}
                <AICard
                    title="Finance Insights"
                    icon={DollarSign}
                    onGenerate={getFinanceInsights}
                    data={financeInsights?.analysis}
                    isLoading={isGenerating}
                />
            </div>
        </div>
    );
};

export default AI;
