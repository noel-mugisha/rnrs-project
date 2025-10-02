"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Briefcase,
  Plus,
  Send,
  TrendingUp,
  Calendar,
  Eye,
  MapPin,
  Clock,
  Users,
  Building2,
  ArrowRight,
  AlertCircle,
  FileText,
  Edit,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { api, type Job } from "@/lib/api"
import { motion } from "framer-motion"
import { toast } from "sonner"

interface DashboardStats {
  totalJobs: number
  activeJobs: number
  draftJobs: number
  totalApplications: number
}

export default function EmployerDashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    draftJobs: 0,
    totalApplications: 0,
  })
  const [recentJobs, setRecentJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.role === 'JOBPROVIDER' && user.employerProfile) {
      loadDashboardData()
    } else if (user?.role === 'JOBPROVIDER' && !user.employerProfile) {
      router.push('/dashboard/employer/setup')
    } else if (user?.role === 'JOBSEEKER') {
      // Job seekers shouldn't be here
      router.push('/dashboard')
    }
  }, [user, router])

  const loadDashboardData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Load jobs data
      const jobsResponse = await api.getMyJobs({ limit: 5 })

      if (jobsResponse.success && jobsResponse.data) {
        const jobs = jobsResponse.data.jobs || []
        setRecentJobs(jobs)

        // Calculate stats from jobs
        const totalJobs = jobs.length
        const activeJobs = jobs.filter(j => j.status === 'PUBLISHED').length
        const draftJobs = jobs.filter(j => j.status === 'DRAFT').length
        const totalApplications = jobs.reduce((sum, job) => sum + (job._count?.applications || 0), 0)

        setStats({
          totalJobs,
          activeJobs,
          draftJobs,
          totalApplications,
        })
      } else {
        setError(jobsResponse.error || "Failed to load dashboard data")
      }
    } catch (err) {
      console.error("Error loading dashboard:", err)
      setError("Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || user.role !== "JOBPROVIDER") {
    return null
  }

  if (!user.employerProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Setup Required</CardTitle>
            <CardDescription>Complete your employer profile to start posting jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-gradient-to-r from-primary to-blue-600">
              <Link href="/dashboard/employer/setup">
                <Building2 className="mr-2 h-4 w-4" />
                Complete Profile Setup
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
            {user.employerProfile.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your job postings and find the best candidates
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
          <Link href="/dashboard/employer/jobs/new">
            <Plus className="mr-2 h-4 w-4" />
            Post a Job
          </Link>
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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Total Jobs */}
        <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                <p className="text-4xl font-bold text-primary">{stats.totalJobs}</p>
                <p className="text-xs text-muted-foreground">All time</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-blue-600" />
        </Card>

        {/* Active Jobs */}
        <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                <p className="text-4xl font-bold text-green-600">{stats.activeJobs}</p>
                <p className="text-xs text-muted-foreground">Published</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-600" />
        </Card>

        {/* Draft Jobs */}
        <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Draft Jobs</p>
                <p className="text-4xl font-bold text-orange-600">{stats.draftJobs}</p>
                <p className="text-xs text-muted-foreground">Unpublished</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-600" />
        </Card>

        {/* Total Applications */}
        <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Applications</p>
                <p className="text-4xl font-bold text-blue-600">{stats.totalApplications}</p>
                <p className="text-xs text-muted-foreground">Total received</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Send className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
        </Card>
      </motion.div>

      {/* Recent Jobs & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Jobs */}
        <div className="lg:col-span-2">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Recent Job Postings
                  </CardTitle>
                  <CardDescription className="mt-1">Your latest job listings</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/employer/jobs">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentJobs.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                    <Briefcase className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">No jobs posted yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start attracting top talent by posting your first job
                    </p>
                    <Button asChild className="bg-gradient-to-r from-primary to-blue-600">
                      <Link href="/dashboard/employer/jobs/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Post Your First Job
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{job.title}</h4>
                            <Badge
                              variant={
                                job.status === "PUBLISHED"
                                  ? "default"
                                  : job.status === "DRAFT"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {job.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location || "Remote"}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {job._count?.applications || 0} applicants
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(job.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/employer/jobs/${job.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/employer/jobs/${job.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Company Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-primary/5 to-blue-500/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90" asChild>
                <Link href="/dashboard/employer/jobs/new">
                  <Plus className="mr-3 h-5 w-5" />
                  <div className="text-left flex-1">
                    <div className="font-semibold">Post New Job</div>
                    <div className="text-xs opacity-90">Find the perfect candidate</div>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" className="w-full justify-start hover:bg-accent" asChild>
                <Link href="/dashboard/employer/jobs">
                  <Briefcase className="mr-3 h-5 w-5 text-primary" />
                  <div className="text-left flex-1">
                    <div className="font-semibold">Manage Jobs</div>
                    <div className="text-xs text-muted-foreground">View all postings</div>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" className="w-full justify-start hover:bg-accent" asChild>
                <Link href="/dashboard/applications">
                  <FileText className="mr-3 h-5 w-5 text-green-600" />
                  <div className="text-left flex-1">
                    <div className="font-semibold">Applications</div>
                    <div className="text-xs text-muted-foreground">Review candidates</div>
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Company Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Industry
                </p>
                <p className="text-sm text-muted-foreground pl-6">
                  {user.employerProfile.industry || "Not specified"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Location
                </p>
                <p className="text-sm text-muted-foreground pl-6">
                  {user.employerProfile.location || "Not specified"}
                </p>
              </div>
              {user.employerProfile.website && (
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    Website
                  </p>
                  <a
                    href={user.employerProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline pl-6 block"
                  >
                    {user.employerProfile.website}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
