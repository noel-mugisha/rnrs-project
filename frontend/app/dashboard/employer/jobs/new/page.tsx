"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Briefcase,
  MapPin,
  DollarSign,
  FileText,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  AlertCircle,
  Sparkles,
  Info,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { api, type WorkCategory } from "@/lib/api"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

interface JobFormData {
  workCategory: string
  workType: string
  title: string
  description: string
  requirements: string
  location: string
  salaryAmount: string
  remote: boolean
  jobType: string
  experienceLevel: string
}

const JOB_TYPES = [
  { value: "FULLTIME", label: "Full Time" },
  { value: "PARTTIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
]

const EXPERIENCE_LEVELS = [
  { value: "ENTRY", label: "Entry Level" },
  { value: "MID", label: "Mid Level" },
  { value: "SENIOR", label: "Senior Level" },
  { value: "LEAD", label: "Lead" },
  { value: "EXECUTIVE", label: "Executive" },
]

export default function NewJobPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [categories, setCategories] = useState<WorkCategory[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<JobFormData>({
    workCategory: "",
    workType: "",
    title: "",
    description: "",
    requirements: "",
    location: "",
    salaryAmount: "",
    remote: false,
    jobType: "FULLTIME",
    experienceLevel: "ENTRY",
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setIsLoadingCategories(true)
    const response = await api.getWorkCategories()
    if (response.success && response.data) {
      setCategories(response.data)
    } else {
      toast.error("Failed to load work categories")
    }
    setIsLoadingCategories(false)
  }

  const handleInputChange = (field: keyof JobFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const selectedWorks = categories.find(c => c.category === formData.workCategory)?.works || []

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.workCategory || !formData.workType) {
          setError("Please select both category and work type")
          return false
        }
        return true
      case 2:
        if (!formData.title.trim() || formData.title.length < 3) {
          setError("Please enter a valid job title (at least 3 characters)")
          return false
        }
        if (!formData.description.trim() || formData.description.length < 50) {
          setError("Please enter a detailed description (at least 50 characters)")
          return false
        }
        if (!formData.requirements.trim() || formData.requirements.length < 10) {
          setError("Please enter requirements (at least 10 characters)")
          return false
        }
        return true
      case 3:
        if (!formData.location.trim()) {
          setError("Please enter a location")
          return false
        }
        if (!formData.salaryAmount || parseInt(formData.salaryAmount) <= 0) {
          setError("Please enter a valid salary amount")
          return false
        }
        return true
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
      setError(null)
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setError(null)
  }

  const handleSubmit = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!validateStep(3)) return

    setIsSubmitting(true)
    setError(null)

    try {
      const jobData = {
        workCategory: formData.workCategory,
        workType: formData.workType,
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        location: formData.location,
        salaryAmount: parseInt(formData.salaryAmount),
        remote: formData.remote,
        jobType: formData.jobType,
        experienceLevel: formData.experienceLevel,
        status,
      }

      const response = await api.createJob(jobData)

      if (response.success) {
        toast.success(
          status === 'PUBLISHED' 
            ? "Job posted successfully!" 
            : "Job saved as draft!"
        )
        router.push("/dashboard/employer/jobs")
      } else {
        setError(response.error || "Failed to create job")
        toast.error(response.error || "Failed to create job")
      }
    } catch (err) {
      console.error("Job creation error:", err)
      setError("An unexpected error occurred")
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user || user.role !== 'JOBPROVIDER' || !user.employerProfile) {
    router.push('/dashboard/employer/setup')
    return null
  }

  const progress = (currentStep / 4) * 100

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Post a New Job
          </h1>
          <p className="text-muted-foreground">
            Fill in the details to create your job posting
          </p>
        </div>
      </motion.div>

      {/* Progress */}
      <Card className="bg-gradient-to-r from-primary/5 to-blue-500/5">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Step {currentStep} of 4</span>
              <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="grid grid-cols-4 gap-2">
              {['Category', 'Details', 'Compensation', 'Review'].map((step, index) => (
                <div
                  key={step}
                  className={`text-center text-xs ${
                    index + 1 <= currentStep ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Category Selection */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Select Job Category
                </CardTitle>
                <CardDescription>
                  Choose the category and specific work type for this position
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoadingCategories ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="workCategory">Work Category *</Label>
                      <Select
                        value={formData.workCategory}
                        onValueChange={(value) => {
                          handleInputChange("workCategory", value)
                          handleInputChange("workType", "")
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.category} value={cat.category}>
                              {cat.category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Select the main category for this job
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workType">Specific Work Type *</Label>
                      <Select
                        value={formData.workType}
                        onValueChange={(value) => handleInputChange("workType", value)}
                        disabled={!formData.workCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={formData.workCategory ? "Select work type" : "First select a category"} />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedWorks.map((work) => (
                            <SelectItem key={work} value={work}>
                              {work}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Select the specific type of work within the category
                      </p>
                    </div>

                    {formData.workCategory && formData.workType && (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          Selected: <strong>{formData.workCategory}</strong> → <strong>{formData.workType}</strong>
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Job Details */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Job Details
                </CardTitle>
                <CardDescription>
                  Provide detailed information about the position
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Senior Software Engineer"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide a clear and descriptive job title
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Minimum 50 characters
                    </span>
                    <span className={formData.description.length >= 50 ? "text-green-600" : "text-muted-foreground"}>
                      {formData.description.length} / 50
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements *</Label>
                  <Textarea
                    id="requirements"
                    placeholder="List the qualifications, skills, and experience needed for this role..."
                    value={formData.requirements}
                    onChange={(e) => handleInputChange("requirements", e.target.value)}
                    rows={5}
                    className="resize-none"
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Minimum 10 characters
                    </span>
                    <span className={formData.requirements.length >= 10 ? "text-green-600" : "text-muted-foreground"}>
                      {formData.requirements.length} / 10
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Compensation & Location */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Compensation & Location
                </CardTitle>
                <CardDescription>
                  Set salary and work location details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="e.g., Kigali, Rwanda"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salaryAmount">Salary (RWF) *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-sm text-muted-foreground">RWF</span>
                      <Input
                        id="salaryAmount"
                        type="number"
                        placeholder="500000"
                        value={formData.salaryAmount}
                        onChange={(e) => handleInputChange("salaryAmount", e.target.value)}
                        className="pl-14"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter monthly salary in Rwandan Francs
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remote"
                    checked={formData.remote}
                    onCheckedChange={(checked) => handleInputChange("remote", checked)}
                  />
                  <label
                    htmlFor="remote"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remote work available
                  </label>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="jobType">Job Type</Label>
                    <Select
                      value={formData.jobType}
                      onValueChange={(value) => handleInputChange("jobType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experienceLevel">Experience Level</Label>
                    <Select
                      value={formData.experienceLevel}
                      onValueChange={(value) => handleInputChange("experienceLevel", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPERIENCE_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Review Your Job Posting
                </CardTitle>
                <CardDescription>
                  Make sure everything looks good before publishing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Category</h3>
                    <div className="flex gap-2">
                      <Badge variant="outline">{formData.workCategory}</Badge>
                      <Badge>{formData.workType}</Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Job Title</h3>
                    <p className="text-lg">{formData.title}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {formData.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Requirements</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {formData.requirements}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Location</h3>
                      <p className="text-sm flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {formData.location}
                        {formData.remote && <Badge variant="secondary" className="ml-2">Remote</Badge>}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Salary</h3>
                      <p className="text-sm flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        RWF {parseInt(formData.salaryAmount).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Job Type</h3>
                      <Badge variant="outline">
                        {JOB_TYPES.find(t => t.value === formData.jobType)?.label}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Experience Level</h3>
                      <Badge variant="outline">
                        {EXPERIENCE_LEVELS.find(l => l.value === formData.experienceLevel)?.label}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    You can save this as a draft or publish it immediately. Published jobs will be visible to all job seekers.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {currentStep === 4 ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleSubmit('DRAFT')}
                    disabled={isSubmitting}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save as Draft
                  </Button>
                  <Button
                    onClick={() => handleSubmit('PUBLISHED')}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-primary to-blue-600"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Publish Job
                  </Button>
                </>
              ) : (
                <Button onClick={nextStep}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
