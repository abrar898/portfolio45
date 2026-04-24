export const PERSONAL = {
  name: "Muhammad Abrar Ahmad",
  initials: "MAA",
  title: "Full Stack Developer",
  sub: "& Cyber Security Enthusiast",
  email: "abrarjr66@gmail.com",
  linkedin: "linkedin.com/in/muhammad-abrar-ahmad",
  github: "github.com/abrar",
  location: "Rawalpindi, Pakistan",
  university: "NUST — Military College of Signals",
  bio: "NUST student crafting <strong>scalable full-stack systems</strong> and solving real-world problems. Currently building robust backend systems at <strong>Drcoders</strong>. Passionate about clean architecture, agile development, and continuous learning.",
  tagline: "Crafting digital experiences that fuse logic and design into living, breathing products.",
};

export const STATS = [
  { num: "4", suffix: "+", label: "Internships" },
  { num: "5", suffix: "+", label: "Projects Shipped" },
  { num: "12", suffix: "+", label: "Technologies" },
  { num: "1", suffix: "st", label: "Class at NUST MCS" },
];

export const SKILLS = {
  Frontend: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "HTML5", "CSS3", "Redux", "Zustand", "Shadcn UI"],
  Backend:  ["Node.js", "Express", "NestJS", "Django", "Flask", "GraphQL", "REST API", "JWT"],
  Database: ["MongoDB", "PostgreSQL", "MySQL", "TypeORM", "Mongoose"],
  DevOps:   ["Docker", "AWS", "Vercel", "Netlify", "Git", "CI/CD", "Figma", "Jest", "Postman", "Java"],
};

export const PROJECTS = [
  {
    id: "01",
    name: "Music Streaming & Event Platform",
    desc: "Scalable streaming system with user auth, playlist creation, genre filtering, and a dynamic event module with RBAC and QR code integration.",
    tags: ["Django", "JavaScript", "Tailwind CSS", "RBAC", "QR Code", "Real-time"],
    color: "#ff3d00",
  },
  {
    id: "02",
    name: "E-Commerce Checkout Engine",
    desc: "Modular e-commerce architecture with multi-role access — admin, seller, customer — persistent session handling, and PDF invoice generation.",
    tags: ["Django", "JavaScript", "Tailwind CSS", "PDF Gen", "Session"],
    color: "#00d4ff",
  },
  {
    id: "03",
    name: "AutiConnect",
    desc: "Specialized landing page connecting individuals with autism to essential resources and community support, built with compassionate UX and accessibility at its core.",
    tags: ["React", "Vite", "Tailwind CSS", "Accessibility"],
    color: "#c8a84b",
  },
  {
    id: "04",
    name: "Library Management System",
    desc: "Robust Java-based desktop application using Swing/AWT and MySQL for complete library lifecycle management — books, members, loans, and overdue tracking.",
    tags: ["Java", "MySQL", "Swing/AWT"],
    color: "#8b5cf6",
  },
  {
    id: "05",
    name: "StoreBase",
    desc: "Google Drive-inspired file storage solution with local file system persistence, serverless-ready architecture, full CRUD capability, and a clean dashboard UI.",
    tags: ["Next.js", "Node.js", "MongoDB", "Express"],
    color: "#10b981",
  },
];

export const EXPERIENCE = [
  {
    company: "Dr Coder",
    role: "Full-Stack Developer Intern",
    period: "Aug 2025 – Present",
    location: "Remote",
    current: true,
    color: "#ff3d00",
    tags: ["Next.js", "NestJS", "TypeScript", "GraphQL", "PostgreSQL", "MongoDB", "Docker"],
    points: [
      "Built full-stack apps with clean architecture and modular monolith principles.",
      "Developed secure RESTful & GraphQL APIs with JWT auth, RBAC, DTOs, Pipes & Guards.",
      "Integrated PostgreSQL & MongoDB with TypeORM/Mongoose, migrations, and indexing.",
      "Collaborated in Agile/Scrum with Git, CI/CD pipelines, Swagger docs, and Docker.",
    ],
  },
  {
    company: "Four Minds",
    role: "Software Developer Intern",
    period: "May – Aug 2025",
    location: "Remote",
    current: false,
    color: "#00d4ff",
    tags: ["React Native", "Firebase", "React", "Node.js", "State Management"],
    points: [
      "Built a cross-platform React Native weather app with Firebase real-time data and auth.",
      "Applied advanced state management and navigation systems across devices.",
      "Collaborated on full-stack features with React and Node.js.",
    ],
  },
  {
    company: "Tech Horizon",
    role: "Web Developer Intern",
    period: "Aug – Sep 2025",
    location: "Remote",
    current: false,
    color: "#c8a84b",
    tags: ["MERN Stack", "Next.js", "React", "Node.js", "Express", "MongoDB"],
    points: [
      "Developed a dynamic MERN application with SSR using Next.js and React.",
      "Implemented RESTful APIs and integrated MongoDB for scalable data storage.",
      "Ensured responsive, cross-browser compatible design across all devices.",
    ],
  },
  {
    company: "Disruptive AI",
    role: "Full-Stack Developer Intern",
    period: "Aug – Oct 2024",
    location: "Islamabad, Pakistan",
    current: false,
    color: "#8b5cf6",
    tags: ["React", "Node.js", "Express", "JavaScript", "Git", "Unit Testing"],
    points: [
      "Developed, tested, and deployed scalable web apps with React and Node.js/Express.",
      "Implemented full-stack features following Agile workflows and unit testing principles.",
      "Used Git/GitHub for version control and CI/CD readiness.",
    ],
  },
];

export const NAV = [
  { label: "About",      href: "#about" },
  { label: "Skills",     href: "#skills" },
  { label: "Projects",   href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact",    href: "#contact" },
];
