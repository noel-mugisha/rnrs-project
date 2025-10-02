"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Building2,
  Globe,
  MapPin,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { api, type WorkCategory } from "@/lib/api"
import { toast } from "sonner"

interface FormData {
  name: string
  website: string
  industry: string
  location: string
}

const steps = [
  {
    id: 1,
    title: "Company Name",
    description: "What's the name of your company?",
    icon: Building2,
    field: "name",
  },
  {
    id: 2,
    title: "Company Website",
    description: "Do you have a company website?",
    icon: Globe,
    field: "website",
  },
  {
    id: 3,
    title: "Industry",
    description: "What industry does your company operate in?",
    icon: Briefcase,
    field: "industry",
  },
  {
    id: 4,
    title: "Location",
    description: "Where is your company located?",
    icon: MapPin,
    field: "location",
  },
]

export default function EmployerSetupPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [workCategories, setWorkCategories] = useState<WorkCategory[]>([])
  const [formData, setFormData] = useState<FormData>({
    name: "",
    website: "",
    industry: "",
    location: "",
  })

  // Load work categories for industry dropdown
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.getWorkCategories()
        if (response.success && response.data) {
          setWorkCategories(response.data)
        }
      } catch (err) {
        console.error("Failed to load categories:", err)
      }
    }
    loadCategories()
  }, [])

  // Check if user already has employer profile
  useEffect(() => {
    if (user?.employerProfile) {
      router.push("/dashboard/employer")
    }
  }, [user, router])

  const currentStepData = steps.find(s => s.id === currentStep)
  const progress = (currentStep / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
      setError(null)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError(null)
    }
  }

  const handleSkip = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
      setError(null)
    } else {
      handleSubmit()
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async () => {
    // At least company name should be provided
    if (!formData.name.trim()) {
      setError("Company name is required to complete setup")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Prepare data - only send filled fields
      const dataToSubmit: any = { name: formData.name.trim() }
      
      if (formData.website.trim()) {
        dataToSubmit.website = formData.website.trim()
      }
      if (formData.industry.trim()) {
        dataToSubmit.industry = formData.industry.trim()
      }
      if (formData.location.trim()) {
        dataToSubmit.location = formData.location.trim()
      }

      const response = await api.createEmployer(dataToSubmit)

      if (response.success) {
        await refreshUser()
        toast.success("🎉 Employer profile created successfully!")
        router.push("/dashboard/employer")
      } else {
        setError(response.error || "Failed to create employer profile")
      }
    } catch (err: any) {
      console.error("Employer setup error:", err)
      setError(err.message || "An error occurred during setup")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || user.role !== "JOBPROVIDER") {
    return null
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary/5 via-blue-500/5 to-purple-500/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-2xl border-2">
          <CardHeader className="space-y-4 pb-8">
            <div className="flex items-center justify-center mb-2">
              <div className="w-16 h-16 bg-gradient-to-br from-primary via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Complete Your Profile
              </CardTitle>
              <CardDescription className="text-base">
                Let's set up your employer profile to start posting jobs
              </CardDescription>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-muted-foreground">
                  Step {currentStep} of {steps.length}
                </span>
                <span className="font-semibold text-primary">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Steps Indicator */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      step.id < currentStep
                        ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white"
                        : step.id === currentStep
                        ? "bg-gradient-to-br from-primary to-blue-600 text-white ring-4 ring-primary/20"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {step.id < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="font-semibold">{step.id}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded transition-all duration-300 ${
                        step.id < currentStep ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <AnimatePresence mode="wait">
              {currentStepData && (
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Step Header */}
                  <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-xl border-2 border-dashed border-primary/20">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <currentStepData.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        {currentStepData.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {currentStepData.description}
                      </p>
                    </div>
                  </div>

                  {/* Input Field */}
                  <div className="space-y-3">
                    {currentStepData.field === "industry" ? (
                      <>
                        <Label htmlFor="industry" className="text-base font-semibold">
                          Select Industry {currentStep < steps.length && "(Optional)"}
                        </Label>
                        <Select
                          value={formData.industry}
                          onValueChange={(value) => handleInputChange("industry", value)}
                        >
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Choose your industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {workCategories.map((category) => (
                              <SelectItem key={category.category} value={category.category}>
                                {category.category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    ) : (
                      <>
                        <Label htmlFor={currentStepData.field} className="text-base font-semibold">
                          {currentStepData.title} {currentStep > 1 && "(Optional)"}
                        </Label>
                        <Input
                          id={currentStepData.field}
                          type={currentStepData.field === "website" ? "url" : "text"}
                          value={formData[currentStepData.field as keyof FormData]}
                          onChange={(e) => handleInputChange(currentStepData.field, e.target.value)}
                          placeholder={
                            currentStepData.field === "name"
                              ? "e.g., Tech Solutions Inc."
                              : currentStepData.field === "website"
                              ? "e.g., https://yourcompany.com"
                              : currentStepData.field === "location"
                              ? "e.g., Kigali, Rwanda"
                              : ""
                          }
                          className="h-12 text-base"
                          autoFocus
                        />
                      </>
                    )}
                    
                    {currentStep === 1 && (
                      <p className="text-xs text-muted-foreground">
                        This will be displayed on all your job postings
                      </p>
                    )}
                  </div>

                  {/* Tips */}
                  {currentStep === 1 && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-blue-900">Quick Tip</p>
                          <p className="text-xs text-blue-700">
                            Use your official company name. This helps candidates find and trust your job postings.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>

          <CardFooter className="flex items-center justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isLoading}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="flex items-center gap-3">
              {currentStep < steps.length && (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  disabled={isLoading}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Skip
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                disabled={isLoading || (currentStep === 1 && !formData.name.trim())}
                className="gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : currentStep === steps.length ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Finish Setup
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Help Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-6"
        >
          You can update this information later in your profile settings
        </motion.p>
      </motion.div>
    </div>
  )
}
