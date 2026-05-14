const { generatePortfolioData } = require('../utils/geminiService');

const buildPortfolio = async (req, res) => {
  try {
    const { resumeText, jdText } = req.body;
    if (!resumeText || !jdText) {
      return res.status(400).json({ message: "Resume and Job Description are required" });
    }

    const portfolioData = await generatePortfolioData(resumeText, jdText);
    res.json(portfolioData);
  } catch (error) {
    console.error("Portfolio Generation Error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { buildPortfolio };
