# Result Page Update for FREE Tier Job Seekers

This document details the implementation plan for overhauling the Result Page, adding feature gating, and setting up the required database infrastructure for the AI Resume & Job Description Matcher.

> [!WARNING]
> **Tech Stack Discrepancy**
> The request mentions **Next.js 14 + Supabase**, but this project is built using the **MERN stack (React/Vite, Node.js/Express, MongoDB)**. 
> 
> **This plan adapts all your requirements to fit the existing MERN stack seamlessly.** If you specifically meant to start a *brand new* Next.js project instead of updating this one, please let me know. Otherwise, I will proceed with MongoDB and React/Vite.

## Open Questions
- **Billing / Subscription logic:** Should the "Upgrade" button just link to `/pricing`, or do we need to implement any new subscription logic in the backend right now?
- **AI Prompt:** The current AI returns detailed JSON with `matchedSkills` objects containing percentages. Changing this to simple string arrays (`matched_keywords`, `missing_keywords`) simplifies it but drops the percentage bars. I will update it to match your new requested data shape, but please confirm this is okay.

## Proposed Changes

### 1. Database Schema Updates (MongoDB)
- **User Model (`server/models/User.js`)**: Add `usage_count` (default: 0) and `isPro` (default: false).
- **MatchHistory Model (`server/models/MatchHistory.js`)**: Create a new model to store `{ userId, jobTitle, company, score, matchedKeywords, missingKeywords, createdAt }`.
- **MatchFeedback Model (`server/models/MatchFeedback.js`)**: Create a new model to store `{ userId, matchId, feedback (enum: 'positive'|'negative'), timestamp }`.

### 2. Backend API Updates
- **AI Service (`server/utils/geminiService.js`)**: Update the prompt to enforce the new JSON structure: `score`, `summary`, `job_title`, `company`, `matched_keywords`, `missing_keywords`.
- **Match Controller**: 
  - Add logic to increment `usage_count` for the user after a successful match.
  - Save the match to `MatchHistory` and return the `matchId`.
  - Add error handling and retry mechanisms.
- **Feedback Endpoint**: Create `POST /api/match/feedback` to save feedback to the database.

### 3. Frontend: `Results.jsx` Complete Overhaul
I will replace the existing `Results.jsx` with your requested design:

- **Header**: Job Title extracted from the JD (`Software Engineer @ Company Name — X min ago`). Match Counter Badge in the top right (`X / 5 matches used this month`, red if only 1 remaining).
- **Score Section**: Score Visual Ring using SVG/CSS (`0-40%` Red, `41-70%` Amber, `71-100%` Green).
- **Metric Cards**: Side-by-side cards for "Matched keywords" (Green) and "Missing keywords" (Red).
- **Keyword Tags Section**: Green pill tags for matches, Red pill tags for missing keywords.
- **Feature Gating / Pro Upsell Lock Banner**: Display a blue banner masking the ATS Score, detailed suggestions, and skill gap analysis, prompting users to Upgrade to Pro.
- **Matches Remaining Progress Bar**: Visual progress bar indicating usage (fills up with red), with the "Unlimited matches chahiye?" text below it.
- **Feedback Buttons**: "Haan, helpful tha" and "Improve karo" buttons that trigger the new feedback API endpoint.
- **Bottom Action Buttons**: "New match karo" (links to `/upload`) and "History dekho" (links to `/history`).
- **Retry Logic**: If the AI API fails, show a clean error state with a "Try again" button.

### 4. Testing
- Write basic tests (using Jest/Supertest or similar existing testing library) for the `usage_count` increment logic to ensure users aren't overcharged for failed matches.

## Verification Plan
1. Run backend tests to verify `usage_count` increments correctly.
2. Manually test uploading a resume and JD as a free user.
3. Verify the AI response format contains the new fields (`job_title`, `company`).
4. Verify the database saves the match history and the usage count increments.
5. Ensure the UI precisely matches the requested layout (Progress bar, Visual Ring, Pill tags, Lock banner).
6. Test submitting feedback and verify it saves to the DB.
