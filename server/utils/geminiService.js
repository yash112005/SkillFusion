const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const retryWithBackoff = require('./retryWithBackoff');

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function cleanAIJSON(text) {
  try {
    // Remove potential markdown fences
    let cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    
    // If still contains fences (Gemini sometimes puts them in the middle or incorrectly)
    if (cleaned.includes('```')) {
      cleaned = cleaned.replace(/```json|```/g, "").trim();
    }
    
    // Try to find the first [ or { and last ] or } to extract just the JSON
    const startBracket = cleaned.indexOf('[');
    const startBrace = cleaned.indexOf('{');
    let start = -1;
    let end = -1;

    if (startBracket !== -1 && (startBrace === -1 || startBracket < startBrace)) {
      start = startBracket;
      end = cleaned.lastIndexOf(']');
    } else if (startBrace !== -1) {
      start = startBrace;
      end = cleaned.lastIndexOf('}');
    }

    if (start !== -1 && end !== -1 && end > start) {
      cleaned = cleaned.substring(start, end + 1);
    }

    return cleaned;
  } catch (err) {
    console.error("Error in cleanAIJSON:", err);
    return text;
  }
}


function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}


async function getEmbedding(text) {
  try {
    const model = client.getGenerativeModel({ model: "gemini-embedding-001" });
    const res   = await model.embedContent(String(text));
    if (!res.embedding || !res.embedding.values) {
      throw new Error("No embedding returned from Gemini");
    }
    return res.embedding.values;
  } catch (error) {
    console.error("Error in Gemini Embedding API:", error.message);
    throw new Error("Failed to get embedding from Gemini API");
  }
}


async function batchEmbed(texts) {
  const results = [];
  for (const t of texts) {
    try {
      const vector = await getEmbedding(t);
      results.push({ text: t, vector });
    } catch {
      results.push({ text: t, vector: null });
    }
  }
  return results;
}


async function embeddingSkillMatch(sourceSkills, targetSkills, threshold = 0.70) {
  if (!sourceSkills?.length || !targetSkills?.length) {
    return { matched: [], unmatched: sourceSkills || [] };
  }

  const [srcEmbedded, tgtEmbedded] = await Promise.all([
    batchEmbed(sourceSkills),
    batchEmbed(targetSkills),
  ]);

  const matched   = [];
  const unmatched = [];

  for (const src of srcEmbedded) {
    if (!src.vector) { unmatched.push(src.text); continue; }

    let bestScore = 0;
    let bestMatch = null;

    for (const tgt of tgtEmbedded) {
      if (!tgt.vector) continue;
      const score = cosineSimilarity(src.vector, tgt.vector);
      if (score > bestScore) { bestScore = score; bestMatch = tgt.text; }
    }

    if (bestScore >= threshold) {
      matched.push({ skill: src.text, matchedWith: bestMatch, score: parseFloat(bestScore.toFixed(3)) });
    } else {
      unmatched.push(src.text);
    }
  }

  return { matched, unmatched };
}


async function matchProjectsToJob(projects = [], jobSkills = [], jobResponsibilities = []) {
  if (!projects.length) return [];


  const jobContext = [...jobSkills, ...jobResponsibilities].join(". ");
  const jobVector  = await getEmbedding(jobContext).catch(() => null);
  if (!jobVector) return projects.map(p => ({ project: p, relevanceScore: 0 }));

  const scored = await Promise.all(
    projects.map(async (project) => {

      const projectText = typeof project === "object"
        ? `${project.name || ""} ${project.description || ""} ${(project.technologies || []).join(" ")}`
        : String(project);

      const projVector = await getEmbedding(projectText).catch(() => null);
      const score = projVector ? cosineSimilarity(projVector, jobVector) : 0;
      return {
        project,
        relevanceScore: parseFloat(score.toFixed(3)),
        isRelevant: score >= 0.65,
      };
    })
  );

  return scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
}


