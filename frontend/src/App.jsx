import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { 
  Upload, 
  FileText, 
  Link, 
  Sparkles, 
  Download, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Brain,
  Target,
  FileCheck
} from 'lucide-react'
import './App.css'

function App() {
  // State management
  const [activeStep, setActiveStep] = useState(1)
  const [jobInput, setJobInput] = useState({ text: '', url: '' })
  const [jobData, setJobData] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [optimizedResume, setOptimizedResume] = useState('')
  const [downloadUrls, setDownloadUrls] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)

  // API base URL - updated for Netlify deployment
  const API_BASE = '/.netlify/functions/api'

  // Handle job posting input
  const handleJobSubmit = async () => {
    if (!jobInput.text && !jobInput.url) {
      setError('Please provide either job description text or a URL')
      return
    }

    setLoading(true)
    setError('')
    setProgress(25)

    try {
      const response = await fetch(`${API_BASE}/process-job-posting`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobText: jobInput.text,
          jobUrl: jobInput.url
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setJobData(data)
        setActiveStep(2)
        setProgress(50)
      } else {
        setError(data.error || 'Failed to process job posting')
      }
    } catch (err) {
      setError('Failed to connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle resume upload
  const handleResumeUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      setError('Please upload a PDF or DOCX file')
      return
    }

    setResumeFile(file)
    setLoading(true)
    setError('')
    setProgress(75)

    try {
      const formData = new FormData()
      formData.append('resume', file)

      const response = await fetch(`${API_BASE}/upload-resume`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      if (data.success) {
        setResumeText(data.resumeText)
        setActiveStep(3)
        setProgress(100)
      } else {
        setError(data.error || 'Failed to upload resume')
      }
    } catch (err) {
      setError('Failed to upload resume. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle AI optimization
  const handleOptimize = async () => {
    if (!resumeText || !jobData) {
      setError('Please complete previous steps first')
      return
    }

    setLoading(true)
    setError('')
    setProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      const response = await fetch(`${API_BASE}/optimize-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText,
          jobDescription: jobData.jobDescription
        })
      })

      const data = await response.json()
      clearInterval(progressInterval)
      
      if (data.success) {
        setOptimizedResume(data.optimizedResume)
        setDownloadUrls(data.downloads)
        setActiveStep(4)
        setProgress(100)
      } else {
        setError(data.error || 'Failed to optimize resume')
      }
    } catch (err) {
      setError('Failed to optimize resume. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Reset application
  const handleReset = () => {
    setActiveStep(1)
    setJobInput({ text: '', url: '' })
    setJobData(null)
    setResumeFile(null)
    setResumeText('')
    setOptimizedResume('')
    setDownloadUrls(null)
    setLoading(false)
    setError('')
    setProgress(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Resume Optimizer
                </h1>
                <p className="text-sm text-muted-foreground">AI-Powered ATS Resume Builder</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleReset}>
              Start Over
            </Button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  activeStep >= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {activeStep > step ? <CheckCircle className="h-4 w-4" /> : step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-1 mx-2 ${
                    activeStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            Step {activeStep} of 4
          </div>
        </div>
        
        {loading && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-center text-muted-foreground">
              {activeStep === 1 && 'Processing job posting...'}
              {activeStep === 2 && 'Uploading and parsing resume...'}
              {activeStep === 3 && 'Optimizing resume with AI...'}
            </p>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="container mx-auto px-4 mb-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Step 1: Job Posting Input */}
          <Card className={`transition-all duration-300 ${activeStep === 1 ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>1. Job Posting</span>
              </CardTitle>
              <CardDescription>
                Provide the job description you want to optimize for
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text">Paste Text</TabsTrigger>
                  <TabsTrigger value="url">From URL</TabsTrigger>
                </TabsList>
                
                <TabsContent value="text" className="space-y-4">
                  <div>
                    <Label htmlFor="job-text">Job Description</Label>
                    <Textarea
                      id="job-text"
                      placeholder="Paste the job description here..."
                      value={jobInput.text}
                      onChange={(e) => setJobInput(prev => ({ ...prev, text: e.target.value }))}
                      rows={8}
                      className="resize-none"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="url" className="space-y-4">
                  <div>
                    <Label htmlFor="job-url">Job Posting URL</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="job-url"
                        type="url"
                        placeholder="https://example.com/job-posting"
                        value={jobInput.url}
                        onChange={(e) => setJobInput(prev => ({ ...prev, url: e.target.value }))}
                      />
                      <Button variant="outline" size="icon">
                        <Link className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <Button 
                onClick={handleJobSubmit} 
                disabled={loading || (!jobInput.text && !jobInput.url)}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Process Job Posting
                  </>
                )}
              </Button>

              {jobData && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Job Analysis Complete</span>
                  </div>
                  
                  {jobData.analysis && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-green-700 mb-1">Job Title:</p>
                        <Badge variant="secondary" className="text-xs">{jobData.analysis.jobTitle}</Badge>
                      </div>
                      
                      <div>
                        <p className="text-xs font-medium text-green-700 mb-1">Technical Skills Required:</p>
                        <div className="flex flex-wrap gap-1">
                          {jobData.analysis.technicalSkills?.slice(0, 6).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs capitalize">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {jobData.analysis.industry} Industry
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {jobData.analysis.yearsRequired}+ Years
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Resume Upload */}
          <Card className={`transition-all duration-300 ${activeStep === 2 ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>2. Upload Resume</span>
              </CardTitle>
              <CardDescription>
                Upload your current resume in PDF or DOCX format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleResumeUpload}
                  className="hidden"
                  id="resume-upload"
                  disabled={!jobData || loading}
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF or DOCX files only (max 10MB)
                  </p>
                </label>
              </div>

              {resumeFile && (
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800">{resumeFile.name}</p>
                    <p className="text-xs text-blue-600">
                      {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              )}

              {resumeText && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Resume parsed successfully</span>
                  </div>
                  <p className="text-xs text-green-700">
                    {resumeText.length} characters extracted
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 3: AI Optimization */}
          <Card className={`transition-all duration-300 ${activeStep === 3 ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5" />
                <span>3. AI Optimization</span>
              </CardTitle>
              <CardDescription>
                Let AI optimize your resume for the job posting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <FileCheck className="h-4 w-4 text-blue-600" />
                  <span>ATS-compliant formatting</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span>Keyword optimization</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Brain className="h-4 w-4 text-blue-600" />
                  <span>AI-powered content enhancement</span>
                </div>
              </div>

              <Separator />

              <Button 
                onClick={handleOptimize}
                disabled={!resumeText || !jobData || loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Optimize Resume
                  </>
                )}
              </Button>

              {optimizedResume && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Resume optimized successfully</span>
                  </div>
                  <p className="text-xs text-green-700">
                    Ready for download in multiple formats
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Step 4: Download Results */}
        {activeStep === 4 && optimizedResume && (
          <Card className="mt-6 ring-2 ring-green-500 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>4. Download Your Optimized Resume</span>
              </CardTitle>
              <CardDescription>
                Your resume has been optimized and is ready for download
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enhanced Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base font-medium">Optimized Resume Preview</Label>
                  <Badge variant="secondary" className="text-xs">
                    ✨ Job-Matched Content
                  </Badge>
                </div>
                <div className="mt-2 p-6 bg-white rounded-lg border shadow-sm max-h-80 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed text-gray-800">
                    {optimizedResume}
                  </pre>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  ✅ Resume optimized with job-specific experience, skills, and achievements
                  <br />
                  📄 Available formats: PDF, Word Document, and Text
                </p>
              </div>

              {/* Download Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => {
                    if (downloadUrls?.pdf) {
                      const link = document.createElement('a');
                      link.href = downloadUrls.pdf;
                      link.download = 'optimized-resume.pdf';
                      link.click();
                    }
                  }}
                  className="h-12"
                  disabled={!downloadUrls?.pdf}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                
                <Button 
                  onClick={() => {
                    if (downloadUrls?.docx) {
                      const link = document.createElement('a');
                      link.href = downloadUrls.docx;
                      link.download = 'optimized-resume.docx';
                      link.click();
                    }
                  }}
                  className="h-12"
                  disabled={!downloadUrls?.docx}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Word
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Create a formatted version for copying
                    navigator.clipboard.writeText(optimizedResume);
                    // You could add a toast notification here
                  }}
                  className="h-12"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Copy Text
                </Button>
              </div>

              <div className="text-center">
                <Button variant="outline" onClick={handleReset}>
                  Optimize Another Resume
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 Resume Optimizer. Powered by Google Gemini AI.</p>
            <p className="mt-1">Build ATS-compliant resumes that get noticed.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

