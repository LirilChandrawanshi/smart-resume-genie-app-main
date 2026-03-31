// Sample resume data used for live template previews in the gallery
export const SAMPLE_RESUME = {
  personalInfo: {
    name: 'Liril Chandrawanshi',
    title: 'Software Engineer',
    email: 'myselfliril@gmail.com',
    phone: '8800857706',
    location: 'Gurugram, Haryana',
    summary:
      'Full-stack software engineer focused on scalable fintech and productivity platforms. Experienced with Next.js and Spring Boot, performance optimization, and AI-assisted product workflows.',
    linkedin: 'linkedin.com/in/lirilchandrawanshi',
    github: 'github.com/LirilChandrawanshi',
  },
  experience: [
    {
      id: '1',
      title: 'Software Engineer',
      company: 'Univest',
      location: 'Gurgaon, India',
      startDate: 'Jul 2025',
      endDate: 'Present',
      description:
        'Built an end-to-end subscription-based brokerage plans system using Next.js (SSR) for 100K+ daily active users, including bundled pricing, coupons, auto-pay discounts, and GST calculations.\nOrchestrated a News CMS in Spring Boot with full CRUD and Gemini API integration, reducing content creation time by 30%.\nResolved critical production performance issues on univest.in, improving stability and load times.\nImproved MF Funds screener performance and drove a 20% increase in weekly active users.',
    },
    {
      id: '2',
      title: 'Java Developer Intern',
      company: 'Monkhub Innovations',
      location: 'Gurgaon, India',
      startDate: 'Apr 2025',
      endDate: 'Jul 2025',
      description:
        'Engineered scalable REST APIs using Java and Spring Boot, modernizing legacy systems and reducing API latency by 25%.\nRefactored bottleneck endpoints from GET to POST patterns, improving backend efficiency by 40%.\nCollaborated with a 3-developer team on backend architecture for seamless frontend integration across services.',
    },
  ],
  education: [
    {
      id: '1',
      degree: 'Master of Computer Applications',
      school: 'Birla Institute of Technology Mesra',
      location: 'India',
      startDate: 'Aug 2023',
      endDate: 'Aug 2025',
      description: 'CGPA: 7.83',
    },
    {
      id: '2',
      degree: 'Bachelor of Computer Science',
      school: 'Government Motilal Vigyan Mahavidyalaya',
      location: 'India',
      startDate: 'Aug 2019',
      endDate: 'May 2022',
      description: 'Percentage: 74.73%',
    },
  ],
  skills: [
    { id: '1', name: 'Languages', level: 'Java, JavaScript, SQL, Data Structures and Algorithms (DSA)' },
    { id: '2', name: 'Frontend', level: 'React.js, Next.js, TypeScript, Tailwind CSS, HTML' },
    { id: '3', name: 'Backend', level: 'Spring Boot, REST APIs' },
    { id: '4', name: 'Databases', level: 'MySQL, MongoDB' },
    { id: '5', name: 'Tools', level: 'Git, GitHub, Postman, Swagger, IntelliJ, VS Code, Maven' },
  ],
  projects: [
    {
      id: '1',
      name: 'OpenTalk',
      description:
        'Built backend architecture of a real-time chat app with Spring Boot and REST APIs, lowering message latency by 25%.\nImplemented real-time messaging with WebSockets, STOMP, JWT auth, and secure APIs.\nContainerized with Docker for consistent dev/staging/production deployments.',
      technologies: 'Java, Spring Boot, Next.js, TypeScript, Tailwind, Docker, MongoDB',
      startDate: 'Apr 2025',
      endDate: 'Jul 2025',
      url: '',
    },
    {
      id: '2',
      name: 'Smart Resume Genie',
      description:
        'Built a full-stack AI-powered resume builder with real-time preview, 10+ dynamic templates, and PDF generation.\nIntegrated AI APIs for ATS optimization, suggestions, and bullet enhancement.\nImplemented JWT auth, RBAC, admin dashboard, and deployed with Docker on Vercel and Render.',
      technologies: 'Java, Spring Boot, Next.js, TypeScript, Tailwind, MongoDB',
      startDate: '2024',
      endDate: 'Present',
      url: '',
    },
  ],
  achievements: [
    {
      id: '1',
      name: 'Programming',
      description: 'Solved 400+ problems on LeetCode and GeeksforGeeks in Java; achieved 5 stars in Java, 5 stars in Problem Solving, and 4 stars in SQL on HackerRank.',
      technologies: 'LeetCode, GeeksforGeeks, HackerRank',
      url: '',
    },
    {
      id: '2',
      name: 'Certifications',
      description: 'Earned certifications in Problem Solving (Basic, Intermediate), Java (Basic), REST API (Intermediate), and Python (Basic).',
      technologies: 'HackerRank, GeeksforGeeks',
      url: '',
    },
    {
      id: '3',
      name: 'Entrance Exam Rankings',
      description: 'AIR 124 (VITMEE 2023) and AIR 48 (MAHACET 2023).',
      technologies: 'VITMEE, MAHACET',
      url: '',
    },
  ],
};
