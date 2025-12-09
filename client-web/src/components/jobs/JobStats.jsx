import React from 'react';
import { Briefcase, Calendar, Trophy, Send, Target, TrendingUp } from 'lucide-react';

const JobStats = ({ jobs }) => {
    const stats = {
        total: jobs.length,
        applied: jobs.filter(j => j.status === 'Applied').length,
        interviews: jobs.filter(j => j.status === 'Interview').length,
        offers: jobs.filter(j => j.status === 'Offer').length,
    };

    const responseRate = stats.total > 0
        ? Math.round((stats.interviews / stats.total) * 100)
        : 0;

    const successRate = stats.total > 0
        ? Math.round((stats.offers / stats.total) * 100)
        : 0;

    const statCards = [
        { label: 'Total', value: stats.total, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        { label: 'Applied', value: stats.applied, icon: Send, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { label: 'Interviews', value: stats.interviews, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { label: 'Offers', value: stats.offers, icon: Trophy, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    ];

    const rateCards = [
        { label: 'Response Rate', value: `${responseRate}%`, icon: Target, color: 'text-blue-600', bgGradient: 'from-blue-500 to-blue-600' },
        { label: 'Success Rate', value: `${successRate}%`, icon: TrendingUp, color: 'text-green-600', bgGradient: 'from-green-500 to-green-600' },
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

            {/* Rate Cards */}
            <div className="grid grid-cols-2 gap-3">
                {rateCards.map((rate) => (
                    <div
                        key={rate.label}
                        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center"
                    >
                        <rate.icon className={`w-6 h-6 ${rate.color} mx-auto mb-2`} />
                        <p className={`text-2xl font-bold bg-gradient-to-r ${rate.bgGradient} bg-clip-text text-transparent`}>
                            {rate.value}
                        </p>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mt-1">
                            {rate.label}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JobStats;
