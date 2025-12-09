import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { addKey, getKeys, deleteKey, resetKey } from '../controllers/aiKeyController.js';

const router = express.Router();

router.route('/')
    .post(protect, addKey)
    .get(protect, getKeys);

router.route('/:id')
    .delete(protect, deleteKey);

router.route('/:id/reset')
    .put(protect, resetKey);

export default router;
