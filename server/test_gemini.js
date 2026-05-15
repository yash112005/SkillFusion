const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const test = async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("API Key found:", apiKey ? "Yes (starts with " + apiKey.substring(0, 5) + ")" : "No");
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Test with the model name from the code
  const modelName = "gemini-2.5-flash-lite";
  console.log("Testing model:", modelName);
  
  try {
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      systemInstruction: "You are a helpful assistant." 
    });
    const result = await model.generateContent("Hi");
    console.log("Response with string instruction:", result.response.text());
  } catch (error) {
    console.error("Error with string instruction:", error.message);
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      systemInstruction: { parts: [{ text: "You are a helpful assistant." }] }
    });
    const result = await model.generateContent("Hi");
    console.log("Response with object instruction:", result.response.text());
  } catch (error) {
    console.error("Error with object instruction:", error.message);
  }
    
    // Try a known good model
    const fallbackModel = "gemini-1.5-flash";
    console.log("Testing fallback model:", fallbackModel);
    try {
      const model2 = genAI.getGenerativeModel({ model: fallbackModel });
      const result2 = await model2.generateContent("Hi");
      console.log("Fallback Response:", result2.response.text());
    } catch (err2) {
      console.error("Error with " + fallbackModel + ":", err2.message);
    }
  }
};

test();
