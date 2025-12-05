import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import DailySummary from '../models/dailySummaryModel.js';
import Task from '../models/taskModel.js';
import Habit from '../models/habitModel.js';
import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService.js';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        if (!user.isVerified && process.env.NODE_ENV !== 'development') {
            res.status(401);
            throw new Error('Please verify your email address.');
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, gender } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    const user = await User.create({
        name,
        email,
        password,
        gender,
        verificationToken,
        isVerified: false
    });

    if (user) {
        // Send verification email
        try {
            await sendVerificationEmail(user.email, user.verificationToken);
        } catch (error) {
            console.error('Failed to send verification email:', error);
            // Consider deleting the user or allowing resend
        }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            message: 'Registration successful. Please verify your email.',
            // Do NOT return token here
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Verify email
// @route   GET /api/users/verify/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
    const token = req.params.token;

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired verification token');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.send('Email verified successfully. You can now login to the app.');
});

// @desc    Check verification status (Polling)
// @route   GET /api/users/check-verification/:email
// @access  Public
const checkVerificationStatus = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.params.email });

    if (user && user.isVerified) {
        res.json({
            isVerified: true,
            token: generateToken(user._id),
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                gender: user.gender,
                profilePicture: user.profilePicture,
                onboardingCompleted: user.onboardingCompleted
            }
        });
    } else {
        res.json({ isVerified: false });
    }
});

// @desc    Forgot Password
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and save to DB
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    try {
        await sendPasswordResetEmail(user.email, resetToken);
        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        res.status(500);
        throw new Error('Email could not be sent');
    }
});

// @desc    Reset Password
// @route   POST /api/users/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    // Hash incoming token to compare with DB
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired token');
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password updated successfully' });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            gender: user.gender,
            profilePicture: user.profilePicture,
            onboardingCompleted: user.onboardingCompleted,
            xp: user.xp,
            level: user.level,
            badges: user.badges,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private
const getUserStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // 1. Total Work Hours (from DailySummary)
    const totalWorkResult = await DailySummary.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, totalSeconds: { $sum: '$totalWorkSeconds' } } }
    ]);
    const totalHours = totalWorkResult.length > 0
        ? Math.round(totalWorkResult[0].totalSeconds / 3600)
        : 0;

    // 2. Tasks Completed
    const completedTasks = await Task.countDocuments({
        user: userId,
        status: 'Completed'
    });

    // 3. Best Streak (from Habits)
    const bestStreakResult = await Habit.find({ user: userId })
        .sort({ currentStreak: -1 })
        .limit(1);
    const bestStreak = bestStreakResult.length > 0 ? bestStreakResult[0].currentStreak : 0;

    res.json({
        totalHours,
        completedTasks,
        streak: bestStreak
    });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.gender) {
            user.gender = req.body.gender;
        }

        if (req.body.profilePicture) {
            user.profilePicture = req.body.profilePicture;
        }

        if (req.body.onboardingCompleted !== undefined) {
            user.onboardingCompleted = req.body.onboardingCompleted;
        }

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            gender: updatedUser.gender,
            profilePicture: updatedUser.profilePicture,
            onboardingCompleted: updatedUser.onboardingCompleted,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});


// @desc    Get dashboard data for a specific date
// @route   GET /api/users/dashboard/:date
// @access  Private
const getDashboardData = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { date } = req.params;

    // Validate date format and ensure it's within last 90 days
    const requestedDate = new Date(date);
    const today = new Date();
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(today.getDate() - 90);

    if (isNaN(requestedDate.getTime())) {
        res.status(400);
        throw new Error('Invalid date format');
    }

    if (requestedDate > today || requestedDate < ninetyDaysAgo) {
        res.status(400);
        throw new Error('Date must be within the last 90 days');
    }

    // Format date for querying (YYYY-MM-DD)
    const dateStr = requestedDate.toISOString().split('T')[0];
    const nextDay = new Date(requestedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split('T')[0];

    try {
        // Fetch data for the specific date
        const [tasks, timers, habits, transactions, notes] = await Promise.all([
            // Tasks completed on this date
            Task.find({
                user: userId,
                status: 'Completed',
                updatedAt: {
                    $gte: new Date(dateStr),
                    $lt: new Date(nextDayStr)
                }
            }).select('title description status priority tags'),

            // Timers from this date
            (async () => {
                const Timer = (await import('../models/timerModel.js')).default;
                return Timer.find({
                    user: userId,
                    createdAt: {
                        $gte: new Date(dateStr),
                        $lt: new Date(nextDayStr)
                    }
                }).select('title description duration type');
            })(),

            // Habits completed on this date
            Habit.find({
                user: userId,
                [`completionHistory.${dateStr}`]: true
            }).select('name color targetDays currentStreak'),

            // Transactions from this date
            (async () => {
                const Transaction = (await import('../models/transactionModel.js')).default;
                return Transaction.find({
                    user: userId,
                    date: {
                        $gte: new Date(dateStr),
                        $lt: new Date(nextDayStr)
                    }
                }).select('description amount type category');
            })(),

            // Notes created on this date
            (async () => {
                const Note = (await import('../models/noteModel.js')).default;
                return Note.find({
                    user: userId,
                    createdAt: {
                        $gte: new Date(dateStr),
                        $lt: new Date(nextDayStr)
                    }
                }).select('title content color');
            })()
        ]);

        res.json({
            date: dateStr,
            tasks: tasks || [],
            timers: timers || [],
            habits: habits || [],
            transactions: transactions || [],
            notes: notes || []
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500);
        throw new Error('Failed to fetch dashboard data');
    }
});

export {
    authUser,
    registerUser,
    verifyEmail,
    checkVerificationStatus,
    forgotPassword,
    resetPassword,
    getUserProfile,
    getUserStats,
    updateUserProfile,
    getDashboardData
};

