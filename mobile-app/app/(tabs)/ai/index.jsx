import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Platform,
    LayoutAnimation,
    UIManager,
    Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAiStore from '../../../store/aiStore';
import useThemeStore from '../../../store/themeStore';

const AISkeleton = () => {
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
        <Animated.View style={{ opacity, backgroundColor: isDarkMode ? '#1E1E1E' : '#f0f0f0', borderRadius: 12, padding: 12, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4, marginBottom: 12 }}>
                <View style={{ backgroundColor: '#ccc', width: '40%', height: 16, borderRadius: 4 }} />
                <View style={{ backgroundColor: '#ccc', width: 20, height: 20, borderRadius: 4 }} />
            </View>
            <View style={{ backgroundColor: '#ccc', width: '90%', height: 14, borderRadius: 4, marginBottom: 8 }} />
            <View style={{ backgroundColor: '#ccc', width: '75%', height: 14, borderRadius: 4, marginBottom: 8 }} />
            <View style={{ backgroundColor: '#ccc', width: '85%', height: 14, borderRadius: 4 }} />
        </Animated.View>
    );
};

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AiScreen() {
    const { isDarkMode } = useThemeStore();
    const {
        dailyPlan,
        taskSuggestions,
        habitInsights,
        isGenerating,
        error,
        generateDailyPlan,
        getTaskSuggestions,

        getHabitInsights,
        getFinanceInsights,
        financeInsights,
        reset,
        checkExpiration
    } = useAiStore();

    useEffect(() => {
        checkExpiration();
    }, []);

    const themeStyles = {
        container: { backgroundColor: isDarkMode ? '#0B0B0B' : '#f7f8fb' },
        text: { color: isDarkMode ? '#fff' : '#111' },
        subText: { color: isDarkMode ? '#9AA0A6' : '#666' },
        card: { backgroundColor: isDarkMode ? '#121212' : '#fff' },
        accent: isDarkMode ? '#4A90E2' : '#007AFF'
    };

    const ActionButton = ({ icon, label, onPress, disabled }) => (
        <TouchableOpacity
            style={[
                styles.actionButton,
                { opacity: disabled ? 0.6 : 1, borderColor: themeStyles.accent }
            ]}
            onPress={onPress}
            disabled={disabled}
        >
            <Ionicons name={icon} size={20} color={themeStyles.accent} />
            <Text style={[styles.actionLabel, { color: themeStyles.accent }]}>{label}</Text>
        </TouchableOpacity>
    );

    const CollapsibleCard = ({ title, children, hasData }) => {
        const [expanded, setExpanded] = useState(hasData);

        useEffect(() => {
            if (hasData) {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setExpanded(true);
            }
        }, [hasData]);

        const toggleExpand = () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setExpanded(!expanded);
        };

        return (
            <View style={[styles.card, themeStyles.card]}>
                <TouchableOpacity onPress={toggleExpand} style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, themeStyles.text]}>{title}</Text>
                    <Ionicons
                        name={expanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={themeStyles.subText.color}
                    />
                </TouchableOpacity>

                {expanded && <View style={styles.cardBody}>{children}</View>}
            </View>
        );
    };

    const SimpleMarkdown = ({ content }) => {
        if (!content) return null;

        // Array (list)
        if (Array.isArray(content)) {
            return (
                <View>
                    {content.map((item, index) => (
                        <View key={index} style={styles.mdListItem}>
                            <Text style={[styles.mdBullet, themeStyles.text]}>•</Text>
                            <View style={{ flex: 1 }}>
                                {typeof item === 'string' ? (
                                    <Text style={[styles.mdText, themeStyles.text]}>{item}</Text>
                                ) : (
                                    <SimpleMarkdown content={item} />
                                )}
                            </View>
                        </View>
                    ))}
                </View>
            );
        }

        // Object (structured content)
        if (typeof content === 'object') {
            if (content.plan || content.content) {
                return <SimpleMarkdown content={content.plan || content.content} />;
            }

            return (
                <View style={{ marginLeft: 8 }}>
                    {Object.entries(content).map(([key, value], index) => {
                        if (['generatedAt', 'meta'].includes(key)) return null;

                        return (
                            <View key={index} style={{ marginBottom: 4 }}>
                                <Text style={[styles.mdBold, themeStyles.text]}>{key}:</Text>
                                <SimpleMarkdown content={value} />
                            </View>
                        );
                    })}
                </View>
            );
        }

        // Strings (markdown)
        const lines = String(content).split('\n');

        return (
            <View>
                {lines.map((line, index) => {
                    // Headers
                    if (line.startsWith('### ')) {
                        return (
                            <Text key={index} style={[styles.mdHeader, themeStyles.text]}>
                                {line.replace('### ', '')}
                            </Text>
                        );
                    }
                    if (line.startsWith('## ')) {
                        return (
                            <Text key={index} style={[styles.mdHeaderLarge, themeStyles.text]}>
                                {line.replace('## ', '')}
                            </Text>
                        );
                    }

                    // Bullet lists
                    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
                        const cleanLine = line.trim().substring(2);
                        return (
                            <View key={index} style={styles.mdListItem}>
                                <Text style={[styles.mdBullet, themeStyles.text]}>•</Text>
                                <Text style={[styles.mdText, themeStyles.text]}>
                                    {parseBold(cleanLine)}
                                </Text>
                            </View>
                        );
                    }

                    // Numbered lists (e.g., "1. Task")
                    if (/^\d+\.\s/.test(line.trim())) {
                        const parts = line.trim().split(/\.\s(.+)/);
                        const number = parts[0];
                        const text = parts[1];
                        return (
                            <View key={index} style={styles.mdListItem}>
                                <Text style={[styles.mdBullet, themeStyles.text, { minWidth: 20 }]}>{number}.</Text>
                                <Text style={[styles.mdText, themeStyles.text]}>
                                    {parseBold(text)}
                                </Text>
                            </View>
                        );
                    }

                    // Regular paragraphs with bold parsing
                    return (
                        <Text key={index} style={[styles.mdParagraph, themeStyles.text]}>
                            {parseBold(line)}
                        </Text>
                    );
                })}
            </View>
        );
    };

    // Helper to parse **bold** text
    const parseBold = (text) => {
        if (!text) return null;
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <Text key={i} style={styles.mdBold}>
                        {part.slice(2, -2)}
                    </Text>
                );
            }
            return <Text key={i}>{part}</Text>;
        });
    };

    return (
        <ScrollView contentContainerStyle={[styles.container, themeStyles.container]}>
            <View style={styles.headerRow}>
                <View>
                    <Text style={[styles.headerTitle, themeStyles.text]}>AI Assistant</Text>
                    <Text style={[styles.headerSubtitle, themeStyles.subText]}>
                        Quickly generate a plan, tasks, or habit insights
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.resetButton, { borderColor: themeStyles.accent }]}
                    onPress={reset}
                >
                    <Ionicons name="refresh" size={18} color={themeStyles.accent} />
                </TouchableOpacity>
            </View>

            <View style={styles.actionsRow}>
                <ActionButton icon="calendar" label="Daily Plan" onPress={generateDailyPlan} disabled={isGenerating} />
                <ActionButton icon="bulb" label="Task Suggestions" onPress={getTaskSuggestions} disabled={isGenerating} />
            </View>
            <View style={styles.actionsRow}>
                <ActionButton icon="bar-chart" label="Habit Insights" onPress={getHabitInsights} disabled={isGenerating} />
                <ActionButton icon="cash" label="Finance Insights" onPress={getFinanceInsights} disabled={isGenerating} />
            </View>

            {isGenerating && (
                <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color={themeStyles.accent} />
                    <Text style={[styles.loadingText, themeStyles.subText]}>Generating…</Text>
                </View>
            )}

            {error && (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>Error: {String(error)}</Text>
                </View>
            )}

            {!dailyPlan && !taskSuggestions && !habitInsights && !isGenerating ? (
                <>
                    <AISkeleton />
                    <AISkeleton />
                    <AISkeleton />
                </>
            ) : (
                <>
                    <CollapsibleCard title="Daily Plan" hasData={!!dailyPlan}>
                        {dailyPlan ? <SimpleMarkdown content={dailyPlan} /> : <Text style={themeStyles.subText}>No plan yet — tap "Daily Plan" to generate.</Text>}
                    </CollapsibleCard>

                    <CollapsibleCard title="Task Suggestions" hasData={!!taskSuggestions}>
                        {taskSuggestions ? <SimpleMarkdown content={taskSuggestions} /> : <Text style={themeStyles.subText}>No suggestions yet — tap "Task Suggestions" to generate.</Text>}
                    </CollapsibleCard>

                    <CollapsibleCard title="Habit Insights" hasData={!!habitInsights}>
                        {habitInsights ? <SimpleMarkdown content={habitInsights} /> : <Text style={themeStyles.subText}>No habit insights yet — tap "Habit Insights" to generate.</Text>}
                    </CollapsibleCard>

                    <CollapsibleCard title="Finance Insights" hasData={!!financeInsights}>
                        {financeInsights?.analysis ? <SimpleMarkdown content={financeInsights.analysis} /> : <Text style={themeStyles.subText}>No finance insights yet — tap "Finance Insights" to generate.</Text>}
                    </CollapsibleCard>
                </>
            )}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 18 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    headerTitle: { fontSize: 22, fontWeight: '700' },
    headerSubtitle: { fontSize: 13, marginTop: 4 },
    resetButton: { borderWidth: 1, padding: 8, borderRadius: 10 },
    actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, marginHorizontal: 6, borderRadius: 10, borderWidth: 1 },
    actionLabel: { marginLeft: 8, fontWeight: '600' },
    loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    loadingText: { marginLeft: 8 },
    card: { borderRadius: 12, padding: 12, marginBottom: 12, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
    cardTitle: { fontSize: 16, fontWeight: '700' },
    cardBody: { marginTop: 12 },
    errorBox: { padding: 10, backgroundColor: '#FFF2F0', borderRadius: 8, marginBottom: 12 },
    errorText: { color: '#C62828' },

    // Markdown styles
    mdHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 12, marginBottom: 6 },
    mdParagraph: { fontSize: 15, marginBottom: 8, lineHeight: 22 },
    mdListItem: { flexDirection: 'row', marginBottom: 4, paddingLeft: 8 },
    mdBullet: { marginRight: 8, fontSize: 15, lineHeight: 22 },
    mdText: { flex: 1, fontSize: 15, lineHeight: 22 },
    mdBold: { fontWeight: 'bold' }
});
