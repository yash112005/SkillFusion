const { GoogleGenerativeAI } = require("@google/generative-ai");
const retryWithBackoff = require("../utils/retryWithBackoff");

const handleSkillyChat = async (req, res) => {
  try {
    const { message, history } = req.body;
    const context = req.body.context || {};
    const userRole = req.user?.role || "candidate";

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Skilly Chat Error: GEMINI_API_KEY is not set");
      return res.status(500).json({ message: "AI service is not configured." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      // FIX 1: Use a valid, publicly available Gemini model name
      model: "gemini-2.5-flash",
      systemInstruction: `
        You are Skilly, a helpful AI assistant in a job search and resume builder app.
        Your identity: Friendly, clear, and concise. Solve doubts fast.
        Your name is Skilly.
        
        User Role: ${userRole}
        
        Context Awareness:
        - Has Resume Uploaded: ${context.hasResume ? "Yes" : "No"}
        - Has JD Uploaded: ${context.hasJD ? "Yes" : "No"}
        - Current Match Score: ${context.matchScore || "N/A"}
        ${context.resumeText ? `Resume Content: ${context.resumeText.substring(0, 1000)}...` : ""}
        ${context.jdText ? `JD Content: ${context.jdText.substring(0, 1000)}...` : ""}

        Answer Domains:
        1. Resume Doubts (format, pages, summary, bullet points, ATS).
        2. Job Search Tips (fresher tips, cold emails, referrals, LinkedIn, interviews).
        3. App Usage (how to upload, where to paste JD, how score works).
        4. JD & Match Score (explaining scores, missing skills, ATS keywords).

        Rules:
        - Keep answers SHORT (max 3-4 sentences for simple doubts).
        - Use simple numbered lists for complex doubts (max 5 points).
        - Reference the user's uploaded resume/JD if available.
        - Never say "Great question!" or filler phrases.
        - Always end with ONE optional follow-up offer (e.g., "Want me to explain [topic] too?").
        - If user is a recruiter, shift perspective to hiring/JD optimization.
        - If user asks something out of scope, politely redirect to resume/job search.
        - If user says "thanks/ok", respond with "Anytime! Ask if anything else comes up."
        - If user asks who you are: "I'm Skilly — your AI assistant for resumes, job search, and everything in this app!"
      `,
    });

    // FIX 2: Correctly format history for Gemini
    // - History must strictly alternate: user → model → user → model ...
    // - The LAST message in history must be from 'model' (Gemini appends the new user message internally)
    // - Do NOT add a fabricated model message at the end — only trim or fix real history
    const formattedHistory = [];

    (history || []).forEach((msg) => {
      const role = msg.role === "user" ? "user" : "model";
      
      // CRITICAL: Gemini history MUST start with a 'user' message
      if (formattedHistory.length === 0 && role === "model") return;

      const lastEntry = formattedHistory[formattedHistory.length - 1];
      if (lastEntry && lastEntry.role === role) {
        lastEntry.parts[0].text += `\n${msg.content}`;
      } else {
        formattedHistory.push({ role, parts: [{ text: msg.content }] });
      }
    });

    // FIX 3: Remove the fabricated model padding that was confusing Gemini.
    // If history ends with a 'user' message, drop it — sendMessage() will send
    // the real user message, and having a dangling user entry causes API errors.
    if (
      formattedHistory.length > 0 &&
      formattedHistory[formattedHistory.length - 1].role === "user"
    ) {
      formattedHistory.pop();
    }

    const chat = model.startChat({
      history: formattedHistory,
    });

    // FIX 4: Await retryWithBackoff correctly and log the raw response for debugging
    const result = await retryWithBackoff(() => chat.sendMessage(message));

    // Uncomment the line below temporarily to debug raw Gemini output:
    // console.log("Raw Gemini result:", JSON.stringify(result.response, null, 2));

    let responseText = "I couldn't generate a response. Please try again.";

    try {
      responseText = result.response.text();
    } catch (parseError) {
      // FIX 5: Log the parse error so it's not silently swallowed
      console.error("Skilly Chat — response parse error:", parseError);

      const finishReason =
        result.response?.candidates?.[0]?.finishReason || "";

      if (finishReason === "SAFETY") {
        responseText =
          "I can't answer that due to safety policies. Let's talk about resumes or job search instead!";
      } else if (finishReason === "RECITATION") {
        responseText =
          "I can't reproduce that content. Try rephrasing your question.";
      } else if (finishReason === "MAX_TOKENS") {
        responseText =
          "My response was too long to send. Could you ask a more specific question?";
      }
    }

    res.json({ content: responseText });
  } catch (error) {
    console.error("Skilly Chat Error:", error?.message || error);
    res
      .status(500)
      .json({ message: "Skilly is a bit overwhelmed. Try again in a second!" });
  }
};

module.exports = { handleSkillyChat };