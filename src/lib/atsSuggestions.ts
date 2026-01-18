/**
 * ATS-Friendly Resume Suggestions Engine
 * Uses rule-based checks and optional Hugging Face Router API (via OpenAI SDK) for free AI suggestions
 */

import { OpenAI } from "openai";

// Initialize OpenAI client with Hugging Face Router
const getHuggingFaceClient = () => {
  const apiKey = import.meta.env.VITE_HF_TOKEN || '';
  
  if (!apiKey) {
    return null; // Will fall back to rule-based if no API key
  }
  
  return new OpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: apiKey,
  });
};

export interface ATSuggestion {
  field: string;
  value: string;
  type: 'summary' | 'skill' | 'experience' | 'education' | 'format' | 'keyword';
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

// Common ATS-friendly keywords by category
const COMMON_KEYWORDS = {
  technical: [
    'Java', 'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Spring Boot',
    'SQL', 'MongoDB', 'PostgreSQL', 'Git', 'Docker', 'Kubernetes', 'AWS', 'Azure',
    'REST API', 'GraphQL', 'Microservices', 'CI/CD', 'Agile', 'Scrum', 'DevOps'
  ],
  soft: [
    'Leadership', 'Communication', 'Problem Solving', 'Team Collaboration',
    'Project Management', 'Critical Thinking', 'Time Management', 'Adaptability'
  ],
  actionVerbs: [
    'Developed', 'Implemented', 'Designed', 'Led', 'Managed', 'Created', 'Improved',
    'Optimized', 'Collaborated', 'Delivered', 'Achieved', 'Increased', 'Reduced',
    'Streamlined', 'Enhanced', 'Built', 'Maintained', 'Deployed', 'Integrated'
  ]
};

/**
 * Analyze resume for ATS-friendly suggestions using rule-based checks
 * Priority: Dataset API → Hugging Face Router API → Rule-based
 */
export async function generateATSSuggestions(resumeData: any): Promise<ATSuggestion[]> {
  const suggestions: ATSuggestion[] = [];

  // PRIORITY 1: Try dataset-based pattern analysis FIRST (if available)
  const resumeTextForDataset = [
    resumeData.personalInfo?.summary || '',
    ...(resumeData.experience || []).map((e: any) => e.description || '').join(' '),
    ...(resumeData.skills || []).map((s: any) => s.name).join(' ')
  ].join(' ').toLowerCase();

  const datasetSuggestions = await analyzeWithDatasetPatterns(resumeTextForDataset, resumeData);
  
  if (datasetSuggestions && datasetSuggestions.length > 0) {
    // Add dataset-based suggestions first (high priority)
    datasetSuggestions.forEach((suggestion, index) => {
      suggestions.push({
        field: `dataset-pattern-${index}`,
        value: suggestion.value,
        type: (suggestion.type || 'keyword') as 'summary' | 'skill' | 'experience' | 'education' | 'format' | 'keyword',
        priority: (suggestion.priority || 'high') as 'high' | 'medium' | 'low',
        reason: suggestion.reason || 'Pattern analysis based on high-scoring resumes from ATS dataset'
      });
    });
  }

  // Continue with rule-based checks to supplement dataset suggestions
  // 1. Check Professional Summary
  if (!resumeData.personalInfo?.summary || resumeData.personalInfo.summary.length < 50) {
    const suggestedSummary = await generateSummarySuggestion(resumeData);
    suggestions.push({
      field: 'summary',
      value: suggestedSummary,
      type: 'summary',
      priority: 'high',
      reason: 'Professional summary should be 50-150 words and highlight key skills and experience'
    });
  } else if (resumeData.personalInfo.summary.length > 200) {
    suggestions.push({
      field: 'summary',
      value: resumeData.personalInfo.summary.substring(0, 150) + '...',
      type: 'summary',
      priority: 'medium',
      reason: 'Summary is too long. ATS-friendly summaries should be 50-150 words'
    });
  }

  // 2. Check Skills Section
  const existingSkills = (resumeData.skills || []).map((s: any) => s.name.toLowerCase());
  
  // Suggest missing common technical keywords
  const missingTechSkills = COMMON_KEYWORDS.technical.filter(tech => 
    !existingSkills.some((skill: string) => skill.toLowerCase().includes(tech.toLowerCase()))
  );
  
  if (missingTechSkills.length > 0 && existingSkills.length < 10) {
    // Randomly select a missing skill to suggest (different each time)
    const randomSkill = missingTechSkills[Math.floor(Math.random() * Math.min(missingTechSkills.length, 5))];
    suggestions.push({
      field: 'skill',
      value: randomSkill,
      type: 'skill',
      priority: 'medium',
      reason: `Adding relevant technical skills like "${randomSkill}" can improve ATS keyword matching`
    });
  }

  // 3. Check Experience Descriptions
  const experienceChecks = await Promise.all(
    (resumeData.experience || []).map(async (exp: any, index: number) => {
      if (!exp.description || exp.description.trim().length < 30) {
        const suggestedDescription = await generateExperienceSuggestion(exp, existingSkills);
        return {
          field: `experience-${index}-description`,
          value: suggestedDescription,
          type: 'experience' as const,
          priority: 'high' as const,
          reason: 'Experience descriptions should be detailed with action verbs and quantifiable achievements'
        };
      } else {
        // Check for action verbs
        const hasActionVerb = COMMON_KEYWORDS.actionVerbs.some(verb => 
          exp.description.toLowerCase().includes(verb.toLowerCase())
        );
        
        if (!hasActionVerb && !exp.description.toLowerCase().match(/^[a-z]/)) {
          return {
            field: `experience-${index}-description`,
            value: improveExperienceDescription(exp.description),
            type: 'experience' as const,
            priority: 'medium' as const,
            reason: 'Start bullet points with strong action verbs (e.g., "Developed", "Led", "Implemented")'
          };
        }

        // Check for quantifiable metrics
        const hasNumbers = /\d+/.test(exp.description);
        if (!hasNumbers) {
          return {
            field: `experience-${index}-description`,
            value: addMetricsToDescription(exp.description),
            type: 'experience' as const,
            priority: 'medium' as const,
            reason: 'Add quantifiable results (percentages, numbers) to demonstrate impact'
          };
        }
      }
      return null;
    })
  );

  // Add valid experience suggestions
  experienceChecks.forEach(suggestion => {
    if (suggestion) {
      suggestions.push(suggestion);
    }
  });

  // 4. Check Education Section
  (resumeData.education || []).forEach((edu: any, index: number) => {
    if (!edu.degree || !edu.school) {
      suggestions.push({
        field: `education-${index}`,
        value: 'Complete education details improve ATS parsing',
        type: 'education',
        priority: 'high',
        reason: 'Education section should include degree, school name, and graduation date'
      });
    }
  });

  // 5. Check for ATS-friendly formatting issues
  if (resumeData.personalInfo?.email && !resumeData.personalInfo.email.includes('@')) {
    suggestions.push({
      field: 'format',
      value: 'Ensure email format is correct',
      type: 'format',
      priority: 'high',
      reason: 'ATS systems parse contact information. Ensure email format is valid'
    });
  }

  // 6. Check keyword density
  const allText = [
    resumeData.personalInfo?.summary || '',
    ...(resumeData.experience || []).map((e: any) => e.description || '').join(' '),
    ...(resumeData.skills || []).map((s: any) => s.name).join(' ')
  ].join(' ').toLowerCase();

  const uniqueKeywords = new Set(
    COMMON_KEYWORDS.technical.filter(keyword => 
      allText.includes(keyword.toLowerCase())
    )
  );

  if (uniqueKeywords.size < 5 && (resumeData.skills || []).length < 8) {
    suggestions.push({
      field: 'keyword',
      value: 'Add more industry-relevant keywords',
      type: 'keyword',
      priority: 'medium',
      reason: 'ATS systems match resumes to job descriptions using keywords. Add more relevant technical terms'
    });
  }

  return suggestions;
}

/**
 * Generate a professional summary suggestion using Hugging Face Router API (OpenAI SDK) or fallback
 */
async function generateSummarySuggestion(resumeData: any): Promise<string> {
  const role = resumeData.personalInfo?.title || 'Professional';
  const experience = resumeData.experience || [];
  const skills = resumeData.skills || [];
  
  const yearsOfExperience = experience.length > 0 ? `${experience.length}+ years` : '';
  const topSkills = skills.slice(0, 3).map((s: any) => s.name).join(', ');
  
  // Try Hugging Face Router API using OpenAI SDK
  const client = getHuggingFaceClient();
  if (client) {
    try {
      const prompt = `Write a professional 2-3 sentence resume summary for a ${role}${yearsOfExperience ? ` with ${yearsOfExperience} of experience` : ''}${topSkills ? ` and skills in ${topSkills}` : ''}. Make it ATS-friendly with relevant keywords and action verbs. Keep it concise (50-150 words).`;
      
      const chatCompletion = await client.chat.completions.create({
        model: "utter-project/EuroLLM-22B-Instruct-2512:publicai",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      if (chatCompletion.choices && chatCompletion.choices[0]?.message?.content) {
        const generatedText = chatCompletion.choices[0].message.content.trim();
        if (generatedText.length > 20) { // Ensure we have meaningful content
          return generatedText;
        }
      }
    } catch (error) {
      console.log('Hugging Face Router API error, using rule-based generation:', error);
    }
  }

  // Fallback: Rule-based summary generation
  const actionVerbs = ['Experienced', 'Skilled', 'Proven', 'Dedicated'];
  const randomVerb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
  
  return `${randomVerb} ${role.toLowerCase()}${yearsOfExperience ? ` with ${yearsOfExperience} of experience` : ''}${topSkills ? ` specializing in ${topSkills}` : ''}. Proven track record of delivering high-quality solutions and collaborating with cross-functional teams. Strong problem-solving abilities with a focus on continuous improvement and best practices.`;
}

/**
 * Generate experience description suggestion using AI or fallback
 */
async function generateExperienceSuggestion(exp: any, existingSkills: string[]): Promise<string> {
  const title = exp.title || 'Professional';
  const company = exp.company || 'organization';
  
  const techKeywords = COMMON_KEYWORDS.technical.filter(tech =>
    existingSkills.some(skill => skill.toLowerCase().includes(tech.toLowerCase()))
  );
  
  const techStack = techKeywords.slice(0, 3).join(', ') || 'modern technologies';
  
  // Try Hugging Face Router API using OpenAI SDK
  const client = getHuggingFaceClient();
  if (client) {
    try {
      const prompt = `Write a professional 2-3 bullet point description for a ${title} role at ${company}${techStack ? ` using ${techStack}` : ''}. Include action verbs, quantifiable metrics (percentages or numbers), and ATS-friendly keywords. Make it concise and impactful.`;
      
      const chatCompletion = await client.chat.completions.create({
        model: "utter-project/EuroLLM-22B-Instruct-2512:publicai",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      if (chatCompletion.choices && chatCompletion.choices[0]?.message?.content) {
        const generatedText = chatCompletion.choices[0].message.content.trim();
        if (generatedText.length > 30) { // Ensure we have meaningful content
          return generatedText;
        }
      }
    } catch (error) {
      console.log('Hugging Face Router API error for experience, using rule-based generation:', error);
    }
  }

  // Fallback: Rule-based generation
  const actionVerbs = ['Developed', 'Implemented', 'Led', 'Designed', 'Optimized'];
  const randomVerb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
  
  return `${randomVerb} and maintained scalable solutions using ${techStack}, resulting in improved performance and user satisfaction. Collaborated with cross-functional teams to deliver projects on time and within budget. Identified and resolved technical challenges, contributing to overall team success.`;
}

/**
 * Improve experience description with action verbs
 */
function improveExperienceDescription(description: string): string {
  const actionVerbs = ['Developed', 'Implemented', 'Led', 'Designed', 'Created'];
  const randomVerb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
  
  // If description doesn't start with capital action verb, suggest improvement
  if (!/^[A-Z]/.test(description.trim())) {
    return `${randomVerb} ${description.trim().toLowerCase()}`;
  }
  
  return description;
}

/**
 * Add metrics to description if missing
 */
function addMetricsToDescription(description: string): string {
  // Suggest adding metrics
  const metrics = [
    'by 30%',
    'by 25%',
    'by 40%',
    'by 50%',
    'for 100+ users',
    'with 99.9% uptime',
    'reducing costs by 20%'
  ];
  
  const randomMetric = metrics[Math.floor(Math.random() * metrics.length)];
  
  if (!/\d+/.test(description)) {
    return `${description.trim()} (Consider adding quantifiable results, e.g., "${randomMetric}")`;
  }
  
  return description;
}

/**
 * Fetch high-scoring resume examples from Hugging Face dataset
 * This helps us learn patterns from resumes with good ATS scores
 * 
 * Note: The dataset might be gated/private and require authentication.
 * If unavailable, this function returns null and falls back to rule-based suggestions.
 * Uses random offset to get different examples each time.
 */
async function fetchHighScoringResumeExamples(limit: number = 100): Promise<Array<{text: string, ats_score: number}> | null> {
  try {
    // Use random offset to get different examples each time (dataset has ~6,374 rows)
    // Random offset between 0 and 6000 to ensure we get different examples
    // API limit: length must be <= 100
    const maxOffset = 6200; // Leave room for the batch
    const randomOffset = Math.floor(Math.random() * maxOffset);
    const fetchLength = 100; // API maximum is 100
    
    const response = await fetch(
      `https://datasets-server.huggingface.co/rows?dataset=0xnbk%2Fresume-ats-score-v1-en&config=default&split=train&offset=${randomOffset}&length=${fetchLength}`,
      {
        headers: {
          'Accept': '*/*',
        },
      }
    );

    if (!response.ok) {
      // Check if it's an authentication/gated dataset error
      const errorData = await response.json().catch(() => ({}));
      if (errorData.error && errorData.error.includes('authentication')) {
        console.log('Dataset requires authentication or is gated. Skipping dataset-based suggestions.');
      } else {
        console.log('Hugging Face Datasets API not accessible, skipping dataset-based suggestions');
      }
      return null;
    }

    const data = await response.json();
    
    // Check for error in response body (even if status is 200)
    if (data.error) {
      if (data.error.includes('authentication') || data.error.includes('gated') || data.error.includes('private')) {
        console.log('Dataset is gated/private and requires authentication. Using rule-based suggestions instead.');
      } else {
        console.log('Dataset API error:', data.error);
      }
      return null;
    }
    
    if (data.rows && Array.isArray(data.rows)) {
      // Extract text and ats_score from rows
      let examples = data.rows
        .map((row: any) => ({
          text: row.row?.text || '',
          ats_score: row.row?.ats_score || 0
        }))
        .filter((ex: any) => ex.text && ex.ats_score > 70); // Only high-scoring examples

      // Shuffle and select random subset for variety
      // This ensures different examples are used each time
      examples = examples.sort(() => Math.random() - 0.5); // Shuffle
      
      // Take random sample (between 50-100 examples)
      const sampleSize = Math.min(limit, examples.length);
      examples = examples.slice(0, sampleSize);
      
      // Sort by score descending for final selection
      examples.sort((a: any, b: any) => b.ats_score - a.ats_score);

      return examples.length > 0 ? examples : null;
    }

    return null;
  } catch (error) {
    console.log('Error fetching resume examples (dataset may be private/gated):', error);
    return null;
  }
}

/**
 * Analyze resume using patterns from high-scoring examples from dataset
 * Returns actionable suggestions based on real ATS-scored resumes
 */
async function analyzeWithDatasetPatterns(resumeText: string, resumeData: any): Promise<Array<{value: string, type: string, priority: string, reason: string}> | null> {
  const suggestions: Array<{value: string, type: string, priority: string, reason: string}> = [];
  
  const examples = await fetchHighScoringResumeExamples(100);
  
  if (!examples || examples.length === 0) {
    return null; // No dataset access, return null
  }

  console.log(`📊 Using ${examples.length} high-scoring resume examples from dataset`);

  // Analyze patterns from high-scoring resumes
  const highScoreTexts = examples.map(ex => ex.text.toLowerCase());
  const resumeTextLower = resumeText.toLowerCase();
  const avgScore = examples.reduce((sum, ex) => sum + ex.ats_score, 0) / examples.length;

  // Enhanced pattern analysis based on high-scoring examples
  const commonPatterns = [
    { 
      pattern: /\d+%/, 
      desc: 'quantifiable metrics (percentages)', 
      example: '30% improvement',
      type: 'experience' as const,
      priority: 'high' as const
    },
    { 
      pattern: /\d+\+ (years?|months?|years of)/i, 
      desc: 'experience duration', 
      example: '5+ years of experience',
      type: 'experience' as const,
      priority: 'medium' as const
    },
    { 
      pattern: /\b(developed|implemented|led|designed|optimized|created|delivered|achieved|increased|reduced|improved|managed|built|deployed)\b/i, 
      desc: 'strong action verbs', 
      example: 'Developed, Led, Implemented',
      type: 'experience' as const,
      priority: 'high' as const
    },
    { 
      pattern: /\b(aws|azure|kubernetes|docker|jenkins|terraform|ansible|git|ci\/cd)\b/i, 
      desc: 'modern DevOps/cloud technologies', 
      example: 'AWS, Docker, Kubernetes',
      type: 'skill' as const,
      priority: 'medium' as const
    },
    { 
      pattern: /\d+ (projects?|teams?|users?|customers?|clients?|companies?)/i, 
      desc: 'quantifiable achievements', 
      example: '100+ users, 5 projects',
      type: 'experience' as const,
      priority: 'high' as const
    },
    { 
      pattern: /(bachelor|master|phd|degree|certification|certified)/i, 
      desc: 'educational credentials', 
      example: 'Bachelor\'s degree, Certifications',
      type: 'education' as const,
      priority: 'medium' as const
    }
  ];

  // Check for missing patterns
  for (const { pattern, desc, example, type, priority } of commonPatterns) {
    const hasPattern = pattern.test(resumeTextLower);
    const highScoreHasPattern = highScoreTexts.filter(text => pattern.test(text)).length;
    const patternFrequency = (highScoreHasPattern / highScoreTexts.length) * 100;
    
    // If pattern is found in >70% of high-scoring resumes but missing in user's resume
    if (!hasPattern && patternFrequency > 70) {
      suggestions.push({
        value: `Add ${desc} to your resume. Example: "${example}". Found in ${Math.round(patternFrequency)}% of high-scoring resumes.`,
        type,
        priority,
        reason: `High-scoring resumes (avg score: ${avgScore.toFixed(1)}) commonly include ${desc}`
      });
    }
  }

  // Analyze summary quality from high-scoring examples
  const highScoreSummaries = examples
    .map(ex => {
      const summaryMatch = ex.text.match(/summary[:\s]*([^]+?)(?=\n|experience|education|skills|$)/i);
      return summaryMatch ? summaryMatch[1].trim() : null;
    })
    .filter(s => s && s.length > 30);

  if (highScoreSummaries.length > 0) {
    const avgSummaryLength = highScoreSummaries.reduce((sum, s) => sum + s!.length, 0) / highScoreSummaries.length;
    const userSummaryLength = resumeData.personalInfo?.summary?.length || 0;

    if (userSummaryLength === 0 || userSummaryLength < 50) {
      suggestions.push({
        value: `Professional summaries in high-scoring resumes average ${Math.round(avgSummaryLength)} characters with key skills and achievements.`,
        type: 'summary',
        priority: 'high',
        reason: `High-scoring resumes typically have detailed professional summaries (avg: ${Math.round(avgSummaryLength)} chars)`
      });
    }
  }

  // Skill keyword analysis
  const skillMatches = highScoreTexts
    .join(' ')
    .match(/\b(java|python|javascript|react|node\.js|spring|sql|mongodb|docker|kubernetes|aws|azure|git|agile|scrum|devops|machine learning|ai|ml)\b/gi);
  
  const allHighScoreSkills: string[] = skillMatches || [];
  
  const skillCounts = allHighScoreSkills.reduce((acc: Record<string, number>, skill: string) => {
    const normalized = skill.toLowerCase();
    acc[normalized] = (acc[normalized] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSkills = Object.entries(skillCounts)
    .sort(([,a]: any, [,b]: any) => b - a)
    .slice(0, 10)
    .map(([skill]) => skill);

  const userSkills = (resumeData.skills || []).map((s: any) => s.name.toLowerCase());
  const missingTopSkills = topSkills.filter(skill => 
    !userSkills.some(us => us.includes(skill) || skill.includes(us))
  );

  if (missingTopSkills.length > 0 && userSkills.length < 10) {
    // Randomize which skill to suggest for variety
    const randomSkill = missingTopSkills[Math.floor(Math.random() * Math.min(missingTopSkills.length, 3))];
    suggestions.push({
      value: `Consider adding "${randomSkill}" - it appears frequently in high-scoring resumes (avg score: ${avgScore.toFixed(1)})`,
      type: 'skill',
      priority: 'medium',
      reason: 'Skills frequently found in high-ATS-scoring resumes'
    });
  }

  // Shuffle and limit suggestions for variety (show different suggestions each time)
  if (suggestions.length > 0) {
    // Shuffle suggestions randomly
    const shuffled = suggestions.sort(() => Math.random() - 0.5);
    
    // Return 3-5 random suggestions (or all if less than 3)
    const maxSuggestions = Math.min(shuffled.length, Math.max(3, Math.floor(Math.random() * 3) + 3));
    return shuffled.slice(0, maxSuggestions);
  }

  return null;
}

/**
 * Calculate ATS score based on similarity to dataset examples
 * Uses the actual ATS scores from the dataset to estimate user's score
 */
async function calculateDatasetBasedScore(resumeText: string, resumeData: any): Promise<{ score: number; feedback: string[] } | null> {
  const examples = await fetchHighScoringResumeExamples(100);
  
  if (!examples || examples.length === 0) {
    return null;
  }

  const feedback: string[] = [];
  const resumeTextLower = resumeText.toLowerCase();
  
  // Calculate similarity to high-scoring resumes based on pattern matching
  let matchedPatterns = 0;
  let totalPatterns = 0;
  
  // Common patterns from high-scoring resumes with weights
  const weightedPatterns = [
    { pattern: /\d+%/, weight: 3, desc: 'quantifiable metrics' },
    { pattern: /\d+\+ (years?|months?)/i, weight: 2, desc: 'experience duration' },
    { pattern: /\b(developed|implemented|led|designed|optimized|created|delivered|achieved)\b/i, weight: 3, desc: 'action verbs' },
    { pattern: /\b(aws|azure|kubernetes|docker|jenkins|terraform)\b/i, weight: 2, desc: 'modern technologies' },
    { pattern: /\d+ (projects?|teams?|users?)/i, weight: 3, desc: 'quantifiable achievements' },
    { pattern: /(bachelor|master|degree|certification)/i, weight: 1, desc: 'education credentials' },
  ];

  for (const { pattern, weight, desc } of weightedPatterns) {
    totalPatterns += weight;
    const hasPattern = pattern.test(resumeTextLower);
    const highScoreFrequency = examples.filter(ex => pattern.test(ex.text.toLowerCase())).length / examples.length;
    
    if (hasPattern) {
      matchedPatterns += weight;
    } else if (highScoreFrequency > 0.7) {
      feedback.push(`Missing ${desc} found in ${Math.round(highScoreFrequency * 100)}% of high-scoring resumes`);
    }
  }

  // Pattern match score (0-100)
  const patternScore = (matchedPatterns / totalPatterns) * 100;
  
  // Calculate average ATS score of similar resumes
  const avgDatasetScore = examples.reduce((sum, ex) => sum + ex.ats_score, 0) / examples.length;
  const minDatasetScore = Math.min(...examples.map(ex => ex.ats_score));
  const maxDatasetScore = Math.max(...examples.map(ex => ex.ats_score));
  
  // Estimate score based on pattern matching + dataset average
  // Weight: 60% pattern match, 40% dataset baseline
  const estimatedScore = Math.round((patternScore * 0.6) + (avgDatasetScore * 0.4));
  
  // Clamp score to reasonable range based on dataset
  const finalScore = Math.max(minDatasetScore, Math.min(maxDatasetScore, estimatedScore));
  
  // Add dataset-based feedback
  if (finalScore >= 80) {
    feedback.unshift(`Based on dataset analysis, your resume matches patterns from high-scoring resumes (avg dataset score: ${avgDatasetScore.toFixed(1)})`);
  } else if (finalScore >= 60) {
    feedback.unshift(`Your resume has some elements of high-scoring resumes (dataset avg: ${avgDatasetScore.toFixed(1)}), but improvements are needed.`);
  } else {
    feedback.unshift(`Compared to high-scoring resumes in the dataset (avg: ${avgDatasetScore.toFixed(1)}), your resume needs significant improvements.`);
  }
  
  return { score: Math.round(finalScore), feedback };
}

/**
 * Calculate ATS score using dataset-based analysis (if available) + rule-based checks
 */
export async function calculateATSScore(resumeData: any): Promise<{ score: number; feedback: string[] }> {
  const feedback: string[] = [];
  let score = 100;

  // Try to use dataset-based scoring first
  const resumeTextForScoring = [
    resumeData.personalInfo?.summary || '',
    ...(resumeData.experience || []).map((e: any) => e.description || '').join(' '),
    ...(resumeData.skills || []).map((s: any) => s.name).join(' ')
  ].join(' ').toLowerCase();

  const datasetScoreData = await calculateDatasetBasedScore(resumeTextForScoring, resumeData);
  
  if (datasetScoreData) {
    // Use dataset-based scoring if available
    console.log(`📊 Using dataset-based ATS score: ${datasetScoreData.score}/100`);
    return datasetScoreData;
  }

  // Fallback to rule-based scoring
  console.log('📝 Using rule-based ATS scoring (dataset not available)');

  // Check summary
  if (!resumeData.personalInfo?.summary || resumeData.personalInfo.summary.length < 50) {
    score -= 15;
    feedback.push('Professional summary is missing or too short');
  }

  // Check skills count
  const skillsCount = (resumeData.skills || []).length;
  if (skillsCount < 5) {
    score -= 10;
    feedback.push('Add more relevant skills (aim for 5-10)');
  }

  // Check experience descriptions
  const emptyExp = (resumeData.experience || []).filter((e: any) => !e.description || e.description.length < 30);
  if (emptyExp.length > 0) {
    score -= 20;
    feedback.push(`${emptyExp.length} experience${emptyExp.length > 1 ? ' entries' : ' entry'} missing detailed descriptions`);
  }

  // Check for action verbs
  const allExpText = (resumeData.experience || [])
    .map((e: any) => e.description || '')
    .join(' ')
    .toLowerCase();
  
  const hasActionVerbs = COMMON_KEYWORDS.actionVerbs.some(verb => 
    allExpText.includes(verb.toLowerCase())
  );
  
  if (!hasActionVerbs) {
    score -= 10;
    feedback.push('Use strong action verbs in experience descriptions');
  }

  // Check for quantifiable metrics
  const hasMetrics = /\d+%/.test(allExpText) || /\d+\+/.test(allExpText);
  if (!hasMetrics) {
    score -= 10;
    feedback.push('Add quantifiable results (percentages, numbers) to show impact');
  }

  // Check contact info
  if (!resumeData.personalInfo?.email || !resumeData.personalInfo?.phone) {
    score -= 5;
    feedback.push('Ensure contact information is complete');
  }

  // Check education
  if (!resumeData.education || resumeData.education.length === 0) {
    score -= 10;
    feedback.push('Add education details');
  }

  if (score >= 80) {
    feedback.unshift('Your resume is well-optimized for ATS systems!');
  } else if (score >= 60) {
    feedback.unshift('Your resume is good but could be improved for better ATS compatibility.');
  } else {
    feedback.unshift('Your resume needs significant improvements for ATS compatibility.');
  }

  return { score: Math.max(0, score), feedback };
}
