const { generateInterviewQuestions, evaluateInterviewAnswer } = require("../utils/geminiService");
const MockInterview = require("../models/MockInterview");
const User = require("../models/User");
const { sendEmail } = require("../utils/emailService");

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
    const { interviewId, overallScore, evaluations } = req.body;
    
    const interview = await MockInterview.findByIdAndUpdate(interviewId, {
      status: 'completed',
      overallScore: overallScore
    }, { new: true });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Try to send email report
    try {
      const user = await User.findById(req.user._id);
      if (user && user.email) {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #4f46e5; text-align: center;">Interview Performance Report</h2>
            <p>Hi ${user.name || 'there'},</p>
            <p>Congratulations on completing your mock interview for the <strong>${interview.role}</strong> position!</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <span style="font-size: 24px; font-weight: bold; color: #111827;">Overall Score: ${overallScore}%</span>
            </div>

            <h3>Summary:</h3>
            <ul>
              <li><strong>Role:</strong> ${interview.role}</li>
              <li><strong>Level:</strong> ${interview.level}</li>
              <li><strong>Type:</strong> ${interview.type}</li>
              <li><strong>Total Questions:</strong> ${evaluations ? evaluations.length : interview.questions.length}</li>
            </ul>

            <p>You can view your detailed feedback and download the full PDF report by visiting your dashboard.</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/candidate" 
                 style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                View Full Report
              </a>
            </div>
            
            <p style="margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center;">
              Keep practicing to sharpen your skills! <br/>
              &copy; ${new Date().getFullYear()} SkillFusion
            </p>
          </div>
        `;

        await sendEmail({
          to: user.email,
          subject: `Your Interview Report: ${interview.role}`,
          html: emailHtml
        });
      }
    } catch (emailErr) {
      console.error("Failed to send interview report email:", emailErr);
      // Don't fail the whole request if email fails
    }

    res.status(200).json({ message: "Interview completed and report sent" });
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
