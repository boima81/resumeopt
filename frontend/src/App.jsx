import { useState, useEffect } from 'react'
import { Button } from './components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card.jsx'
import { generatePDF } from './lib/pdf-generator.js'
import { Textarea } from './components/ui/textarea.jsx'
import { Input } from './components/ui/input.jsx'
import { Label } from './components/ui/label.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs.jsx'
import { Progress } from './components/ui/progress.jsx'
import { Alert, AlertDescription } from './components/ui/alert.jsx'
import { Badge } from './components/ui/badge.jsx'
import { Separator } from './components/ui/separator.jsx'
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
  const [resumeData, setResumeData] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [optimizedResume, setOptimizedResume] = useState('')
  const [downloadUrls, setDownloadUrls] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [aiStatus, setAiStatus] = useState('unknown')

  // API base URL - updated for Netlify deployment
  const API_BASE = '/.netlify/functions/api'

  // Check AI status on component mount
  useEffect(() => {
    const checkAIStatus = async () => {
      try {
        const response = await fetch(`${API_BASE}/health`)
        const data = await response.json()
        setAiStatus(data.ai_status || 'unknown')
      } catch (error) {
        console.error('Failed to check AI status:', error)
        setAiStatus('error')
      }
    }
    checkAIStatus()
  }, [])

  // Handle job posting input
  const handleJobSubmit = async () => {
    if (!jobInput.text && !jobInput.url) {
      setError('Please provide either job description text or a URL')
      return
    }

    setLoading(true)
    setError('')
    setProgress(20)

    try {
      const response = await fetch(`${API_BASE}/process-job-posting`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobText: jobInput.text,
          jobUrl: jobInput.url
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setJobData(data.analysis)
        setProgress(50)
        setActiveStep(2)
      } else {
        // Handle URL extraction failures with helpful suggestions
        if (data.fallback && data.suggestion) {
          setError(`${data.error}\n\n💡 Suggestion: ${data.suggestion}`)
        } else {
          setError(data.error || 'Failed to process job posting')
        }
      }
    } catch (error) {
      console.error('Error processing job posting:', error)
      setError('Failed to process job posting. Please try again.')
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  // Handle resume file upload
  const handleResumeUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(file.type)) {
      setError('Please upload a PDF, DOCX, or TXT file')
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
        setResumeData(data.analysis)
        setActiveStep(3)
        setProgress(100)
      } else {
        setError(data.error || 'Failed to upload and parse resume')
      }
    } catch (err) {
      console.error('Resume upload error:', err)
      setError('Failed to upload resume. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle AI optimization
  const handleOptimize = async () => {
    if (!resumeData || !jobData) {
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
          resumeData: resumeData,
          jobData: jobData
        }),
      })

      const data = await response.json()
      
      clearInterval(progressInterval)
        if (data.success) {
        setOptimizedResume(data.optimizedResume)
        setDownloadUrls({
          docx: data.downloads?.docx,
          text: data.downloads?.text
        })
        setProgress(100)
        setActiveStep(4)
      } else {
        setError(data.error || 'Failed to optimize resume')
      }
    } catch (error) {
      console.error('Optimization error:', error)
      setError('Failed to optimize resume. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  // Reset function
  const handleReset = () => {
    setActiveStep(1)
    setJobInput({ text: '', url: '' })
    setJobData(null)
    setResumeFile(null)
    setResumeData(null)
    setResumeText('')
    setOptimizedResume('')
    setDownloadUrls(null)
    setError('')
    setProgress(0)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            <Brain className="inline-block mr-3 h-10 w-10 text-blue-600" />
            AI Resume Optimizer
          </h1>
          <p className="text-lg text-gray-600">
            Optimize your resume with real AI analysis for any job posting
          </p>
          <div className="mt-2 flex justify-center items-center gap-2">
            <Badge variant={aiStatus === 'gemini_active' ? 'default' : 'secondary'}>
              {aiStatus === 'gemini_active' ? '🤖 Gemini AI Active' : 
               aiStatus === 'fallback_mode' ? '⚡ Fallback Mode' : 
               '🔄 Checking AI Status'}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        {loading && (
          <div className="mb-6">
            <Progress value={progress} className="w-full" />
            <p className="text-center text-sm text-gray-600 mt-2">
              {progress < 30 ? 'Processing job posting...' :
               progress < 60 ? 'Analyzing requirements...' :
               progress < 90 ? 'Optimizing resume...' :
               'Finalizing...'}
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Job Posting Input */}
        {activeStep === 1 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Step 1: Job Posting Analysis
              </CardTitle>
              <CardDescription>
                Provide the job posting you want to optimize your resume for
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text">Paste Job Text</TabsTrigger>
                  <TabsTrigger value="url">From URL</TabsTrigger>
                </TabsList>
                
                <TabsContent value="text" className="space-y-4">
                  <div>
                    <Label htmlFor="job-text">Job Description</Label>
                    <Textarea
                      id="job-text"
                      placeholder="Paste the complete job description here..."
                      value={jobInput.text}
                      onChange={(e) => setJobInput({...jobInput, text: e.target.value})}
                      className="min-h-[200px] mt-2"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="url" className="space-y-4">
                  <div>
                    <Label htmlFor="job-url">Job Posting URL</Label>
                    <Input
                      id="job-url"
                      type="url"
                      placeholder="https://example.com/job-posting"
                      value={jobInput.url}
                      onChange={(e) => setJobInput({...jobInput, url: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <Button 
                onClick={handleJobSubmit} 
                disabled={loading || (!jobInput.text && !jobInput.url)}
                className="w-full mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Job Posting...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze Job Posting with AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Resume Upload */}
        {activeStep === 2 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-600" />
                Step 2: Upload Your Resume
              </CardTitle>
              <CardDescription>
                Upload your current resume for AI analysis and optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Upload your resume</p>
                  <p className="text-sm text-gray-600">PDF, DOCX, or TXT files supported</p>
                </div>
                <Input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleResumeUpload}
                  className="mt-4"
                />
              </div>
              
              {resumeFile && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      {resumeFile.name} uploaded successfully
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Optimization */}
        {activeStep === 3 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                Step 3: AI Resume Optimization
              </CardTitle>
              <CardDescription>
                Let AI optimize your resume for the specific job requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Job Analysis Complete</h3>
                    <p className="text-sm text-blue-700">
                      ✅ Job title: {jobData?.jobTitle || 'Analyzed'}<br/>
                      ✅ Technical skills: {jobData?.technicalSkills?.length || 0} identified<br/>
                      ✅ Experience level: {jobData?.experienceLevel || 'Determined'}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-medium text-green-900 mb-2">Resume Parsed</h3>
                    <p className="text-sm text-green-700">
                      ✅ Resume content extracted<br/>
                      ✅ Skills and experience identified<br/>
                      ✅ Ready for optimization
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={handleOptimize} 
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Optimizing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Optimize Resume with AI
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Results */}
        {activeStep === 4 && optimizedResume && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-green-600" />
                Your Optimized Resume
              </CardTitle>
              <CardDescription>
                AI-optimized resume tailored for the job posting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">✨ Optimization Complete!</h3>
                  <p className="text-sm text-green-700">
                    ✅ Resume optimized with job-specific experience, skills, and achievements<br/>
                    📄 Available formats: PDF, Word Document, and Text
                  </p>
                </div>

                <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed text-gray-800">
                    {optimizedResume}
                  </pre>
                </div>

                {/* Download Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">                  <Button 
                    onClick={async () => {
                      try {
                        const pdf = await generatePDF(optimizedResume);
                        pdf.save('optimized-resume.pdf');
                      } catch (error) {
                        setError('Failed to generate PDF. Please try again.');
                      }
                    }}
                    className="h-12"
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
                      navigator.clipboard.writeText(optimizedResume);
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
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default App

