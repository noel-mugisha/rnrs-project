"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { api, type Job } from "@/lib/api"
import { motion } from "framer-motion"
import { toast } from "sonner"
import EmployerDashboardLoading from "./loading"

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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const lastLoadTime = useRef<number>(0)

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

  // Auto-refresh dashboard when page becomes visible (when returning from job creation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user?.role === 'JOBPROVIDER' && user.employerProfile) {
        // Only refresh if it's been more than 5 seconds since last load (avoids excessive calls)
        const now = Date.now()
        if (now - lastLoadTime.current > 5000) {
          loadDashboardData()
        }
      }
    }

    const handleFocus = () => {
      if (user?.role === 'JOBPROVIDER' && user.employerProfile) {
        // Only refresh if it's been more than 5 seconds since last load
        const now = Date.now()
        if (now - lastLoadTime.current > 5000) {
          loadDashboardData()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [user])
  
  // Check for fresh data every 30 seconds when page is active
  useEffect(() => {
    if (user?.role === 'JOBPROVIDER' && user.employerProfile && !isLoading) {
      const interval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          loadDashboardData()
        }
      }, 30000) // Refresh every 30 seconds
      
      return () => clearInterval(interval)
    }
  }, [user, isLoading])

  const loadDashboardData = async () => {
    setIsLoading(true)
    setError(null)
    lastLoadTime.current = Date.now()

    try {
      // Load jobs data
      const jobsResponse = await api.getMyJobs({ limit: 5 })

      if (jobsResponse.success && jobsResponse.data) {
        const jobs = jobsResponse.data.jobs || []
        const previousJobCount = recentJobs.length
        setRecentJobs(jobs)
        
        // Show notification if new jobs were found
        if (jobs.length > previousJobCount && previousJobCount > 0) {
          toast.success(`🎉 Found ${jobs.length - previousJobCount} new job${jobs.length - previousJobCount === 1 ? '' : 's'}!`)
        }

        // Calculate stats from jobs
        const totalJobs = jobsResponse.data.pagination?.total || jobs.length;
        const activeJobs = jobs.filter(j => j.status === 'PUBLISHED').length;
        const draftJobs = jobs.filter(j => j.status === 'DRAFT').length;
        const totalApplications = jobs.reduce((sum, job) => sum + (job._count?.applications || 0), 0);
        setStats({
          totalJobs,
          activeJobs,
          draftJobs,
          totalApplications,
        })
        setLastUpdated(new Date())
      } else {
        // Handle "Job not found" as no jobs case (empty employer)
        if (jobsResponse.error === "Job not found" || jobsResponse.error?.includes("not found")) {
          setRecentJobs([])
          setStats({
            totalJobs: 0,
            activeJobs: 0,
            draftJobs: 0,
            totalApplications: 0,
          })
          setError(null) // Clear the error for empty state
        } else {
          setError(jobsResponse.error || "Failed to load dashboard data")
        }
      }
    } catch (err) {
      console.error("Error loading dashboard:", err)
      setError("Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteJob = async (jobId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      return;
    }
  
    try {
      const response = await api.deleteJob(jobId);
      if (response.success) {
        toast.success("Job deleted successfully");
        loadDashboardData(); // Refresh data
      } else {
        toast.error(response.error || "Failed to delete job");
      }
    } catch (err) {
      toast.error("An error occurred while deleting the job");
    }
  };

  if (!user || user.role !== "JOBPROVIDER") {
    return null
  }

  if (isLoading) {
    return <EmployerDashboardLoading />
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
            {user.employerProfile?.name || 'Employer Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your job postings and find the best candidates
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
            <Link href="/dashboard/employer/jobs/new">
              <Plus className="mr-2 h-4 w-4" />
              Post a Job
            </Link>
          </Button>
        </div>
      </motion.div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Jobs", value: stats.totalJobs, icon: Briefcase, color: "red" },
          { title: "Active Jobs", value: stats.activeJobs, icon: TrendingUp, color: "green" },
          { title: "Draft Jobs", value: stats.draftJobs, icon: FileText, color: "orange" },
          { title: "Applications", value: stats.totalApplications, icon: Send, color: "blue" },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Card className={`relative overflow-hidden hover:shadow-xl transition-all duration-300 border-l-4 border-l-${stat.color}-500`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className={`text-4xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.title === 'Total Jobs' ? 'All time' : stat.title === 'Applications' ? 'Total received' : (stat.title === 'Active Jobs' ? 'Published' : 'Unpublished')}</p>
                  </div>
                  <div className={`w-12 h-12 bg-${stat.color}-100 rounded-full flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardContent>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-${stat.color}-400 to-${stat.color}-600`} />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Jobs & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Jobs */}
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      Recent Job Postings
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Your latest job listings
                      {lastUpdated && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          • Updated {lastUpdated.toLocaleTimeString()}
                        </span>
                      )}
                    </CardDescription>
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
                {recentJobs.length > 0 ? (
                  <div className="space-y-3">
                    {recentJobs.map((job, index) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link href={`/dashboard/employer/jobs/${job.id}`} className="block group">
                          <div className="p-5 border-2 rounded-xl hover:border-primary/50 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-3">
                                <div className="flex items-start gap-4">
                                  <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                    <Briefcase className="h-7 w-7 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors truncate">{job.title}</h3>
                                      <Badge 
                                        variant={job.status === "PUBLISHED" ? "default" : "secondary"}
                                        className={job.status === "PUBLISHED" ? "bg-green-500 hover:bg-green-600" : ""}
                                      >
                                        {job.status === "PUBLISHED" ? "✓ Published" : job.status}
                                      </Badge>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-1.5">
                                        <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                                        <span className="truncate">{job.location}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <Users className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                        <span className="font-medium">{job._count?.applications || 0} applicant{(job._count?.applications || 0) !== 1 ? 's' : ''}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4 text-green-500 flex-shrink-0" />
                                        <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="hover:bg-primary/10 hover:text-primary" 
                                  asChild 
                                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); router.push(`/dashboard/employer/jobs/${job.id}/edit`); }}
                                >
                                  <Link href={`/dashboard/employer/jobs/${job.id}/edit`}>
                                    <Edit className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950" 
                                  onClick={(e) => handleDeleteJob(job.id, e)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : (
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
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {/* Quick Actions */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-gradient-to-br from-primary/5 to-blue-500/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 h-auto p-3" asChild>
                  <Link href="/dashboard/employer/jobs/new">
                    <Plus className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Post New Job</div>
                      <div className="text-xs opacity-90">Find the perfect candidate</div>
                    </div>
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start hover:bg-accent h-auto p-3" asChild>
                  <Link href="/dashboard/employer/jobs">
                    <Briefcase className="mr-3 h-5 w-5 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold">Manage Jobs</div>
                      <div className="text-xs text-muted-foreground">View all postings</div>
                    </div>
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start hover:bg-accent h-auto p-3" asChild>
                  <Link href="/dashboard/applications">
                    <FileText className="mr-3 h-5 w-5 text-green-600" />
                    <div className="text-left">
                      <div className="font-semibold">Applications</div>
                      <div className="text-xs text-muted-foreground">Review candidates</div>
                    </div>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}