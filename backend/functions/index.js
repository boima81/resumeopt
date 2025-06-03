const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const express = require('express');
const cors = require('cors');
const Busboy = require('busboy');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');
const axios = require('axios');
const cheerio = require('cheerio');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(functions.config().gemini?.api_key || process.env.GEMINI_API_KEY);

// Create Express app
const app = express();
app.use(cors({ origin: true }));

// Helper function to parse uploaded files
const parseFile = async (buffer, mimetype) => {
  try {
    if (mimetype === 'application/pdf') {
      const data = await pdfParse(buffer);
      return data.text;
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Error parsing file:', error);
    throw new Error('Failed to parse file content');
  }
};

// Helper function to scrape job posting from URL
const scrapeJobPosting = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Remove script and style elements
    $('script, style').remove();
    
    // Extract text content
    const text = $('body').text().replace(/\s+/g, ' ').trim();
    
    // Try to find job-specific content
    const jobKeywords = ['responsibilities', 'requirements', 'qualifications', 'experience', 'skills', 'job description'];
    const sentences = text.split(/[.!?]+/);
    const relevantSentences = sentences.filter(sentence => 
      jobKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
    );
    
    return relevantSentences.length > 0 ? relevantSentences.join('. ') : text.substring(0, 2000);
  } catch (error) {
    console.error('Error scraping job posting:', error);
    throw new Error('Failed to scrape job posting from URL');
  }
};

// Helper function to optimize resume with Gemini AI
const optimizeResume = async (resumeText, jobDescription) => {
  try {
    // Check if Gemini API key is available
    const apiKey = functions.config().gemini?.api_key || process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.log('Gemini API key not configured, using mock AI service');
      const { mockOptimizeResume } = require('./mockAI');
      return await mockOptimizeResume(resumeText, jobDescription);
    }
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
You are an expert resume writer and ATS optimization specialist. Your task is to rewrite the provided resume to perfectly match the job posting while maintaining authenticity and avoiding AI detection.

RESUME TO OPTIMIZE:
${resumeText}

JOB POSTING:
${jobDescription}

INSTRUCTIONS:
1. Rewrite the resume to closely match the job posting requirements
2. Ensure ATS compliance with proper formatting and keywords
3. Use varied sentence structures and natural language to avoid AI detection
4. Maintain professional tone and authenticity
5. Include relevant keywords from the job posting naturally
6. Structure using standard resume sections: Contact, Summary, Experience, Skills, Education
7. Quantify achievements where possible
8. Ensure the content flows naturally and doesn't sound robotic

IMPORTANT GUIDELINES:
- Keep all factual information accurate (don't invent false experience)
- Use synonyms and varied phrasing to reduce AI detection
- Incorporate job-specific terminology naturally
- Maintain chronological consistency
- Use action verbs and specific achievements
- Ensure proper grammar and professional language

Please provide the optimized resume in a clean, professional format:
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error optimizing resume with AI:', error);
    
    // Fallback to mock AI if Gemini fails
    console.log('Falling back to mock AI service');
    const { mockOptimizeResume } = require('./mockAI');
    return await mockOptimizeResume(resumeText, jobDescription);
  }
};

// Helper function to generate DOCX document
const generateDocx = async (resumeText) => {
  try {
    const lines = resumeText.split('\n').filter(line => line.trim());
    const children = [];
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        // Check if it's a heading (all caps or contains common section headers)
        const isHeading = /^[A-Z\s]+$/.test(trimmedLine) || 
                         ['CONTACT', 'SUMMARY', 'EXPERIENCE', 'SKILLS', 'EDUCATION', 'CERTIFICATIONS'].some(header => 
                           trimmedLine.toUpperCase().includes(header));
        
        if (isHeading) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: trimmedLine, bold: true, size: 24 })],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 240, after: 120 }
            })
          );
        } else {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: trimmedLine, size: 22 })],
              spacing: { after: 120 }
            })
          );
        }
      }
    });
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: children
      }]
    });
    
    return await Packer.toBuffer(doc);
  } catch (error) {
    console.error('Error generating DOCX:', error);
    throw new Error('Failed to generate DOCX document');
  }
};

