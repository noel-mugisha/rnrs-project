"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination"
import { Search, Calendar, MapPin, Building, Clock, Eye, User, Mail, Phone, FileText, CheckCircle, X, Loader2, AlertCircle, Download, ExternalLink, RefreshCw } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { api, Application, Job } from "@/lib/api"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

// Custom hook for debouncing input
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  return debouncedValue
}

// Status mapping
const statusMapping = {
  APPLIED: { label: "Applied", color: "bg-gray-500", textColor: "text-gray-700", bgColor: "bg-gray-100" },
  VIEWED: { label: "Under Review", color: "bg-blue-500", textColor: "text-blue-700", bgColor: "bg-blue-100" },
  SHORTLISTED: { label: "Shortlisted", color: "bg-yellow-500", textColor: "text-yellow-700", bgColor: "bg-yellow-100" },
  INTERVIEW_SCHEDULED: { label: "Interview Scheduled", color: "bg-green-500", textColor: "text-green-700", bgColor: "bg-green-100" },
  OFFERED: { label: "Offered", color: "bg-purple-500", textColor: "text-purple-700", bgColor: "bg-purple-100" },
  HIRED: { label: "Hired", color: "bg-emerald-500", textColor: "text-emerald-700", bgColor: "bg-emerald-100" },
  REJECTED: { label: "Rejected", color: "bg-red-500", textColor: "text-red-700", bgColor: "bg-red-100" },
}

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "APPLIED", label: "Applied" },
  { value: "VIEWED", label: "Under Review" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "INTERVIEW_SCHEDULED", label: "Interview Scheduled" },
  { value: "OFFERED", label: "Offered" },
  { value: "HIRED", label: "Hired" },
  { value: "REJECTED", label: "Rejected" },
]

const statusTransitions = {
  APPLIED: ['VIEWED', 'REJECTED'],
  VIEWED: ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED: ['INTERVIEW_SCHEDULED', 'REJECTED'],
  INTERVIEW_SCHEDULED: ['OFFERED', 'REJECTED'],
  OFFERED: ['HIRED', 'REJECTED'],
  HIRED: [],
  REJECTED: [],
}

function ApplicationsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-80" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-12 w-24 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-48" />
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    </div>
  )
}

