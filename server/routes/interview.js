const express = require("express");
const router = express.Router();
const { startInterview, submitAnswer, completeInterview, getInterviewHistory } = require("../controllers/interviewController");
const { protect } = require("../middleware/auth");

router.post("/start", protect, startInterview);
router.post("/evaluate", protect, submitAnswer);
router.post("/complete", protect, completeInterview);
router.get("/history", protect, getInterviewHistory);

module.exports = router;
