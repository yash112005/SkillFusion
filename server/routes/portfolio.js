const express = require('express');
const router = express.Router();
const { buildPortfolio } = require('../controllers/portfolioController');
const { protect } = require('../middleware/auth');

router.post('/generate', protect, buildPortfolio);

module.exports = router;
