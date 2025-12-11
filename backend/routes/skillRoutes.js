import express from 'express';
import Skill from '../models/skillModel.js';
import Task from '../models/taskModel.js';
import aiService from '../services/aiService.js';
import aiTaskService from '../services/aiTaskService.js';
import { updateSkillActivity } from '../services/skillService.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @desc Get all skills for user
 * @route GET /api/skills
 */
router.get('/', protect, async (req, res) => {
    try {
        const skills = await Skill.find({ user: req.user._id });
        res.json(skills);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching skills', error: error.message });
    }
});

/**
 * @desc Create a new skill
 * @route POST /api/skills
 */
router.post('/', protect, async (req, res) => {
    try {
        const { name, targetLevel, minutesPerDay, category } = req.body;
        const skill = await Skill.create({
            user: req.user._id,
            name,
            targetLevel,
            minutesPerDay: minutesPerDay || 30,
            category: category || 'General',
            status: req.body.status || 'learning'
        });
        res.status(201).json(skill);
    } catch (error) {
        res.status(500).json({ message: 'Error creating skill', error: error.message });
    }
});

/**
 * @desc Generate Roadmap for a Skill
 * @route POST /api/skills/:id/roadmap
 */
router.post('/:id/roadmap', protect, async (req, res) => {
    try {
        const skill = await Skill.findOne({ _id: req.params.id, user: req.user._id });
        if (!skill) {
            return res.status(404).json({ message: 'Skill not found' });
        }

        const context = {
            skillName: skill.name,
            currentLevel: skill.currentLevel,
            targetLevel: skill.targetLevel,
            minutesPerDay: skill.minutesPerDay,
            category: skill.category
        };

        const prompt = aiService.createSkillRoadmapPrompt(context);
        const aiResponse = await aiService.generateAIResponse(prompt, {}, req.user._id);

        const roadmapItems = aiTaskService.parseRoadmapJson(aiResponse);

        skill.roadmap = roadmapItems;
        await skill.save();

        res.json({ message: 'Roadmap generated', roadmap: skill.roadmap });

    } catch (error) {
        console.error('Roadmap generation error:', error);
        res.status(500).json({ message: 'Failed to generate roadmap', error: error.message });
    }
});

/**
 * @desc Generate Daily Learning Tasks
 * @route POST /api/skills/daily-learning
 */
router.post('/daily-learning', protect, async (req, res) => {
    try {
        const { minutesAvailable = 60, maxTasks = 3 } = req.body;

        // 1. Fetch learning skills with unfinished details
        const skills = await Skill.find({
            user: req.user._id,
            status: 'learning',
            'roadmap.isCompleted': false // Only skills with unfinished items
        });

        if (skills.length === 0) {
            return res.json({ message: 'No active learning skills found', tasks: [] });
        }

        // 2. Prepare context
        const skillsContext = skills.map(s => ({
            name: s.name,
            priority: 'Medium', // Could derive from DB
            items: s.roadmap.filter(i => !i.isCompleted).slice(0, 3) // Send next 3 items
        }));

        const context = {
            skills: skillsContext,
            minutesAvailable,
            maxTasks
        };

        // 3. AI Call
        const prompt = aiService.createDailyLearningPrompt(context);
        const aiResponse = await aiService.generateAIResponse(prompt, {}, req.user._id);

        // 4. Parse & Create
        const parsedTasks = aiTaskService.parseTasksJson(aiResponse);

        // Map back to skillIds
        const tasksToCreate = parsedTasks.map(t => {
            const relatedSkill = skills.find(s => s.name.toLowerCase() === t.skillName.toLowerCase());
            return {
                ...t,
                skillId: relatedSkill ? relatedSkill._id : null
            };
        });

        const createdTasks = await aiTaskService.createTasksFromAi({
            userId: req.user._id,
            tasks: tasksToCreate,
            taskType: 'learning'
        });

        res.json({ message: 'Learning tasks generated', tasks: createdTasks });

    } catch (error) {
        console.error('Daily learning generation error:', error);
        res.status(500).json({ message: 'Failed to generate learning tasks', error: error.message });
    }
});

/**
 * @desc Generate Daily Practice Tasks
 * @route POST /api/skills/daily-practice
 */
router.post('/daily-practice', protect, async (req, res) => {
    try {
        const { minutesAvailable = 30, maxTasks = 3 } = req.body;

        const skills = await Skill.find({
            user: req.user._id,
            status: 'practicing'
        });

        if (skills.length === 0) {
            return res.json({ message: 'No practicing skills found', tasks: [] });
        }

        const context = {
            practicingSkills: skills.map(s => ({ name: s.name, level: s.currentLevel })),
            minutesAvailable,
            maxTasks
        };

        const prompt = aiService.createDailyPracticePrompt(context);
        const aiResponse = await aiService.generateAIResponse(prompt, {}, req.user._id);

        const parsedTasks = aiTaskService.parseTasksJson(aiResponse);

        const tasksToCreate = parsedTasks.map(t => {
            const relatedSkill = skills.find(s => s.name.toLowerCase() === t.skillName.toLowerCase());
            return {
                ...t,
                skillId: relatedSkill ? relatedSkill._id : null
            };
        });

        const createdTasks = await aiTaskService.createTasksFromAi({
            userId: req.user._id,
            tasks: tasksToCreate,
            taskType: 'practice'
        });

        res.json({ message: 'Practice tasks generated', tasks: createdTasks });

    } catch (error) {
        console.error('Daily practice generation error:', error);
        res.status(500).json({ message: 'Failed to generate practice tasks', error: error.message });
    }
});

