import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, ActivityIndicator, Animated } from 'react-native';
import useThemeStore from '../../store/themeStore';
import useJobStore from '../../store/jobStore';
import InterviewPrepModal from '../../components/InterviewPrepModal';
import JobStats from '../../components/JobStats';

const JobSkeleton = () => {
    const { isDarkMode } = useThemeStore();
    const pulseAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const opacity = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View style={{ opacity, backgroundColor: isDarkMode ? '#1E1E1E' : '#f0f0f0', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                    <View style={{ backgroundColor: '#ccc', width: '70%', height: 18, borderRadius: 4, marginBottom: 8 }} />
                    <View style={{ backgroundColor: '#ccc', width: '50%', height: 14, borderRadius: 4, marginBottom: 6 }} />
                    <View style={{ backgroundColor: '#ccc', width: '40%', height: 12, borderRadius: 4 }} />
                </View>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' }}>
                <View style={{ backgroundColor: '#ccc', width: 70, height: 24, borderRadius: 12 }} />
                <View style={{ backgroundColor: '#ccc', width: 70, height: 24, borderRadius: 12 }} />
                <View style={{ backgroundColor: '#ccc', width: 70, height: 24, borderRadius: 12 }} />
            </View>
        </Animated.View>
    );
};

const STATUS_COLORS = {
    'Wishlist': '#64748B', // Slate
    'Applied': '#3B82F6',  // Blue
    'Interview': '#F59E0B', // Amber
    'Offer': '#10B981',    // Emerald
    'Rejected': '#EF4444'  // Red
};

export default function JobsScreen() {
    const { jobs, fetchJobs, addJob, updateJob, deleteJob, getInterviewPrep, isLoading } = useJobStore();
    const { theme, isDarkMode } = useThemeStore();
    const [modalVisible, setModalVisible] = useState(false);
    const [newJob, setNewJob] = useState({ company: '', role: '', status: 'Wishlist', location: '', notes: '', skills: '' });
    const [activeTab, setActiveTab] = useState('All');
    const [editingJob, setEditingJob] = useState(null);
    const [prepModalVisible, setPrepModalVisible] = useState(false);
    const [prepData, setPrepData] = useState(null);
    const [prepLoading, setPrepLoading] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, []);

    const filteredJobs = activeTab === 'All'
        ? jobs
        : jobs.filter(job => job.status === activeTab);

    const handleSaveJob = async () => {
        if (!newJob.company.trim() || !newJob.role.trim()) return;

        const jobData = {
            ...newJob,
            skills: newJob.skills.split(',').map(s => s.trim()).filter(Boolean)
        };

        if (editingJob) {
            await updateJob(editingJob._id, jobData);
            setEditingJob(null);
        } else {
            await addJob(jobData);
        }

        setNewJob({ company: '', role: '', status: 'Wishlist', location: '', notes: '', skills: '' });
        setModalVisible(false);
    };

    const handleEditJob = (job) => {
        setEditingJob(job);
        setNewJob({
            company: job.company,
            role: job.role,
            status: job.status,
            location: job.location || '',
            notes: job.notes || '',
            skills: job.skills ? job.skills.join(', ') : ''
        });
        setModalVisible(true);
    };

    const handleInterviewPrep = async (job) => {
        setPrepModalVisible(true);
        setPrepLoading(true);
        const data = await getInterviewPrep(job.role, job.skills || '');
        setPrepData(data);
        setPrepLoading(false);
    };

    const themeStyles = {
        container: {
            backgroundColor: theme.colors.background,
        },
        text: {
            color: theme.colors.text,
        },
        subText: {
            color: theme.colors.subText,
        },
        card: {
            backgroundColor: theme.colors.card,
            shadowColor: isDarkMode ? '#000' : '#888',
            shadowOpacity: isDarkMode ? 0.3 : 0.1,
            borderWidth: isDarkMode ? 1 : 0,
            borderColor: theme.colors.border,
        },
        tabBar: {
            backgroundColor: theme.colors.card,
            borderBottomColor: theme.colors.border,
            borderBottomWidth: 1,
        },
        tabText: {
            color: theme.colors.text,
        },
        activeTabText: {
            color: '#fff',
        },
        modalContent: {
            backgroundColor: theme.colors.card,
        },
        input: {
            borderColor: theme.colors.border,
            color: theme.colors.text,
            backgroundColor: theme.colors.input,
        },
        chip: {
            backgroundColor: theme.colors.chip,
        },
        chipText: {
            color: theme.colors.chipText,
        }
    };

    const renderJobItem = ({ item }) => (
        <View style={[styles.jobCard, themeStyles.card]}>
            <View style={styles.jobHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.jobRole, themeStyles.text]} numberOfLines={1}>{item.role}</Text>
                    <Text style={[styles.jobCompany, themeStyles.subText]} numberOfLines={1}>{item.company}</Text>
                    {item.location ? (
                        <Text style={[styles.jobLocation, themeStyles.subText]}>📍 {item.location}</Text>
                    ) : null}
                </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                    onPress={() => handleInterviewPrep(item)}
                    style={[styles.prepButton, { backgroundColor: theme.colors.primary + '20' }]}
                >
                    <Text style={[styles.prepButtonText, { color: theme.colors.primary }]}>✨ Prep</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleEditJob(item)} style={styles.deleteButton}>
                    <Text style={[styles.deleteText, { color: theme.colors.subText, fontSize: 18 }]}>✎</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteJob(item._id)} style={styles.deleteButton}>
                    <Text style={styles.deleteText}>×</Text>
                </TouchableOpacity>
            </View>


            <View style={styles.statusContainer}>
                {['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'].map((status) => (
                    <TouchableOpacity
                        key={status}
                        style={[
                            styles.statusChip,
                            themeStyles.chip,
                            item.status === status && { backgroundColor: STATUS_COLORS[status] }
                        ]}
                        onPress={() => updateJob(item._id, { status })}
                    >
                        <Text style={[
                            styles.chipText,
                            themeStyles.chipText,
                            item.status === status && styles.activeChipText
                        ]}>
                            {status}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View >
    );

    return (
        <View style={[styles.container, themeStyles.container]}>
            <View style={[styles.tabBar, themeStyles.tabBar]}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabBarContent}
                >
                    {['All', 'Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tab,
                                activeTab === tab && { backgroundColor: tab === 'All' ? theme.colors.primary : STATUS_COLORS[tab] }
                            ]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[
                                styles.tabText,
                                themeStyles.tabText,
                                activeTab === tab && styles.activeTabText
                            ]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Job Stats */}
            {!isLoading && jobs.length > 0 && (
                <View style={styles.statsContainer}>
                    <JobStats jobs={jobs} />
                </View>
            )}

            {isLoading && jobs.length === 0 ? (
                <View style={styles.listContent}>
                    <JobSkeleton />
                    <JobSkeleton />
                    <JobSkeleton />
                    <JobSkeleton />
                </View>
            ) : (
                <FlatList
                    data={filteredJobs}
                    renderItem={renderJobItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Text style={styles.emptyText}>No jobs found in {activeTab}</Text>}
                />
            )}

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                onPress={() => {
                    setEditingJob(null);
                    setNewJob({ company: '', role: '', status: 'Wishlist', location: '', notes: '', skills: '' });
                    setModalVisible(true);
                }}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, themeStyles.modalContent]}>
                        <Text style={[styles.modalTitle, themeStyles.text]}>
                            {editingJob ? 'Edit Job' : 'New Job'}
                        </Text>

                        <TextInput
                            style={[styles.input, themeStyles.input]}
                            placeholder="Company"
                            placeholderTextColor={theme.colors.subText}
                            value={newJob.company}
                            onChangeText={(text) => setNewJob({ ...newJob, company: text })}
                        />
                        <TextInput
                            style={[styles.input, themeStyles.input]}
                            placeholder="Role"
                            placeholderTextColor={theme.colors.subText}
                            value={newJob.role}
                            onChangeText={(text) => setNewJob({ ...newJob, role: text })}
                        />
                        <TextInput
                            style={[styles.input, themeStyles.input]}
                            placeholder="Location"
                            placeholderTextColor={theme.colors.subText}
                            value={newJob.location}
                            onChangeText={(text) => setNewJob({ ...newJob, location: text })}
                        />
                        <TextInput
                            style={[styles.input, themeStyles.input]}
                            placeholder="Skills (comma separated)"
                            placeholderTextColor={theme.colors.subText}
                            value={newJob.skills}
                            onChangeText={(text) => setNewJob({ ...newJob, skills: text })}
                        />
                        <TextInput
                            style={[styles.input, themeStyles.input, { height: 100, textAlignVertical: 'top' }]}
                            placeholder="Notes"
                            placeholderTextColor={theme.colors.subText}
                            value={newJob.notes}
                            multiline
                            numberOfLines={4}
                            onChangeText={(text) => setNewJob({ ...newJob, notes: text })}
                        />

                        {/* Status Selector */}
                        <Text style={[styles.label, themeStyles.text]}>Status:</Text>
                        <View style={styles.statusSelector}>
                            {['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'].map((status) => (
                                <TouchableOpacity
                                    key={status}
                                    style={[
                                        styles.statusOption,
                                        themeStyles.chip,
                                        newJob.status === status && { backgroundColor: STATUS_COLORS[status] }
                                    ]}
                                    onPress={() => setNewJob({ ...newJob, status })}
                                >
                                    <Text style={[
                                        styles.statusOptionText,
                                        themeStyles.subText,
                                        newJob.status === status && styles.statusOptionTextActive
                                    ]}>
                                        {status}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.cancelButton, { backgroundColor: theme.colors.danger }]} onPress={() => setModalVisible(false)}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.colors.primary }]} onPress={handleSaveJob}>
                                <Text style={styles.buttonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Interview Prep Modal */}
            <InterviewPrepModal
                visible={prepModalVisible}
                onClose={() => setPrepModalVisible(false)}
                prepData={prepData}
                loading={prepLoading}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40, // Status bar spacing
    },
    tabBar: {
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    tabBarContent: {
        gap: 10,
        paddingRight: 20, // Ensure last item is visible
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
    },
    jobCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 3,
    },
    jobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    jobRole: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 4,
    },
    jobCompany: {
        fontSize: 14,
        marginBottom: 4,
    },
    jobLocation: {
        fontSize: 12,
        marginTop: 2,
        opacity: 0.8,
    },
    deleteButton: {
        padding: 4,
    },
    deleteText: {
        color: '#FF3B30',
        fontSize: 20,
        fontWeight: 'bold',
        lineHeight: 20,
    },
    prepButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    prepButtonText: {
        fontSize: 12,
        fontWeight: ' 600',
    },
    statsContainer: {
        paddingHorizontal: 16,
    },
    statusContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    statusChip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
    },
    chipText: {
        fontSize: 11,
        fontWeight: '600',
    },
    activeChipText: {
        color: '#fff',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#999',
        fontSize: 16,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    fabText: {
        color: '#fff',
        fontSize: 32,
        marginTop: -4,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 20,
    },
    modalContent: {
        padding: 24,
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 12,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    saveButton: {
        flex: 1,
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 10,
    },
    statusSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
    },
    statusOption: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
    },
    statusOptionText: {
        fontSize: 12,
        fontWeight: '600',
    },
    statusOptionTextActive: {
        color: '#fff',
    },
});
