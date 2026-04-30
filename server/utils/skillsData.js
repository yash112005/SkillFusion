const skills = {
  technical: {
    programmingLang: [
      "Programming", "Python", "Java", "JavaScript", "TypeScript", "C", "C++", "C#",
      "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin", "MATLAB", "SQL", "NoSQL",
      "HTML", "CSS", "Bash", "Shell scripting", "PowerShell", "Assembly", "Scala",
      "Perl", "Lua", "Dart",
    ],
    WebandAppDevelopment: [
      "Web development", "Front‑end development", "Back‑end development",
      "Full‑stack development", "API development", "REST APIs", "GraphQL",
      "Microservices", "Serverless computing", "WebSockets", "Responsive design",
      "UI development", "UX principles", "Mobile app development", "iOS development",
      "Android development", "Cross‑platform development", "Flutter", "React Native",
      "Mern Stack development", "MEAN Stack development", "ReactJS", "Angular",
      "Vue.js", "Node.js", "Django", "Flask", "Ruby on Rails", "MongoDB",
      "Express.js", "Next.js", "SQL databases", "HTML", "javascript", "GraphOL",
    ],
    GameDevelopment: [
      "Game development", "Unity", "Unreal Engine", "2D game programming",
      "3D game programming", "Graphics programming", "Shader programming",
      "AR development", "VR development", "XR development",
    ],
    AIMachineLearningData: [
      "Machine learning", "Deep learning", "AI model training", "Neural networks",
      "Computer vision", "NLP (Natural Language Processing)", "Speech recognition",
      "Large language models", "Data mining", "Data analytics", "Data science",
      "Data cleaning", "Data engineering", "Big data processing", "Hadoop", "Spark",
      "Kafka", "ETL pipelines", "Data warehousing", "Snowflake", "Redshift", "BigQuery",
    ],
    cloudDevops: [
      "Cloud computing", "AWS", "Azure", "Google Cloud", "Cloud architecture",
      "Cloud security", "Docker", "Kubernetes", "Containerization", "Virtualization",
      "VMware", "Hyper‑V", "Linux administration", "Windows Server administration",
      "DevOps", "CI/CD pipelines", "Git", "GitHub", "GitLab CI", "Jenkins",
      "Terraform", "Ansible", "Chef", "Puppet", "Infrastructure as Code",
    ],
    NetworkingSecurity: [
      "Networking", "Network configuration", "Router configuration",
      "Switch configuration", "TCP/IP", "DNS", "DHCP", "VPN configuration",
      "Firewall management", "Network security", "Cybersecurity",
      "Penetration testing", "Ethical hacking", "Vulnerability analysis",
      "Threat modeling", "Malware analysis", "SIEM tools", "IDS/IPS",
      "SOC operations", "Forensics analysis", "Cryptography",
    ],
    others: [
      "Blockchain", "Smart contract development", "Solidity", "Web3 development",
      "Distributed systems", "High‑availability systems", "Load balancing",
      "Scalability architecture", "Performance optimization", "Database design",
      "Database administration", "SQL Server", "MySQL", "PostgreSQL", "Redis",
      "Cassandra", "Oracle DB", "Firebase", "Real‑time systems", "Embedded systems",
      "Firmware development", "Microcontroller programming", "Arduino",
      "Raspberry Pi development", "IoT systems", "Sensor integration",
      "Robotics programming", "PLC programming", "Automation systems", "CAD software",
      "3D modeling", "Blender", "AutoCAD", "Electrical design tools",
      "Simulation tools", "Testing automation", "Unit testing", "Integration testing",
      "System testing", "QA automation", "Selenium", "Cypress", "Playwright",
      "Software debugging", "Reverse engineering", "API testing", "Security testing",
      "Performance testing", "Load testing", "Cloud monitoring", "Logging tools",
      "Prometheus", "Grafana", "Splunk", "ELK stack",
      "SRE (Site Reliability Engineering)", "IT support", "Troubleshooting",
      "Helpdesk operations", "ERP systems", "CRM systems",
      "Salesforce administration", "SAP usage", "Computer hardware maintenance",
      "PCB design", "FPGA development", "VHDL", "Verilog", "Audio DSP programming",
      "Video processing", "Streaming technologies", "CDN configuration",
      "Email server administration", "Web hosting", "Domain management",
      "DNS management", "AI ops", "MLOps", "DataOps", "Model deployment", "Edge AI",
      "Autonomous systems", "GIS technology", "Satellite data processing",
      "Quantum computing basics", "Bioinformatics", "DNA data processing",
      "Medical software development", "Fintech systems",
      "Payment gateway integration", "E‑commerce platforms",
      "Search engine optimization (technical SEO)", "Content management systems",
      "WordPress development", "Shopify development",
      "Security compliance (SOC2, HIPAA, GDPR)", "IT auditing", "IT governance",
      "Backup systems", "Disaster recovery", "NAS/SAN configuration",
      "Robotics automation", "Mechanical simulation tools", "Algorithm design",
      "Complexity analysis", "Scientific computing",
      "High‑performance computing (HPC)", "Cloud networking",
      "Distributed databases", "Event‑driven architecture",
    ],
  },

  NonTechnical: {
    softskills: [
      "Communication", "Active listening", "Public speaking", "Critical thinking",
      "Problem-solving", "Adaptability", "Creativity", "Time management",
      "Organization", "Teamwork", "Leadership", "Decision-making",
      "Conflict resolution", "Emotional intelligence", "Stress management",
      "Negotiation", "Responsibility", "Self-discipline", "Patience", "Work ethic",
      "Attention to detail", "Empathy", "Collaboration", "Flexibility",
      "Interpersonal skills",
    ],
    BusinessManagementSkills: [
      "Project management", "People management", "Business strategy", "Planning",
      "Budgeting", "Resource management", "Market research",
      "Operations management", "Business communication", "Stakeholder management",
      "Hiring & recruitment", "Training & mentoring", "Change management",
      "Sales strategy", "Pitching & presenting", "Customer relationship management",
      "Contract negotiation",
    ],
    financeAndProfessionalSkills: [
      "Accounting", "Bookkeeping", "Financial planning", "Tax understanding",
      "Cost control", "Investing basics", "Financial analysis",
      "Stock trading basics", "Portfolio management",
    ],
    writingAndCommunicationSkills: [
      "Writing", "Creative writing", "Copywriting", "Editing", "Proofreading",
      "Storytelling", "Blogging", "Scriptwriting", "Grant writing",
      "Report writing", "Research writing", "Journalism", "Teaching & tutoring",
    ],
    creativeAndArtisticSkills: [
      "Drawing", "Painting", "Sketching", "Graphic design (non-technical)",
      "Photography", "Videography", "Video editing", "Animation basics",
      "Music composition", "Singing", "Acting", "Dancing", "Fashion design",
      "Interior design", "Makeup artistry", "Crafting", "Knitting", "DIY crafts",
      "Sculpting", "Calligraphy",
    ],
    marketingAndBrandingSkills: [
      "Social media strategy", "Branding", "Digital marketing (non-technical side)",
      "Customer service", "Advertising basics", "Influencer skills",
      "Event promotion", "Content creation", "Product storytelling",
    ],
    socialAndPersonalSkills: [
      "Networking", "Persuasion", "Cultural awareness", "Manners & etiquette",
      "Community building", "Relationship management", "Counselling basics",
      "Mediation",
    ],
    lifestyleAndPracticalSkills: [
      "Cooking", "Baking", "Meal planning", "Sewing", "Gardening", "Cleaning",
      "Home organization", "Time-blocking", "Decluttering", "Childcare",
      "Elder care", "First aid basics (non-technical)", "CPR basics", "Pet care",
      "Driving",
    ],
    sportsAndPhysicalSkills: [
      "Swimming", "Running", "Yoga", "Pilates", "Weight training", "Boxing",
      "Martial arts", "Cycling", "Sports coaching",
      "Dancing styles (hip hop, ballet, freestyle)",
    ],
    tradesAndCraftsmanshipSkills: [
      "Carpentry", "Woodworking", "Electrical basics", "Plumbing basics",
      "Welding (non-industrial)", "Home repair", "Painting & decoration",
      "Auto maintenance", "Tailoring",
    ],
    educationAndHumanSkills: [
      "Teaching", "Curriculum planning", "Coaching", "Mentoring",
      "Classroom management", "Public speaking", "Workshop facilitation",
    ],
    lifeManagementSkills: [
      "Goal setting", "Budgeting", "Personal finance", "Stress management",
      "Self-care", "Decision-making", "Conflict handling", "Crisis management",
    ],
    travelAndCulturalSkills: [
      "Travel planning", "Navigation", "Cultural etiquette", "Language learning",
      "Tourism knowledge",
    ],
  },
};




