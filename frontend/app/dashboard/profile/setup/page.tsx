"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, ArrowLeft, User, Briefcase, Upload, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { SkillsSelector } from "@/components/ui/skills-selector"
import { toast } from "sonner"
import type { LucideIcon } from "lucide-react"

interface ProfileData {
  phone: string
  desiredTitle: string
  about: string
  skills: Array<{
    category: string
    work: string
  }>
}

interface ResumeUploadState {
  file: File | null
  isUploading: boolean
  progress: number
  error: string | null
  success: boolean
}

interface Step {
  id: number
  title: string
  description: string
  icon: LucideIcon
}

const steps: Step[] = [
  {
    id: 1,
    title: "Basic Information",
    description: "Let's start with your contact details",
    icon: User,
  },
  {
    id: 2,
    title: "Professional Details",
    description: "Tell us about your work preferences",
    icon: Briefcase,
  },
  {
    id: 3,
    title: "Skills & Experience",
    description: "Select your skills from our categories",
    icon: CheckCircle,
  },
  {
    id: 4,
    title: "Upload Resume",
    description: "Add your resume (optional)",
    icon: Upload,
  },
]

export default function ProfileSetupPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [profileData, setProfileData] = useState<ProfileData>({
    phone: "",
    desiredTitle: "",
    about: "",
    skills: [],
  })
  
  const [resumeUpload, setResumeUpload] = useState<ResumeUploadState>({
    file: null,
    isUploading: false,
    progress: 0,
    error: null,
    success: false,
  })

  // Redirect if user is not authenticated or not a job seeker
  useEffect(() => {
    if (user && user.role !== 'JOBSEEKER') {
      router.push('/dashboard')
    }
  }, [user, router])

  const updateProfileData = (field: keyof ProfileData, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Resume upload handler
  const handleResumeUpload = async (file: File) => {
    if (!file) return

    // Validate file type
    if (!file.type.includes('pdf') && !file.type.includes('doc')) {
      setResumeUpload(prev => ({ ...prev, error: 'Please upload a PDF or DOC file' }))
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setResumeUpload(prev => ({ ...prev, error: 'File size must be less than 10MB' }))
      return
    }

    setResumeUpload(prev => ({
      ...prev,
      file,
      isUploading: true,
      progress: 0,
      error: null,
    }))

    try {
      // Step 1: Request upload URL
      const uploadRequest = await api.requestResumeUpload({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      })

      if (!uploadRequest.success || !uploadRequest.data) {
        throw new Error('Failed to get upload URL')
      }

      const { uploadUrl, fileKey } = uploadRequest.data

      // Step 2: Upload file to the provided URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file')
      }

      setResumeUpload(prev => ({ ...prev, progress: 80 }))

      // Step 3: Complete the upload
      const completeResponse = await api.completeResumeUpload(fileKey)
      
      if (!completeResponse.success) {
        throw new Error('Failed to complete upload')
      }

      setResumeUpload(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        success: true,
      }))

      toast.success('Resume uploaded successfully!')
    } catch (error) {
      console.error('Resume upload error:', error)
      setResumeUpload(prev => ({
        ...prev,
        isUploading: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      }))
    }
  }

  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 1:
        return profileData.phone.length > 0
      case 2:
        return profileData.desiredTitle.length > 0 && profileData.about.length > 0
      case 3:
        return profileData.skills.length > 0
      case 4:
        return true // Resume is optional
      default:
        return false
    }
  }

  const canProceed = isStepComplete(currentStep)

  const handleSubmit = async () => {
    if (currentStep === steps.length) {
      setIsSubmitting(true)
      setError("")

      try {
        // Update user profile
        const response = await api.updateJobSeekerProfile(profileData)
        
        if (response.success) {
          await refreshUser()
          toast.success("Profile setup completed successfully!")
          router.push("/dashboard")
        } else {
          setError("Failed to update profile. Please try again.")
        }
      } catch (err) {
        setError("An error occurred. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
    } else {
      nextStep()
    }
  }

  const handleSkip = () => {
    router.push("/dashboard")
  }

  const progressPercentage = (currentStep / steps.length) * 100
  const currentStepData = steps[currentStep - 1]
  const CurrentStepIcon = currentStepData.icon

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-2xl mx-auto space-y-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Complete Your Profile
          </h1>
          <p className="text-muted-foreground">
            Help us match you with the best job opportunities
          </p>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Step {currentStep} of {steps.length}</span>
            <span className="font-medium">{Math.round(progressPercentage)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </motion.div>

        {/* Steps Indicator */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              const StepIcon = step.icon

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-2 ${isCompleted ? "bg-green-500" : "bg-muted"}`} />
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="backdrop-blur-sm bg-card/80 border shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CurrentStepIcon className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="text-xl">{currentStepData.title}</h3>
                    <p className="text-sm text-muted-foreground font-normal">
                      {currentStepData.description}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Step Content */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+250 788 123 456"
                        value={profileData.phone}
                        onChange={(e) => updateProfileData("phone", e.target.value)}
                      />
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="desiredTitle">Desired Job Title *</Label>
                      <Input
                        id="desiredTitle"
                        placeholder="e.g., Farm Worker, Construction Worker, etc."
                        value={profileData.desiredTitle}
                        onChange={(e) => updateProfileData("desiredTitle", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="about">About You *</Label>
                      <Textarea
                        id="about"
                        rows={4}
                        placeholder="Tell potential employers about yourself, your experience, and what makes you a great candidate..."
                        value={profileData.about}
                        onChange={(e) => updateProfileData("about", e.target.value)}
                      />
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <SkillsSelector
                      selectedSkills={profileData.skills}
                      onSkillsChange={(skills) => updateProfileData("skills", skills)}
                    />
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {!resumeUpload.file && !resumeUpload.success && (
                      <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                          <Upload className="h-10 w-10 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Upload Your Resume</h3>
                          <p className="text-muted-foreground">
                            This step is optional, but having a resume can significantly improve your chances
                          </p>
                        </div>
                        
                        <div className="max-w-md mx-auto">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                handleResumeUpload(file)
                              }
                            }}
                            className="hidden"
                            id="resume-upload"
                            disabled={resumeUpload.isUploading}
                          />
                          <label htmlFor="resume-upload">
                            <Button 
                              asChild
                              className="w-full cursor-pointer bg-gradient-to-r from-primary to-blue-600"
                              disabled={resumeUpload.isUploading}
                            >
                              <div>
                                <Upload className="h-4 w-4 mr-2" />
                                Choose Resume File
                              </div>
                            </Button>
                          </label>
                          <p className="text-xs text-muted-foreground mt-2">
                            Supported formats: PDF, DOC, DOCX (Max 10MB)
                          </p>
                        </div>
                      </div>
                    )}

                    {resumeUpload.isUploading && (
                      <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Uploading Resume...</h3>
                          <p className="text-muted-foreground">
                            {resumeUpload.file?.name}
                          </p>
                        </div>
                        <div className="max-w-md mx-auto">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-500"
                              style={{ width: `${resumeUpload.progress}%` }}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {resumeUpload.progress}% complete
                          </p>
                        </div>
                      </div>
                    )}

                    {resumeUpload.success && (
                      <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-green-700">Resume Uploaded Successfully!</h3>
                          <p className="text-muted-foreground">
                            {resumeUpload.file?.name}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setResumeUpload({
                              file: null,
                              isUploading: false,
                              progress: 0,
                              error: null,
                              success: false,
                            })
                          }}
                        >
                          Upload Another Resume
                        </Button>
                      </div>
                    )}

                    {resumeUpload.error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{resumeUpload.error}</AlertDescription>
                      </Alert>
                    )}

                    {!resumeUpload.success && !resumeUpload.isUploading && (
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                          You can also upload your resume later from your profile.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between pt-6">
                  <div className="flex gap-2">
                    {currentStep > 1 && (
                      <Button variant="outline" onClick={prevStep}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                    )}
                    <Button variant="ghost" onClick={handleSkip}>
                      Skip Setup
                    </Button>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={!canProceed || isSubmitting}
                    className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Setting up...
                      </>
                    ) : currentStep === steps.length ? (
                      "Complete Setup"
                    ) : (
                      <>
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}