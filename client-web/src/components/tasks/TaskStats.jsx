import React from 'react';
import { ListTodo, CheckCircle2, Clock, Zap } from 'lucide-react';

const TaskStats = ({ tasks }) => {
    const stats = {
        total: tasks.length,
        backlog: tasks.filter(t => t.status === 'Backlog').length,
        today: tasks.filter(t => t.status === 'Today').length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        completed: tasks.filter(t => t.status === 'Completed').length,
    };

    const completionRate = stats.total > 0
        ? Math.round((stats.completed / stats.total) * 100)
        : 0;

    const statCards = [
        { label: 'Total Tasks', value: stats.total, icon: ListTodo, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        { label: 'Today', value: stats.today, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        { label: 'In Progress', value: stats.inProgress, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    ];

    return (
        <div className="mb-6 space-y-3">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {statCards.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white dark:bg-gray-800 rounded-xl p-3.5 shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            <span className={`${stat.bg} ${stat.color} px-2.5 py-0.5 rounded-lg text-sm font-bold`}>
                                {stat.value}
                            </span>
                        </div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            {stat.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Completion Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Completion Rate
                    </h3>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {completionRate}%
                    </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-300"
                        style={{ width: `${completionRate}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default TaskStats;