// Upload and parse resume endpoint
app.post('/upload-resume', (req, res) => {
  const busboy = Busboy({ headers: req.headers });
  let fileBuffer = Buffer.alloc(0);
  let mimetype = '';
  let filename = '';
  
  busboy.on('file', (fieldname, file, info) => {
    filename = info.filename;
    mimetype = info.mimeType;
    
    file.on('data', (data) => {
      fileBuffer = Buffer.concat([fileBuffer, data]);
    });
  });
  
  busboy.on('finish', async () => {
    try {
      // Validate file type
      if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(mimetype)) {
        return res.status(400).json({ error: 'Only PDF and DOCX files are supported' });
      }
      
      // Parse file content
      const resumeText = await parseFile(fileBuffer, mimetype);
      
      // Store original file in Firebase Storage
      const bucket = admin.storage().bucket();
      const fileRef = bucket.file(`resumes/original_${Date.now()}_${filename}`);
      
      await fileRef.save(fileBuffer, {
        metadata: {
          contentType: mimetype,
          metadata: {
            originalName: filename
          }
        }
      });
      
      const [downloadUrl] = await fileRef.getSignedUrl({
        action: 'read',
        expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      });
      
      res.json({
        success: true,
        resumeText,
        originalFileUrl: downloadUrl,
        filename
      });
    } catch (error) {
      console.error('Error processing resume upload:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  req.pipe(busboy);
});

// Process job posting endpoint
app.post('/process-job-posting', async (req, res) => {
  try {
    const { jobText, jobUrl } = req.body;
    
    let jobDescription = '';
    
    if (jobUrl) {
      jobDescription = await scrapeJobPosting(jobUrl);
    } else if (jobText) {
      jobDescription = jobText;
    } else {
      return res.status(400).json({ error: 'Either job text or job URL is required' });
    }
    
    // Extract key requirements using simple text processing
    const lines = jobDescription.toLowerCase().split('\n');
    const requirements = lines.filter(line => 
      line.includes('require') || 
      line.includes('must have') || 
      line.includes('experience') ||
      line.includes('skill') ||
      line.includes('qualification')
    );
    
    res.json({
      success: true,
      jobDescription,
      keyRequirements: requirements.slice(0, 10) // Limit to top 10
    });
  } catch (error) {
    console.error('Error processing job posting:', error);
    res.status(500).json({ error: error.message });
  }
});

// Optimize resume endpoint
app.post('/optimize-resume', async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: 'Resume text and job description are required' });
    }
    
    // Optimize resume with AI
    const optimizedResume = await optimizeResume(resumeText, jobDescription);
    
    // Generate DOCX version
    const docxBuffer = await generateDocx(optimizedResume);
    
    // Store optimized files in Firebase Storage
    const bucket = admin.storage().bucket();
    const timestamp = Date.now();
    
    // Store DOCX file
    const docxRef = bucket.file(`resumes/optimized_${timestamp}.docx`);
    await docxRef.save(docxBuffer, {
      metadata: {
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }
    });
    
    // Store text version for PDF generation (will be handled by frontend)
    const textRef = bucket.file(`resumes/optimized_${timestamp}.txt`);
    await textRef.save(optimizedResume, {
      metadata: {
        contentType: 'text/plain'
      }
    });
    
    // Get download URLs
    const [docxUrl] = await docxRef.getSignedUrl({
      action: 'read',
      expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });
    
    const [textUrl] = await textRef.getSignedUrl({
      action: 'read',
      expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });
    
    // Save session data to Firestore
    const sessionData = {
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      originalResume: resumeText.substring(0, 1000), // Store first 1000 chars
      jobDescription: jobDescription.substring(0, 1000),
      optimizedResume: optimizedResume.substring(0, 1000),
      docxUrl,
      textUrl
    };
    
    await admin.firestore().collection('sessions').add(sessionData);
    
    res.json({
      success: true,
      optimizedResume,
      downloads: {
        docx: docxUrl,
        text: textUrl
      }
    });
  } catch (error) {
    console.error('Error optimizing resume:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);

