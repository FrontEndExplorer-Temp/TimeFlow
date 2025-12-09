import asyncHandler from 'express-async-handler';
import AIKey from '../models/AIKey.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// @desc    Add a new AI Key
// @route   POST /api/ai-keys
// @access  Private/Admin
const addKey = asyncHandler(async (req, res) => {
    const { key, label, provider } = req.body;

    if (!key || !label) {
        res.status(400);
        throw new Error('Key and Label are required');
    }

    // 1. Validate Key by listing models (lighter and safer)
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
        );
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }
        if (!data.models) {
            throw new Error('No models found for this key.');
        }
    } catch (error) {
        console.error("Key Validation Failed:", error.message);
        res.status(400);
        throw new Error(`Invalid API Key: ${error.message}`);
    }

    // 2. Save Key
    const isGlobal = req.user.isAdmin && req.body.isGlobal === true;

    const newKey = await AIKey.create({
        key,
        label,
        provider: provider || 'google',
        status: 'active',
        isActive: true,
        owner: req.user._id,
        isGlobal: isGlobal,
    });

    if (newKey) {
        res.status(201).json({
            _id: newKey._id,
            label: newKey.label,
            status: newKey.status,
            usageCount: newKey.usageCount
        });
    } else {
        res.status(400);
        throw new Error('Invalid key data');
    }
});

// @desc    Get all AI Keys
// @route   GET /api/ai-keys
// @access  Private
const getKeys = asyncHandler(async (req, res) => {
    let query = {};

    if (req.user.isAdmin) {
        // Admins: See Global Keys OR Own Keys OR Legacy Keys (no owner)
        query = {
            $or: [
                { isGlobal: true },
                { owner: req.user._id },
                { owner: { $exists: false } }, // Legacy
                { owner: null } // Legacy
            ]
        };
    } else {
        // Users: See Only Own Keys
        query = { owner: req.user._id };
    }

    const keys = await AIKey.find(query).select('-key').sort('-createdAt');
    res.json(keys);
});

// @desc    Delete AI Key
// @route   DELETE /api/ai-keys/:id
// @access  Private/Admin
const deleteKey = asyncHandler(async (req, res) => {
    const key = await AIKey.findById(req.params.id);

    if (key) {
        // Only owner or admin can delete
        if (key.owner.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            res.status(401);
            throw new Error('Not authorized to delete this key');
        }

        await key.deleteOne();
        res.json({ message: 'Key removed' });
    } else {
        res.status(404);
        throw new Error('Key not found');
    }
});

// @desc    Toggle Key Status or Reset Quota
// @route   PUT /api/ai-keys/:id/reset
// @access  Private/Admin
const resetKey = asyncHandler(async (req, res) => {
    const key = await AIKey.findById(req.params.id);

    if (key) {
        // Only owner or admin can delete
        if (key.owner.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            res.status(401);
            throw new Error('Not authorized to reset this key');
        }

        key.status = 'active';
        key.isActive = true;
        key.errorCount = 0;
        await key.save();
        res.json({ message: 'Key status reset to active', key });
    } else {
        res.status(404);
        throw new Error('Key not found');
    }
});

export { addKey, getKeys, deleteKey, resetKey };
