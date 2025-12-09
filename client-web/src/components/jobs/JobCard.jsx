import React from 'react';
import { Briefcase, Trash2, ExternalLink, BrainCircuit, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../utils/cn';

const JobCard = ({ job, onEdit, onDelete, onPrep, onStatusChange }) => {
    const statusColors = {
        'Wishlist': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
        'Applied': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        'Interview': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
        'Offer': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        'Rejected': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    };

    return (
        <div className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all">
            {/* Header with Company & Role */}
            <div className="mb-3">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                        <h4 className="font-semibold text-base text-gray-900 dark:text-white mb-0.5">{job.role}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{job.company}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onPrep(job)}
                            className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                            title="Interview Prep"
                        >
                            <BrainCircuit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onEdit(job)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        >
                            <Briefcase className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(job._id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Status Badge */}
                <span className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                    statusColors[job.status] || statusColors['Wishlist']
                )}>
                    {job.status}
                </span>
            </div>

            {/* Skills Pills */}
            {job.skills && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {(Array.isArray(job.skills) ? job.skills : job.skills.split(',')).slice(0, 4).map((skill, i) => (
                        <span
                            key={i}
                            className="px-2 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                            {skill.trim()}
                        </span>
                    ))}
                    {(Array.isArray(job.skills) ? job.skills : job.skills.split(',')).length > 4 && (
                        <span className="text-xs text-gray-400">
                            +{(Array.isArray(job.skills) ? job.skills : job.skills.split(',')).length - 4}
                        </span>
                    )}
                </div>
            )}

            {/* Footer with Location & Date */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
                {/* Status Dropdown */}
                <select
                    value={job.status}
                    onChange={(e) => onStatusChange(job._id, e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer"
                >
                    <option value="Wishlist">📋 Wishlist</option>
                    <option value="Applied">📧 Applied</option>
                    <option value="Interview">📅 Interview</option>
                    <option value="Offer">🎉 Offer</option>
                    <option value="Rejected">❌ Rejected</option>
                </select>

                {/* Info Row */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-3">
                        {job.location && (
                            <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{job.location}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                                {job.dateApplied && !isNaN(new Date(job.dateApplied))
                                    ? format(new Date(job.dateApplied), 'MMM d')
                                    : 'Today'}
                            </span>
                        </div>
                    </div>
                    {job.link && (
                        <a
                            href={job.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobCard;
