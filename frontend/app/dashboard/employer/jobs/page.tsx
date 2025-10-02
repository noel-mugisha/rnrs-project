"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Briefcase,
  Plus,
  Search,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Edit,
  Eye,
  Trash2,
  MoreVertical,
  AlertCircle,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { api, type Job } from "@/lib/api"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Jobs" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Draft" },
  { value: "CLOSED", label: "Closed" },
]

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

export default function JobsManagementPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.role === 'JOBPROVIDER' && user.employerProfile) {
      loadJobs()
    }
  }, [user, statusFilter])

  const loadJobs = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params: any = { limit: 100 }
      if (statusFilter !== 'ALL') {
        params.status = statusFilter
      }

      const response = await api.getMyJobs(params)

      if (response.success && response.data) {
        setJobs(response.data.jobs || [])
      } else {
        setError(response.error || "Failed to load jobs")
      }
    } catch (err) {
      console.error("Error loading jobs:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      return
    }

    try {
      const response = await api.deleteJob(jobId)
      if (response.success) {
        toast.success("Job deleted successfully")
        loadJobs()
      } else {
        toast.error(response.error || "Failed to delete job")
      }
    } catch (err) {
      toast.error("An error occurred while deleting the job")
    }
  }

  const handlePublishJob = async (jobId: string) => {
    try {
      const response = await api.publishJob(jobId)
      if (response.success) {
        toast.success("Job published successfully")
        loadJobs()
      } else {
        toast.error(response.error || "Failed to publish job")
      }
    } catch (err) {
      toast.error("An error occurred while publishing the job")
    }
  }

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.workCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.workType.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!user || user.role !== 'JOBPROVIDER' || !user.employerProfile) {
    router.push('/dashboard/employer/setup')
    return null
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Manage Jobs
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage all your job postings
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-primary to-blue-600">
          <Link href="/dashboard/employer/jobs/new">
            <Plus className="mr-2 h-4 w-4" />
            Post New Job
          </Link>
        </Button>
      </motion.div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, category, or work type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Jobs List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {searchQuery || statusFilter !== 'ALL' ? 'No jobs found' : 'No jobs posted yet'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== 'ALL'
                    ? 'Try adjusting your filters or search query'
                    : 'Start attracting top talent by posting your first job'}
                </p>
                {!searchQuery && statusFilter === 'ALL' && (
                  <Button asChild className="bg-gradient-to-r from-primary to-blue-600">
                    <Link href="/dashboard/employer/jobs/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Post Your First Job
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job, index) => {
            const StatusIcon = STATUS_ICONS[job.status as keyof typeof STATUS_ICONS]
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* Title and Status */}
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Briefcase className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-lg">{job.title}</h3>
                              <Badge variant={STATUS_COLORS[job.status as keyof typeof STATUS_COLORS]}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {job.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {job.workCategory}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {job.workType}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Job Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-muted-foreground pl-15">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                            {job.remote && <Badge variant="secondary" className="text-xs">Remote</Badge>}
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span>RWF {job.salaryAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{job._count?.applications || 0} applicants</span>
                          </div>
                        </div>

                        {/* Meta Info */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground pl-15">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                          </div>
                          {job.postedAt && (
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                              <span>Live since {new Date(job.postedAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/employer/jobs/${job.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/employer/jobs/${job.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Job
                            </Link>
                          </DropdownMenuItem>
                          {job.status === 'DRAFT' && (
                            <DropdownMenuItem onClick={() => handlePublishJob(job.id)}>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Publish Job
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDeleteJob(job.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Job
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Stats Summary */}
      {!isLoading && filteredJobs.length > 0 && (
        <Card className="bg-gradient-to-r from-primary/5 to-blue-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
              </span>
              <div className="flex gap-4">
                <span className="text-muted-foreground">
                  {jobs.filter(j => j.status === 'PUBLISHED').length} Published
                </span>
                <span className="text-muted-foreground">
                  {jobs.filter(j => j.status === 'DRAFT').length} Draft
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
