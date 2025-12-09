import asyncHandler from 'express-async-handler';
import Job from '../models/jobModel.js';
import { addXP, checkBadges, XP_REWARDS } from '../services/gamificationService.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Private
const getJobs = asyncHandler(async (req, res) => {
    const jobs = await Job.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
});

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private
const createJob = asyncHandler(async (req, res) => {
    const { company, role, status, location, link, dateApplied, notes, skills } = req.body;

    const job = await Job.create({
        user: req.user._id,
        company,
        role,
        status,
        location,
        link,
        dateApplied,
        notes,
        skills,
    });

    let gamification = {};
    try {
        const xpResult = await addXP(req.user._id, XP_REWARDS.JOB_APPLICATION);
        const newBadges = await checkBadges(req.user._id, 'JOB_ADD');
        gamification = { xpResult, newBadges };
    } catch (e) {
        console.error('Gamification error:', e);
    }

    res.status(201).json({ ...job.toObject(), gamification });
});

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private
const updateJob = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);

    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    // Ensure user owns the job
    if (job.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    const updatedJob = await Job.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.json(updatedJob);
});

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private
const deleteJob = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);

    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    if (job.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    await job.deleteOne();

    res.json({ message: 'Job removed' });
});

// @desc    Generate Interview Prep
// @route   POST /api/jobs/prep
// @access  Private
const generateInterviewPrep = asyncHandler(async (req, res) => {
    const { role, skills } = req.body;

    if (!role) {
        res.status(400);
        throw new Error('Role is required');
    }

    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY not found');
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Use user defined model or fallback to 1.5-flash
        const model = genAI.getGenerativeModel({ model: process.env.GENERATIVE_MODEL || "gemini-1.5-flash" });

        const prompt = `Generate interview preparation questions for a "${role}" position requiring the following skills: "${skills || 'General'}". 
        CRITICAL INSTRUCTIONS:
        1. You MUST generate questions that cover ALL limited skills mentioned in the comma-separated list, not just the first one.
        2. If multiple skills are provided (e.g., "React, Node, AWS"), ensure the Technical questions are distributed across these topics.
        
        Return ONLY a valid JSON object (no markdown, no backticks) with exactly these three keys:
        - "technical": An array of 15 technical questions specific to the role and ALL the provided skills.
        - "behavioral": An array of 5 behavioral questions relevant to the role.
        - "questionsToAsk": An array of 5 strategic questions to ask the interviewer.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        const data = JSON.parse(text);
        res.json(data);

    } catch (error) {
        console.error("AI Generation Failed, falling back to keywords:", error.message);

        // Fallback: Rule-based generation
        const technical = [];
        const behavioral = [
            "Tell me about a time you faced a challenge and how you overcame it?",
            "Why do you want to work for this company?",
            "Where do you see yourself in 5 years?",
            "Describe your ideal work environment?",
            "How do you handle conflict with a coworker?"
        ];
        const questionsToAsk = [
            "What does success look like in this role for the first 90 days?",
            "Can you describe the team culture?",
            "What are the biggest challenges the team is facing right now?"
        ];

        const keywords = (role + ' ' + (skills || '')).toLowerCase();

        if (keywords.includes('react') || keywords.includes('frontend') || keywords.includes('web')) {
            technical.push("Explain the Virtual DOM and how it works in React.");
            technical.push("What is the difference between state and props?");
            technical.push("Explain the useEffect hook dependency array.");
            technical.push("How do you optimize a React application for performance?");
            questionsToAsk.push("What state management library do you use?");
        }

        if (keywords.includes('node') || keywords.includes('backend') || keywords.includes('api')) {
            technical.push("Explain the Event Loop in Node.js.");
            technical.push("Difference between SQL and NoSQL databases?");
            technical.push("How do you handle authentication and authorization?");
            technical.push("Explain REST vs GraphQL.");
        }

        if (keywords.includes('python') || keywords.includes('data')) {
            technical.push("Difference between list and tuple in Python?");
            technical.push("Explain list comprehension.");
            technical.push("How does garbage collection work in Python?");
        }

        if (keywords.includes('manager') || keywords.includes('lead')) {
            behavioral.push("Describe your management style.");
            behavioral.push("How do you handle underperforming team members?");
            questionsToAsk.push("How is the team currently structured?");
        }

        if (technical.length === 0) {
            technical.push(`What are the key technical skills required for a ${role}?`);
            technical.push("Describe a challenging technical project you delivered.");
            technical.push("How do you stay updated with industry trends?");
        }

        res.json({
            technical: technical.slice(0, 5),
            behavioral: behavioral.slice(0, 5),
            questionsToAsk: questionsToAsk.slice(0, 5)
        });
    }
});

export { getJobs, createJob, updateJob, deleteJob, generateInterviewPrep };
