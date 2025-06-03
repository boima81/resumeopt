// Simplified Netlify Function without lambda-multipart-parser dependency
// This version handles the API endpoints without file upload parsing

// Mock AI service for Netlify deployment
const mockOptimizeResume = async (resumeText, jobDescription) => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Extract keywords from job description
  const jobKeywords = extractKeywords(jobDescription);
  
  // Generate optimized resume
  return generateOptimizedResume(resumeText, jobKeywords);
};

const extractKeywords = (text) => {
  const commonKeywords = [
    'react', 'node.js', 'python', 'javascript', 'typescript',
    'aws', 'docker', 'kubernetes', 'postgresql', 'mongodb',
    'api', 'rest', 'graphql', 'microservices', 'agile',
    'git', 'ci/cd', 'testing', 'debugging', 'optimization'
  ];
  
  const textLower = text.toLowerCase();
  return commonKeywords.filter(keyword => textLower.includes(keyword));
};

const generateOptimizedResume = (originalResume, jobKeywords) => {
  let optimized = originalResume;
  
  // Add job-specific keywords naturally
  const keywordPhrases = {
    'react': 'React.js development',
    'node.js': 'Node.js backend development',
    'python': 'Python programming',
    'aws': 'AWS cloud services',
    'docker': 'Docker containerization',
    'postgresql': 'PostgreSQL database management',
    'api': 'RESTful API development',
    'agile': 'Agile development methodologies'
  };
  
  // Enhance summary section
  const summaryEnhancement = jobKeywords
    .slice(0, 3)
    .map(keyword => keywordPhrases[keyword] || keyword)
    .join(', ');
  
  if (summaryEnhancement) {
    optimized = optimized.replace(
      /SUMMARY[\s\S]*?(?=\n\n|\nEXPERIENCE|\nEDUCATION|$)/i,
      `PROFESSIONAL SUMMARY

Experienced software engineer with proven expertise in ${summaryEnhancement}. 
Demonstrated ability to deliver high-quality solutions in fast-paced environments. 
Strong background in full-stack development with focus on scalable, maintainable code. 
Passionate about leveraging modern technologies to solve complex business challenges.`
    );
  }
  
  // Enhance experience section with ATS-friendly formatting
  optimized = optimized
    .replace(/EXPERIENCE/gi, 'PROFESSIONAL EXPERIENCE')
    .replace(/SKILLS/gi, 'TECHNICAL SKILLS')
    .replace(/EDUCATION/gi, 'EDUCATION & CERTIFICATIONS');
  
  return optimized;
};

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const path = event.path.replace('/.netlify/functions/api', '');
    
    // Health check endpoint
    if (event.httpMethod === 'GET' && path === '/health') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          service: 'netlify'
        }),
      };
    }

    // Process job posting endpoint
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
      
      // Extract key requirements using simple text processing
      const lines = jobDescription.toLowerCase().split('\n');
      const requirements = lines.filter(line => 
        line.includes('require') || 
        line.includes('must have') || 
        line.includes('experience') ||
        line.includes('skill') ||
        line.includes('qualification')
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          jobDescription,
          keyRequirements: requirements.slice(0, 10)
        }),
      };
    }

    // Upload resume endpoint (simplified for demo)
    if (event.httpMethod === 'POST' && path === '/upload-resume') {
      // For Netlify demo, we'll simulate file upload
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

    // Optimize resume endpoint
    if (event.httpMethod === 'POST' && path === '/optimize-resume') {
      const { resumeText, jobDescription } = JSON.parse(event.body);
      
      if (!resumeText || !jobDescription) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Resume text and job description are required' }),
        };
      }

      // Use mock AI service
      const optimizedResume = await mockOptimizeResume(resumeText, jobDescription);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          optimizedResume,
          downloads: {
            text: 'data:text/plain;base64,' + Buffer.from(optimizedResume).toString('base64')
          }
        }),
      };
    }

    // Default 404 response
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

