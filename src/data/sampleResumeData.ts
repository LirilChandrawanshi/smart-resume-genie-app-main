// Sample resume data used for live template previews in the gallery
export const SAMPLE_RESUME = {
  personalInfo: {
    name: 'Alex Johnson',
    title: 'Senior Software Engineer',
    email: 'alex@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    summary:
      'Results-driven software engineer with 5+ years building scalable web applications. Passionate about clean architecture, team collaboration, and shipping products that matter.',
    linkedin: 'alexjohnson',
    github: 'alexjohnson',
  },
  experience: [
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'Google LLC',
      location: 'Mountain View, CA',
      startDate: 'Jan 2021',
      endDate: 'Present',
      description:
        'Led development of core infrastructure serving 500M+ users\nReduced system latency by 40% through architectural improvements\nMentored 5 junior engineers and led bi-weekly tech talks\nOwned full migration from monolith to microservices',
    },
    {
      id: '2',
      title: 'Software Engineer',
      company: 'Stripe',
      location: 'San Francisco, CA',
      startDate: 'Jun 2019',
      endDate: 'Dec 2020',
      description:
        'Built real-time payment processing pipeline handling $2B in transactions\nIntegrated fraud detection reducing chargebacks by 30%\nDeveloped internal tooling adopted by 200+ engineers',
    },
  ],
  education: [
    {
      id: '1',
      degree: 'B.S. Computer Science',
      school: 'Stanford University',
      location: 'Stanford, CA',
      startDate: 'Aug 2015',
      endDate: 'May 2019',
      description: 'GPA: 3.9 / 4.0 · Dean\'s List · ACM Chapter President',
    },
  ],
  skills: [
    { id: '1', name: 'Languages', level: 'TypeScript, Python, Go, Rust' },
    { id: '2', name: 'Frontend', level: 'React, Next.js, Tailwind CSS, GraphQL' },
    { id: '3', name: 'Backend', level: 'Node.js, FastAPI, PostgreSQL, Redis' },
    { id: '4', name: 'Cloud & DevOps', level: 'AWS, Docker, Kubernetes, Terraform' },
  ],
  projects: [
    {
      id: '1',
      name: 'OpenFlow',
      description:
        'Open-source workflow automation platform with 4k+ GitHub stars\nBuilt plugin system supporting 50+ integrations\nFeatured in GitHub Trending for 3 consecutive weeks',
      technologies: 'Node.js, React, PostgreSQL, Docker',
      startDate: '2022',
      endDate: '2023',
      url: 'github.com/alex/openflow',
    },
    {
      id: '2',
      name: 'Pulse Analytics',
      description:
        'Real-time web analytics dashboard with sub-second query performance\nHandles 10M+ events per day using ClickHouse',
      technologies: 'TypeScript, ClickHouse, Next.js',
      startDate: '2023',
      endDate: 'Present',
      url: '',
    },
  ],
  achievements: [
    {
      id: '1',
      name: 'Google Developer Expert — Web Technologies',
      description: 'Recognized by Google for contributions to the web developer community',
      technologies: '2022 – Present',
      url: '',
    },
    {
      id: '2',
      name: 'HackMIT Winner',
      description: 'First place out of 300+ teams for building an accessible coding environment',
      technologies: '2018',
      url: '',
    },
  ],
};