function ApplicationDetailsDialog({ application, onStatusUpdate }: { 
  application: Application, 
  onStatusUpdate: (applicationId: string, newStatus: string) => void 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState(application.status)
  const [note, setNote] = useState("")
  const [isDownloadingResume, setIsDownloadingResume] = useState(false)

  const handleStatusUpdate = async () => {
    if (newStatus === application.status) {
      setIsOpen(false)
      return
    }

    setIsUpdating(true)
    try {
      const response = await api.updateApplicationStatus(application.id, newStatus, note || undefined)
      if (response.success) {
        toast.success(`Application status updated to ${statusMapping[newStatus as keyof typeof statusMapping].label}`)
        onStatusUpdate(application.id, newStatus)
        setIsOpen(false)
      } else {
        toast.error(response.error || "Failed to update status")
      }
    } catch (err) {
      toast.error("An error occurred while updating the status")
    } finally {
      setIsUpdating(false)
    }
  }

  const availableTransitions = statusTransitions[application.status as keyof typeof statusTransitions] || []

  const handleResumeDownload = async () => {
    if (!application.resume?.id) {
      toast.error("Resume not available")
      return
    }

    setIsDownloadingResume(true)
    try {
      const response = await api.viewResumeForEmployer(application.resume.id)
      if (response.success && response.data?.downloadUrl) {
        // Open in new tab for download
        window.open(response.data.downloadUrl, '_blank')
      } else {
        toast.error("Failed to generate download URL")
      }
    } catch (err) {
      toast.error("An error occurred while downloading the resume")
    } finally {
      setIsDownloadingResume(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Candidate Information */}
          <div>
            <h3 className="font-semibold mb-3">Candidate Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{application.jobSeeker?.user.firstName} {application.jobSeeker?.user.lastName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{application.jobSeeker?.user.email}</span>
              </div>
              {application.jobSeeker?.user.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{application.jobSeeker.user.phone}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Job Information */}
          <div>
            <h3 className="font-semibold mb-3">Job Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{application.job.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{application.job.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Cover Letter */}
          {application.coverLetter && (
            <>
              <div>
                <h3 className="font-semibold mb-3">Cover Letter</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm leading-relaxed">{application.coverLetter}</p>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Resume */}
          {application.resume && (
            <>
              <div>
                <h3 className="font-semibold mb-3">Resume</h3>
                <div className="flex items-center gap-2 p-4 border rounded-lg">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="flex-1">{application.resume.fileName}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleResumeDownload}
                    disabled={isDownloadingResume}
                  >
                    {isDownloadingResume ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {isDownloadingResume ? "Loading..." : "Download"}
                  </Button>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Status Update */}
          <div>
            <h3 className="font-semibold mb-3">Update Status</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Current Status:</span>
                <Badge className={statusMapping[application.status as keyof typeof statusMapping].bgColor + " " + statusMapping[application.status as keyof typeof statusMapping].textColor}>
                  {statusMapping[application.status as keyof typeof statusMapping].label}
                </Badge>
              </div>
              
              {availableTransitions.length > 0 && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="status">New Status</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={application.status}>
                          {statusMapping[application.status as keyof typeof statusMapping].label} (Current)
                        </SelectItem>
                        {availableTransitions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {statusMapping[status as keyof typeof statusMapping].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="note">Note (Optional)</Label>
                    <Textarea
                      id="note"
                      placeholder="Add a note about this status change..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleStatusUpdate} 
                    disabled={isUpdating}
                    className="w-full"
                  >
                    {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Update Status
                  </Button>
                </div>
              )}
              
              {availableTransitions.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No status changes available for this application.
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function EmployerApplicationsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  
  const [applications, setApplications] = useState<Application[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [jobFilter, setJobFilter] = useState("all")
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 })
  
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Check if user is authorized
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'JOBPROVIDER') {
      router.push('/auth/login')
      return
    }
  }, [isAuthenticated, user, router])

  const loadApplications = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'JOBPROVIDER') return
    
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.getEmployerApplications({
        q: debouncedSearchQuery || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        jobId: jobFilter === "all" ? undefined : jobFilter,
        page: pagination.page,
        limit: pagination.limit,
        sortBy: 'appliedAt',
        sortOrder: 'desc'
      })
      
      if (response.success && response.data) {
        setApplications(response.data.applications || [])
        setPagination(response.data.pagination)
      } else {
        setError("Failed to load applications")
        toast.error("Failed to load applications.")
      }
    } catch (err) {
      setError("An error occurred while loading applications")
      toast.error("An error occurred while loading applications.")
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearchQuery, statusFilter, jobFilter, pagination.page, pagination.limit, isAuthenticated, user])

  const loadJobs = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'JOBPROVIDER') return
    
    try {
      const response = await api.getMyJobs({ limit: 100 })
      if (response.success && response.data) {
        setJobs(response.data.jobs || [])
      }
    } catch (err) {
      console.error('Failed to load jobs:', err)
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'JOBPROVIDER') {
      loadApplications()
      loadJobs()
    }
  }, [loadApplications, loadJobs])

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [debouncedSearchQuery, statusFilter, jobFilter])

  const handleStatusUpdate = useCallback((applicationId: string, newStatus: string) => {
    setApplications(prev => prev.map(app => 
      app.id === applicationId 
        ? { ...app, status: newStatus as any, updatedAt: new Date().toISOString() }
        : app
    ))
  }, [])

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    if (diffInDays < 1) return "Today"
    if (diffInDays < 7) return `${diffInDays} day(s) ago`
    return `${Math.floor(diffInDays / 7)} week(s) ago`
  }

  // Count applications by status
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (!isAuthenticated || user?.role !== 'JOBPROVIDER') {
    return null
  }

  if (isLoading && applications.length === 0) {
    return <ApplicationsSkeleton />
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manage Applications</h1>
            <p className="text-muted-foreground mt-1">
              Review and manage job applications for your posted positions
            </p>
          </div>
          <Button onClick={loadApplications} variant="outline" size="sm" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Status Overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {statusOptions.slice(1).map((status) => {
            const statusKey = status.value as keyof typeof statusMapping
            const count = statusCounts[statusKey] || 0
            const statusInfo = statusMapping[statusKey]
            return (
              <Card key={status.value} className="cursor-pointer transition-all hover:shadow-md" onClick={() => setStatusFilter(status.value)}>
                <CardContent className="p-4 text-center">
                  <div className={`w-3 h-3 rounded-full ${statusInfo.color} mx-auto mb-2`} />
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs text-muted-foreground">{status.label}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by candidate name, email, or job title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={jobFilter} onValueChange={setJobFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Jobs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Applications List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)
        ) : error ? (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load applications</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadApplications}>Try Again</Button>
            </CardContent>
          </Card>
        ) : applications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">No applications found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== "all" || jobFilter !== "all"
                      ? "Try adjusting your search criteria"
                      : "You haven't received any job applications yet."}
                  </p>
                  <Button asChild>
                    <Link href="/employer/jobs">Post a Job</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          applications.map((application, index) => {
            const statusInfo = statusMapping[application.status] || {
              label: application.status,
              color: "bg-gray-500",
              textColor: "text-gray-700",
              bgColor: "bg-gray-100",
            }
            return (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">
                              {application.jobSeeker?.user.firstName} {application.jobSeeker?.user.lastName}
                            </h3>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
                          <Badge className={statusInfo.bgColor + " " + statusInfo.textColor}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {application.job.title}
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {application.jobSeeker?.user.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Applied {new Date(application.appliedAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Updated {getTimeAgo(application.updatedAt)}
                          </div>
                        </div>
                        
                        {application.coverLetter && (
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-sm line-clamp-2 leading-relaxed">
                              <span className="font-medium">Cover Letter: </span>
                              {application.coverLetter}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <ApplicationDetailsDialog 
                          application={application}
                          onStatusUpdate={handleStatusUpdate}
                        />
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/jobs/${application.job.id}`}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Job
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })
        )}
      </motion.div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))
                }}
                className={pagination.page === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="text-sm p-2">
                Page {pagination.page} of {pagination.pages} ({pagination.total} applications)
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setPagination((p) => ({ ...p, page: Math.min(p.pages, p.page + 1) }))
                }}
                className={pagination.page === pagination.pages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}