const { generateInterviewQuestions, evaluateInterviewAnswer } = require("../utils/geminiService");
const MockInterview = require("../models/MockInterview");

exports.startInterview = async (req, res) => {
  try {
    const { role, level, type, count } = req.body;
    
    if (!role || !level || !type || !count) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const questions = await generateInterviewQuestions(role, level, type, count);
    
    // Create an initial record in DB
    const interview = await MockInterview.create({
      userId: req.user._id,
      role,
      level,
      type,
      status: 'in-progress'
    });

    res.status(200).json({ 
      questions, 
      interviewId: interview._id 
    });
  } catch (error) {
    console.error("Interview start error:", error);
    res.status(500).json({ message: "Failed to generate interview questions" });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { interviewId, question, answer } = req.body;

    if (!interviewId || !question || !answer) {
      return res.status(400).json({ message: "Interview ID, question and answer are required" });
    }

    const evaluation = await evaluateInterviewAnswer(question, answer);
    
    // Update the interview record with this question and answer
    await MockInterview.findByIdAndUpdate(interviewId, {
      $push: {
        questions: {
          question,
          answer,
          score: evaluation.score,
          feedback: evaluation.feedback,
          confidence: evaluation.confidence
        }
      }
    });

    res.status(200).json(evaluation);
  } catch (error) {
    console.error("Answer evaluation error:", error);
    res.status(500).json({ message: "Failed to evaluate answer" });
  }
};

exports.completeInterview = async (req, res) => {
  try {
    const { interviewId, overallScore } = req.body;
    
    await MockInterview.findByIdAndUpdate(interviewId, {
      status: 'completed',
      overallScore: overallScore
    });

    res.status(200).json({ message: "Interview completed and saved" });
  } catch (error) {
    console.error("Complete interview error:", error);
    res.status(500).json({ message: "Failed to save interview progress" });
  }
};

exports.getInterviewHistory = async (req, res) => {
  try {
    const history = await MockInterview.find({ userId: req.user._id, status: 'completed' })
      .sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch interview history" });
  }
};