async function geminiaiAnalyzer(resumeText, jobText) {

  resumeText = cleaningText(resumeText);
  jobText    = cleaningText(jobText);

  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });


  const prompt = `
    Resume: ${resumeText}
    Job Description: ${jobText}

    Extract the following fields from both resume and job description and return strictly in JSON format.
    Return only valid JSON. Do not include code fences, language labels, or any text outside JSON.

    {
      "resume": {
        "education": [],
        "experience": [],
        "skills": [],
        "certifications": [],
        "keywords": [],
        "projects": [],
        "Language": [],
        "Achievement": [],
        "Interest": []
      },
      "job": {
        "title": "",
        "department": "",
        "jobLocation": "",
        "employmentType": "",
        "requiredSkills": [],
        "experience": 0,
        "educationRequired": "",
        "responsibilities": [],
        "keywords": [],
        "preferredQualifications": [],
        "salaryRange": "",
        "benefits": [],
        "workSchedule": "",
        "reportingLine": "",
        "careerGrowth": "",
        "applicationProcess": "",
        "equalOpportunityStatement": "",
        "datePosted": "",
        "status": ""
      },
      "matchResult": {
        "similarityScore": 0,
        "matchedSkills": [],
        "missingSkills": [],
        "experienceGap": 0,
        "educationMatch": false,
        "projectMatched": [],
        "achievementMatched": [],
        "experienceMatch": false,
        "extractSkills": [],
        "educationRequired": [],
        "keywordsMatch": [],
        "keywordsMissing": [],
        "recommendation": [],
        "suggestions": [],
        "resumeExperience": [],
        "resumeEducation": [],
        "jobResponsibilities": [],
        "jobEducationRequired": []
      }
    }
  `;


  let rawText;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      rawText = result.response.text();
      break;
    } catch (err) {
      if (err.status === 429 && attempt < 3) {
        const wait = attempt * 35000;
        console.log(`Rate limited. Retrying in ${wait / 1000}s...`);
        await new Promise(r => setTimeout(r, wait));
      } else throw err;
    }
  }


  let parsed;
  try {
    const clean = cleanAIJSON(rawText);
    parsed = JSON.parse(clean);
  } catch {
    console.error("Failed to parse LLM JSON, returning raw text");
    return rawText;
  }


  const resumeSkills  = parsed.resume?.skills   || [];
  const resumeKeywords = parsed.resume?.keywords || [];
  const jobSkills     = parsed.job?.requiredSkills || [];
  const jobKeywords   = parsed.job?.keywords       || [];


  const allResumeTerms = [...new Set([...resumeSkills, ...resumeKeywords])];

  const allJobTerms    = [...new Set([...jobSkills, ...jobKeywords])];

  let embeddingSkillResult = { matched: [], unmatched: [] };
  let embeddingKeywordResult = { matched: [], unmatched: [] };
  let scoredProjects = [];

  try {

    embeddingSkillResult = await embeddingSkillMatch(allResumeTerms, allJobTerms, 0.70);


    embeddingKeywordResult = await embeddingSkillMatch(
      parsed.resume?.keywords || [],
      parsed.job?.keywords    || [],
      0.65
    );


    scoredProjects = await matchProjectsToJob(
      parsed.resume?.projects      || [],
      parsed.job?.requiredSkills   || [],
      parsed.job?.responsibilities || []
    );
  } catch (embErr) {
    console.error("Embedding enrichment failed (non-fatal):", embErr.message);
  }


  parsed.matchResult = {
    ...parsed.matchResult,


    embeddingMatchedSkills: embeddingSkillResult.matched,
    embeddingMissingSkills: embeddingSkillResult.unmatched,


    embeddingKeywordsMatch:   embeddingKeywordResult.matched,
    embeddingKeywordsMissing: embeddingKeywordResult.unmatched,


    projectsRankedByRelevance: scoredProjects,

    relevantProjects: scoredProjects.filter(p => p.isRelevant).map(p => p.project),


    embeddingSimilarityScore: embeddingSkillResult.matched.length
      ? parseFloat(
          (
            embeddingSkillResult.matched
              .slice(0, 3)
              .reduce((sum, m) => sum + m.score, 0) /
            Math.min(3, embeddingSkillResult.matched.length)
          ).toFixed(3)
        )
      : 0,
  };

  return parsed;
}