function getAllSkills(type = "all") {
  const collect = (obj) =>
    Object.values(obj).reduce((acc, arr) => acc.concat(arr), []);

  if (type === "technical") return collect(skills.technical);
  if (type === "NonTechnical") return collect(skills.NonTechnical);
  return [...collect(skills.technical), ...collect(skills.NonTechnical)];
}


function buildSkillLookup() {
  const map = new Map();
  for (const [category, subcats] of Object.entries(skills)) {
    for (const [subcategory, list] of Object.entries(subcats)) {
      for (const skill of list) {
        map.set(skill.toLowerCase(), { category, subcategory });
      }
    }
  }
  return map;
}


function classifySkills(extractedSkills = []) {
  const lookup = buildSkillLookup();
  const classified = [];
  const unclassified = [];

  for (const skill of extractedSkills) {
    const key = String(skill).toLowerCase().trim();
    const match = lookup.get(key);
    if (match) {
      classified.push({ skill, ...match });
    } else {
      unclassified.push(skill);
    }
  }

  return { classified, unclassified };
}


function extractKnownSkills(text = "") {
  const lower = String(text).toLowerCase();
  const found = [];

  for (const [category, subcats] of Object.entries(skills)) {
    for (const [subcategory, list] of Object.entries(subcats)) {
      for (const skill of list) {
        if (lower.includes(skill.toLowerCase())) {
          found.push({ skill, category, subcategory });
        }
      }
    }
  }


  const seen = new Set();
  return found.filter((f) => {
    if (seen.has(f.skill.toLowerCase())) return false;
    seen.add(f.skill.toLowerCase());
    return true;
  });
}

module.exports = {
  skills,
  getAllSkills,
  buildSkillLookup,
  classifySkills,
  extractKnownSkills,
};
