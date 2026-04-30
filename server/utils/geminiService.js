const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


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

  const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });


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
    const clean = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
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

module.exports = {
  getEmbedding,
  geminiaiAnalyzer,
  embeddingSkillMatch,
  matchProjectsToJob,
  cosineSimilarity,
  cleaningText,
};

