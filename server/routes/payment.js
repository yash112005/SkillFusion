const express = require('express');
const { createOrder, verifyPayment, handleWebhook, getBillingInfo, getInvoices, getAdminAnalytics, applyCoupon } = require('../controllers/paymentController');


const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/billing-info', protect, getBillingInfo);
router.get('/invoices', protect, getInvoices);
router.get('/admin/analytics', protect, authorize('admin'), getAdminAnalytics);
router.post('/apply-coupon', protect, applyCoupon);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);






module.exports = router;
