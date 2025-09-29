"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Upload, FileText, Download, Eye, Trash2, Plus, Calendar, CheckCircle, AlertCircle, RefreshCw, Loader2 } from "lucide-react"
import { api, Resume } from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

function ResumesSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    loadResumes()
  }, [])

  const loadResumes = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await api.getResumes()
      if (response.success && response.data) {
        setResumes(response.data)
      } else {
        setError(response.error || 'Failed to load resumes')
      }
    } catch (err) {
      console.error('Resumes loading error:', err)
      setError('An error occurred while loading your resumes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please upload a PDF or DOC file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setUploadError(null)

    try {
      const uploadResponse = await api.requestResumeUpload({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      })

      if (!uploadResponse.success || !uploadResponse.data) {
        throw new Error(uploadResponse.error || 'Failed to get upload URL')
      }

      const { uploadUrl, fileKey } = uploadResponse.data
      
      const xhr = new XMLHttpRequest()
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100
          setUploadProgress(percentComplete)
        }
      })

      xhr.onload = async () => {
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const completeResponse = await api.completeResumeUpload(fileKey)
            
            if (completeResponse.success && completeResponse.data) {
              setResumes(prev => [completeResponse.data, ...prev])
              toast.success('Resume uploaded successfully!')
              setShowUploadDialog(false)
            } else {
              throw new Error(completeResponse.error || 'Failed to complete upload')
            }
          } catch (err) {
            console.error('Complete upload error:', err)
            setUploadError('Failed to complete upload')
          }
        } else {
          setUploadError('Failed to upload file')
        }
        setIsUploading(false)
        setUploadProgress(0)
      }

      xhr.onerror = () => {
        setUploadError('Upload failed')
        setIsUploading(false)
        setUploadProgress(0)
      }

      xhr.open('PUT', uploadUrl)
      xhr.send(file)

    } catch (err) {
      console.error('Upload error:', err)
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = async (resumeId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return
    }

    try {
      const response = await api.deleteResume(resumeId)
      
      if (response.success) {
        setResumes(prev => prev.filter(resume => resume.id !== resumeId))
        toast.success('Resume deleted successfully!')
      } else {
        toast.error(response.error || 'Failed to delete resume')
      }
    } catch (err) {
      console.error('Delete error:', err)
      toast.error('An error occurred while deleting the resume')
    }
  }

  const handleDownload = (resume: Resume) => {
    toast.info('Download functionality will be implemented soon')
  }

  const handlePreview = (resume: Resume) => {
    toast.info('Preview functionality will be implemented soon')
  }
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  const getParseStatusInfo = (status: Resume['parseStatus']) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Processing...', color: 'bg-gray-500' }
      case 'PROCESSING':
        return { label: 'Processing...', color: 'bg-blue-500' }
      case 'SUCCESS':
        return { label: 'Ready', color: 'bg-green-500' }
      case 'FAILED':
        return { label: 'Failed', color: 'bg-red-500' }
      default:
        return { label: 'Unknown', color: 'bg-gray-500' }
    }
  }
  
  if (isLoading) {
    return <ResumesSkeleton />
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Resumes</h1>
            <p className="text-muted-foreground">Manage your resume files and track their performance</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="p-4 bg-red-500/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Error loading resumes</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <Button onClick={loadResumes} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Resumes</h1>
          <p className="text-muted-foreground">Manage your resume files and track their performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadResumes} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Upload Resume
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New Resume</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Upload PDF or DOC files only. Maximum file size: 5MB</AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="resume-file">Choose File</Label>
                  <Input
                    id="resume-file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </div>

                {uploadError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{uploadError}</AlertDescription>
                  </Alert>
                )}

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Resume Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Format</h4>
              <p className="text-muted-foreground">Use PDF format for best compatibility across all systems</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">File Name</h4>
              <p className="text-muted-foreground">Use your name in the filename (e.g., John_Doe_Resume.pdf)</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Content</h4>
              <p className="text-muted-foreground">
                Keep it concise, relevant, and tailored to the job you're applying for
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {resumes.map((resume) => (
          <Card key={resume.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{resume.fileName}</h3>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          getParseStatusInfo(resume.parseStatus).color === 'bg-green-500' 
                            ? 'bg-green-500/10 text-green-700 border-green-200'
                            : getParseStatusInfo(resume.parseStatus).color === 'bg-red-500'
                            ? 'bg-red-500/10 text-red-700 border-red-200'
                            : 'bg-gray-500/10 text-gray-700 border-gray-200'
                        )}
                      >
                        {getParseStatusInfo(resume.parseStatus).label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatFileSize(resume.size)}</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">File type: {resume.mimeType}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handlePreview(resume)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDownload(resume)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(resume.id, resume.fileName)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {resumes.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">No resumes uploaded</h3>
                <p className="text-muted-foreground mb-4">Upload your first resume to start applying for jobs</p>
                <Button onClick={() => setShowUploadDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Resume
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}