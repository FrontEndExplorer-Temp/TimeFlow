import asyncHandler from 'express-async-handler';
import Task from '../models/taskModel.js';
import Habit from '../models/habitModel.js';
import DailySummary from '../models/dailySummaryModel.js';
import {
    generateAIResponse,
    createDailyPlanPrompt,
    createTaskSuggestionsPrompt,
    createHabitInsightsPrompt,
    createTaskBreakdownPrompt,
    createFinanceInsightsPrompt,
    createNoteSummaryPrompt,
} from '../services/aiService.js';
import Transaction from '../models/transactionModel.js';

// @desc    Generate daily plan using AI
// @route   POST /api/ai/daily-plan
// @access  Private
const generateDailyPlan = asyncHandler(async (req, res) => {
    // Fetch user's tasks, habits, and today's stats
    const tasks = await Task.find({
        user: req.user._id,
        status: { $ne: 'Done' }
    }).sort({ priority: 1, dueDate: 1 });

    const habits = await Habit.find({ user: req.user._id });

    const today = new Date().toISOString().split('T')[0];
    const todayStats = await DailySummary.findOne({
        user: req.user._id,
        date: today,
    }) || { totalWorkSeconds: 0, productivityScore: 0 };

    // Create prompt and generate AI response
    const prompt = createDailyPlanPrompt({
        tasks: tasks.slice(0, 10), // Limit to top 10 tasks
        habits,
        todayStats,
    });

    // Accept optional `model` (string) or `models` (array) in the request body
    const models = req.body?.models || (req.body?.model ? [req.body.model] : undefined);
    const aiResult = await generateAIResponse(prompt, models ? { models } : {}, req.user._id);

    // Backwards compatible: if a single-model call returns a string, use it directly.
    const planText = typeof aiResult === 'string' ? aiResult : (aiResult.final || (aiResult.results && aiResult.results[0]?.text) || '');

    const responsePayload = {
        plan: planText,
        generatedAt: new Date(),
    };
    // If multi-model results were returned, include metadata about each model call
    if (typeof aiResult === 'object' && aiResult.results) {
        responsePayload.meta = { models: aiResult.results.map(r => ({ model: r.model, timeMs: r.timeMs })) };
    }

    res.json(responsePayload);
});

// @desc    Get task prioritization suggestions
// @route   POST /api/ai/task-suggestions
// @access  Private
const getTaskSuggestions = asyncHandler(async (req, res) => {
    const tasks = await Task.find({
        user: req.user._id,
        status: { $ne: 'Done' }
    }).sort({ priority: 1 });

    if (tasks.length === 0) {
        return res.json({
            suggestions: 'No pending tasks found. Great job staying on top of things!',
        });
    }

    const prompt = createTaskSuggestionsPrompt(tasks.slice(0, 15));
    const models = req.body?.models || (req.body?.model ? [req.body.model] : undefined);
    const aiResult = await generateAIResponse(prompt, models ? { models } : {}, req.user._id);
    const suggestionsText = typeof aiResult === 'string' ? aiResult : (aiResult.final || (aiResult.results && aiResult.results[0]?.text) || '');

    const responsePayload = {
        suggestions: suggestionsText,
        generatedAt: new Date(),
    };
    if (typeof aiResult === 'object' && aiResult.results) {
        responsePayload.meta = { models: aiResult.results.map(r => ({ model: r.model, timeMs: r.timeMs })) };
    }

    res.json(responsePayload);
});

// @desc    Get habit insights and recommendations
// @route   POST /api/ai/habit-insights
// @access  Private
const getHabitInsights = asyncHandler(async (req, res) => {
    const habits = await Habit.find({ user: req.user._id });

    if (habits.length === 0) {
        return res.json({
            insights: 'No habits tracked yet. Start building positive habits today!',
        });
    }

    const prompt = createHabitInsightsPrompt(habits);
    const models = req.body?.models || (req.body?.model ? [req.body.model] : undefined);
    const aiResult = await generateAIResponse(prompt, models ? { models } : {}, req.user._id);
    const insightsText = typeof aiResult === 'string' ? aiResult : (aiResult.final || (aiResult.results && aiResult.results[0]?.text) || '');

    const responsePayload = {
        insights: insightsText,
        generatedAt: new Date(),
    };
    if (typeof aiResult === 'object' && aiResult.results) {
        responsePayload.meta = { models: aiResult.results.map(r => ({ model: r.model, timeMs: r.timeMs })) };
    }

    res.json(responsePayload);
});

