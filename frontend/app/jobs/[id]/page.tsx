"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/layout/header"
import { MapPin, Clock, DollarSign, Building, Users, Calendar, ArrowLeft, CheckCircle, Upload, AlertCircle, Share2, Heart, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { api, Job, Resume } from "@/lib/api"
import { toast } from "sonner"
import { formatRelativeTime } from "@/lib/profile-utils"
import { Label } from "@/components/ui/label"

function ApplyDialog({ job, onApplySuccess, hasApplied }: { job: Job, onApplySuccess: () => void, hasApplied?: boolean }) {
  const { user } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [selectedResumeId, setSelectedResumeId] = useState("")
  const [resumes, setResumes] = useState<Resume[]>([])
  const [isFetchingResumes, setIsFetchingResumes] = useState(true)

  useEffect(() => {
    if (isOpen && user) {
      const fetchResumes = async () => {
        setIsFetchingResumes(true)
        const response = await api.getResumes()
        if (response.success && response.data) {
          setResumes(response.data)
        }
        setIsFetchingResumes(false)
      }
      fetchResumes()
    }
  }, [isOpen, user])

  const handleApply = async () => {
    if (!selectedResumeId) {
      toast.error("Please select a resume to apply.")
      return
    }

    setIsLoading(true)
    try {
      const response = await api.applyToJob(job.id, {
        resumeId: selectedResumeId,
        coverLetter: coverLetter || undefined,
      })

      if (response.success) {
        toast.success("Application submitted successfully!")
        onApplySuccess()
        setIsOpen(false)
      } else {
        toast.error(response.error || "Failed to submit application.")
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (open && !user) {
      toast.info("Please sign in to apply for this job.", {
        action: {
          label: "Sign In",
          onClick: () => router.push('/auth/login'),
        },
      })
    } else {
      setIsOpen(open)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          size="lg" 
          className="w-full" 
          variant={hasApplied ? "outline" : "default"}
          disabled={hasApplied}
        >
          {hasApplied ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Application Submitted
            </>
          ) : (
            "Apply Now"
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Apply for {job.title}</DialogTitle>
          <DialogDescription>
            You are applying as {user?.firstName} {user?.lastName}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
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
              <div className="text-center p-4 border-2 border-dashed rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">You have no resumes uploaded.</p>
                <Button size="sm" asChild>
                  <Link href="/dashboard/resumes">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Your First Resume
                  </Link>
                </Button>
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="coverLetter" className="mb-2 block">Cover Letter (Optional)</Label>
            <Textarea
              id="coverLetter"
              placeholder="Tell the employer why you're interested in this role..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={4}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleApply}
              disabled={!selectedResumeId || isLoading}
              className="flex-1"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Application
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [applicationCount, setApplicationCount] = useState(0)
  const [hasApplied, setHasApplied] = useState(false)
  const [userApplication, setUserApplication] = useState<any>(null)

  useEffect(() => {
    const fetchJob = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await api.getJob(params.id)
        if (response.success && response.data) {
          setJob(response.data)
          setApplicationCount(response.data._count?.applications || 0)
          
          // Check if user has already applied (for authenticated jobseekers)
          if (response.data.userApplication) {
            setHasApplied(true)
            setUserApplication(response.data.userApplication)
          }
        } else {
          setError(response.error || 'Job not found.')
        }
      } catch (err) {
        setError('An error occurred while fetching job details.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchJob()
  }, [params.id])

  if (isLoading) {
    // This will be handled by the loading.tsx file, but kept as a fallback.
    return <div>Loading...</div>
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
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

  const formatSalary = (job: any) => {
    // Handle salaryRange object (new format from backend)
    if (job.salaryRange && job.salaryRange.min && job.salaryRange.currency) {
      if (job.salaryRange.min === job.salaryRange.max) {
        return `${job.salaryRange.currency} ${job.salaryRange.min.toLocaleString()}`
      }
      return `${job.salaryRange.currency} ${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()}`
    }
    // Handle direct salaryAmount (fallback)
    if (job.salaryAmount) {
      return `RWF ${job.salaryAmount.toLocaleString()}`
    }
    return 'Not Disclosed'
  }

  const getTimeDifference = (date: string | undefined): string => {
    if (!date) return "N/A"
    const now = new Date();
    const targetDate = new Date(date);
    const diffInMs = targetDate.getTime() - now.getTime();
    if (diffInMs < 0) return "Expired";
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''}`
  }


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/jobs" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to jobs
          </Link>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardContent className="p-8 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold">{job.title}</h1>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Building className="h-4 w-4" /> {job.employer.name}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" /> {job.location}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" /> {formatRelativeTime(job.postedAt || job.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon"><Share2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon"><Heart className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <Badge variant="outline" className="text-sm py-1 px-3">{job.jobType.replace('_', '-')}</Badge>
                  {job.remote && <Badge variant="outline" className="text-sm py-1 px-3 text-green-600 border-green-600">Remote</Badge>}
                  <div className="flex items-center gap-1.5 text-lg font-semibold text-primary">
                    <DollarSign className="h-5 w-5" /> {formatSalary(job)}
                  </div>
                </div>
                {job.requirements && (
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(job.requirements) 
                      ? job.requirements.slice(0, 5).map((skill, index) => (
                          <Badge key={index} variant="secondary">{skill}</Badge>
                        ))
                      : typeof job.requirements === 'string' && job.requirements.split(',').slice(0, 5).map((skill, index) => (
                          <Badge key={index} variant="secondary">{skill.trim()}</Badge>
                        ))
                    }
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><h2 className="text-xl font-semibold">Job Description</h2></CardHeader>
              <CardContent className="space-y-6 prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                <p>{job.description}</p>
                {job.responsibilities && job.responsibilities.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 text-foreground">Key Responsibilities</h3>
                    <ul className="space-y-2 pl-5 list-disc">
                      {Array.isArray(job.responsibilities) 
                        ? job.responsibilities.map((item, i) => <li key={i}>{item}</li>)
                        : typeof job.responsibilities === 'string' 
                          ? job.responsibilities.split(',').map((item, i) => <li key={i}>{item.trim()}</li>)
                          : null
                      }
                    </ul>
                  </div>
                )}
                {job.requirements && job.requirements.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 text-foreground">Requirements</h3>
                    <ul className="space-y-2 pl-5 list-disc">
                      {Array.isArray(job.requirements) 
                        ? job.requirements.map((item, i) => <li key={i}>{item}</li>)
                        : typeof job.requirements === 'string' 
                          ? job.requirements.split(',').map((item, i) => <li key={i}>{item.trim()}</li>)
                          : null
                      }
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><h2 className="text-xl font-semibold">About {job.employer.name}</h2></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Industry</div>
                    <div className="font-medium">{job.employer.industry || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Location</div>
                    <div className="font-medium">{job.employer.location || 'N/A'}</div>
                  </div>
                </div>
                <Separator />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  More detailed company information will be available soon.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-4">
                <ApplyDialog 
                  job={job} 
                  onApplySuccess={() => {
                    setApplicationCount(prev => prev + 1)
                    setHasApplied(true)
                  }}
                  hasApplied={hasApplied}
                />
                
                {hasApplied && userApplication && (
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-muted-foreground">Application Status:</span>
                      <Badge variant="secondary" className="text-xs">
                        {userApplication.status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Applied on {new Date(userApplication.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div className="text-center text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-1"><Users className="h-4 w-4" />{applicationCount} applicants</div>
                    <div className="flex items-center gap-1"><Calendar className="h-4 w-4" />{getTimeDifference(job.expiresAt)} left</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><h3 className="font-semibold">Job Details</h3></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Job Type</span><span className="font-medium">{job.jobType.replace('_', '-')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Experience Level</span><span className="font-medium">{job.experienceLevel}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Posted On</span><span className="font-medium">{new Date(job.postedAt || job.createdAt).toLocaleDateString()}</span></div>
                {job.expiresAt && <div className="flex justify-between"><span className="text-muted-foreground">Expires On</span><span className="font-medium">{new Date(job.expiresAt).toLocaleDateString()}</span></div>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}