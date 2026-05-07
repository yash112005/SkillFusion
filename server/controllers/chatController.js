const { GoogleGenerativeAI } = require("@google/generative-ai");
const retryWithBackoff = require("../utils/retryWithBackoff");

const handleSkillyChat = async (req, res) => {
  try {
    const { message, history } = req.body;
    const context = req.body.context || {};
    const userRole = req.user?.role || 'candidate';

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Skilly Chat Error: GEMINI_API_KEY is not set");
      return res.status(500).json({ message: "AI service is not configured." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const systemPrompt = `
      You are Skilly, a helpful AI assistant in a job search and resume builder app.
      Your identity: Friendly, clear, and concise. Solve doubts fast.
      Your name is Skilly.
      
      User Role: ${userRole}
      
      Context Awareness:
      - Has Resume Uploaded: ${context.hasResume ? 'Yes' : 'No'}
      - Has JD Uploaded: ${context.hasJD ? 'Yes' : 'No'}
      - Current Match Score: ${context.matchScore || 'N/A'}
      ${context.resumeText ? `Resume Content: ${context.resumeText.substring(0, 1000)}...` : ''}
      ${context.jdText ? `JD Content: ${context.jdText.substring(0, 1000)}...` : ''}

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
    `;

    // Format history for Gemini (must alternate user/model)
    const formattedHistory = [];
    
    formattedHistory.push({ role: "user", parts: [{ text: systemPrompt }] });
    formattedHistory.push({ role: "model", parts: [{ text: "Understood. I am Skilly, your helpful AI assistant. I will provide concise, helpful, and contextual assistance for resumes and job searches." }] });

    (history || []).forEach(msg => {
      const role = msg.role === 'user' ? 'user' : 'model';
      // If same role as last, append to last message parts (Gemini doesn't like consecutive same roles)
      if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === role) {
        formattedHistory[formattedHistory.length - 1].parts[0].text += `\n${msg.content}`;
      } else {
        formattedHistory.push({ role, parts: [{ text: msg.content }] });
      }
    });

    const chat = model.startChat({
      history: formattedHistory
    });

    const result = await retryWithBackoff(() => chat.sendMessage(message));
    const responseText = result.response.text();

    res.json({ content: responseText });
  } catch (error) {
    console.error("Skilly Chat Error:", error?.message || error);
    res.status(500).json({ message: "Skilly is a bit overwhelmed. Try again in a second!" });
  }
};

module.exports = { handleSkillyChat };
