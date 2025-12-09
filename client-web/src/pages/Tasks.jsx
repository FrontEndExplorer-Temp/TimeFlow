import React, { useEffect, useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import useTaskStore from '../store/taskStore';
import TaskCard from '../components/tasks/TaskCard';
import TaskCalendar from '../components/tasks/TaskCalendar'; // New import
import TaskStats from '../components/tasks/TaskStats';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import AIBreakdownModal from '../components/tasks/AIBreakdownModal';
import { cn } from '../utils/cn';

const Tasks = () => {
    const { tasks, fetchTasks, addTask, updateTask, isLoading } = useTaskStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [view, setView] = useState('board'); // 'board' | 'calendar'
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

    const taskTitle = watch('title');
    const taskDescription = watch('description');

    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [subtasks, setSubtasks] = useState([]);
    const [subtaskInput, setSubtaskInput] = useState('');
    const [editingTask, setEditingTask] = useState(null);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleAddTag = (e) => {
        e.preventDefault();
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleAddSubtask = (e) => {
        e.preventDefault();
        if (subtaskInput.trim()) {
            setSubtasks([...subtasks, { title: subtaskInput.trim(), completed: false }]);
            setSubtaskInput('');
        }
    };

    const handleRemoveSubtask = (index) => {
        setSubtasks(subtasks.filter((_, i) => i !== index));
    };

    const handleAddSubtasksFromAI = (newSubtasks) => {
        const formattedSubtasks = newSubtasks.map(title => ({ title, completed: false }));
        setSubtasks([...subtasks, ...formattedSubtasks]);
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setTags(task.tags || []);
        setSubtasks(task.subtasks || []);
        reset({
            title: task.title,
            description: task.description,
            priority: task.priority,
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
        setTags([]);
        setSubtasks([]);
        reset({ title: '', description: '', priority: 'Medium', dueDate: '' });
    };

    const onSubmit = async (data) => {
        const taskData = {
            ...data,
            tags,
            subtasks,
            status: editingTask ? editingTask.status : 'Backlog',
        };

        let success;
        if (editingTask) {
            success = await updateTask(editingTask._id, taskData);
        } else {
            success = await addTask(taskData);
        }

        if (success !== false) {
            handleCloseModal();
        }
    };

    const columns = [
        { id: 'Backlog', label: 'Backlog', color: 'bg-gray-100 dark:bg-gray-800' },
        { id: 'Today', label: 'Today', color: 'bg-purple-50 dark:bg-purple-900/10' },
        { id: 'In Progress', label: 'In Progress', color: 'bg-orange-50 dark:bg-orange-900/10' },
        { id: 'Completed', label: 'Completed', color: 'bg-green-50 dark:bg-green-900/10' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Tasks</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your tasks efficiently</p>
                </div>
                <Button onClick={() => {
                    setEditingTask(null);
                    reset({ title: '', description: '', priority: 'Medium', dueDate: '' });
                    setTags([]);
                    setSubtasks([]);
                    setIsModalOpen(true);
                }}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Task
                </Button>
            </div>

            {/* Stats */}
            <TaskStats tasks={tasks} />

            {/* Controls Row */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <button
                        onClick={() => setView('board')}
                        className={cn(
                            "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                            view === 'board'
                                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        )}
                    >
                        Board
                    </button>
                    <button
                        onClick={() => setView('calendar')}
                        className={cn(
                            "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                            view === 'calendar'
                                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        )}
                    >
                        Calendar
                    </button>
                </div>
            </div>

            {/* Content View */}
            {view === 'board' ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {columns.map((column) => (
                        <div key={column.id} className="flex flex-col">
                            {/* Column Header */}
                            <div className={cn("rounded-lg p-3 mb-3", column.color)}>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300">{column.label}</h3>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {tasks.filter(t => t.status === column.id).length}
                                    </span>
                                </div>
                            </div>

                            {/* Cards */}
                            <div className="space-y-3 flex-1">
                                {tasks.filter(t => t.status === column.id).map((task) => (
                                    <TaskCard
                                        key={task._id}
                                        task={task}
                                        onEdit={() => handleEditTask(task)}
                                    />
                                ))}

                                {tasks.filter(t => t.status === column.id).length === 0 && (
                                    <div className="text-center py-8 text-sm text-gray-400">
                                        No tasks
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <TaskCalendar tasks={tasks} onEdit={handleEditTask} />
            )}

            {/* Modal - Same as before */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTask ? "Edit Task" : "Create Task"}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input label="Title" placeholder="Task title" {...register('title', { required: 'Title is required' })} error={errors.title?.message} />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea {...register('description')} rows={3} className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white" placeholder="Add details..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                            <select {...register('priority')} className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <Input label="Due Date" type="date" {...register('dueDate')} />
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
                        <div className="flex gap-2 mb-2">
                            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)} placeholder="Add tag..." className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                            <Button type="button" variant="outline" onClick={handleAddTag}>Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag, i) => (
                                <span key={i} className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                    {tag} <button type="button" onClick={() => handleRemoveTag(tag)}>×</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Subtasks */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subtasks</label>
                            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAIModalOpen(true)} disabled={!taskTitle && !taskDescription}>
                                <Sparkles className="w-4 h-4 mr-1" />AI
                            </Button>
                        </div>
                        <div className="flex gap-2 mb-2">
                            <input type="text" value={subtaskInput} onChange={(e) => setSubtaskInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask(e)} placeholder="Add subtask..." className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
                            <Button type="button" variant="outline" onClick={handleAddSubtask}>Add</Button>
                        </div>
                        <div className="space-y-1">
                            {subtasks.map((st, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                    <span className="flex-1">• {st.title}</span>
                                    <button type="button" onClick={() => handleRemoveSubtask(i)} className="text-red-500">×</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={handleCloseModal}>Cancel</Button>
                        <Button type="submit" isLoading={isLoading}>{editingTask ? "Save" : "Create"}</Button>
                    </div>
                </form>
            </Modal>

            <AIBreakdownModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} taskTitle={taskTitle} taskDescription={taskDescription} onAddSubtasks={handleAddSubtasksFromAI} />
        </div>
    );
};

export default Tasks;
