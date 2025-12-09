import { GoogleGenerativeAI } from '@google/generative-ai';
import AIKey from '../models/AIKey.js';

// Default Models
const DEFAULT_MODELS = (process.env.GENERATIVE_MODELS && process.env.GENERATIVE_MODELS.split(',').map(s => s.trim()).filter(Boolean))
    || [process.env.GENERATIVE_MODEL || 'gemini-1.5-flash'];

// Helper to get active keys (Prioritizing User Keys -> Global Keys)
const getActiveKeys = async (userId) => {
    // 1. Get Personal Keys
    const personalKeys = await AIKey.find({
        owner: userId,
        status: 'active',
        isActive: true
    }).sort('lastUsedAt');

    // 2. Get Global Keys (Explicit Global OR Legacy/No Owner)
    const globalKeys = await AIKey.find({
        $or: [
            { isGlobal: true },
            { isGlobal: { $exists: false } },
            { owner: { $exists: false } }
        ],
        status: 'active',
        isActive: true
    }).sort('lastUsedAt');

    // 3. Merge: Personal first, then Global
    return [...personalKeys, ...globalKeys];
};

/**
 * Generate AI response with Key Rotation
 */
export const generateAIResponse = async (prompt, opts = {}, userId) => {
    let keys = [];

    // Attempt to fetch keys from DB
    try {
        keys = await getActiveKeys(userId);
    } catch (error) {
        console.error("Error fetching AI keys:", error);
    }

    // Add fallback env key if no keys found
    if (keys.length === 0 && process.env.GEMINI_API_KEY) {
        keys.push({
            key: process.env.GEMINI_API_KEY,
            isEnv: true,
            getDecryptedKey: function () { return this.key },
            label: 'Env Fallback'
        });
    }

    if (keys.length === 0) {
        throw new Error('No active AI keys available.');
    }

    let lastError = null;
    const models = opts.models || (opts.model ? [opts.model] : DEFAULT_MODELS);
    const modelName = models[0];

    // Iterate through keys (Round Robin / Failover)
    for (const keyObj of keys) {
        try {
            const apiKey = keyObj.isEnv ? keyObj.key : keyObj.getDecryptedKey();
            const genAI = new GoogleGenerativeAI(apiKey);
            const instance = genAI.getGenerativeModel({ model: modelName });

            console.log(`🤖 AI Request using ${keyObj.label || 'Env'} on ${modelName}`);

            const result = await instance.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Success! Update Usage
            if (!keyObj.isEnv) {
                await AIKey.findByIdAndUpdate(keyObj._id, {
                    $inc: { usageCount: 1 },
                    status: 'active',
                    lastUsedAt: new Date()
                });
            }

            return text;

        } catch (error) {
            console.error(`AI Key Failed (${keyObj.label || 'Env'}):`, error.message);
            lastError = error;

            if (!keyObj.isEnv) {
                // Handle Failures
                if (error.message.includes('429') || error.message.includes('Quota')) {
                    await AIKey.findByIdAndUpdate(keyObj._id, {
                        status: 'quota_exceeded',
                        lastError: '429 Quota Exceeded',
                        errorCount: (keyObj.errorCount || 0) + 1
                    });
                } else if (error.message.includes('401') || error.message.includes('API key not valid')) {
                    await AIKey.findByIdAndUpdate(keyObj._id, {
                        status: 'revoked',
                        isActive: false,
                        lastError: `Auth Error`,
                    });
                } else {
                    await AIKey.findByIdAndUpdate(keyObj._id, {
                        lastError: error.message,
                        $inc: { errorCount: 1 }
                    });
                }
            }
            // Continue loop
        }
    }

    throw new Error(`AI Generation failed after checking available keys. Last error: ${lastError?.message}`);
};

// Prompts Helpers
export const createDailyPlanPrompt = (userData) => {
    const { tasks, habits, todayStats } = userData;

    return `You are a productivity assistant. Generate a personalized daily plan based on the following user data:

**Today's Tasks (${tasks.length} total):**
${tasks.map(t => `- [${t.priority}] ${t.title} (Status: ${t.status})`).join('\n')}

**Habits to Complete:**
${habits.map(h => `- ${h.name} (Current Streak: ${h.currentStreak})`).join('\n')}

**Today's Work Stats:**
- Work Time: ${Math.floor(todayStats.totalWorkSeconds / 3600)}h ${Math.floor((todayStats.totalWorkSeconds % 3600) / 60)}m
- Productivity Score: ${todayStats.productivityScore}%

Please provide:
1. A prioritized task list for today
2. Suggested time blocks for focused work
3. Habit reminders
4. Motivational insight

Keep the response concise and actionable (max 300 words).`;
};

export const createTaskSuggestionsPrompt = (tasks) => {
    return `You are a task management expert. Analyze these tasks and provide prioritization suggestions:

${tasks.map((t, i) => `${i + 1}. ${t.title} - Priority: ${t.priority}, Due: ${t.dueDate || 'None'}, Status: ${t.status}`).join('\n')}

Provide:
1. Top 3 tasks to focus on today
2. Tasks that can be delegated or postponed
3. Quick wins (tasks that can be completed quickly)

Keep response brief (max 200 words).`;
};

export const createHabitInsightsPrompt = (habits) => {
    return `You are a habit coach. Analyze these habits and provide insights:

${habits.map(h => `- ${h.name}: Current Streak ${h.currentStreak} days, Best Streak ${h.bestStreak} days, Total Completions: ${h.completions.length}`).join('\n')}

Provide:
1. Patterns you notice
2. Encouragement for strong habits
3. Suggestions for struggling habits
4. One actionable tip to improve consistency

Keep response motivational and concise (max 250 words).`;
};

export const createTaskBreakdownPrompt = (taskTitle, taskDescription) => {
    return `You are a project manager. Break down this task into smaller, actionable subtasks:
Task: "${taskTitle}"
Description: "${taskDescription || 'No description provided'}"

Provide a JSON array of strings, where each string is a subtask.
Example format:
["Subtask 1", "Subtask 2", "Subtask 3"]

Do not include any markdown formatting or extra text. Just the JSON array.`;
};

export const createFinanceInsightsPrompt = (transactions) => {
    return `You are a financial advisor. Analyze these recent transactions:
${transactions.map(t => `- ${t.date.split('T')[0]}: ${t.description} (${t.amount} ${t.type}) - Category: ${t.category}`).join('\n')}

Provide:
1. Spending trends (e.g., "You spent 20% more on food this month")
2. Saving opportunities
3. A quick financial tip

Keep response concise (max 200 words).`;
};

export const createNoteSummaryPrompt = (noteContent) => {
    return `You are an expert summarizer. Summarize the following note into concise bullet points and extract any action items:

"${noteContent}"

Format:
**Summary:**
- Point 1
- Point 2

**Action Items:**
- [ ] Item 1
- [ ] Item 2`;
};


export default {
    generateAIResponse,
    createDailyPlanPrompt,
    createTaskSuggestionsPrompt,
    createHabitInsightsPrompt,
    createTaskBreakdownPrompt,
    createFinanceInsightsPrompt,
    createNoteSummaryPrompt,
};
