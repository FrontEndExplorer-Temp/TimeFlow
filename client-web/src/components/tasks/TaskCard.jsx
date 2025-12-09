import React from 'react';
import { format } from 'date-fns';
import { Trash2, Calendar, Edit2, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import useTaskStore from '../../store/taskStore';

const TaskCard = ({ task, onEdit }) => {
    const { updateTask, deleteTask } = useTaskStore();

    const priorityColors = {
        Low: 'border-l-blue-500',
        Medium: 'border-l-yellow-500',
        High: 'border-l-red-500',
    };

    const handleSubtaskToggle = (index) => {
        const updatedSubtasks = task.subtasks.map((st, i) =>
            i === index ? { ...st, completed: !st.completed } : st
        );
        updateTask(task._id, { subtasks: updatedSubtasks });
    };

    const completedSubtasks = task.subtasks ? task.subtasks.filter(st => st.completed).length : 0;
    const totalSubtasks = task.subtasks ? task.subtasks.length : 0;

    return (
        <div
            className={cn(
                "group bg-white dark:bg-gray-800 rounded-lg border-l-4 border-r border-t border-b border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow",
                priorityColors[task.priority] || priorityColors.Low
            )}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <h3 className={cn(
                    "text-sm font-medium text-gray-900 dark:text-white flex-1 pr-2",
                    task.status === 'Completed' && "line-through text-gray-500 dark:text-gray-400"
                )}>
                    {task.title}
                </h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={onEdit}
                        className="p-1 text-gray-400 hover:text-blue-600 rounded"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => deleteTask(task._id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Description */}
            {task.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {task.description}
                </p>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {task.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Subtasks List */}
            {task.subtasks && task.subtasks.length > 0 && (
                <div className="mb-3 space-y-1">
                    {task.subtasks.map((subtask, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 text-xs group/subtask"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSubtaskToggle(index);
                            }}
                        >
                            <div className={cn(
                                "w-3.5 h-3.5 border rounded flex items-center justify-center cursor-pointer transition-colors",
                                subtask.completed
                                    ? "bg-blue-500 border-blue-500 text-white"
                                    : "border-gray-300 dark:border-gray-500 hover:border-blue-500"
                            )}>
                                {subtask.completed && <CheckCircle2 className="w-2.5 h-2.5" />}
                            </div>
                            <span className={cn(
                                "flex-1 cursor-pointer transition-colors",
                                subtask.completed
                                    ? "text-gray-400 dark:text-gray-500 line-through"
                                    : "text-gray-700 dark:text-gray-200"
                            )}>
                                {subtask.title}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <span className={cn(
                        "px-2 py-1 rounded font-medium",
                        task.priority === 'High' && "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
                        task.priority === 'Medium' && "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
                        task.priority === 'Low' && "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                    )}>
                        {task.priority}
                    </span>

                    {task.dueDate && (
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3 h-3" />
                            <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                        </div>
                    )}
                </div>

                {/* Status Dropdown */}
                <select
                    value={task.status}
                    onChange={(e) => updateTask(task._id, { status: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer"
                >
                    <option value="Backlog">📋 Backlog</option>
                    <option value="Today">⏰ Today</option>
                    <option value="In Progress">⚡ In Progress</option>
                    <option value="Completed">✅ Completed</option>
                </select>
            </div>
        </div>
    );
};

export default TaskCard;
