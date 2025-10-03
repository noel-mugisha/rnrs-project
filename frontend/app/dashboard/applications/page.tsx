
"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination"
import { Search, Calendar, MapPin, Building, Clock, Eye, ExternalLink, RefreshCw, Loader2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { api, Application } from "@/lib/api"
import { toast } from "sonner"

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
  APPLIED: { label: "Applied", color: "bg-gray-500" },
  VIEWED: { label: "Under Review", color: "bg-blue-500" },
  SHORTLISTED: { label: "Shortlisted", color: "bg-yellow-500" },
  INTERVIEW_SCHEDULED: { label: "Interview Scheduled", color: "bg-green-500" },
  OFFERED: { label: "Offered", color: "bg-purple-500" },
  HIRED: { label: "Hired", color: "bg-emerald-500" },
  REJECTED: { label: "Rejected", color: "bg-red-500" },
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

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, pages: 1 })

  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const loadApplications = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.getMyApplications({
        q: debouncedSearchQuery || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        page: pagination.page,
        limit: pagination.limit,
      })
      if (response.success && response.data) {
        setApplications(response.data.applications || [])
        setPagination(response.data.pagination)
      } else {
        setError("Failed to load applications")
        toast.error("Failed to load applications.")
      }
    } catch (err) {
      setError("An error occurred while loading your applications")
      toast.error("An error occurred while loading your applications.")
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearchQuery, statusFilter, pagination.page, pagination.limit])

  useEffect(() => {
    loadApplications()
  }, [loadApplications])

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [debouncedSearchQuery, statusFilter])

  const formatSalary = (salaryRange: any) => {
    if (!salaryRange) return "Salary not disclosed"
    if (salaryRange.min && salaryRange.max) {
      return `$${salaryRange.min.toLocaleString()} - $${salaryRange.max.toLocaleString()}`
    }
    return "Salary not disclosed"
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    if (diffInDays < 1) return "Today"
    if (diffInDays < 7) return `${diffInDays} day(s) ago`
    return `${Math.floor(diffInDays / 7)} week(s) ago`
  }

  if (isLoading && applications.length === 0) {
    return <ApplicationsSkeleton />
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Applications</h1>
          <Button onClick={loadApplications} variant="outline" size="sm" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
        </div>
        <p className="text-muted-foreground mt-1">
          Track the status of your job applications and manage your opportunities
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by job title or company..."
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
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)
        ) : applications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">No applications found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== "all"
                      ? "Try adjusting your search criteria"
                      : "You haven't applied to any jobs yet."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          applications.map((application, index) => {
            const statusInfo = statusMapping[application.status] || {
              label: application.status,
              color: "bg-gray-500",
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
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{application.job.title}</h3>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
                            <Badge variant="secondary" className="text-xs">
                              {statusInfo.label}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {application.job.employer.name}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {application.job.location || "Remote"}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Applied {new Date(application.appliedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <Badge variant="outline">{application.job.jobType}</Badge>
                          <span className="font-medium text-primary">
                            {formatSalary(application.job.salaryRange)}
                          </span>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            Updated {getTimeAgo(application.updatedAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/jobs/${application.job.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Job
                          </Link>
                        </Button>
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/dashboard/applications/${application.id}`}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Details
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
                Page {pagination.page} of {pagination.pages}
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