function cleaningText(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function generateResumeContent(promptType, data, jobDescription = "") {
  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
  let prompt = "";

  if (promptType === "summary") {
    prompt = `Write a professional resume summary (max 3-4 sentences) for a candidate with the following details: ${JSON.stringify(data)}.
    ${jobDescription ? `Tailor the summary to align with this job description: ${jobDescription}` : ""}
    Return ONLY the summary text.`;
  } else if (promptType === "bullets") {
    prompt = `Rewrite the following job experience description into 3-4 professional, ATS-friendly bullet points starting with strong action verbs.
    Details: ${JSON.stringify(data)}.
    ${jobDescription ? `Incorporate relevant keywords from this job description if applicable: ${jobDescription}` : ""}
    Return the response as a JSON array of strings: ["bullet 1", "bullet 2", "bullet 3"]`;
  } else if (promptType === "skills") {
    prompt = `Based on the following candidate experience/summary: ${JSON.stringify(data)}, 
    ${jobDescription ? `and this job description: ${jobDescription},` : ""}
    suggest a list of 10-15 professional, relevant skills for their resume.
    Return the response as a JSON array of strings: ["Skill 1", "Skill 2"]`;
  }

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    if (promptType === "bullets" || promptType === "skills") {
      text = cleanAIJSON(text);
      return JSON.parse(text);
    }
    return text;
  } catch (err) {
    console.error("Error generating resume content:", err);
    throw new Error("Failed to generate content with AI");
  }
}



async function generateInterviewQuestions(role, level, type, count) {
  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `
    You are an expert technical interviewer and career coach with 15+ years of experience hiring for top tech companies. 
    Generate ${count} interview questions for a candidate with the following profile:
    - Job Role: ${role}
    - Experience Level: ${level}
    - Interview Type: ${type}

    Rules for questions:
    - Match the difficulty to the experience level (${level})
    - Make questions specific, realistic, and industry-standard
    - For behavioral: use STAR-friendly prompts ("Tell me about a time...")
    - For technical: ask about real concepts, trade-offs, or coding approaches
    - For system design: ask candidates to design scalable, real-world systems
    - For mixed: blend behavioral and technical questions evenly
    - Never repeat questions across sessions

    Return ONLY a valid JSON array of strings.
    No markdown. No backticks. No numbering inside question strings. No extra text.

    Format:
    ["Question one?", "Question two?", "Question three?"]
  `;

  try {
    const result = await retryWithBackoff(() => model.generateContent(prompt), {
      retries: 3,
      delayMs: 2000
    });
    let text = result.response.text().trim();
    // Clean potential markdown artifacts
    text = cleanAIJSON(text);
    return JSON.parse(text);
  } catch (err) {
    console.error("Error generating interview questions:", err);
    throw new Error("Failed to generate questions with AI");
  }
}

async function evaluateInterviewAnswer(question, answer) {
  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `
    You are an expert technical interviewer and career coach with 15+ years of experience.
    Evaluate the following interview answer and return ONLY a valid JSON object.

    Question: "${question}"
    Candidate Answer: "${answer}"

    Scoring criteria:
    - "great" → Answer is clear, structured, specific, and shows depth of knowledge or experience
    - "good" → Answer is correct and reasonable but lacks detail, examples, or structure
    - "needs improvement" → Answer is vague, off-topic, too short, or misses the core concept

    Feedback rules:
    - Always be constructive and encouraging, never harsh
    - Point out strengths and provide specific advice for improvement (2-3 sentences).

    Confidence evaluation:
    - Provide a "confidence" score (0-100) based on how well the candidate articulated their thoughts and the depth of their answer.

    Return ONLY a valid JSON object.
    No markdown. No backticks. No extra text.

    Format:
    {"score": "great" | "good" | "needs improvement", "feedback": "Your 2–3 sentence feedback here.", "confidence": 85}
  `;


  try {
    const result = await retryWithBackoff(() => model.generateContent(prompt));
    let text = result.response.text().trim();
    // Clean potential markdown artifacts
    text = cleanAIJSON(text);
    return JSON.parse(text);
  } catch (err) {
    console.error("Error evaluating interview answer:", err);
    throw new Error("Failed to evaluate answer with AI");
  }
}

