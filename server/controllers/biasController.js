const { analyzeBias, inclusiveRewrite } = require('../utils/geminiService');

const getBiasAnalysis = async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ message: "Description is required" });
    }

    const analysis = await analyzeBias(description);
    res.json(analysis);
  } catch (error) {
    console.error("Bias Analysis Error:", error);
    res.status(500).json({ message: error.message });
  }
};

const getInclusiveRewrite = async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ message: "Description is required" });
    }

    const rewrittenText = await inclusiveRewrite(description);
    res.json({ rewrittenText });
  } catch (error) {
    console.error("Inclusive Rewrite Error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBiasAnalysis, getInclusiveRewrite };
