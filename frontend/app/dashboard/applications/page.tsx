"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Filter, Calendar, MapPin, Building, Clock, Eye, ExternalLink, AlertCircle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { api, Application } from "@/lib/api"
import { toast } from "sonner"

// Status mapping for display and colors
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
  { value: "", label: "All Status" },
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
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-80" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="text-center space-y-2">
                <Skeleton className="h-8 w-12 mx-auto" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-48" />
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
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
  const [statusFilter, setStatusFilter] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Load applications on mount
  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await api.getMyApplications()
      
      if (response.success && response.data) {
        setApplications(response.data.applications || [])
      } else {
        setError('Failed to load applications')
      }
    } catch (err) {
      console.error('Applications loading error:', err)
      setError('An error occurred while loading your applications')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job.employer.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = !statusFilter || app.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusStats = () => {
    const stats = applications.reduce(
      (acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      total: applications.length,
      active: (stats.APPLIED || 0) + (stats.VIEWED || 0) + (stats.SHORTLISTED || 0),
      interviews: stats.INTERVIEW_SCHEDULED || 0,
      offered: stats.OFFERED || 0,
      hired: stats.HIRED || 0,
      rejected: stats.REJECTED || 0,
    }
  }

  const stats = getStatusStats()
  
  const formatSalary = (salaryRange: any) => {
    if (!salaryRange) return 'Salary not disclosed'
    if (typeof salaryRange === 'string') return salaryRange
    if (salaryRange.min && salaryRange.max) {
      return `$${salaryRange.min.toLocaleString()} - $${salaryRange.max.toLocaleString()}`
    }
    return 'Salary not disclosed'
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return '1 day ago'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`
    return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`
  }
  
  if (isLoading) {
    return <ApplicationsSkeleton />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            My Applications
          </h1>
          <p className="text-muted-foreground mt-1">
            Track the status of your job applications and manage your opportunities
          </p>
        </div>
        <Button onClick={loadApplications} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </motion.div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Applications</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{stats.interviews}</p>
              <p className="text-sm text-muted-foreground">Interviews</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{stats.rejected}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="hover:shadow-lg transition-all duration-300">
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
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="md:hidden">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
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
        {filteredApplications.map((application, index) => {
          const statusInfo = statusMapping[application.status] || { label: application.status, color: "bg-gray-500" }
          
          return (
            <motion.div
              key={application.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{application.job.title}</h3>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
                              <Badge variant="secondary" className="text-xs">
                                {statusInfo.label}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              {application.job.employer.name}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {application.job.location || 'Remote'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Applied {new Date(application.appliedAt).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <Badge variant="outline">{application.job.jobType}</Badge>
                            <span className="font-medium text-primary">{formatSalary(application.job.salaryRange)}</span>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              Updated {getTimeAgo(application.updatedAt)}
                            </div>
                          </div>
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
        })}
      </motion.div>

      {filteredApplications.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">No applications found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter
                      ? "Try adjusting your search criteria or filters"
                      : "You haven't applied to any jobs yet. Start exploring opportunities!"}
                  </p>
                  <div className="flex gap-3 justify-center">
                    {(searchQuery || statusFilter) && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSearchQuery('')
                          setStatusFilter('')
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                    <Button asChild>
                      <Link href="/jobs">Browse Jobs</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
