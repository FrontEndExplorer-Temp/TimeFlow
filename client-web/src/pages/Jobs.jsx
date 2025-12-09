import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import useJobStore from '../store/jobStore';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import JobStats from '../components/jobs/JobStats';
import JobCard from '../components/jobs/JobCard';
import InterviewPrepModal from '../components/InterviewPrepModal';
import { cn } from '../utils/cn';

const JobSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
        <div className="mb-3">
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="flex gap-1">
                    <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
            <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
        <div className="flex gap-2 mb-3">
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between">
            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
    </div>
);

const Jobs = () => {
    const { jobs, fetchJobs, addJob, updateJob, deleteJob, getInterviewPrep, isLoading } = useJobStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPrepModalOpen, setIsPrepModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [prepData, setPrepData] = useState(null);
    const [prepLoading, setPrepLoading] = useState(false);
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleEdit = (job) => {
        setEditingJob(job);
        setValue('company', job.company);
        setValue('role', job.role);
        setValue('location', job.location);
        setValue('link', job.link);
        setValue('status', job.status);
        setValue('skills', job.skills);
        setValue('notes', job.notes);
        setIsModalOpen(true);
    };

    const handlePrep = async (job) => {
        setPrepLoading(true);
        setIsPrepModalOpen(true);
        const data = await getInterviewPrep(job.role, job.skills);
        setPrepData(data);
        setPrepLoading(false);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingJob(null);
        reset();
    };

    const onSubmit = async (data) => {
        let success;
        if (editingJob) {
            await updateJob(editingJob._id, data);
            success = true;
        } else {
            success = await addJob({
                ...data,
                dateApplied: new Date().toISOString()
            });
        }

        if (success) {
            handleCloseModal();
        }
    };

    const columns = [
        { id: 'Wishlist', label: 'Wishlist', color: 'bg-gray-100 dark:bg-gray-800' },
        { id: 'Applied', label: 'Applied', color: 'bg-blue-50 dark:bg-blue-900/10' },
        { id: 'Interview', label: 'Interview', color: 'bg-yellow-50 dark:bg-yellow-900/10' },
        { id: 'Offer', label: 'Offer', color: 'bg-green-50 dark:bg-green-900/10' },
        { id: 'Rejected', label: 'Rejected', color: 'bg-red-50 dark:bg-red-900/10' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Job Applications</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track your career opportunities</p>
                </div>
                <Button onClick={() => { setEditingJob(null); reset(); setIsModalOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Application
                </Button>
            </div>

            {/* Stats */}
            <JobStats jobs={jobs} />

            {/* Kanban Board */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {columns.map((column) => (
                    <div key={column.id} className="flex flex-col">
                        {/* Column Header */}
                        <div className={cn("rounded-lg p-3 mb-3", column.color)}>
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300">{column.label}</h3>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {jobs.filter(j => j.status === column.id).length}
                                </span>
                            </div>
                        </div>

                        {/* Cards */}
                        <div className="space-y-3 flex-1">
                            {jobs.filter(j => j.status === column.id).map((job) => (
                                <JobCard
                                    key={job._id}
                                    job={job}
                                    onEdit={handleEdit}
                                    onDelete={deleteJob}
                                    onPrep={handlePrep}
                                    onStatusChange={(id, status) => updateJob(id, { status })}
                                />
                            ))}

                            {isLoading && jobs.length === 0 && (
                                <>
                                    <JobSkeleton />
                                    <JobSkeleton />
                                </>
                            )}

                            {jobs.filter(j => j.status === column.id).length === 0 && (
                                <div className="text-center py-8 text-sm text-gray-400">
                                    No jobs
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingJob ? "Edit Application" : "New Application"}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input label="Company" placeholder="Company name" {...register('company', { required: 'Required' })} error={errors.company?.message} />
                    <Input label="Role" placeholder="Job title" {...register('role', { required: 'Required' })} error={errors.role?.message} />
                    <Input label="Skills" placeholder="e.g. React, Node.js" {...register('skills')} />
                    <Input label="Location" placeholder="e.g. Remote, NY" {...register('location')} />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                        <textarea {...register('notes')} rows={3} className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white" placeholder="Add notes..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                        <select {...register('status')} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm dark:text-white">
                            {columns.map(c => (<option key={c.id} value={c.id}>{c.label}</option>))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={handleCloseModal}>Cancel</Button>
                        <Button type="submit" isLoading={isLoading}>{editingJob ? "Save" : "Create"}</Button>
                    </div>
                </form>
            </Modal>

            {/* Interview Prep Modal */}
            <InterviewPrepModal
                isOpen={isPrepModalOpen}
                onClose={() => setIsPrepModalOpen(false)}
                prepData={prepData}
                loading={prepLoading}
            />
        </div>
    );
};

export default Jobs;
