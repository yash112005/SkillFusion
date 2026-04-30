import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
   {
    question:"What is the Resume & Job Description Matcher?",
    answer:"It’s a tool that analyzes resumes against job descriptions to calculate a match score and provide suggestions for improvement."
  },
  {
    question:"Who can use this tool?",
    answer:"Both job seekers and recruiters. Job seekers can check how well their resume fits a role, while recruiters can quickly shortlist candidates."
  },
  {
    question:"How accurate is the match score?",
    answer:"The score is generated using AI‑based analysis of skills, experience, and keywords. While it’s highly reliable, it should be used as guidance, not a guarantee."
  },
  {
    question:"What file formats are supported for resumes?",
    answer:"Common formats like PDF, DOC, and DOCX are supported for resume uploads."
  },
  {
    question:"Is my data safe?",
    answer:"Yes, we prioritize user privacy and data security. Uploaded resumes and job descriptions are processed securely and not shared with third parties."
  },
  {
    question:"Can I use this tool for multiple job descriptions?",
    answer:"Absolutely! You can analyze your resume against different job descriptions to see how well it matches various roles."
  },
  {
    question:"Does using this tool guarantee a job?",
    answer:"No, while the tool helps optimize your resume for better alignment with job descriptions, securing a job also depends on other factors like interviews and overall fit."
  },
  {
    question:"Do I need to create an account to use the matcher?",
    answer:"Basic features may be available without an account, but advanced features (like saving results or recruiter dashboards) may require sign‑up."
  },
  {
    question:"How long does it take to generate a match score?",
    answer:"Usually just a few seconds after uploading your resume and pasting the job description."
  },
  {
    question:"Can recruiters upload multiple resumes at once?",
    answer:"Yes, recruiters can upload batches of resumes to evaluate multiple candidates efficiently."
  },
  {
    question:"Is there a limit to the size of the resume or job description?",
    answer:"Yes, typically there are size limits (e.g., 5MB for resumes and 10,000 characters for job descriptions) to ensure optimal processing speed."
  },
  {
    question: "How does the AI resume matching work?",
    answer: "We extract the text from your uploaded resume and the job description, then pass it to Google's advanced Gemini AI model. The AI analyzes semantic similarities, keyword overlaps, and contextual experience to generate a match score."
  },
  {
    question: "Is my data secure?",
    answer: "Yes. Your uploaded PDFs are processed in memory and are not permanently stored on our servers unless you explicitly opt-in to save your history. We use industry-standard encryption for all data."
  },
  {
    question: "Can I use SkillFusion as a recruiter?",
    answer: "Absolutely. When signing up, choose the 'Recruiter' role. You'll get access to a specialized dashboard to manage job descriptions and view applicant rankings."
  },
  {
    question: "What is a good match score?",
    answer: "Generally, a score above 75% indicates a strong alignment with the job description. However, the AI also provides specific suggestions on how to improve your resume regardless of your score."
  },
  {
    question: "How do I upgrade to Pro?",
    answer: "You can upgrade to the Pro tier by visiting the Pricing page and subscribing via Razorpay. Pro users get unlimited matches and deeper analytics."
  }
];

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg mb-4 bg-white dark:bg-dark-card overflow-hidden">
      <button 
        className="w-full px-6 py-4 flex justify-between items-center focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold text-left text-gray-900 dark:text-white">{question}</span>
        {isOpen ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-gray-600 dark:text-gray-400">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

const FAQ = () => {
  return (
    <div className="min-h-screen py-20 bg-gray-50 dark:bg-dark-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">Everything you need to know about SkillFusion.</p>
        </div>
        <div>
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
