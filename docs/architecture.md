# Resume Optimizer Application Architecture

## Project Overview
A full-stack web application that uses Gemini AI to optimize resumes based on job postings, providing ATS-compliant output in multiple formats.

## Technology Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for responsive styling
- **shadcn/ui** for professional UI components
- **Lucide React** for icons
- **React Router** for navigation
- **Framer Motion** for animations

### Backend
- **Firebase Functions** for serverless backend logic
- **Firebase Storage** for file storage (resumes, generated documents)
- **Firebase Firestore** for user sessions and history
- **Firebase Hosting** for frontend deployment

### AI & Processing
- **Google Gemini AI** for resume optimization
- **PDF parsing** libraries for resume extraction
- **DOCX processing** for Word document handling
- **Web scraping** for job posting URL extraction

## Application Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │ Firebase        │    │ External APIs   │
│                 │    │ Functions       │    │                 │
│ • Job Input     │◄──►│                 │◄──►│ • Gemini AI     │
│ • Resume Upload │    │ • File Processing│    │ • Job Scraping  │
│ • AI Processing │    │ • AI Integration │    │                 │
│ • Download      │    │ • Document Gen  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│ Firebase        │    │ Firebase        │
│ Hosting         │    │ Storage         │
│                 │    │                 │
│ • Static Files  │    │ • Uploaded Files│
│ • SPA Routing   │    │ • Generated Docs│
└─────────────────┘    └─────────────────┘
```

## Core Features

### 1. Job Posting Input
- **Text Input**: Direct paste of job description
- **URL Input**: Automatic scraping of job posting URLs
- **Key Extraction**: Parse responsibilities and qualifications
- **Display**: Clean presentation of extracted information

### 2. Resume Upload
- **File Support**: PDF and DOCX formats
- **Validation**: File type and size checking
- **Parsing**: Extract text content for AI processing
- **Preview**: Show parsed content to user

### 3. AI Optimization
- **Gemini Integration**: Use Google's Gemini AI API
- **Prompt Engineering**: Craft prompts for ATS compliance
- **Content Matching**: Align resume with job requirements
- **Style Variation**: Reduce AI detection patterns

### 4. Document Generation
- **PDF Output**: Professional PDF formatting
- **DOCX Output**: Editable Word document
- **ATS Compliance**: Ensure parsing compatibility
- **Download Management**: Secure file delivery

### 5. User Experience
- **Progress Tracking**: Real-time status updates
- **Responsive Design**: Mobile and desktop support
- **Error Handling**: Graceful failure management
- **Session Management**: Optional user accounts

## Data Flow

1. **Input Phase**
   - User provides job posting (text/URL)
   - User uploads resume file
   - System validates and parses inputs

2. **Processing Phase**
   - Extract job requirements
   - Parse resume content
   - Send to Gemini AI for optimization
   - Generate optimized resume content

3. **Output Phase**
   - Create PDF and DOCX versions
   - Store in Firebase Storage
   - Provide download links
   - Save session data (optional)

## Security Considerations

- **File Validation**: Strict file type checking
- **Size Limits**: Prevent large file uploads
- **API Security**: Secure Gemini AI key management
- **Storage Rules**: Proper Firebase security rules
- **Input Sanitization**: Clean user inputs

## Deployment Strategy

1. **Development**: Local testing with Firebase emulators
2. **Staging**: Firebase Hosting preview channels
3. **Production**: Firebase Hosting with custom domain
4. **Monitoring**: Firebase Analytics and error tracking

## File Structure

```
resume-optimizer/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities
│   │   └── assets/         # Static assets
│   └── public/             # Public files
├── backend/
│   ├── functions/          # Firebase Functions
│   └── storage/            # Storage configuration
├── docs/                   # Documentation
└── README.md              # Project documentation
```

## Development Phases

1. **Setup**: Project initialization and configuration
2. **Backend**: Firebase Functions and AI integration
3. **Frontend**: React components and UI
4. **Integration**: Connect frontend and backend
5. **Testing**: Comprehensive testing suite
6. **Deployment**: Firebase hosting and functions
7. **Documentation**: Complete project documentation

