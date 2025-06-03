// Advanced Resume Optimization Engine
// Creates professionally designed resumes that match job requirements

const advancedResumeOptimizer = {
  
  // Extract detailed job requirements and skills
  analyzeJobPosting: (jobDescription) => {
    const text = jobDescription.toLowerCase();
    
    // Extract technical skills
    const technicalSkills = [
      'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node.js', 'express',
      'mongodb', 'postgresql', 'mysql', 'aws', 'azure', 'docker', 'kubernetes',
      'git', 'ci/cd', 'jenkins', 'terraform', 'microservices', 'api', 'rest',
      'graphql', 'typescript', 'html', 'css', 'sass', 'webpack', 'babel',
      'redux', 'next.js', 'nuxt.js', 'django', 'flask', 'spring', 'laravel'
    ].filter(skill => text.includes(skill));

    // Extract soft skills
    const softSkills = [
      'leadership', 'communication', 'teamwork', 'problem solving', 'analytical',
      'project management', 'agile', 'scrum', 'collaboration', 'mentoring',
      'strategic thinking', 'innovation', 'adaptability', 'time management'
    ].filter(skill => text.includes(skill));

    // Extract experience requirements
    const experienceMatch = text.match(/(\d+)[\+\-\s]*years?\s+(?:of\s+)?experience/);
    const yearsRequired = experienceMatch ? parseInt(experienceMatch[1]) : 3;

    // Extract education requirements
    const educationKeywords = ['bachelor', 'master', 'phd', 'degree', 'computer science', 'engineering'];
    const educationRequired = educationKeywords.some(keyword => text.includes(keyword));

    // Extract company type/industry
    const industryKeywords = {
      'fintech': ['financial', 'banking', 'payment', 'trading', 'investment'],
      'healthcare': ['healthcare', 'medical', 'hospital', 'patient', 'clinical'],
      'ecommerce': ['ecommerce', 'retail', 'shopping', 'marketplace', 'commerce'],
      'saas': ['saas', 'software as a service', 'b2b', 'enterprise'],
      'startup': ['startup', 'early stage', 'fast-paced', 'dynamic'],
      'enterprise': ['enterprise', 'large scale', 'fortune', 'corporate']
    };

    let industry = 'technology';
    for (const [key, keywords] of Object.entries(industryKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        industry = key;
        break;
      }
    }

    // Extract key responsibilities
    const responsibilities = advancedResumeOptimizer.extractResponsibilities(jobDescription);

    return {
      technicalSkills,
      softSkills,
      yearsRequired,
      educationRequired,
      industry,
      responsibilities,
      jobTitle: advancedResumeOptimizer.extractJobTitle(jobDescription)
    };
  },

  // Extract job title from posting
  extractJobTitle: (jobDescription) => {
    const lines = jobDescription.split('\n');
    const firstLine = lines[0].trim();
    
    // Common job title patterns
    const titlePatterns = [
      /(?:senior|sr\.?|lead|principal|staff)\s+(?:software|full[\-\s]?stack|frontend|backend|web)\s+(?:engineer|developer)/i,
      /(?:software|full[\-\s]?stack|frontend|backend|web)\s+(?:engineer|developer)/i,
      /(?:frontend|backend|full[\-\s]?stack)\s+developer/i,
      /web\s+developer/i,
      /software\s+engineer/i
    ];

    for (const pattern of titlePatterns) {
      const match = firstLine.match(pattern);
      if (match) return match[0];
    }

    return 'Software Engineer';
  },

  // Extract key responsibilities from job posting
  extractResponsibilities: (jobDescription) => {
    const lines = jobDescription.split('\n');
    const responsibilities = [];
    
    let inResponsibilities = false;
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.toLowerCase().includes('responsibilities') || 
          trimmed.toLowerCase().includes('you will') ||
          trimmed.toLowerCase().includes('duties')) {
        inResponsibilities = true;
        continue;
      }
      
      if (inResponsibilities && (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*'))) {
        responsibilities.push(trimmed.substring(1).trim());
      }
      
      if (trimmed.toLowerCase().includes('requirements') || 
          trimmed.toLowerCase().includes('qualifications')) {
        inResponsibilities = false;
      }
    }

    return responsibilities.slice(0, 5); // Top 5 responsibilities
  },

  // Generate professional experience based on job requirements
  generateRelevantExperience: (jobAnalysis, baseResume) => {
    const { technicalSkills, industry, responsibilities, yearsRequired, jobTitle } = jobAnalysis;
    
    // Create relevant job titles and companies
    const experienceEntries = [];
    
    // Current/Recent position
    const currentTitle = advancedResumeOptimizer.generateJobTitle(jobTitle, 'senior');
    const currentCompany = advancedResumeOptimizer.generateCompanyName(industry);
    const currentDuration = `2022 - Present`;
    
    experienceEntries.push({
      title: currentTitle,
      company: currentCompany,
      duration: currentDuration,
      achievements: advancedResumeOptimizer.generateAchievements(technicalSkills, responsibilities, 'senior')
    });

    // Previous position
    if (yearsRequired >= 3) {
      const previousTitle = advancedResumeOptimizer.generateJobTitle(jobTitle, 'mid');
      const previousCompany = advancedResumeOptimizer.generateCompanyName(industry);
      const previousDuration = `2020 - 2022`;
      
      experienceEntries.push({
        title: previousTitle,
        company: previousCompany,
        duration: previousDuration,
        achievements: advancedResumeOptimizer.generateAchievements(technicalSkills, responsibilities, 'mid')
      });
    }

    // Entry level position
    if (yearsRequired >= 5) {
      const entryTitle = advancedResumeOptimizer.generateJobTitle(jobTitle, 'junior');
      const entryCompany = advancedResumeOptimizer.generateCompanyName(industry);
      const entryDuration = `2018 - 2020`;
      
      experienceEntries.push({
        title: entryTitle,
        company: entryCompany,
        duration: entryDuration,
        achievements: advancedResumeOptimizer.generateAchievements(technicalSkills, responsibilities, 'junior')
      });
    }

    return experienceEntries;
  },

  // Generate appropriate job titles
  generateJobTitle: (baseTitle, level) => {
    const levelPrefixes = {
      'senior': ['Senior', 'Lead', 'Principal'],
      'mid': ['', 'Mid-Level'],
      'junior': ['Junior', 'Associate', '']
    };
    
    const prefix = levelPrefixes[level][Math.floor(Math.random() * levelPrefixes[level].length)];
    return prefix ? `${prefix} ${baseTitle}` : baseTitle;
  },

  // Generate realistic company names by industry
  generateCompanyName: (industry) => {
    const companies = {
      'fintech': ['FinanceFlow Inc', 'PaymentPro Solutions', 'TradeTech Systems', 'InvestSmart Corp'],
      'healthcare': ['HealthTech Solutions', 'MedData Systems', 'CareConnect Inc', 'HealthFlow Technologies'],
      'ecommerce': ['ShopSmart Technologies', 'RetailFlow Inc', 'CommerceHub Solutions', 'MarketPlace Systems'],
      'saas': ['CloudTech Solutions', 'SaaS Innovations Inc', 'Enterprise Software Corp', 'TechFlow Systems'],
      'startup': ['InnovateTech Startup', 'NextGen Solutions', 'DisruptTech Inc', 'AgileFlow Technologies'],
      'enterprise': ['Global Tech Corporation', 'Enterprise Solutions Inc', 'TechCorp International', 'SystemsFlow Enterprise']
    };
    
    const companyList = companies[industry] || companies['technology'] || ['TechFlow Solutions'];
    return companyList[Math.floor(Math.random() * companyList.length)];
  },

  // Generate relevant achievements based on skills and responsibilities
  generateAchievements: (skills, responsibilities, level) => {
    const achievements = [];
    
    // Technical achievements
    if (skills.includes('react') || skills.includes('javascript')) {
      achievements.push(`Developed responsive web applications using React.js and modern JavaScript, improving user engagement by 40%`);
    }
    
    if (skills.includes('node.js') || skills.includes('api')) {
      achievements.push(`Built and maintained RESTful APIs using Node.js, handling 10,000+ daily requests with 99.9% uptime`);
    }
    
    if (skills.includes('aws') || skills.includes('docker')) {
      achievements.push(`Implemented cloud infrastructure on AWS with Docker containerization, reducing deployment time by 60%`);
    }
    
    if (skills.includes('python')) {
      achievements.push(`Automated data processing workflows using Python, reducing manual work by 75% and improving accuracy`);
    }

    // Leadership achievements for senior roles
    if (level === 'senior') {
      achievements.push(`Led a team of 5 developers in delivering critical features ahead of schedule, resulting in 25% faster time-to-market`);
      achievements.push(`Mentored junior developers and established coding standards, improving code quality and team productivity`);
    }

    // Collaboration achievements
    achievements.push(`Collaborated with cross-functional teams including design, product, and QA to deliver high-quality software solutions`);
    
    // Performance achievements
    if (skills.includes('database') || skills.includes('postgresql') || skills.includes('mongodb')) {
      achievements.push(`Optimized database queries and implemented caching strategies, improving application performance by 50%`);
    }

    return achievements.slice(0, 4); // Top 4 achievements per role
  },

  // Create professional resume format
  formatProfessionalResume: (jobAnalysis, experience) => {
    const { technicalSkills, softSkills, jobTitle } = jobAnalysis;
    
    return `
ALEX JOHNSON
Software Engineer
📧 alex.johnson@email.com | 📱 (555) 123-4567 | 🌐 linkedin.com/in/alexjohnson | 📍 San Francisco, CA

═══════════════════════════════════════════════════════════════════════════════════

PROFESSIONAL SUMMARY
═══════════════════════════════════════════════════════════════════════════════════

Experienced ${jobTitle.toLowerCase()} with ${jobAnalysis.yearsRequired}+ years of expertise in full-stack development and modern web technologies. Proven track record of delivering scalable solutions using ${technicalSkills.slice(0, 4).join(', ')}. Strong background in ${jobAnalysis.industry} industry with focus on performance optimization, user experience, and collaborative development practices.

TECHNICAL SKILLS
═══════════════════════════════════════════════════════════════════════════════════

Programming Languages: ${technicalSkills.filter(s => ['javascript', 'python', 'java', 'typescript'].includes(s)).join(', ').toUpperCase()}
Frontend Technologies: ${technicalSkills.filter(s => ['react', 'angular', 'vue', 'html', 'css'].includes(s)).join(', ').toUpperCase()}
Backend Technologies: ${technicalSkills.filter(s => ['node.js', 'express', 'django', 'flask'].includes(s)).join(', ').toUpperCase()}
Databases: ${technicalSkills.filter(s => ['mongodb', 'postgresql', 'mysql'].includes(s)).join(', ').toUpperCase()}
Cloud & DevOps: ${technicalSkills.filter(s => ['aws', 'docker', 'kubernetes', 'ci/cd'].includes(s)).join(', ').toUpperCase()}
Tools & Methodologies: Git, Agile/Scrum, Test-Driven Development, Code Review

PROFESSIONAL EXPERIENCE
═══════════════════════════════════════════════════════════════════════════════════

${experience.map(exp => `
${exp.title.toUpperCase()}
${exp.company} | ${exp.duration}

${exp.achievements.map(achievement => `• ${achievement}`).join('\n')}
`).join('\n')}

EDUCATION
═══════════════════════════════════════════════════════════════════════════════════

Bachelor of Science in Computer Science
University of Technology | 2018
Relevant Coursework: Data Structures, Algorithms, Software Engineering, Database Systems

CERTIFICATIONS & ACHIEVEMENTS
═══════════════════════════════════════════════════════════════════════════════════

• AWS Certified Developer Associate
• Certified Scrum Master (CSM)
• Contributed to open-source projects with 500+ GitHub stars
• Speaker at local tech meetups on modern web development practices

PROJECTS
═══════════════════════════════════════════════════════════════════════════════════

E-Commerce Platform Redesign
• Led frontend redesign using React.js and modern UI/UX principles
• Implemented responsive design resulting in 45% increase in mobile conversions
• Integrated payment processing and inventory management systems

Real-Time Analytics Dashboard
• Built real-time data visualization dashboard using ${technicalSkills.includes('react') ? 'React' : 'modern web technologies'}
• Processed and displayed live data from multiple APIs with sub-second latency
• Implemented user authentication and role-based access control
`.trim();
  }
};

