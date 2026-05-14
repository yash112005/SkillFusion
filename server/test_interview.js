const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    // There isn't a direct listModels in the JS SDK that is easily accessible without the rest client
    // but we can try to fetch it via node-fetch or axios if we had it.
    // However, let's try a common one that should definitely exist: "gemini-2.5-flash-lite"
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent("test");
    console.log("Result:", result.response.text());
  } catch (err) {
    console.error("Error details:", JSON.stringify(err, null, 2));
  }
}

listModels();
