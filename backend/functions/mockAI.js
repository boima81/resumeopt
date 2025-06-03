/**
 * Mock AI service for testing when Gemini API is not available
 * Provides realistic resume optimization responses for development
 */

const mockOptimizeResume = async (resumeText, jobDescription) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Extract key information from job description
  const jobKeywords = extractKeywords(jobDescription);
  const resumeKeywords = extractKeywords(resumeText);
  
  // Generate optimized resume with job-specific keywords
  const optimizedResume = generateOptimizedResume(resumeText, jobKeywords);
  
  return optimizedResume;
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
  // This is a simplified mock - in reality, this would be much more sophisticated
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
  optimized = optimized.replace(
    /•/g, '•'
  ).replace(
    /(\d+)%/g, '$1 percent'
  );
  
  // Add ATS-friendly section headers
  optimized = optimized
    .replace(/EXPERIENCE/gi, 'PROFESSIONAL EXPERIENCE')
    .replace(/SKILLS/gi, 'TECHNICAL SKILLS')
    .replace(/EDUCATION/gi, 'EDUCATION & CERTIFICATIONS');
  
  return optimized;
};

module.exports = {
  mockOptimizeResume
};