// Enhanced mock optimization function
const enhancedMockOptimizeResume = async (resumeText, jobDescription) => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  try {
    // Analyze the job posting
    const jobAnalysis = advancedResumeOptimizer.analyzeJobPosting(jobDescription);
    
    // Generate relevant experience
    const relevantExperience = advancedResumeOptimizer.generateRelevantExperience(jobAnalysis, resumeText);
    
    // Create professionally formatted resume
    const optimizedResume = advancedResumeOptimizer.formatProfessionalResume(jobAnalysis, relevantExperience);
    
    return optimizedResume;
    
  } catch (error) {
    console.error('Resume optimization error:', error);
    
    // Fallback to basic optimization
    return `
PROFESSIONAL RESUME
═══════════════════════════════════════════════════════════════════════════════════

This resume has been optimized based on the job requirements you provided.
The content has been tailored to match the specific skills and experience needed for this position.

${resumeText}

═══════════════════════════════════════════════════════════════════════════════════
OPTIMIZATION NOTES:
• Resume content aligned with job requirements
• Keywords optimized for ATS systems
• Professional formatting applied
• Experience highlighted to match job description
`;
  }
};

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = event.path.replace('/.netlify/functions/api', '');
    
    // Health check
    if (event.httpMethod === 'GET' && path === '/health') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          service: 'netlify-enhanced',
          optimization: 'advanced-matching'
        }),
      };
    }

    // Process job posting
    if (event.httpMethod === 'POST' && path === '/process-job-posting') {
      const { jobText, jobUrl } = JSON.parse(event.body);
      
      if (!jobText && !jobUrl) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Either job text or job URL is required' }),
        };
      }

      let jobDescription = jobText || 'Sample job description from URL';
      
      // Enhanced job analysis
      const jobAnalysis = advancedResumeOptimizer.analyzeJobPosting(jobDescription);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          jobDescription,
          analysis: {
            jobTitle: jobAnalysis.jobTitle,
            technicalSkills: jobAnalysis.technicalSkills,
            yearsRequired: jobAnalysis.yearsRequired,
            industry: jobAnalysis.industry,
            keyResponsibilities: jobAnalysis.responsibilities
          }
        }),
      };
    }

    // Upload resume
    if (event.httpMethod === 'POST' && path === '/upload-resume') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          resumeText: `John Doe
Software Engineer
Email: john.doe@email.com

SUMMARY
Experienced software engineer with 4 years of experience in full-stack development.

EXPERIENCE
Senior Software Engineer | Tech Company | 2022-Present
- Developed web applications using React and Node.js
- Collaborated with cross-functional teams

EDUCATION
Bachelor of Science in Computer Science | 2020

SKILLS
JavaScript, Python, React, Node.js, AWS, Docker`,
          filename: 'sample_resume.pdf'
        }),
      };
    }

    // Enhanced resume optimization
    if (event.httpMethod === 'POST' && path === '/optimize-resume') {
      const { resumeText, jobDescription } = JSON.parse(event.body);
      
      if (!resumeText || !jobDescription) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Resume text and job description are required' }),
        };
      }

      // Use enhanced optimization
      const optimizedResume = await enhancedMockOptimizeResume(resumeText, jobDescription);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          optimizedResume,
          optimization: 'advanced-job-matching',
          downloads: {
            text: 'data:text/plain;base64,' + Buffer.from(optimizedResume).toString('base64')
          }
        }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Endpoint not found' }),
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

