"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Clock, Building, ArrowLeft, CheckCircle, Upload, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { api, Job, Resume } from "@/lib/api"
import { toast } from "sonner"
import { formatRelativeTime } from "@/lib/profile-utils"
import { Label } from "@/components/ui/label"

export default function JobApplicationPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [coverLetter, setCoverLetter] = useState("")
  const [selectedResumeId, setSelectedResumeId] = useState("")
  const [resumes, setResumes] = useState<Resume[]>([])
  const [isFetchingResumes, setIsFetchingResumes] = useState(true)
  const [hasApplied, setHasApplied] = useState(false)
  const [userApplication, setUserApplication] = useState<any>(null)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (user.role !== 'JOBSEEKER') {
      toast.error('Only job seekers can apply for jobs.')
      router.push('/dashboard')
      return
    }

    const fetchJobAndResumes = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Fetch job details
        const jobResponse = await api.getJob(params.id)
        if (!jobResponse.success || !jobResponse.data) {
          setError(jobResponse.error || 'Job not found.')
          return
        }

        setJob(jobResponse.data)

        // Check if user has already applied
        if (jobResponse.data.userApplication) {
          setHasApplied(true)
          setUserApplication(jobResponse.data.userApplication)
        }

        // Fetch user's resumes
        setIsFetchingResumes(true)
        const resumesResponse = await api.getResumes()
        if (resumesResponse.success && resumesResponse.data) {
          setResumes(resumesResponse.data)
        }
        setIsFetchingResumes(false)

      } catch (err) {
        console.error('Error fetching data:', err)
        setError('An error occurred while loading job details.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobAndResumes()
  }, [params.id, user, router])

  const handleSubmitApplication = async () => {
    if (!selectedResumeId) {
      toast.error("Please select a resume to apply.")
      return
    }

    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const idempotencyKey = `${job!.id}-${selectedResumeId}-${Date.now()}`
      
      const response = await api.applyToJob(job!.id, {
        resumeId: selectedResumeId,
        coverLetter: coverLetter || undefined,
      }, idempotencyKey)

      if (response.success) {
        toast.success("Application submitted successfully!")
        router.push('/dashboard/applications')
      } else {
        toast.error(response.error || "Failed to submit application.")
      }
    } catch (err) {
      console.error('Application error:', err)
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatSalary = (salaryAmount: number) => {
    if (salaryAmount) {
      return `RWF ${salaryAmount.toLocaleString()}`;
    }
    return 'Not Disclosed';
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-2xl font-bold">Job Not Found</h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <Button asChild className="mt-6">
            <Link href="/jobs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (hasApplied) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/jobs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Application Already Submitted</h1>
            <p className="text-muted-foreground mb-4">
              You have already applied for this position on{" "}
              {new Date(userApplication.appliedAt || userApplication.createdAt).toLocaleDateString()}
            </p>
            <div className="space-x-4">
              <Button asChild>
                <Link href="/dashboard/applications">View My Applications</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/jobs">Browse More Jobs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/jobs/${job.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Job Details
            </Link>
          </Button>
        </div>

        {/* Job Summary */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold">{job.title}</h1>
                <div className="flex items-center gap-4 text-muted-foreground mt-2">
                  <div className="flex items-center gap-1.5">
                    <Building className="h-4 w-4" /> {job.employer?.name || 'Unknown Company'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> {job.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> {formatRelativeTime(job.postedAt || job.createdAt)}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Badge variant="outline">{job.jobType.replace('_', '-')}</Badge>
                {job.remote && <Badge variant="outline" className="text-green-600 border-green-600">Remote</Badge>}
                <div className="text-lg font-semibold text-primary">
                  {formatSalary(job.salaryAmount)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submit Your Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Resume Selection */}
            <div>
              <Label htmlFor="resume" className="mb-2 block">Select Resume *</Label>
              {isFetchingResumes ? (
                <div className="flex items-center justify-center h-24">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : resumes.length > 0 ? (
                <>
                  <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                    <SelectTrigger id="resume">
                      <SelectValue placeholder="Choose a resume" />
                    </SelectTrigger>
                    <SelectContent>
                      {resumes.map((resume) => (
                        <SelectItem key={resume.id} value={resume.id}>
                          {resume.fileName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="sm" className="mt-2" asChild>
                    <Link href="/dashboard/resumes">
                      <Upload className="h-4 w-4 mr-2" />
                      Manage Resumes
                    </Link>
                  </Button>
                </>
              ) : (
                <div className="text-center p-6 border-2 border-dashed rounded-lg">
                  <p className="text-sm text-muted-foreground mb-4">You have no resumes uploaded.</p>
                  <Button asChild>
                    <Link href="/dashboard/resumes">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Your First Resume
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Cover Letter */}
            <div>
              <Label htmlFor="coverLetter" className="mb-2 block">Cover Letter (Optional)</Label>
              <Textarea
                id="coverLetter"
                placeholder="Tell the employer why you're interested in this role and how your skills match their requirements..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                A well-written cover letter can help you stand out from other applicants.
              </p>
            </div>


            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleSubmitApplication}
                disabled={!selectedResumeId || isSubmitting}
                size="lg"
                className="flex-1"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href={`/jobs/${job.id}`}>Cancel</Link>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              By submitting this application, you agree to share your resume and cover letter with {job.employer?.name || 'the employer'}.
            </p>
          </CardContent>
        </Card>
    </div>
  )
}