async function multiJDCompare(resumeText, jds = []) {
  if (!jds.length) return [];

  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

  const results = [];
  
  for (const jd of jds) {
    const prompt = `
      Resume: ${resumeText.substring(0, 5000)}
      Job Description (@ ${jd.company || 'Unknown'} - ${jd.role || 'Unknown'}): ${jd.text.substring(0, 5000)}

      Analyze the fit between the resume and this specific job description.
      Provide a detailed analysis following these rules:
      1. Match score (0-100) weighted: skills 40%, experience level 30%, domain/industry 20%, location/remote fit 10%.
      2. Matched skills: list keywords/skills from the resume that appear in the JD.
      3. Missing skills / gaps: required/preferred skills in the JD absent from the resume.
      4. Seniority alignment: Does the candidate's experience match the JD's required level? (Labels: "under", "over", "match").
      5. ATS red flags: Important keywords from the JD missing from the resume.
      6. Tailoring tip: One specific, actionable suggestion.

      Return strictly in JSON format:
      {
        "company": "${jd.company || 'Unknown'}",
        "role": "${jd.role || 'Unknown'}",
        "score": 0,
        "matchedSkills": [],
        "missingSkills": [],
        "seniority": "match",
        "atsRedFlags": [],
        "tailoringTip": "",
        "quickVerdict": "A short 1-sentence summary"
      }
    `;

    try {
      const result = await retryWithBackoff(() => model.generateContent(prompt));
      let text = result.response.text().trim();
      text = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
      const parsed = JSON.parse(text);
      results.push(parsed);
    } catch (err) {
      console.error(`Error comparing for ${jd.company}:`, err);
      results.push({
        company: jd.company || 'Unknown',
        role: jd.role || 'Unknown',
        score: 0,
        error: "Failed to analyze this JD"
      });
    }
  }

  // Calculate Best Bet
  const sorted = [...results].sort((a, b) => b.score - a.score);
  const bestBet = sorted[0];

  return {
    comparisons: sorted,
    bestBet: {
      recommendation: bestBet ? `Your best bet is ${bestBet.role} at ${bestBet.company}.` : "No recommendation available.",
      reason: bestBet ? `It has the highest match score of ${bestBet.score}/100 and aligns well with your ${bestBet.seniority === 'match' ? 'experience level' : 'background'}.` : ""
    }
  };
}

async function generateJDRefinements(jobTitle, currentJD, applicantData) {
  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `
    You are an expert recruitment consultant. Analyze the following recruitment data and provide 2-4 specific, actionable suggestions for the recruiter to improve the Job Description (JD).
    
    Job Title: ${jobTitle}
    Current JD (excerpt): ${currentJD.substring(0, 2000)}
    
    Applicant Data:
    - Total Applicants: ${applicantData.total}
    - Average Match Score: ${applicantData.avgScore}
    - Most Frequently Matched Skills: ${applicantData.topSkills.join(", ")}
    - Most Frequently Missing Skills: ${applicantData.missingSkills.join(", ")}
    
    Rules for suggestions:
    - Be direct and analytical.
    - Format as a JSON array of strings.
    - Suggestions should focus on JD quality, filtering accuracy, and pool quality.
    - Example: "Consider removing 'Kubernetes' as a hard requirement — 68% of applicants lack it, which may be filtering strong candidates unnecessarily."
    
    Return ONLY a valid JSON array of strings.
  `;

  try {
    const result = await retryWithBackoff(() => model.generateContent(prompt));
    let text = result.response.text().trim();
    text = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    return JSON.parse(text);
  } catch (err) {
    console.error("Error generating JD refinements:", err);
    return ["Consider reviewing skill requirements for better alignment with the candidate pool."];
  }
}

