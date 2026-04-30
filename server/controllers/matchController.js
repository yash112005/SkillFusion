const Match = require('../models/Match');
const { PDFParse } = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const retryWithBackoff = require('../utils/retryWithBackoff');

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

const generateMatch = async (req, res) => {
  try {
    if (!req.files || !req.files.resume || !req.files.jd) {
      return res.status(400).json({
        message: 'Please upload both resume and job description files.'
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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash'
    });

    const prompt = `Compare the following resume with the job description.
Return ONLY valid JSON.

{
  "score": number,
  "matches": [
    { "skill": "string", "jd_req": "string", "percent": number }
  ],
  "suggestions": "string"
}

Resume:
${resumeText.substring(0, 5000)}

Job Description:
${jdText.substring(0, 5000)}
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
        message: 'Failed to parse AI response',
        rawResponse: aiText
      });
    }

    
    const match = await Match.create({
      userId: req.user._id,
      score: resultJson.score,
      matchedSkills: resultJson.matches,
      suggestions: resultJson.suggestions,
      atsScore: Math.floor(Math.random() * 30) + 60
    });

    res.status(201).json(match);

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

module.exports = { generateMatch, getMatchHistory };