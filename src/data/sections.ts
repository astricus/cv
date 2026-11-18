export type ContentBlock = {
  heading?: string;
  text?: string;
  items?: string[];
  tags?: string[];
  links?: { label: string; href: string; download?: boolean }[];
};

export type Section = {
  id: string;
  name: string;
  objectName: string;
  tagline: string;
  color: string;
  position: [number, number, number];
  camDist: number;
  blocks: ContentBlock[];
};

export const SECTIONS: Section[] = [
  {
    id: "about",
    name: "About",
    objectName: "Homeworld",
    tagline: "Software Team Lead · Bolzano, Italy",
    color: "#4f9cf9",
    position: [11, 1.5, 10],
    camDist: 7,
    blocks: [
      {
        text: "I lead engineering teams building products at scale — from micro-frontend architectures to distributed backend services — and help developers grow along the way.",
      },
      {
        heading: "Leadership",
        text: "Leading a team of 9 and hiring for it. Planning and prioritizing team work, reviewing code, mentoring developers and aligning technical decisions with business goals, while meeting tight deadlines and keeping quality high.",
      },
      {
        heading: "Languages",
        items: ["English — C1", "Italian — A2", "Russian — native"],
      },
    ],
  },
  {
    id: "experience",
    name: "Experience",
    objectName: "Gas Giant",
    tagline: "13+ years from freelance to team lead",
    color: "#f59e0b",
    position: [-17, 2.5, 7],
    camDist: 14,
    blocks: [
      {
        heading: "2025 – present · Software Team Lead",
        text: "innoscripta SE, Munich",
        items: [
          "Lead a full-stack team of 9 engineers building the company's core business products: PHP/Laravel microservices with RabbitMQ and TypeScript micro-frontends",
          "Migrated all micro-frontend apps from Create React App to Rsbuild with no breaking changes — build times down from 2–4 minutes to 10–30 seconds, hot reload for child apps, and a boilerplate that gets new apps running in minutes",
          "Hired 3 senior engineers to grow the team",
          "Run agile planning for the team, shipping on two-week release cycles",
          "Part of the company's growth through its IPO in May 2025, with valuation up more than 10× since 2020",
        ],
      },
      {
        heading: "2021 – 2025 · Senior Front-end Developer",
        text: "innoscripta AG, Munich",
        items: [
          "Introduced a micro-frontend architecture (Webpack Module Federation) for Clusterix, now the company's flagship product — adopted by around 40 teams that ship independently and add new apps quickly",
          "One of the main developers of IMS, the customer platform for collecting R&D project information",
          "Developed features for the internal CRM used to manage customers' R&D tax-funding applications",
        ],
      },
      {
        heading: "2020 – 2021 · Front-end Developer",
        text: "innoscripta AG, Munich",
      },
      {
        heading: "2012 – 2020 · Front-end Developer (freelance)",
        text: "Several companies, St. Petersburg",
        items: [
          "Built a GIS single-page application in React",
          "Web applications and websites on WordPress and Joomla",
        ],
      },
    ],
  },
  {
    id: "skills",
    name: "Skills",
    objectName: "Orbital Station",
    tagline: "Full-stack: TypeScript front, PHP back",
    color: "#22d3ee",
    position: [-9, -2.5, -17],
    camDist: 8,
    blocks: [
      {
        heading: "Frontend",
        tags: [
          "TypeScript",
          "JavaScript",
          "React",
          "Next.js",
          "Micro-frontends",
          "Module Federation",
          "Rsbuild",
          "React Native",
          "Expo",
        ],
      },
      {
        heading: "Backend",
        tags: ["PHP", "Laravel", "PostgreSQL", "RabbitMQ", "Microservices", "Docker"],
      },
      {
        heading: "Tooling",
        tags: ["Git", "GitLab", "CI/CD", "Testing", "Webpack", "Vite", "Figma"],
      },
      {
        heading: "Leadership",
        tags: ["Team leadership", "Hiring", "Mentoring", "Code review", "Agile planning"],
      },
    ],
  },
  {
    id: "education",
    name: "Education",
    objectName: "Comet",
    tagline: "Applied Mathematics & Physics",
    color: "#7cc7ff",
    position: [15, 4, -13],
    camDist: 10,
    blocks: [
      {
        heading: "2011 – 2013 · Master of Applied Mathematics and Physics",
        text: "St. Petersburg State University",
        items: [
          "Graduated with distinction — 5.0 of 5.0",
          "Computational modeling (Matlab, Wolfram Mathematica) of physical processes in nanostructures",
        ],
      },
      {
        heading: "2007 – 2011 · Bachelor of Applied Mathematics and Physics",
        text: "St. Petersburg State University",
        items: ["Graduated with distinction — 4.75 of 5.0"],
      },
    ],
  },
  {
    id: "contact",
    name: "Contact",
    objectName: "Comms Satellite",
    tagline: "Open channel — say hello",
    color: "#34d399",
    position: [3, -3, 20],
    camDist: 7.5,
    blocks: [
      {
        text: "Based in Bolzano, Italy. Strong written and verbal communication — constructive feedback and effective collaboration are part of how I work.",
      },
      {
        links: [
          { label: "astricus@hotmail.com", href: "mailto:astricus@hotmail.com" },
          { label: "LinkedIn", href: "https://it.linkedin.com/in/astricus" },
          { label: "GitHub", href: "https://github.com/astricus" },
        ],
      },
      {
        heading: "CV",
        links: [
          { label: "Download CV (EN)", href: "/cv/CV_Romanenko_EN.pdf", download: true },
          { label: "Scarica CV (IT)", href: "/cv/CV_Romanenko_IT.pdf", download: true },
        ],
      },
    ],
  },
];

export const NAME = "Konstantin Romanenko";
export const ROLE = "Software Team Lead";