async function generateSkillGapRoadmap(missingSkills, role) {
  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `
    You are an expert technical mentor and career coach.
    A candidate is missing the following skills for a ${role} position: ${missingSkills.join(", ")}.
    
    Create a detailed, autonomous learning roadmap for these skills.
    For each skill, provide:
    1. A 2-week roadmap (Week 1 and Week 2 focus).
    2. Suggested learning resources:
       - 1 high-quality online course (Udemy, Coursera, etc.)
       - 1 professional certification (if applicable)
       - 1 popular GitHub repository for hands-on practice
    3. A brief "Mentor's Tip" on how to master this skill quickly.

    Return ONLY a valid JSON object.
    No markdown. No backticks. No extra text.

    Format:
    {
      "mentorMessage": "Friendly intro message...",
      "roadmaps": [
        {
          "skill": "Skill Name",
          "timeframe": "2 Weeks",
          "week1": "Topics to cover in week 1",
          "week2": "Topics to cover in week 2",
          "resources": {
            "course": "Course Name & Platform",
            "certification": "Cert Name (or 'N/A')",
            "github": "Repo Name/Link"
          },
          "mentorTip": "Mastery tip..."
        }
      ]
    }
  `;

  try {
    const result = await retryWithBackoff(() => model.generateContent(prompt));
    let text = result.response.text().trim();
    text = cleanAIJSON(text);
    return JSON.parse(text);
  } catch (err) {
    console.error("Error generating skill gap roadmap:", err);
    throw new Error("Failed to generate roadmap with AI");
  }
}

async function generateRecruiterInsights(stats, jobs, applications) {
  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `
    You are an elite Recruitment Strategist AI. Analyze the following recruiter dashboard data and provide 3-5 autonomous, high-impact insights.
    
    Data Summary:
    - Total Active Jobs: ${jobs.length}
    - Total Applicants: ${stats.totalApplicants}
    - Average Match Score: ${stats.avgMatchScore}%
    
    Specific Metrics:
    Jobs: ${JSON.stringify(jobs.map(j => ({ title: j.title, company: j.company, applicants: applications.filter(a => a.jobId.toString() === j._id.toString()).length })))}
    Top Missing Skills (agg): ${JSON.stringify(applications.slice(0, 20).flatMap(a => a.missingKeywords || []))}
    
    Insight Rules:
    - Identify hiring bottlenecks (e.g., "Job X has 0 matches above 80%").
    - Identify skill trends (e.g., "70% of candidates for Role Y are missing Skill Z").
    - Provide actionable advice (e.g., "Adjust JD for Role A to focus more on Skill B").
    - Keep each insight concise (1 sentence).
    - Return strictly as a JSON object with a 'headline' and an array of 'insights'.
    
    Format:
    {
      "headline": "Hiring Pipeline Analysis",
      "insights": [
        "Insight one...",
        "Insight two..."
      ],
      "priority": "high" | "medium" | "low"
    }
  `;

  try {
    const result = await retryWithBackoff(() => model.generateContent(prompt));
    let text = result.response.text().trim();
    text = cleanAIJSON(text);
    return JSON.parse(text);
  } catch (err) {
    console.error("Error generating recruiter insights:", err);
    return {
      headline: "Strategic Overview",
      insights: ["Reviewing applicant pool for optimization...", "Monitoring high-priority roles..."],
      priority: "medium"
    };
  }
}

module.exports = {
  getEmbedding,
  geminiaiAnalyzer,
  embeddingSkillMatch,
  matchProjectsToJob,
  cosineSimilarity,
  cleaningText,
  generateResumeContent,
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  multiJDCompare,
  generateJDRefinements,
  generateSkillGapRoadmap,
  generateRecruiterInsights
};



