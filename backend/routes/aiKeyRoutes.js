import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { addKey, getKeys, deleteKey, resetKey } from '../controllers/aiKeyController.js';

const router = express.Router();

router.route('/')
    .post(protect, admin, addKey)
    .get(protect, admin, getKeys);

router.route('/:id')
    .delete(protect, admin, deleteKey);

router.route('/:id/reset')
    .put(protect, admin, resetKey);

export default router;
