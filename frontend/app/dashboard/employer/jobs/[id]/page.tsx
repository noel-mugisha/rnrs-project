"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
  Building2,
  Globe,
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { api, type Job } from "@/lib/api"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

const STATUS_COLORS = {
  PUBLISHED: "default",
  DRAFT: "secondary",
  CLOSED: "outline",
  ARCHIVED: "destructive",
} as const

const STATUS_ICONS = {
  PUBLISHED: CheckCircle2,
  DRAFT: Clock,
  CLOSED: XCircle,
  ARCHIVED: Trash2,
}

export default function JobDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const jobId = params?.id as string

  useEffect(() => {
    if (user?.role === 'JOBPROVIDER' && user.employerProfile && jobId) {
      loadJob()
    }
  }, [user, jobId])

  const loadJob = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('Loading job with ID:', jobId)
      const response = await api.getMyJob(jobId)
      console.log('Job response:', response)

      if (response.success && response.data) {
        setJob(response.data)
        console.log('Loaded job:', response.data)
      } else {
        console.error('Failed to load job:', response.error)
        setError(response.error || "Failed to load job")
      }
    } catch (err) {
      console.error("Error loading job:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteJob = async () => {
    if (!job || !confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      return
    }

    try {
      const response = await api.deleteJob(job.id)
      if (response.success) {
        toast.success("Job deleted successfully")
        router.push('/dashboard/employer/jobs')
      } else {
        toast.error(response.error || "Failed to delete job")
      }
    } catch (err) {
      toast.error("An error occurred while deleting the job")
    }
  }

  const handlePublishJob = async () => {
    if (!job) return

    try {
      const response = await api.publishJob(job.id)
      if (response.success) {
        toast.success("Job published successfully")
        loadJob() // Reload to get updated status
      } else {
        toast.error(response.error || "Failed to publish job")
      }
    } catch (err) {
      toast.error("An error occurred while publishing the job")
    }
  }

  if (!user || user.role !== 'JOBPROVIDER' || !user.employerProfile) {
    router.push('/dashboard/employer/setup')
    return null
  }

  if (isLoading) {
    return (
      <div className="space-y-6 pb-10">
        <Skeleton className="h-12 w-3/4" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 pb-10">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/employer/jobs')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="space-y-6 pb-10">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/employer/jobs')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Job not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  const StatusIcon = STATUS_ICONS[job.status as keyof typeof STATUS_ICONS]

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/employer/jobs')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                {job.title}
              </h1>
              <Badge variant={STATUS_COLORS[job.status as keyof typeof STATUS_COLORS]}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {job.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Badge variant="outline">{job.workCategory}</Badge>
              <Badge variant="secondary">{job.workType}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            {job.status === 'DRAFT' && (
              <Button onClick={handlePublishJob} className="bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Publish
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href={`/dashboard/employer/jobs/${job.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteJob}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Job Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{job.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{job.requirements}</p>
              </div>
            </CardContent>
          </Card>

          {job.responsibilities && job.responsibilities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {job.responsibilities.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{job.location}</p>
                  {job.remote && (
                    <Badge variant="secondary" className="mt-1">Remote</Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Salary</p>
                  <p className="text-sm text-muted-foreground">
                    RWF {job.salaryAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Job Type</p>
                  <p className="text-sm text-muted-foreground">{job.jobType || 'Not specified'}</p>
                </div>
              </div>

              {job.experienceLevel && (
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Experience Level</p>
                    <p className="text-sm text-muted-foreground">{job.experienceLevel}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Posted</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {job.postedAt && (
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Published</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(job.postedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Applications</CardTitle>
              <CardDescription>View applicants for this position</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{job._count?.applications || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Applicants</p>
                  </div>
                </div>
              </div>
              {job.status === 'PUBLISHED' && (
                <Button asChild className="w-full mt-4">
                  <Link href={`/dashboard/employer/jobs/${job.id}/applicants`}>
                    View Applicants
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
