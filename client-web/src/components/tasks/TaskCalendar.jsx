import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import TaskCard from './TaskCard';

const TaskCalendar = ({ tasks, onEdit }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Filter tasks for the selected date
    const tasksForDate = tasks.filter(task => {
        if (!task.dueDate) return false;
        return isSameDay(new Date(task.dueDate), selectedDate);
    });

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    // Get dots for dates with tasks
    const getTaskDots = (date) => {
        const tasksOnDate = tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), date));
        if (tasksOnDate.length === 0) return null;

        // Priority colors
        const hasHigh = tasksOnDate.some(t => t.priority === 'High');
        const hasMedium = tasksOnDate.some(t => t.priority === 'Medium');

        let color = 'bg-green-500'; // Default low
        if (hasHigh) color = 'bg-red-500';
        else if (hasMedium) color = 'bg-yellow-500';

        return (
            <div className={cn("w-1.5 h-1.5 rounded-full mt-1", color)} />
        );
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Calendar Widget */}
            <div className="lg:w-80 flex-shrink-0">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={prevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {format(currentDate, 'MMMM yyyy')}
                        </h3>
                        <button onClick={nextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <span key={d} className="text-xs font-medium text-gray-400 uppercase">{d}</span>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {/* Empty cells for start of month offset if needed (simplified for now) */}
                        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}

                        {daysInMonth.map((date, i) => {
                            const isSelected = isSameDay(date, selectedDate);
                            const isToday = isSameDay(date, new Date());

                            return (
                                <button
                                    key={i}
                                    onClick={() => setSelectedDate(date)}
                                    className={cn(
                                        "h-9 w-9 rounded-full flex flex-col items-center justify-center text-sm relative transition-all",
                                        isSelected
                                            ? "bg-blue-600 text-white shadow-md transform scale-105"
                                            : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300",
                                        isToday && !isSelected && "border border-blue-600 text-blue-600"
                                    )}
                                >
                                    <span>{format(date, 'd')}</span>
                                    {getTaskDots(date)}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Task List for Selected Date */}
            <div className="flex-1">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Tasks for {format(selectedDate, 'MMMM do, yyyy')}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {tasksForDate.length} tasks scheduled
                    </p>
                </div>

                <div className="space-y-3">
                    {tasksForDate.length > 0 ? (
                        tasksForDate.map(task => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                onEdit={() => onEdit(task)}
                            />
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400">No tasks for this day</p>
                            <p className="text-xs text-gray-400 mt-1">Select another date or add a new task.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskCalendar;