export { generateDailyPlan, getTaskSuggestions, getHabitInsights };

// @desc    Generate subtasks for a task
// @route   POST /api/ai/breakdown
// @access  Private
export const getTaskBreakdown = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title) {
        res.status(400);
        throw new Error('Task title is required');
    }

    const prompt = createTaskBreakdownPrompt(title, description);
    const models = req.body?.models || (req.body?.model ? [req.body.model] : (req.query.model ? [req.query.model] : undefined));
    console.log(`🧠 AI Breakdown Request for "${title}" using models:`, models || 'DEFAULT');
    const aiResult = await generateAIResponse(prompt, models ? { models } : {}, req.user._id);

    let subtasks = [];
    const resultText = typeof aiResult === 'string' ? aiResult : (aiResult.final || (aiResult.results && aiResult.results[0]?.text) || '');

    try {
        // Attempt to parse JSON response
        // Clean up markdown code blocks if present
        const jsonStr = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
        subtasks = JSON.parse(jsonStr);
    } catch (e) {
        console.error('Failed to parse AI breakdown response:', e);
        // Fallback: split by newlines if JSON parsing fails
        subtasks = resultText.split('\n').filter(line => line.trim().length > 0);
    }

    const responsePayload = {
        subtasks,
        generatedAt: new Date(),
    };
    if (typeof aiResult === 'object' && aiResult.results) {
        responsePayload.meta = { models: aiResult.results.map(r => ({ model: r.model, timeMs: r.timeMs })) };
    }

    res.json(responsePayload);
});

// @desc    Get finance insights
// @route   POST /api/ai/finance-insights
// @access  Private
export const getFinanceInsights = asyncHandler(async (req, res) => {
    // Fetch recent transactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactions = await Transaction.find({
        user: req.user._id,
        date: { $gte: thirtyDaysAgo }
    }).sort({ date: -1 }).limit(50);

    if (transactions.length === 0) {
        return res.json({
            insights: 'No recent transactions found. Add some expenses to get insights!',
        });
    }

    const prompt = createFinanceInsightsPrompt(transactions);
    const models = req.body?.models || (req.body?.model ? [req.body.model] : undefined);
    const aiResult = await generateAIResponse(prompt, models ? { models } : {}, req.user._id);
    const insightsText = typeof aiResult === 'string' ? aiResult : (aiResult.final || (aiResult.results && aiResult.results[0]?.text) || '');

    const responsePayload = {
        insights: insightsText,
        generatedAt: new Date(),
    };
    if (typeof aiResult === 'object' && aiResult.results) {
        responsePayload.meta = { models: aiResult.results.map(r => ({ model: r.model, timeMs: r.timeMs })) };
    }

    res.json(responsePayload);
});

// @desc    Summarize a note
// @route   POST /api/ai/summarize-note
// @access  Private
export const summarizeNote = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content) {
        res.status(400);
        throw new Error('Note content is required');
    }

    const prompt = createNoteSummaryPrompt(content);
    const models = req.body?.models || (req.body?.model ? [req.body.model] : undefined);
    const aiResult = await generateAIResponse(prompt, models ? { models } : {}, req.user._id);
    const summaryText = typeof aiResult === 'string' ? aiResult : (aiResult.final || (aiResult.results && aiResult.results[0]?.text) || '');

    const responsePayload = {
        summary: summaryText,
        generatedAt: new Date(),
    };
    if (typeof aiResult === 'object' && aiResult.results) {
        responsePayload.meta = { models: aiResult.results.map(r => ({ model: r.model, timeMs: r.timeMs })) };
    }

    res.json(responsePayload);
});
