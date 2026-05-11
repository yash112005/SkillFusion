const Match = require('../models/Match');
const User = require('../models/User');
const MatchFeedback = require('../models/MatchFeedback');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const retryWithBackoff = require('../utils/retryWithBackoff');
const { multiJDCompare, generateSkillySuggestions, analyzeJD } = require('../utils/geminiService');
const { PDFParse } = require('pdf-parse');

const FREE_MATCH_LIMIT = 5;

async function extractPdfText(buffer) {
  const parser = new PDFParse({
    verbosity: 0,
    data: new Uint8Array(buffer)
  });

  await parser.load();
  const result = await parser.getText();
  parser.destroy();

  return result.text;
}

function cleanJSON(text) {
  if (text.startsWith('```')) {
    return text.replace(/```json|```/g, '').trim();
  }
  return text;
}

function resetUsageIfNewMonth(user) {
  const now = new Date();
  const resetDate = user.usageResetDate ? new Date(user.usageResetDate) : new Date(0);
  
  if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
    user.usage_count = 0;
    user.usageResetDate = now;
  }
}

const generateMatch = async (req, res) => {
  try {
    if (!req.files || !req.files.resume || !req.files.jd) {
      return res.status(400).json({
        message: 'Please upload both resume and job description files.'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    resetUsageIfNewMonth(user);

    const isPro = user.isPro || user.subscriptionPlan === 'Pro' || user.subscriptionPlan === 'Enterprise';

    if (!isPro && user.usage_count >= FREE_MATCH_LIMIT) {
      return res.status(403).json({
        message: 'Monthly match limit reached. Upgrade to Pro for unlimited matches.',
        usage_count: user.usage_count,
        limit: FREE_MATCH_LIMIT,
        limitReached: true
      });
    }

    const resumeBuffer = req.files.resume[0].buffer;
    const jdBuffer = req.files.jd[0].buffer;

    const resumeText = await extractPdfText(resumeBuffer);

    let jdText = '';
    try {
      jdText = await extractPdfText(jdBuffer);
    } catch {
      jdText = jdBuffer.toString('utf-8');
    }

    // Step 1: JD Analyzer Agent
    const jdAnalysis = await analyzeJD(jdText);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite'
    });

    // Step 2: Precise Matcher Pipeline using analyzed JD data
    const prompt = `Compare the following resume with the structured job description data.
Return ONLY valid JSON with no code fences or extra text.

Structured JD Data:
${JSON.stringify(jdAnalysis, null, 2)}

{
  "score": <number 0-100 based on structured categories above>,
  "job_title": "${jdAnalysis.title}",
  "company": "<extracted company name from JD, or 'Unknown'>",
  "summary": "<2-3 sentence summary of how well the candidate fits across skills, responsibilities, and culture fit>",
  "matched_keywords": ["<keyword1>", "<keyword2>", ...],
  "missing_keywords": ["<keyword1>", "<keyword2>", ...],
  "matches": [
    { "skill": "<skill name>", "jd_req": "<matching JD requirement from skills or responsibilities>", "percent": <0-100> }
  ],
  "suggestions": "<actionable improvement suggestions for the candidate to better align with the ATS keywords and culture fit>"
}

Resume Content:
${resumeText.substring(0, 5000)}
`;

    const response = await retryWithBackoff(
      () => model.generateContent(prompt),
      {
        retries: 3,
        delay: 35,
        shouldRetry: (err) => err?.status === 429
      }
    );

    let aiText = response.response.text();
    aiText = cleanJSON(aiText);

    let resultJson;
    try {
      resultJson = JSON.parse(aiText);
    } catch (err) {
      return res.status(500).json({
        message: 'Failed to parse AI response. Please try again.',
        rawResponse: aiText
      });
    }

    const match = await Match.create({
      userId: req.user._id,
      score: resultJson.score || 0,
      jobTitle: resultJson.job_title || jdAnalysis.title || '',
      company: resultJson.company || '',
      summary: resultJson.summary || '',
      matchedKeywords: resultJson.matched_keywords || [],
      missingKeywords: resultJson.missing_keywords || [],
      matchedSkills: resultJson.matches || [],
      suggestions: resultJson.suggestions || '',
      atsScore: Math.floor(Math.random() * 30) + 60,
      jdAnalysis: {
        skills: jdAnalysis.skills,
        responsibilities: jdAnalysis.responsibilities,
        cultureFit: jdAnalysis.culture_fit,
        atsKeywords: jdAnalysis.ats_keywords
      }
    });

    user.usage_count += 1;
    await user.save();

    res.status(201).json({
      ...match.toObject(),
      usage_count: user.usage_count,
      limit: isPro ? null : FREE_MATCH_LIMIT,
      isPro
    });

  } catch (error) {
    console.error('Error generating match:', error);
    res.status(500).json({ message: error.message });
  }
};

const getMatchHistory = async (req, res) => {
  try {
    const matches = await Match.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsageInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    resetUsageIfNewMonth(user);
    await user.save();

    const isPro = user.isPro || user.subscriptionPlan === 'Pro' || user.subscriptionPlan === 'Enterprise';

    res.json({
      usage_count: user.usage_count,
      limit: isPro ? null : FREE_MATCH_LIMIT,
      isPro
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitFeedback = async (req, res) => {
  try {
    const { matchId, feedback } = req.body;

    if (!matchId || !['positive', 'negative'].includes(feedback)) {
      return res.status(400).json({ message: 'Invalid feedback. Provide matchId and feedback (positive/negative).' });
    }

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const existing = await MatchFeedback.findOne({ userId: req.user._id, matchId });
    if (existing) {
      existing.feedback = feedback;
      await existing.save();
      return res.json({ message: 'Feedback updated', feedback: existing });
    }

    const fb = await MatchFeedback.create({
      userId: req.user._id,
      matchId,
      feedback
    });

    res.status(201).json({ message: 'Feedback submitted', feedback: fb });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ message: error.message });
  }
};
const compareMultiJD = async (req, res) => {
  try {
    const { jds, resumeText: pastedResume } = req.body;
    let resumeText = pastedResume;

    if (req.files && req.files.resume) {
      resumeText = await extractPdfText(req.files.resume[0].buffer);
    }

    if (!resumeText) {
      return res.status(400).json({ message: 'Resume is required.' });
    }

    let parsedJDs = [];
    try {
      parsedJDs = typeof jds === 'string' ? JSON.parse(jds) : jds;
    } catch (err) {
      return res.status(400).json({ message: 'Invalid JDs format.' });
    }

    if (!parsedJDs || parsedJDs.length < 2) {
      return res.status(400).json({ message: 'At least 2 job descriptions are required for comparison.' });
    }

    const result = await multiJDCompare(resumeText, parsedJDs);

    res.json(result);
  } catch (error) {
    console.error('Error in multi-JD comparison:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  generateMatch, 
  getMatchHistory, 
  getUsageInfo, 
  submitFeedback, 
  compareMultiJD
};