import React from 'react';
import { X, Code, Users, HelpCircle } from 'lucide-react';
import Modal from './ui/Modal';

const InterviewPrepModal = ({ isOpen, onClose, prepData, loading }) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Interview Preparation">
            <div className="max-h-[600px] overflow-y-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                            Generating interview questions...
                        </p>
                    </div>
                ) : prepData ? (
                    <div className="space-y-6">
                        {/* Technical Questions */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Code className="w-5 h-5 text-purple-600" />
                                <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                                    Technical Questions
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {prepData.technical?.map((question, index) => (
                                    <div key={index} className="flex gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                        <span className="flex-shrink-0 font-semibold text-purple-600 dark:text-purple-400">
                                            {index + 1}.
                                        </span>
                                        <p className="text-gray-800 dark:text-gray-200">
                                            {question}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Behavioral Questions */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Users className="w-5 h-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                    Behavioral Questions
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {prepData.behavioral?.map((question, index) => (
                                    <div key={index} className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <span className="flex-shrink-0 font-semibold text-blue-600 dark:text-blue-400">
                                            {index + 1}.
                                        </span>
                                        <p className="text-gray-800 dark:text-gray-200">
                                            {question}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Questions to Ask */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <HelpCircle className="w-5 h-5 text-green-600" />
                                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">
                                    Questions to Ask Interviewer
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {prepData.questionsToAsk?.map((question, index) => (
                                    <div key={index} className="flex gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <span className="flex-shrink-0 font-semibold text-green-600 dark:text-green-400">
                                            {index + 1}.
                                        </span>
                                        <p className="text-gray-800 dark:text-gray-200">
                                            {question}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-gray-600 dark:text-gray-400">
                            No prep data available
                        </p>
                    </div>
                )}

                {/* Close Button */}
                {!loading && (
                    <div className="mt-6 pt-4 border-t dark:border-gray-700">
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default InterviewPrepModal;