/**
 * @desc Generate Combined Daily Plan
 * @route POST /api/skills/daily-plan
 */
router.post('/daily-plan', protect, async (req, res) => {
    try {
        const { minutesAvailable = 90, mode = 'append' } = req.body;

        if (mode === 'replace') {
            await Task.deleteMany({
                user: req.user._id,
                status: 'Today',
                taskType: { $in: ['learning', 'practice'] }
            });
        }


        // Gather Data
        const learningSkills = await Skill.find({
            user: req.user._id,
            status: 'learning'
        });

        const practicingSkills = await Skill.find({
            user: req.user._id,
            status: 'practicing'
        });

        if (learningSkills.length === 0 && practicingSkills.length === 0) {
            return res.json({ message: 'No skills found. Add some skills to generate a daily plan!', totalTasks: 0, tasks: [] });
        }

        const context = {
            roadmapLearningSkills: learningSkills.map(s => ({
                name: s.name,
                nextItems: s.roadmap.filter(i => !i.isCompleted).slice(0, 2)
            })),
            practicingSkills: practicingSkills.map(s => ({ name: s.name })),
            minutesAvailable,
            maxTasksTotal: 5
        };

        const prompt = aiService.createCombinedPlanPrompt(context);
        const aiResponse = await aiService.generateAIResponse(prompt, {}, req.user._id);

        // Parse custom object { learning: [], practice: [] }
        // We'll trust aiTaskService's helpers or parse manually if structure differs.
        // Prompt asks for { learning: [], practice: [] }

        let plan;
        try {
            const match = aiResponse.match(/\{.*\}/s);
            plan = JSON.parse(match ? match[0] : aiResponse);
        } catch (e) {
            throw new Error('Failed to parse combined plan');
        }

        const createdTasks = [];

        // Handle Learning
        if (plan.learning && Array.isArray(plan.learning)) {
            const learningTasks = plan.learning.map(t => {
                let s = learningSkills.find(ls => ls.name.toLowerCase() === (t.skillName || '').toLowerCase());
                if (!s && t.skillName) {
                    // Try partial match
                    s = learningSkills.find(ls => t.skillName.toLowerCase().includes(ls.name.toLowerCase()) || ls.name.toLowerCase().includes(t.skillName.toLowerCase()));
                }
                return { ...t, skillId: s?._id };
            });
            const created = await aiTaskService.createTasksFromAi({ userId: req.user._id, tasks: learningTasks, taskType: 'learning' });
            createdTasks.push(...created);
        }

        // Handle Practice
        if (plan.practice && Array.isArray(plan.practice)) {
            const practiceTasks = plan.practice.map(t => {
                let s = practicingSkills.find(ps => ps.name.toLowerCase() === (t.skillName || '').toLowerCase());
                if (!s && t.skillName) {
                    // Try partial match
                    s = practicingSkills.find(ps => t.skillName.toLowerCase().includes(ps.name.toLowerCase()) || ps.name.toLowerCase().includes(t.skillName.toLowerCase()));
                }
                return { ...t, skillId: s?._id };
            });
            const created = await aiTaskService.createTasksFromAi({ userId: req.user._id, tasks: practiceTasks, taskType: 'practice' });
            createdTasks.push(...created);
        }

        res.json({ message: 'Combined plan generated', totalTasks: createdTasks.length, tasks: createdTasks });
    } catch (error) {
        console.error('Combined plan generation error:', error);
        res.status(500).json({ message: 'Failed to generate combined plan', error: error.message });
    }
});

/**
 * @desc Toggle Roadmap Item Completion
 * @route PATCH /api/skills/:id/roadmap/:index
 */
router.patch('/:id/roadmap/:index', protect, async (req, res) => {
    try {
        const { id, index } = req.params;
        const skill = await Skill.findOne({ _id: id, user: req.user._id });

        if (!skill) {
            return res.status(404).json({ message: 'Skill not found' });
        }

        if (!skill.roadmap || !skill.roadmap[index]) {
            return res.status(404).json({ message: 'Roadmap item not found' });
        }

        // Toggle status
        skill.roadmap[index].isCompleted = !skill.roadmap[index].isCompleted;

        // If marking as completed, update last activity
        if (skill.roadmap[index].isCompleted) {
            await updateSkillActivity(req.user._id, skill._id);
        }

        await skill.save();
        res.json(skill);

    } catch (error) {
        console.error('Error updating roadmap item:', error);
        res.status(500).json({ message: 'Failed to update roadmap item', error: error.message });
    }
});

export default router;
