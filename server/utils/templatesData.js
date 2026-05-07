// 8 ATS-Friendly Templates
const templates = [
  {
    id: "classic",
    name: "Classic Professional",
    style: "professional",
    thumbnail: "classic-thumb", // Handle SVG dynamically in frontend
    description: "ATS-tested, 1-column standard.",
    layout: {
      fonts: { body: "Arial, sans-serif", size: "11pt" },
      margins: "1in",
      sections: ["summary", "experience", "education", "skills", "projects"]
    },
    colors: { text: "#000000", accent: "#000000" }
  },
  {
    id: "modern",
    name: "Modern Clean",
    style: "professional",
    thumbnail: "modern-thumb",
    description: "Slightly stylized headers, clean spacing.",
    layout: {
      fonts: { body: "Calibri, sans-serif", size: "11pt" },
      margins: "1in",
      sections: ["summary", "skills", "experience", "education", "projects"]
    },
    colors: { text: "#000000", accent: "#1A365D" } // Dark blue ATS safe
  },
  {
    id: "hybrid",
    name: "Hybrid",
    style: "tech",
    thumbnail: "hybrid-thumb",
    description: "Prioritizes skills section at the top.",
    layout: {
      fonts: { body: "Helvetica, sans-serif", size: "10.5pt" },
      margins: "0.8in",
      sections: ["summary", "skills", "experience", "projects", "education"]
    },
    colors: { text: "#000000", accent: "#2D3748" } // Gray
  },
  {
    id: "executive",
    name: "Executive",
    style: "professional",
    thumbnail: "exec-thumb",
    description: "Elegant serif font for senior roles.",
    layout: {
      fonts: { body: "Georgia, serif", size: "11pt" },
      margins: "1in",
      sections: ["summary", "experience", "education", "projects", "skills"]
    },
    colors: { text: "#000000", accent: "#000000" }
  },
  {
    id: "entry-level",
    name: "Entry-Level",
    style: "creative",
    thumbnail: "entry-thumb",
    description: "Focuses on education and projects.",
    layout: {
      fonts: { body: "Arial, sans-serif", size: "11pt" },
      margins: "1in",
      sections: ["summary", "education", "projects", "skills", "experience"]
    },
    colors: { text: "#000000", accent: "#000000" }
  },
  {
    id: "tech",
    name: "Tech Focused",
    style: "tech",
    thumbnail: "tech-thumb",
    description: "Compact spacing, dense information.",
    layout: {
      fonts: { body: "Roboto, sans-serif", size: "10pt" },
      margins: "0.5in",
      sections: ["skills", "experience", "projects", "education", "summary"]
    },
    colors: { text: "#000000", accent: "#1A202C" }
  },
  {
    id: "creative-safe",
    name: "Creative Safe",
    style: "creative",
    thumbnail: "creative-thumb",
    description: "Subtle modern touches but 100% ATS parseable.",
    layout: {
      fonts: { body: "Trebuchet MS, sans-serif", size: "10.5pt" },
      margins: "0.75in",
      sections: ["summary", "experience", "skills", "education", "projects"]
    },
    colors: { text: "#000000", accent: "#2B6CB0" } // Dark blue
  },
  {
    id: "reverse-chrono",
    name: "Strict Chronological",
    style: "professional",
    thumbnail: "chrono-thumb",
    description: "Standard reverse chronological order.",
    layout: {
      fonts: { body: "Times New Roman, serif", size: "12pt" },
      margins: "1in",
      sections: ["experience", "education", "skills", "projects", "summary"]
    },
    colors: { text: "#000000", accent: "#000000" }
  }
];

module.exports = templates;
