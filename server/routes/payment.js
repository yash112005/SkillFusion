import express from 'express';
import { createOrder, handleWebhook } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;
