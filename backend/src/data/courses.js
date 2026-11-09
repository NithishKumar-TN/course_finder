/**
 * Course catalog for LearnMate.
 * Each track contains ordered modules (courses) with metadata.
 */

export const LEARNING_TRACKS = {
  "Frontend Development": {
    icon: "💻",
    description: "Build modern, responsive web interfaces using HTML, CSS, JavaScript, and React.",
    levels: {
      beginner: [
        { id: "fe-b1", title: "HTML & CSS Fundamentals", provider: "freeCodeCamp", url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/", duration: "20h", free: true, skills: ["HTML5", "CSS3", "Responsive Design"] },
        { id: "fe-b2", title: "JavaScript Essentials", provider: "The Odin Project", url: "https://www.theodinproject.com/paths/foundations/courses/foundations", duration: "30h", free: true, skills: ["JavaScript", "DOM", "ES6"] },
        { id: "fe-b3", title: "Git & Version Control", provider: "GitHub Learning Lab", url: "https://skills.github.com/", duration: "8h", free: true, skills: ["Git", "GitHub"] },
      ],
      intermediate: [
        { id: "fe-i1", title: "React – The Complete Guide", provider: "Udemy / Scrimba", url: "https://scrimba.com/learn/learnreact", duration: "40h", free: false, skills: ["React", "Hooks", "State Management"] },
        { id: "fe-i2", title: "TypeScript for Developers", provider: "Total TypeScript", url: "https://www.totaltypescript.com/tutorials", duration: "15h", free: true, skills: ["TypeScript"] },
        { id: "fe-i3", title: "CSS Advanced – Flexbox & Grid", provider: "CSS-Tricks / Kevin Powell", url: "https://www.youtube.com/@KevinPowell", duration: "10h", free: true, skills: ["Flexbox", "CSS Grid"] },
        { id: "fe-i4", title: "REST APIs & Fetch", provider: "freeCodeCamp", url: "https://www.freecodecamp.org/learn/back-end-development-and-apis/", duration: "20h", free: true, skills: ["REST", "Fetch API", "JSON"] },
      ],
      advanced: [
        { id: "fe-a1", title: "Next.js Full-Stack Apps", provider: "Vercel / Next.js Docs", url: "https://nextjs.org/learn", duration: "25h", free: true, skills: ["Next.js", "SSR", "SSG"] },
        { id: "fe-a2", title: "Web Performance & Core Web Vitals", provider: "web.dev", url: "https://web.dev/learn/performance/", duration: "12h", free: true, skills: ["Performance", "Lighthouse"] },
        { id: "fe-a3", title: "Testing with Vitest & React Testing Library", provider: "Testing Library Docs", url: "https://testing-library.com/", duration: "15h", free: true, skills: ["Unit Testing", "Integration Testing"] },
      ],
    },
  },

  "Cybersecurity": {
    icon: "🔒",
    description: "Protect systems and networks; learn ethical hacking, threat analysis, and security engineering.",
    levels: {
      beginner: [
        { id: "cs-b1", title: "Introduction to Cybersecurity", provider: "Cisco NetAcad", url: "https://www.netacad.com/courses/introduction-to-cybersecurity", duration: "15h", free: true, skills: ["Security Concepts", "Threats", "Vulnerabilities"] },
        { id: "cs-b2", title: "Linux Basics for Hackers", provider: "OverTheWire / TryHackMe", url: "https://tryhackme.com/path/outline/presecurity", duration: "20h", free: true, skills: ["Linux", "CLI", "Networking"] },
        { id: "cs-b3", title: "Networking Fundamentals", provider: "Cisco NetAcad", url: "https://www.netacad.com/courses/networking-basics", duration: "25h", free: true, skills: ["TCP/IP", "DNS", "HTTP"] },
      ],
      intermediate: [
        { id: "cs-i1", title: "Ethical Hacking – Penetration Testing", provider: "TryHackMe", url: "https://tryhackme.com/path/outline/jrpenetrationtester", duration: "64h", free: false, skills: ["Nmap", "Metasploit", "Burp Suite"] },
        { id: "cs-i2", title: "Web Application Security (OWASP Top 10)", provider: "PortSwigger Web Security Academy", url: "https://portswigger.net/web-security", duration: "40h", free: true, skills: ["XSS", "SQLi", "CSRF"] },
        { id: "cs-i3", title: "Cryptography Fundamentals", provider: "Khan Academy / Coursera", url: "https://www.coursera.org/learn/crypto", duration: "20h", free: true, skills: ["Encryption", "PKI", "Hashing"] },
      ],
      advanced: [
        { id: "cs-a1", title: "CompTIA Security+ Prep", provider: "Professor Messer", url: "https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-comptia-security-plus-course/", duration: "30h", free: true, skills: ["Security+", "Risk Management", "Compliance"] },
        { id: "cs-a2", title: "Malware Analysis & Reverse Engineering", provider: "ANY.RUN / OpenSecurityTraining", url: "https://opensecuritytraining.info/", duration: "35h", free: true, skills: ["Reverse Engineering", "Assembly", "Malware"] },
        { id: "cs-a3", title: "Cloud Security on IBM Cloud", provider: "IBM Training", url: "https://www.ibm.com/training/cloud", duration: "20h", free: true, skills: ["Cloud Security", "IAM", "Zero Trust"] },
      ],
    },
  },

  "UI/UX Design": {
    icon: "🎨",
    description: "Design intuitive digital experiences through user research, prototyping, and visual design systems.",
    levels: {
      beginner: [
        { id: "ux-b1", title: "Foundations of UX Design", provider: "Google UX Design Certificate (Coursera)", url: "https://www.coursera.org/professional-certificates/google-ux-design", duration: "20h", free: false, skills: ["UX Principles", "User Research", "Personas"] },
        { id: "ux-b2", title: "Figma for Beginners", provider: "Figma Community / YouTube", url: "https://help.figma.com/hc/en-us/categories/360002051613", duration: "10h", free: true, skills: ["Figma", "Wireframing"] },
        { id: "ux-b3", title: "Design Thinking", provider: "IDEO / IBM Design Thinking", url: "https://www.ibm.com/design/thinking/", duration: "8h", free: true, skills: ["Empathy Mapping", "Ideation", "Prototyping"] },
      ],
      intermediate: [
        { id: "ux-i1", title: "User Research Methods", provider: "Nielsen Norman Group", url: "https://www.nngroup.com/courses/", duration: "16h", free: false, skills: ["Usability Testing", "Interviews", "Surveys"] },
        { id: "ux-i2", title: "Interaction Design & Micro-animations", provider: "Interaction Design Foundation", url: "https://www.interaction-design.org/", duration: "20h", free: false, skills: ["Motion Design", "Interaction Patterns"] },
        { id: "ux-i3", title: "Design Systems & Component Libraries", provider: "Storybook / Carbon Design (IBM)", url: "https://carbondesignsystem.com/", duration: "15h", free: true, skills: ["Design Systems", "Accessibility", "Carbon"] },
      ],
      advanced: [
        { id: "ux-a1", title: "Advanced Figma – Auto Layout & Variants", provider: "Figma Community", url: "https://www.figma.com/community", duration: "12h", free: true, skills: ["Auto Layout", "Components", "Variants"] },
        { id: "ux-a2", title: "UX Portfolio & Case Studies", provider: "UX Collective", url: "https://uxdesign.cc/", duration: "20h", free: true, skills: ["Portfolio", "Case Studies", "Storytelling"] },
        { id: "ux-a3", title: "Service Design & Systems Thinking", provider: "Coursera / IDEO", url: "https://www.coursera.org/learn/service-design", duration: "18h", free: false, skills: ["Service Design", "Journey Mapping"] },
      ],
    },
  },

  "Data Science": {
    icon: "📊",
    description: "Extract insights from data using Python, statistics, machine learning, and visualization.",
    levels: {
      beginner: [
        { id: "ds-b1", title: "Python for Everybody", provider: "Coursera (University of Michigan)", url: "https://www.coursera.org/specializations/python", duration: "40h", free: true, skills: ["Python", "Variables", "Loops"] },
        { id: "ds-b2", title: "Statistics Fundamentals", provider: "Khan Academy", url: "https://www.khanacademy.org/math/statistics-probability", duration: "20h", free: true, skills: ["Probability", "Distributions", "Hypothesis Testing"] },
        { id: "ds-b3", title: "SQL for Data Analysis", provider: "Mode Analytics / freeCodeCamp", url: "https://mode.com/sql-tutorial/", duration: "15h", free: true, skills: ["SQL", "Joins", "Aggregations"] },
      ],
      intermediate: [
        { id: "ds-i1", title: "Data Analysis with Pandas & NumPy", provider: "Kaggle Learn", url: "https://www.kaggle.com/learn/pandas", duration: "20h", free: true, skills: ["Pandas", "NumPy", "Data Wrangling"] },
        { id: "ds-i2", title: "Data Visualization with Matplotlib & Seaborn", provider: "Kaggle Learn", url: "https://www.kaggle.com/learn/data-visualization", duration: "8h", free: true, skills: ["Matplotlib", "Seaborn", "Plotly"] },
        { id: "ds-i3", title: "Machine Learning with Scikit-Learn", provider: "fast.ai / Coursera", url: "https://www.coursera.org/learn/machine-learning", duration: "60h", free: false, skills: ["Supervised Learning", "Regression", "Classification"] },
      ],
      advanced: [
        { id: "ds-a1", title: "Deep Learning Specialization", provider: "deeplearning.ai (Coursera)", url: "https://www.coursera.org/specializations/deep-learning", duration: "120h", free: false, skills: ["Neural Networks", "CNNs", "RNNs"] },
        { id: "ds-a2", title: "IBM Watson Studio & AutoAI", provider: "IBM Skills Network", url: "https://skills.network/learn/course/watson-studio/", duration: "20h", free: true, skills: ["Watson Studio", "AutoAI", "IBM Cloud"] },
        { id: "ds-a3", title: "MLOps & Model Deployment", provider: "MLflow / Coursera", url: "https://www.coursera.org/learn/mlops-fundamentals", duration: "25h", free: false, skills: ["MLOps", "Docker", "APIs"] },
      ],
    },
  },

  "Cloud Computing": {
    icon: "☁️",
    description: "Build and deploy scalable applications on cloud platforms including IBM Cloud.",
    levels: {
      beginner: [
        { id: "cc-b1", title: "Cloud Computing Fundamentals", provider: "IBM SkillsBuild", url: "https://skillsbuild.org/", duration: "10h", free: true, skills: ["Cloud Concepts", "IaaS/PaaS/SaaS"] },
        { id: "cc-b2", title: "Docker for Beginners", provider: "Play With Docker", url: "https://training.play-with-docker.com/", duration: "12h", free: true, skills: ["Docker", "Containers", "Images"] },
        { id: "cc-b3", title: "Linux Administration Basics", provider: "edX / IBM", url: "https://www.edx.org/learn/linux", duration: "20h", free: true, skills: ["Linux", "Bash", "SSH"] },
      ],
      intermediate: [
        { id: "cc-i1", title: "IBM Cloud Essentials", provider: "IBM Training", url: "https://www.ibm.com/training/cloud-computing", duration: "16h", free: true, skills: ["IBM Cloud", "IAM", "Cloud Foundry"] },
        { id: "cc-i2", title: "Kubernetes & Container Orchestration", provider: "KodeKloud / edX", url: "https://www.edx.org/learn/kubernetes", duration: "30h", free: false, skills: ["Kubernetes", "Helm", "Pods"] },
        { id: "cc-i3", title: "Terraform & Infrastructure as Code", provider: "HashiCorp Learn", url: "https://developer.hashicorp.com/terraform/tutorials", duration: "20h", free: true, skills: ["Terraform", "IaC", "AWS/IBM Cloud"] },
      ],
      advanced: [
        { id: "cc-a1", title: "IBM Cloud Professional Architect", provider: "IBM Training", url: "https://www.ibm.com/training/", duration: "40h", free: true, skills: ["Architecture", "HA/DR", "IBM Cloud"] },
        { id: "cc-a2", title: "Serverless & IBM Cloud Functions", provider: "IBM Developer", url: "https://developer.ibm.com/components/cloud-functions/", duration: "15h", free: true, skills: ["Serverless", "Cloud Functions", "OpenWhisk"] },
        { id: "cc-a3", title: "DevOps & CI/CD Pipelines", provider: "IBM UrbanCode / GitLab", url: "https://www.ibm.com/cloud/urbancode", duration: "25h", free: false, skills: ["CI/CD", "Jenkins", "GitOps"] },
      ],
    },
  },

  "Backend Development": {
    icon: "⚙️",
    description: "Build robust server-side applications, APIs, and databases using modern backend technologies.",
    levels: {
      beginner: [
        { id: "be-b1", title: "Node.js & Express Fundamentals", provider: "freeCodeCamp", url: "https://www.freecodecamp.org/learn/back-end-development-and-apis/", duration: "25h", free: true, skills: ["Node.js", "Express", "npm"] },
        { id: "be-b2", title: "Databases & SQL", provider: "SQLZoo / W3Schools", url: "https://sqlzoo.net/", duration: "15h", free: true, skills: ["SQL", "PostgreSQL", "CRUD"] },
        { id: "be-b3", title: "REST API Design Principles", provider: "RESTful API Tutorial", url: "https://restfulapi.net/", duration: "10h", free: true, skills: ["REST", "HTTP Methods", "Status Codes"] },
      ],
      intermediate: [
        { id: "be-i1", title: "Authentication & Authorization (JWT/OAuth)", provider: "Auth0 / Udemy", url: "https://auth0.com/learn/", duration: "15h", free: true, skills: ["JWT", "OAuth 2.0", "Session Management"] },
        { id: "be-i2", title: "MongoDB & NoSQL Databases", provider: "MongoDB University", url: "https://learn.mongodb.com/", duration: "20h", free: true, skills: ["MongoDB", "Mongoose", "NoSQL"] },
        { id: "be-i3", title: "Microservices Architecture", provider: "Udemy / IBM Developer", url: "https://developer.ibm.com/learningpaths/get-started-microservices/", duration: "25h", free: true, skills: ["Microservices", "Message Queues", "gRPC"] },
      ],
      advanced: [
        { id: "be-a1", title: "GraphQL API Development", provider: "Apollo Docs / HowToGraphQL", url: "https://www.howtographql.com/", duration: "20h", free: true, skills: ["GraphQL", "Apollo", "Schema Design"] },
        { id: "be-a2", title: "System Design & Scalability", provider: "Educative / ByteByteGo", url: "https://bytebytego.com/", duration: "30h", free: false, skills: ["System Design", "Load Balancing", "Caching"] },
        { id: "be-a3", title: "Security Best Practices for APIs", provider: "OWASP / Snyk", url: "https://owasp.org/www-project-api-security/", duration: "15h", free: true, skills: ["API Security", "Input Validation", "Rate Limiting"] },
      ],
    },
  },
};

export const AVAILABLE_TRACKS = Object.keys(LEARNING_TRACKS);
export const SKILL_LEVELS = ["beginner", "intermediate", "advanced"];

/**
 * Get courses for a given track and skill level.
 */
export function getCoursesForTrack(track, level) {
  const trackData = LEARNING_TRACKS[track];
  if (!trackData) return [];
  const courses = trackData.levels[level] || [];
  return courses;
}

/**
 * Build a full personalized roadmap from student profile.
 */
export function buildRoadmap(profile) {
  const { interests, skillLevel } = profile;
  const roadmap = [];

  for (const interest of interests) {
    const trackData = LEARNING_TRACKS[interest];
    if (!trackData) continue;

    const levelsToInclude = getLevelsToInclude(skillLevel);
    const modules = [];

    for (const level of levelsToInclude) {
      const courses = trackData.levels[level] || [];
      modules.push(
        ...courses.map((c) => ({
          ...c,
          level,
          track: interest,
          status: "not_started", // not_started | in_progress | completed
        }))
      );
    }

    roadmap.push({
      track: interest,
      icon: trackData.icon,
      description: trackData.description,
      modules,
      totalHours: modules.reduce((sum, m) => sum + parseFloat(m.duration), 0),
    });
  }

  return roadmap;
}

function getLevelsToInclude(skillLevel) {
  switch (skillLevel) {
    case "beginner":
      return ["beginner", "intermediate", "advanced"];
    case "intermediate":
      return ["intermediate", "advanced"];
    case "advanced":
      return ["advanced"];
    default:
      return ["beginner", "intermediate", "advanced"];
  }
}
