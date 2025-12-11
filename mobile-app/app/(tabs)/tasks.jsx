import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, Animated } from 'react-native';
import useThemeStore from '../../store/themeStore';
import useTaskStore from '../../store/taskStore';
import CalendarView from '../../components/CalendarView';
import dayjs from 'dayjs';
import AIBreakdownModal from '../../components/AI/AIBreakdownModal';
import TaskStats from '../../components/TaskStats';

const PRIORITY_COLORS = {
    Low: '#34C759',
    Medium: '#FF9500',
    High: '#FF3B30'
};

const STATUS_COLORS = {
    'Backlog': '#64748B', // Slate
    'Today': '#3B82F6',   // Blue
    'In Progress': '#F59E0B', // Amber
    'Completed': '#10B981' // Emerald
};

const getTagColor = (tag) => {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
};

const TaskSkeleton = () => {
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
        <Animated.View style={{ opacity, backgroundColor: isDarkMode ? '#1E1E1E' : '#f0f0f0', borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={{ backgroundColor: '#ccc', width: '70%', height: 20, borderRadius: 4 }} />
                <View style={{ backgroundColor: '#ccc', width: 60, height: 20, borderRadius: 4 }} />
            </View>
            <View style={{ backgroundColor: '#ccc', width: '90%', height: 14, borderRadius: 4, marginBottom: 8 }} />
            <View style={{ backgroundColor: '#ccc', width: '60%', height: 14, borderRadius: 4 }} />
        </Animated.View>
    );
};

export default function TasksScreen() {
    const { tasks, fetchTasks, addTask, updateTask, deleteTask, isLoading } = useTaskStore();
    const { theme, isDarkMode } = useThemeStore();
    const [modalVisible, setModalVisible] = useState(false);
    const [aiModalVisible, setAiModalVisible] = useState(false);
    const [calendarModalVisible, setCalendarModalVisible] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        tags: [],
        subtasks: [],
        dueDate: '',
        status: 'Backlog'
    });
    const [tagInput, setTagInput] = useState('');
    const [subtaskInput, setSubtaskInput] = useState('');
    const [activeTab, setActiveTab] = useState('Today');

    useEffect(() => {
        fetchTasks();
    }, []);

    // Filter tasks based on view mode
    const filteredTasks = viewMode === 'list'
        ? tasks.filter(task => task.status === activeTab)
        : tasks.filter(task => {
            if (!task.dueDate) return false;
            return isSameDay(parseISO(task.dueDate), selectedDate);
        });

    const handleSaveTask = async () => {
        if (!formData.title.trim()) {
            Alert.alert('Error', 'Please enter a task title');
            return;
        }

        const taskData = {
            ...formData,
            dueDate: formData.dueDate || undefined
        };

        if (editingTask) {
            await updateTask(editingTask._id, taskData);
            setEditingTask(null);
        } else {
            await addTask(taskData);
        }

        resetForm();
        setModalVisible(false);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            priority: 'Medium',
            tags: [],
            subtasks: [],
            dueDate: '',
            status: 'Backlog'
        });
        setTagInput('');
        setSubtaskInput('');
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            description: task.description || '',
            priority: task.priority || 'Medium',
            tags: task.tags || [],
            subtasks: task.subtasks || [],
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
            status: task.status
        });
        setModalVisible(true);
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
    };

    const handleAddSubtask = () => {
        if (subtaskInput.trim()) {
            setFormData({
                ...formData,
                subtasks: [...formData.subtasks, { title: subtaskInput.trim(), completed: false }]
            });
            setSubtaskInput('');
        }
    };

    const handleAddSubtasksFromAI = (newSubtasks) => {
        const formattedSubtasks = newSubtasks.map(title => ({ title, completed: false }));
        setFormData(prev => ({
            ...prev,
            subtasks: [...prev.subtasks, ...formattedSubtasks]
        }));
    };

    const handleRemoveSubtask = (index) => {
        setFormData({
            ...formData,
            subtasks: formData.subtasks.filter((_, i) => i !== index)
        });
    };

    const handleToggleSubtask = (taskId, subtaskIndex) => {
        const task = tasks.find(t => t._id === taskId);
        if (!task) return;

        const updatedSubtasks = task.subtasks.map((st, i) =>
            i === subtaskIndex ? { ...st, completed: !st.completed } : st
        );
        updateTask(taskId, { subtasks: updatedSubtasks });
    };

    const getSubtaskProgress = (subtasks) => {
        if (!subtasks || subtasks.length === 0) return null;
        const completed = subtasks.filter(st => st.completed).length;
        return `${completed}/${subtasks.length}`;
    };

    const handleDateSelect = (date) => {
        setFormData({ ...formData, dueDate: date.toISOString().split('T')[0] });
        setCalendarModalVisible(false);
    };

    const isOverdue = (dueDate) => {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
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
        },
        tabActive: {
            backgroundColor: theme.colors.primary,
        },
        tabInactive: {
            backgroundColor: isDarkMode ? '#333' : '#e0e0e0',
        },
        tabTextInactive: {
            color: theme.colors.text,
        }
    };

    const renderTaskItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.taskCard,
                themeStyles.card,
                { borderLeftColor: PRIORITY_COLORS[item.priority || 'Medium'] }
            ]}
            onPress={() => handleEditTask(item)}
        >
            <View style={styles.taskHeader}>
                <View style={{ flex: 1 }}>
                    <View style={styles.taskTitleRow}>
                        <Text style={[styles.taskTitle, themeStyles.text]} numberOfLines={1}>{item.title}</Text>
                        <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLORS[item.priority || 'Medium'] }]}>
                            <Text style={styles.priorityText}>{item.priority || 'Medium'}</Text>
                        </View>
                    </View>
                    {item.description ? (
                        <Text style={[styles.taskDescription, themeStyles.subText]} numberOfLines={2}>
                            {item.description}
                        </Text>
                    ) : null}
                </View>
                <TouchableOpacity onPress={() => deleteTask(item._id)} style={styles.deleteButton}>
                    <Text style={styles.deleteText}>×</Text>
                </TouchableOpacity>
            </View>

            {/* Tags - Conditionally Rendered */}
            {item.tags && item.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                    {item.tags.slice(0, 3).map((tag, index) => {
                        const tagColor = getTagColor(tag);
                        return (
                            <View key={index} style={[styles.tagChip, { backgroundColor: tagColor + '20' }]}>
                                <Text style={[styles.tagText, { color: tagColor }]}>#{tag}</Text>
                            </View>
                        );
                    })}
                    {item.tags.length > 3 && (
                        <Text style={styles.moreTagsText}>+{item.tags.length - 3}</Text>
                    )}
                </View>
            )}

            {/* Subtasks List - Conditionally Rendered */}
            {item.subtasks && item.subtasks.length > 0 && (
                <View style={styles.subtaskList}>
                    {item.subtasks.map((subtask, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.subtaskRow}
                            onPress={() => handleToggleSubtask(item._id, index)}
                        >
                            <View style={[
                                styles.checkbox,
                                subtask.completed && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                            ]}>
                                {subtask.completed && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={[
                                styles.subtaskTextItem,
                                themeStyles.text,
                                subtask.completed && styles.completedSubtaskText
                            ]}>
                                {subtask.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Due Date - Conditionally Rendered */}
            {item.dueDate && (
                <View style={styles.dueDateContainer}>
                    <Text style={[
                        styles.dueDateText,
                        isOverdue(item.dueDate) && styles.overdueDateText
                    ]}>
                        📅 {new Date(item.dueDate).toLocaleDateString()}
                        {isOverdue(item.dueDate) && ' (Overdue)'}
                    </Text>
                </View>
            )}

            {/* Status Chips */}
            <View style={styles.statusContainer}>
                {['Backlog', 'Today', 'In Progress', 'Completed'].map((status) => (
                    <TouchableOpacity
                        key={status}
                        style={[
                            styles.statusChip,
                            themeStyles.chip,
                            item.status === status && { backgroundColor: STATUS_COLORS[status] }
                        ]}
                        onPress={() => updateTask(item._id, { status })}
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
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, themeStyles.container]}>
            {/* Header with View Toggle */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, themeStyles.text]}>Tasks</Text>
            </View>

            {/* Segmented View Toggle */}
            <View style={[styles.tabContainer, { backgroundColor: isDarkMode ? '#1E1E1E' : '#f0f0f0' }]}>
                <TouchableOpacity
                    style={[styles.tab, viewMode === 'list' ? themeStyles.tabActive : themeStyles.tabInactive]}
                    onPress={() => setViewMode('list')}
                >
                    <Text style={[styles.tabText, viewMode === 'list' ? styles.activeTabText : themeStyles.tabTextInactive]}>
                        List
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, viewMode === 'calendar' ? themeStyles.tabActive : themeStyles.tabInactive]}
                    onPress={() => setViewMode('calendar')}
                >
                    <Text style={[styles.tabText, viewMode === 'calendar' ? styles.activeTabText : themeStyles.tabTextInactive]}>
                        Calendar
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Calendar View */}
            {viewMode === 'calendar' && (
                <View style={styles.calendarContainer}>
                    <CalendarView
                        tasks={tasks}
                        selectedDate={selectedDate}
                        onSelectDate={setSelectedDate}
                    />
                    <Text style={[styles.dateHeader, themeStyles.text]}>
                        Tasks for {selectedDate.toDateString()}
                    </Text>
                </View>
            )}

            {/* Status Tabs (Only in List Mode) */}
            {viewMode === 'list' && (
                <View style={[styles.tabBar, themeStyles.tabBar]}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarContent}>
                        {['Backlog', 'Today', 'In Progress', 'Completed'].map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                style={[
                                    styles.filterTab,
                                    activeTab === tab && { backgroundColor: STATUS_COLORS[tab] }
                                ]}
                                onPress={() => setActiveTab(tab)}
                            >
                                <Text style={[
                                    styles.filterTabText,
                                    themeStyles.tabText,
                                    activeTab === tab && styles.activeTabText
                                ]}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Task Stats (Only in List Mode) */}
            {viewMode === 'list' && !isLoading && tasks.length > 0 && (
                <View style={styles.statsContainer}>
                    <TaskStats tasks={tasks} />
                </View>
            )}

            {isLoading && tasks.length === 0 ? (
                <View style={styles.listContent}>
                    <TaskSkeleton />
                    <TaskSkeleton />
                    <TaskSkeleton />
                    <TaskSkeleton />
                </View>
            ) : (
                <FlatList
                    data={filteredTasks}
                    renderItem={renderTaskItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>
                            {viewMode === 'list'
                                ? `No tasks in ${activeTab}`
                                : `No tasks for ${selectedDate.toDateString()}`}
                        </Text>
                    }
                />
            )}


            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                onPress={() => {
                    setEditingTask(null);
                    resetForm();
                    setModalVisible(true);
                }}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.modalScrollContent}>
                        <View style={[styles.modalContent, themeStyles.modalContent]}>
                            <Text style={[styles.modalTitle, themeStyles.text]}>
                                {editingTask ? 'Edit Task' : 'New Task'}
                            </Text>

                            {/* Title */}
                            <TextInput
                                style={[styles.input, themeStyles.input]}
                                placeholder="Task Title"
                                placeholderTextColor={theme.colors.subText}
                                value={formData.title}
                                onChangeText={(text) => setFormData({ ...formData, title: text })}
                            />

                            {/* Description */}
                            <TextInput
                                style={[styles.input, styles.textArea, themeStyles.input]}
                                placeholder="Description (optional)"
                                placeholderTextColor={theme.colors.subText}
                                value={formData.description}
                                onChangeText={(text) => setFormData({ ...formData, description: text })}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />

                            {/* Priority Selector */}
                            <Text style={[styles.label, themeStyles.text]}>Priority:</Text>
                            <View style={styles.prioritySelector}>
                                {['Low', 'Medium', 'High'].map((priority) => (
                                    <TouchableOpacity
                                        key={priority}
                                        style={[
                                            styles.priorityOption,
                                            { borderColor: PRIORITY_COLORS[priority] },
                                            formData.priority === priority && {
                                                backgroundColor: PRIORITY_COLORS[priority]
                                            }
                                        ]}
                                        onPress={() => setFormData({ ...formData, priority })}
                                    >
                                        <Text style={[
                                            styles.priorityOptionText,
                                            { color: formData.priority === priority ? '#fff' : PRIORITY_COLORS[priority] }
                                        ]}>
                                            {priority}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Status Selector */}
                            <Text style={[styles.label, themeStyles.text]}>Status:</Text>
                            <View style={styles.statusContainer}>
                                {['Backlog', 'Today', 'In Progress', 'Completed'].map((status) => (
                                    <TouchableOpacity
                                        key={status}
                                        style={[
                                            styles.statusChip,
                                            themeStyles.chip,
                                            { backgroundColor: formData.status === status ? STATUS_COLORS[status] : (isDarkMode ? '#333' : '#f5f5f5') }
                                        ]}
                                        onPress={() => setFormData({ ...formData, status })}
                                    >
                                        <Text style={[
                                            styles.chipText,
                                            themeStyles.chipText,
                                            { color: formData.status === status ? '#fff' : (isDarkMode ? '#ccc' : '#666') }
                                        ]}>
                                            {status}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Tags Input */}
                            <Text style={[styles.label, themeStyles.text]}>Tags:</Text>
                            <View style={styles.tagInputContainer}>
                                <TextInput
                                    style={[styles.input, styles.tagInput, themeStyles.input]}
                                    placeholder="Add tag..."
                                    placeholderTextColor={theme.colors.subText}
                                    value={tagInput}
                                    onChangeText={setTagInput}
                                    onSubmitEditing={handleAddTag}
                                />
                                <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.colors.primary }]} onPress={handleAddTag}>
                                    <Text style={styles.addButtonText}>+</Text>
                                </TouchableOpacity>
                            </View>
                            {formData.tags.length > 0 && (
                                <View style={styles.tagsEditContainer}>
                                    {formData.tags.map((tag, index) => {
                                        const tagColor = getTagColor(tag);
                                        return (
                                            <View key={index} style={[styles.tagChipEdit, { backgroundColor: tagColor + '20' }]}>
                                                <Text style={[styles.tagTextEdit, { color: tagColor }]}>#{tag}</Text>
                                                <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                                                    <Text style={[styles.removeText, { color: tagColor }]}>×</Text>
                                                </TouchableOpacity>
                                            </View>
                                        );
                                    })}
                                </View>
                            )}

                            {/* Subtasks */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                                <Text style={[styles.label, themeStyles.text, { marginBottom: 0 }]}>Subtasks:</Text>
                                <TouchableOpacity
                                    onPress={() => setAiModalVisible(true)}
                                    style={{ flexDirection: 'row', alignItems: 'center' }}
                                >
                                    <Text style={{ fontSize: 16, marginRight: 4 }}>✨</Text>
                                    <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>AI Breakdown</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.tagInputContainer}>
                                <TextInput
                                    style={[styles.input, styles.tagInput, themeStyles.input]}
                                    placeholder="Add subtask..."
                                    placeholderTextColor={theme.colors.subText}
                                    value={subtaskInput}
                                    onChangeText={setSubtaskInput}
                                    onSubmitEditing={handleAddSubtask}
                                />
                                <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.colors.primary }]} onPress={handleAddSubtask}>
                                    <Text style={styles.addButtonText}>+</Text>
                                </TouchableOpacity>
                            </View>
                            {formData.subtasks.length > 0 && (
                                <View style={styles.subtasksEditContainer}>
                                    {formData.subtasks.map((subtask, index) => (
                                        <View key={index} style={styles.subtaskItem}>
                                            <Text style={[styles.subtaskText, themeStyles.text]}>• {subtask.title}</Text>
                                            <TouchableOpacity onPress={() => handleRemoveSubtask(index)}>
                                                <Text style={styles.removeText}>×</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Due Date */}
                            <Text style={[styles.label, themeStyles.text]}>Due Date (optional):</Text>
                            <TouchableOpacity
                                style={[styles.input, themeStyles.input, { justifyContent: 'center' }]}
                                onPress={() => setCalendarModalVisible(true)}
                            >
                                <Text style={{ color: formData.dueDate ? theme.colors.text : theme.colors.subText }}>
                                    {formData.dueDate ? formData.dueDate : 'Select Due Date'}
                                </Text>
                            </TouchableOpacity>

                            {/* Buttons */}
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.cancelButton, { backgroundColor: theme.colors.danger }]}
                                    onPress={() => {
                                        setModalVisible(false);
                                        setEditingTask(null);
                                        resetForm();
                                    }}
                                >
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.colors.primary }]} onPress={handleSaveTask}>
                                    <Text style={styles.buttonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </Modal>

            <AIBreakdownModal
                visible={aiModalVisible}
                onClose={() => setAiModalVisible(false)}
                taskTitle={formData.title}
                taskDescription={formData.description}
                onAddSubtasks={handleAddSubtasksFromAI}
            />

            <Modal visible={calendarModalVisible} animationType="fade" transparent>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, themeStyles.modalContent, { padding: 0 }]}>
                        <CalendarView
                            tasks={[]}
                            selectedDate={formData.dueDate ? new Date(formData.dueDate) : new Date()}
                            onSelectDate={handleDateSelect}
                        />
                        <TouchableOpacity
                            style={[styles.cancelButton, { backgroundColor: theme.colors.danger, margin: 20 }]}
                            onPress={() => setCalendarModalVisible(false)}
                        >
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40, // Status bar spacing
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    // Segmented Control Styles
    tabContainer: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 4,
        marginHorizontal: 16,
        marginBottom: 24,
        gap: 8, // Increased gap
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    activeTabText: {
        color: '#fff',
    },
    // Filter Tabs (Status)
    tabBar: {
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    tabBarContent: {
        flexDirection: 'row',
    },
    statsContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    filterTab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        marginRight: 10,
    },
    filterTabText: {
        fontSize: 13,
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    taskCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderLeftWidth: 4, // Added colored border
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 3,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    taskTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        flexWrap: 'wrap',
    },
    taskTitle: {
        fontSize: 17,
        fontWeight: '700',
        flexShrink: 1,
        marginRight: 8,
    },
    taskDescription: {
        fontSize: 14,
        marginTop: 4,
        lineHeight: 20,
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    priorityText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
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
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 12,
    },
    tagChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 6,
        marginBottom: 6,
    },
    tagText: {
        fontSize: 11,
        fontWeight: '600',
    },
    moreTagsText: {
        fontSize: 11,
        color: '#999',
        alignSelf: 'center',
    },
    subtaskList: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    subtaskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#ccc',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmark: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    subtaskTextItem: {
        fontSize: 14,
        flex: 1,
    },
    completedSubtaskText: {
        textDecorationLine: 'line-through',
        opacity: 0.6,
    },
    dueDateContainer: {
        marginTop: 12,
    },
    dueDateText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    overdueDateText: {
        color: '#FF3B30',
    },
    statusContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    statusChip: {
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
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
    modalScrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
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
    textArea: {
        minHeight: 100,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 10,
    },
    prioritySelector: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    priorityOption: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
    },
    priorityOptionText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    tagInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    tagInput: {
        flex: 1,
        marginBottom: 0,
        marginRight: 12,
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: -2,
    },
    tagsEditContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    tagChipEdit: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginRight: 8,
        marginBottom: 8,
    },
    tagTextEdit: {
        fontSize: 13,
        fontWeight: '600',
    },
    removeText: {
        fontSize: 18,
        fontWeight: 'bold',
        opacity: 0.7,
    },
    subtasksEditContainer: {
        marginBottom: 20,
    },
    subtaskItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        marginBottom: 8,
    },
    subtaskText: {
        fontSize: 15,
        flex: 1,
    },
    modalButtons: {
        flexDirection: 'row',
        marginTop: 12,
    },
    cancelButton: {
        flex: 1,
        marginRight: 12,
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
    calendarContainer: {
        paddingHorizontal: 16,
    },
    dateHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 10,
    },
});
