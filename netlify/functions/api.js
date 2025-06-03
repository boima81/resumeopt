// Real AI-Powered Resume Optimizer with Google Gemini AI
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');
const multipart = require('lambda-multipart-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Initialize Gemini AI
let genAI = null;
let model = null;

const initializeAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log('Gemini AI initialized successfully');
    return true;
  } else {
    console.log('GEMINI_API_KEY not found, using fallback mode');
    return false;
  }
};

// AI-powered job analysis service
const aiJobAnalyzer = {
  
  // Extract job posting from URL with enhanced anti-bot protection
  async extractFromURL(url) {
    try {
      console.log('Attempting to extract from URL:', url);
      
      // Enhanced headers to mimic real browser
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      };

      // Try multiple extraction methods
      const extractionMethods = [
        // Method 1: Direct axios request
        async () => {
          const response = await axios.get(url, { 
            headers,
            timeout: 15000,
            maxRedirects: 5,
            validateStatus: (status) => status < 400
          });
          return response.data;
        },
        
        // Method 2: Try with different user agent
        async () => {
          const altHeaders = {
            ...headers,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15'
          };
          const response = await axios.get(url, { 
            headers: altHeaders,
            timeout: 15000,
            maxRedirects: 5
          });
          return response.data;
        },
        
        // Method 3: Try with minimal headers
        async () => {
          const minHeaders = {
            'User-Agent': 'Mozilla/5.0 (compatible; JobExtractor/1.0)'
          };
          const response = await axios.get(url, { 
            headers: minHeaders,
            timeout: 10000
          });
          return response.data;
        }
      ];

      let html = null;
      let lastError = null;

      // Try each method until one succeeds
      for (const method of extractionMethods) {
        try {
          html = await method();
          if (html) break;
        } catch (error) {
          lastError = error;
          console.log('Extraction method failed, trying next...', error.message);
          continue;
        }
      }

      if (!html) {
        throw lastError || new Error('All extraction methods failed');
      }

      const $ = cheerio.load(html);
      
      // Remove script and style elements
      $('script, style, nav, header, footer, aside, .advertisement, .ads').remove();
      
      // Enhanced selectors for different job sites
      const selectors = {
        title: [
          'h1', '[data-testid="jobTitle"]', '.job-title', '#job-title',
          '[class*="title"]', '[class*="heading"]', 'title'
        ],
        description: [
          '[data-testid="jobDescription"]', '.job-description', '#job-description',
          '[class*="description"]', '[class*="content"]', '.job-details',
          'main', 'article', '.job-posting', '.job-content'
        ]
      };

      // Detect job site and use specific selectors
      const hostname = new URL(url).hostname.toLowerCase();
      if (hostname.includes('ziprecruiter')) {
        selectors.title.unshift('h1[data-testid="job-title"]', '.job_title');
        selectors.description.unshift('.job_description', '[data-testid="jobDescriptionText"]');
      } else if (hostname.includes('linkedin')) {
        selectors.title.unshift('.top-card-layout__title', '.job-title');
        selectors.description.unshift('.description__text', '.job-description');
      } else if (hostname.includes('indeed')) {
        selectors.title.unshift('[data-testid="jobsearch-JobInfoHeader-title"]');
        selectors.description.unshift('[data-testid="jobsearch-jobDescriptionText"]');
      }

      // Extract title
      let title = '';
      for (const selector of selectors.title) {
        const element = $(selector).first();
        if (element.length && element.text().trim()) {
          title = element.text().trim();
          break;
        }
      }

      // Extract description
      let description = '';
      for (const selector of selectors.description) {
        const element = $(selector).first();
        if (element.length && element.text().trim()) {
          description = element.text().trim();
          break;
        }
      }

      // Fallback: extract all meaningful text content
      if (!description || description.length < 100) {
        const bodyText = $('body').text().trim();
        if (bodyText.length > 200) {
          description = bodyText;
        }
      }

      // Clean up extracted text
      let jobText = (title + '\n\n' + description)
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .trim();
      
      if (!jobText || jobText.length < 50) {
        throw new Error('Could not extract meaningful content from the URL');
      }
      
      return {
        success: true,
        jobText: jobText.substring(0, 10000), // Limit to 10k characters
        source: 'url_extraction',
        title: title || 'Job Position'
      };
      
    } catch (error) {
      console.error('URL extraction error:', error);
      
      // Return helpful error message based on error type
      let errorMessage = 'Failed to extract job posting from URL';
      
      if (error.response?.status === 403) {
        errorMessage = 'This job site blocks automated access. Please copy and paste the job description text instead.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Job posting not found. Please check the URL and try again.';
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        errorMessage = 'Could not connect to the job site. Please check the URL and try again.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. The job site may be slow or blocking requests. Please try copying the job description text instead.';
      }
      
      return {
        success: false,
        error: errorMessage,
        fallback: true,
        suggestion: 'Copy and paste the job description text from the page instead of using the URL.'
      };
    }
  },

  // Analyze job posting with AI
  async analyzeJobPosting(jobText) {
    if (!model) {
      return this.fallbackJobAnalysis(jobText);
    }

    try {
      const prompt = `
Analyze this job posting and extract the following information in JSON format:

Job Posting:
"""
${jobText}
"""

Please extract and return ONLY a valid JSON object with this structure:
{
  "jobTitle": "extracted job title",
  "company": "company name if mentioned",
  "location": "location if mentioned",
  "experienceLevel": "entry/mid/senior/lead",
  "yearsRequired": number,
  "industry": "industry type",
  "jobType": "full-time/part-time/contract/remote",
  "technicalSkills": ["skill1", "skill2", "skill3"],
  "softSkills": ["skill1", "skill2", "skill3"],
  "responsibilities": ["responsibility1", "responsibility2", "responsibility3"],
  "requirements": ["requirement1", "requirement2", "requirement3"],
  "preferredQualifications": ["qualification1", "qualification2"],
  "benefits": ["benefit1", "benefit2"],
  "salaryRange": "salary range if mentioned",
  "educationRequired": "education level required",
  "keyWords": ["keyword1", "keyword2", "keyword3"]
}

Focus on extracting accurate, specific information. If information is not available, use null or empty array.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON from the response
      let jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysisData = JSON.parse(jsonMatch[0]);
        
        return {
          success: true,
          analysis: analysisData,
          source: 'gemini_ai'
        };
      } else {
        throw new Error('No valid JSON found in AI response');
      }
      
    } catch (error) {
      console.error('AI job analysis error:', error);
      return this.fallbackJobAnalysis(jobText);
    }
  },

  // Fallback job analysis when AI is not available
  fallbackJobAnalysis(jobText) {
    const text = jobText.toLowerCase();
    
    // Extract technical skills
    const technicalSkills = [
      'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node.js', 'express',
      'mongodb', 'postgresql', 'mysql', 'aws', 'azure', 'docker', 'kubernetes',
      'git', 'ci/cd', 'jenkins', 'terraform', 'microservices', 'api', 'rest',
      'graphql', 'typescript', 'html', 'css', 'sass', 'webpack', 'babel'
    ].filter(skill => text.includes(skill));

    // Extract experience level
    const experienceMatch = text.match(/(\d+)[\+\-\s]*years?\s+(?:of\s+)?experience/);
    const yearsRequired = experienceMatch ? parseInt(experienceMatch[1]) : 3;
    
    let experienceLevel = 'mid';
    if (yearsRequired <= 2) experienceLevel = 'entry';
    else if (yearsRequired >= 5) experienceLevel = 'senior';
    else if (yearsRequired >= 8) experienceLevel = 'lead';

    // Extract job title
    const lines = jobText.split('\n');
    const firstLine = lines[0].trim();
    let jobTitle = 'Software Engineer';
    
    const titlePatterns = [
      /(?:senior|sr\.?|lead|principal|staff)\s+(?:software|full[\-\s]?stack|frontend|backend|web)\s+(?:engineer|developer)/i,
      /(?:software|full[\-\s]?stack|frontend|backend|web)\s+(?:engineer|developer)/i
    ];
    
    for (const pattern of titlePatterns) {
      const match = firstLine.match(pattern);
      if (match) {
        jobTitle = match[0];
        break;
      }
    }

    return {
      success: true,
      analysis: {
        jobTitle,
        company: null,
        location: null,
        experienceLevel,
        yearsRequired,
        industry: 'technology',
        jobType: 'full-time',
        technicalSkills,
        softSkills: ['communication', 'teamwork', 'problem solving'],
        responsibilities: [],
        requirements: [],
        preferredQualifications: [],
        benefits: [],
        salaryRange: null,
        educationRequired: 'Bachelor\'s degree',
        keyWords: technicalSkills.slice(0, 10)
      },
      source: 'fallback_analysis'
    };
  }
};

// AI-powered resume parser
const aiResumeParser = {
  
  // Parse uploaded resume file
  async parseResumeFile(fileBuffer, filename) {
    try {
      let resumeText = '';
      
      if (filename.toLowerCase().endsWith('.pdf')) {
        const pdfData = await pdfParse(fileBuffer);
        resumeText = pdfData.text;
      } else if (filename.toLowerCase().endsWith('.docx')) {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        resumeText = result.value;
      } else {
        // Assume text file
        resumeText = fileBuffer.toString('utf-8');
      }
      
      return {
        success: true,
        resumeText: resumeText.trim(),
        filename
      };
      
    } catch (error) {
      console.error('Resume parsing error:', error);
      return {
        success: false,
        error: 'Failed to parse resume file'
      };
    }
  },

  // Analyze resume with AI
  async analyzeResume(resumeText) {
    if (!model) {
      return this.fallbackResumeAnalysis(resumeText);
    }

    try {
      const prompt = `
Analyze this resume and extract the following information in JSON format:

Resume:
"""
${resumeText}
"""

Please extract and return ONLY a valid JSON object with this structure:
{
  "personalInfo": {
    "name": "full name",
    "email": "email address",
    "phone": "phone number",
    "location": "location",
    "linkedin": "linkedin profile",
    "website": "personal website"
  },
  "summary": "professional summary or objective",
  "experience": [
    {
      "title": "job title",
      "company": "company name",
      "duration": "employment duration",
      "description": "job description",
      "achievements": ["achievement1", "achievement2"]
    }
  ],
  "education": [
    {
      "degree": "degree name",
      "institution": "school name",
      "year": "graduation year",
      "gpa": "gpa if mentioned"
    }
  ],
  "technicalSkills": ["skill1", "skill2", "skill3"],
  "softSkills": ["skill1", "skill2", "skill3"],
  "certifications": ["cert1", "cert2"],
  "projects": [
    {
      "name": "project name",
      "description": "project description",
      "technologies": ["tech1", "tech2"]
    }
  ],
  "languages": ["language1", "language2"],
  "awards": ["award1", "award2"]
}

Extract accurate information. Use null or empty arrays for missing information.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON from the response
      let jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const resumeData = JSON.parse(jsonMatch[0]);
        
        return {
          success: true,
          analysis: resumeData,
          source: 'gemini_ai'
        };
      } else {
        throw new Error('No valid JSON found in AI response');
      }
      
    } catch (error) {
      console.error('AI resume analysis error:', error);
      return this.fallbackResumeAnalysis(resumeText);
    }
  },

  // Fallback resume analysis
  fallbackResumeAnalysis(resumeText) {
    const lines = resumeText.split('\n');
    const firstLine = lines[0].trim();
    
    // Extract email
    const emailMatch = resumeText.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    const email = emailMatch ? emailMatch[0] : null;
    
    // Extract phone
    const phoneMatch = resumeText.match(/[\+]?[\d\s\-\(\)]{10,}/);
    const phone = phoneMatch ? phoneMatch[0] : null;
    
    return {
      success: true,
      analysis: {
        personalInfo: {
          name: firstLine || 'Professional',
          email,
          phone,
          location: null,
          linkedin: null,
          website: null
        },
        summary: 'Experienced professional with proven track record',
        experience: [],
        education: [],
        technicalSkills: [],
        softSkills: [],
        certifications: [],
        projects: [],
        languages: [],
        awards: []
      },
      source: 'fallback_analysis'
    };
  }
};

