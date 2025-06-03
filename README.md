# Resume Optimizer 🚀

> AI-Powered ATS Resume Builder using Google Gemini AI

[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Google AI](https://img.shields.io/badge/Google%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

A comprehensive full-stack web application that leverages Google Gemini AI to optimize resumes for specific job postings, ensuring ATS compliance and professional formatting.

## ✨ Features

### 🎯 Core Functionality
- **Job Posting Input**: Paste job descriptions or provide URLs for automatic scraping
- **Resume Upload**: Support for PDF and DOCX file formats
- **AI Optimization**: Powered by Google Gemini AI for intelligent resume enhancement
- **ATS Compliance**: Ensures resumes pass Applicant Tracking Systems
- **Multi-Format Output**: Download optimized resumes in PDF and DOCX formats

### 🎨 User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Progress Tracking**: Real-time progress indicators for each step
- **Professional UI**: Clean, modern interface built with Tailwind CSS and shadcn/ui
- **Error Handling**: Comprehensive error management and user feedback
- **File Management**: Secure file upload and storage with Firebase

### 🔧 Technical Features
- **Serverless Architecture**: Firebase Functions for scalable backend
- **Real-time Database**: Firestore for session management
- **Cloud Storage**: Firebase Storage for file handling
- **AI Integration**: Google Gemini AI for content optimization
- **Modern Frontend**: React 18 with Vite for fast development

## 🏗️ Architecture

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

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Firebase CLI
- Google Gemini AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/resume-optimizer.git
   cd resume-optimizer
   ```

2. **Set up environment**
   ```bash
   ./setup-env.sh
   ```

3. **Install dependencies**
   ```bash
   # Frontend
   cd frontend && npm install && cd ..
   
   # Backend
   cd backend/functions && npm install && cd ../..
   ```

4. **Start development server**
   ```bash
   # Start Firebase emulators
   firebase emulators:start
   
   # In another terminal, start React dev server
   cd frontend && npm run dev
   ```

5. **Open application**
   - Local development: http://localhost:5173
   - Firebase hosting: http://localhost:5000

### Deployment

1. **Configure for production**
   ```bash
   ./setup-env.sh
   # Choose production environment
   ```

2. **Deploy to Firebase**
   ```bash
   ./deploy.sh
   ```

## 📁 Project Structure

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
│   │   ├── index.js        # Main functions file
│   │   ├── mockAI.js       # Mock AI service
│   │   └── package.json    # Dependencies
│   ├── storage/            # Storage rules
│   ├── firestore.rules     # Firestore security rules
│   └── firestore.indexes.json
├── docs/                   # Documentation
│   ├── architecture.md     # System architecture
│   └── deployment.md       # Deployment guide
├── firebase.json           # Firebase configuration
├── .firebaserc            # Firebase project settings
├── deploy.sh              # Deployment script
├── setup-env.sh           # Environment setup
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

Create `backend/functions/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
FIREBASE_PROJECT_ID=your-project-id
NODE_ENV=development
```

### Firebase Configuration

Update `.firebaserc` with your project ID:

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

### API Keys

1. **Gemini AI API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add to environment configuration

2. **Firebase Project**
   - Create project at [Firebase Console](https://console.firebase.google.com/)
   - Enable required services (Functions, Firestore, Storage, Hosting)

## 🧪 Testing

### Local Testing

```bash
# Start emulators
firebase emulators:start

# Run frontend tests
cd frontend && npm test

# Test backend functions
cd backend && python3 test_backend.py
```

### End-to-End Testing

1. Upload a sample resume (PDF/DOCX)
2. Enter a job description
3. Process and optimize
4. Download results
5. Verify file formats and content

## 📊 Performance

- **Frontend**: Optimized React build with code splitting
- **Backend**: Serverless functions with automatic scaling
- **Storage**: CDN-backed file delivery
- **AI Processing**: Efficient prompt engineering for fast responses

## 🔒 Security

- **File Validation**: Strict file type and size checking
- **API Security**: Secure API key management
- **Storage Rules**: Proper Firebase security rules
- **Input Sanitization**: Clean user inputs
- **CORS Configuration**: Proper cross-origin settings

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📱 Mobile Support

Fully responsive design optimized for:
- iOS Safari
- Android Chrome
- Mobile browsers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow ESLint configuration
- Write comprehensive tests
- Update documentation
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for AI capabilities
- [Firebase](https://firebase.google.com/) for backend infrastructure
- [React](https://reactjs.org/) for frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for UI components

## 📞 Support

- **Documentation**: Check the [docs](./docs/) folder
- **Issues**: Open an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions

## 🗺️ Roadmap

- [ ] User authentication and accounts
- [ ] Resume templates and themes
- [ ] Batch processing for multiple resumes
- [ ] Integration with job boards
- [ ] Advanced analytics and insights
- [ ] Mobile app development

## 📈 Stats

- **Languages**: JavaScript, HTML, CSS
- **Frameworks**: React, Node.js
- **Services**: Firebase, Google AI
- **Build Time**: ~3 seconds
- **Bundle Size**: ~255KB (gzipped)

---

<div align="center">
  <p>Built with ❤️ by the Resume Optimizer Team</p>
  <p>
    <a href="https://github.com/yourusername/resume-optimizer">⭐ Star this repo</a> •
    <a href="https://github.com/yourusername/resume-optimizer/issues">🐛 Report Bug</a> •
    <a href="https://github.com/yourusername/resume-optimizer/issues">💡 Request Feature</a>
  </p>
</div>