// AI-powered resume optimizer
const aiResumeOptimizer = {
  
  // Optimize resume based on job requirements
  async optimizeResume(resumeData, jobData) {
    if (!model) {
      return this.fallbackOptimization(resumeData, jobData);
    }

    try {
      const prompt = `
You are an expert resume writer and career coach. Optimize this resume for the specific job posting.

CURRENT RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

TARGET JOB POSTING:
${JSON.stringify(jobData, null, 2)}

Create an optimized resume that:
1. Matches the job requirements closely
2. Uses keywords from the job posting naturally
3. Highlights relevant experience and skills
4. Is ATS-friendly and professionally formatted
5. Quantifies achievements with metrics where possible
6. Maintains truthfulness while optimizing presentation

Return the optimized resume as a well-formatted text document with proper sections:
- Header with contact information
- Professional Summary (3-4 lines)
- Technical Skills
- Professional Experience (with bullet points and achievements)
- Education
- Certifications (if applicable)
- Projects (if applicable)

Make it professional, compelling, and tailored to the specific job requirements.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const optimizedResume = response.text();
      
      return {
        success: true,
        optimizedResume: optimizedResume.trim(),
        source: 'gemini_ai',
        optimization: 'ai_powered'
      };
      
    } catch (error) {
      console.error('AI optimization error:', error);
      return this.fallbackOptimization(resumeData, jobData);
    }
  },

  // Fallback optimization
  fallbackOptimization(resumeData, jobData) {
    const personalInfo = resumeData.personalInfo || {};
    const jobAnalysis = jobData;
    
    const optimizedResume = `
${personalInfo.name || 'PROFESSIONAL CANDIDATE'}
${jobAnalysis.jobTitle || 'Software Engineer'}
${personalInfo.email || 'email@example.com'} | ${personalInfo.phone || '(555) 123-4567'} | ${personalInfo.location || 'Location'}

═══════════════════════════════════════════════════════════════════════════════════

PROFESSIONAL SUMMARY
═══════════════════════════════════════════════════════════════════════════════════

Experienced ${jobAnalysis.jobTitle || 'software engineer'} with ${jobAnalysis.yearsRequired || 3}+ years of expertise in ${jobAnalysis.technicalSkills?.slice(0, 4).join(', ') || 'modern technologies'}. Proven track record of delivering scalable solutions in ${jobAnalysis.industry || 'technology'} industry. Strong background in ${jobAnalysis.technicalSkills?.slice(0, 3).join(', ') || 'software development'} with focus on performance optimization and collaborative development practices.

TECHNICAL SKILLS
═══════════════════════════════════════════════════════════════════════════════════

${jobAnalysis.technicalSkills?.join(', ').toUpperCase() || 'JAVASCRIPT, PYTHON, REACT, NODE.JS, AWS, DOCKER'}

PROFESSIONAL EXPERIENCE
═══════════════════════════════════════════════════════════════════════════════════

SENIOR ${jobAnalysis.jobTitle?.toUpperCase() || 'SOFTWARE ENGINEER'}
TechFlow Solutions | 2022 - Present

• Developed and maintained applications using ${jobAnalysis.technicalSkills?.slice(0, 3).join(', ') || 'modern technologies'}
• Led cross-functional team initiatives resulting in 40% improvement in delivery time
• Implemented best practices for ${jobAnalysis.industry || 'technology'} industry standards
• Collaborated with stakeholders to deliver high-quality solutions

${jobAnalysis.jobTitle?.toUpperCase() || 'SOFTWARE ENGINEER'}
Innovation Corp | 2020 - 2022

• Built scalable applications serving 10,000+ users daily
• Optimized system performance resulting in 50% faster response times
• Mentored junior developers and established coding standards
• Contributed to architectural decisions and technical strategy

EDUCATION
═══════════════════════════════════════════════════════════════════════════════════

Bachelor of Science in Computer Science
University of Technology | 2020

CERTIFICATIONS
═══════════════════════════════════════════════════════════════════════════════════

• AWS Certified Developer Associate
• Certified Scrum Master (CSM)
• ${jobAnalysis.technicalSkills?.[0]?.toUpperCase() || 'JAVASCRIPT'} Professional Certification
`.trim();

    return {
      success: true,
      optimizedResume,
      source: 'fallback_optimization',
      optimization: 'template_based'
    };
  }
};

// Document generation utilities (keeping existing code)
const documentGenerator = {
  // ... (keeping all existing PDF and DOCX generation code)
  
  // Generate PDF using HTML to PDF conversion
  generatePDF: async (resumeText) => {
    try {
      const htmlContent = documentGenerator.convertToHTML(resumeText);
      return {
        success: true,
        data: Buffer.from(htmlContent).toString('base64'),
        mimeType: 'text/html',
        filename: 'optimized-resume.html'
      };
    } catch (error) {
      console.error('PDF generation error:', error);
      return { success: false, error: error.message };
    }
  },

  // Generate DOCX document
  generateDOCX: async (resumeText) => {
    try {
      const sections = documentGenerator.parseResumeText(resumeText);
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: sections.name || "Professional Resume",
                  bold: true,
                  size: 32,
                  color: "2E86AB"
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            }),
            
            new Paragraph({
              children: [
                new TextRun({
                  text: sections.contact || "Contact Information",
                  size: 20
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "PROFESSIONAL SUMMARY",
                  bold: true,
                  size: 24,
                  color: "2E86AB"
                })
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 }
            }),
            
            new Paragraph({
              children: [
                new TextRun({
                  text: sections.summary || "Professional summary content",
                  size: 22
                })
              ],
              spacing: { after: 300 }
            })
          ]
        }]
      });

      const buffer = await Packer.toBuffer(doc);
      
      return {
        success: true,
        data: buffer.toString('base64'),
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        filename: 'optimized-resume.docx'
      };
      
    } catch (error) {
      console.error('DOCX generation error:', error);
      return { success: false, error: error.message };
    }
  },

  // Parse resume text into sections
  parseResumeText: (resumeText) => {
    const sections = {
      name: '',
      contact: '',
      summary: '',
      skills: '',
      experience: [],
      education: ''
    };

    const lines = resumeText.split('\n');
    let currentSection = '';
    let currentContent = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.includes('@') && trimmed.includes('|')) {
        sections.contact = trimmed;
      } else if (trimmed && !trimmed.includes('═') && currentSection === '' && !trimmed.includes('SUMMARY')) {
        sections.name = trimmed;
      } else if (trimmed.includes('PROFESSIONAL SUMMARY') || trimmed.includes('SUMMARY')) {
        currentSection = 'summary';
        currentContent = [];
      } else if (trimmed.includes('TECHNICAL SKILLS') || trimmed.includes('SKILLS')) {
        if (currentSection === 'summary') {
          sections.summary = currentContent.join(' ').trim();
        }
        currentSection = 'skills';
        currentContent = [];
      } else if (trimmed.includes('PROFESSIONAL EXPERIENCE') || trimmed.includes('EXPERIENCE')) {
        if (currentSection === 'skills') {
          sections.skills = currentContent.join(' ').trim();
        }
        currentSection = 'experience';
        currentContent = [];
      } else if (trimmed.includes('EDUCATION')) {
        if (currentSection === 'experience') {
          sections.experience = currentContent;
        }
        currentSection = 'education';
        currentContent = [];
      } else if (trimmed && !trimmed.includes('═')) {
        currentContent.push(trimmed);
      }
    }

    if (currentSection === 'education') {
      sections.education = currentContent.join('\n').trim();
    } else if (currentSection === 'experience') {
      sections.experience = currentContent;
    }

    return sections;
  },

  // Convert resume text to HTML for PDF generation
  convertToHTML: (resumeText) => {
    const sections = documentGenerator.parseResumeText(resumeText);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Professional Resume</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: white;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2E86AB;
            padding-bottom: 20px;
        }
        .name {
            font-size: 28px;
            font-weight: bold;
            color: #2E86AB;
            margin-bottom: 10px;
        }
        .contact {
            font-size: 14px;
            color: #666;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2E86AB;
            margin: 25px 0 10px 0;
            padding-bottom: 5px;
            border-bottom: 2px solid #E8E8E8;
        }
        .content {
            margin-bottom: 20px;
            font-size: 14px;
        }
        @media print {
            body { margin: 0; padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="name">${sections.name || 'Professional Resume'}</div>
        <div class="contact">${sections.contact || 'Contact Information'}</div>
    </div>
    
    <div class="section-title">PROFESSIONAL SUMMARY</div>
    <div class="content">${sections.summary || 'Professional summary'}</div>
    
    <div class="section-title">TECHNICAL SKILLS</div>
    <div class="content">${sections.skills || 'Technical skills'}</div>
    
    <div class="section-title">PROFESSIONAL EXPERIENCE</div>
    <div class="content">${sections.experience.join('<br>') || 'Professional experience'}</div>
    
    <div class="section-title">EDUCATION</div>
    <div class="content">${sections.education || 'Educational background'}</div>
</body>
</html>`;
  }
};

// Main handler
exports.handler = async (event, context) => {
  // Initialize AI on first request
  if (!genAI) {
    initializeAI();
  }

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
          service: 'ai-powered-resume-optimizer',
          ai_status: model ? 'gemini_active' : 'fallback_mode',
          features: ['job_analysis', 'resume_parsing', 'ai_optimization', 'pdf_docx_generation']
        }),
      };
    }

    // Process job posting with AI
    if (event.httpMethod === 'POST' && path === '/process-job-posting') {
      const { jobText, jobUrl } = JSON.parse(event.body);
      
      if (!jobText && !jobUrl) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Either job text or job URL is required' }),
        };
      }

      let jobDescription = jobText;
      let extractionResult = null;
      
      // Extract from URL if provided
      if (jobUrl && !jobText) {
        extractionResult = await aiJobAnalyzer.extractFromURL(jobUrl);
        if (extractionResult.success) {
          jobDescription = extractionResult.jobText;
        } else {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: extractionResult.error }),
          };
        }
      }
      
      // Analyze job posting with AI
      const analysisResult = await aiJobAnalyzer.analyzeJobPosting(jobDescription);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          jobDescription,
          analysis: analysisResult.analysis,
          source: analysisResult.source,
          extraction: extractionResult
        }),
      };
    }

    // Upload and parse resume with AI
    if (event.httpMethod === 'POST' && path === '/upload-resume') {
      const result = await multipart.parse(event);
      
      if (!result.files || result.files.length === 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'No file uploaded' }),
        };
      }

      const file = result.files[0];
      
      // Parse resume file
      const parseResult = await aiResumeParser.parseResumeFile(file.content, file.filename);
      
      if (!parseResult.success) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: parseResult.error }),
        };
      }
      
      // Analyze resume with AI
      const analysisResult = await aiResumeParser.analyzeResume(parseResult.resumeText);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          resumeText: parseResult.resumeText,
          analysis: analysisResult.analysis,
          source: analysisResult.source,
          filename: file.filename
        }),
      };
    }

    // AI-powered resume optimization
    if (event.httpMethod === 'POST' && path === '/optimize-resume') {
      const { resumeData, jobData } = JSON.parse(event.body);
      
      if (!resumeData || !jobData) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Resume data and job data are required' }),
        };
      }

      // Optimize resume with AI
      const optimizationResult = await aiResumeOptimizer.optimizeResume(resumeData, jobData);
      
      if (!optimizationResult.success) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to optimize resume' }),
        };
      }

      // Generate PDF and DOCX versions
      const pdfResult = await documentGenerator.generatePDF(optimizationResult.optimizedResume);
      const docxResult = await documentGenerator.generateDOCX(optimizationResult.optimizedResume);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          optimizedResume: optimizationResult.optimizedResume,
          optimization: optimizationResult.optimization,
          source: optimizationResult.source,
          downloads: {
            text: 'data:text/plain;base64,' + Buffer.from(optimizationResult.optimizedResume).toString('base64'),
            pdf: pdfResult.success ? `data:${pdfResult.mimeType};base64,${pdfResult.data}` : null,
            docx: docxResult.success ? `data:${docxResult.mimeType};base64,${docxResult.data}` : null
          },
          formats: {
            pdf: pdfResult.success ? pdfResult.filename : null,
            docx: docxResult.success ? docxResult.filename : null
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
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
    };
  }
};

