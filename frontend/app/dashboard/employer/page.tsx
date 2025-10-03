"use client"

import { useState, useEffect } from "react"
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
        const totalJobs = jobsResponse.data.pagination?.total || 0;
        const activeJobs = jobs.filter(j => j.status === 'PUBLISHED').length;
        const draftJobs = jobs.filter(j => j.status === 'DRAFT').length;
        const totalApplications = jobs.reduce((sum, job) => sum + (job._count?.applications || 0), 0);
        
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
                {recentJobs.length > 0 ? (
                  <div className="space-y-4">
                    {recentJobs.map((job) => (
                      <Link key={job.id} href={`/dashboard/employer/jobs/${job.id}`} className="block group">
                        <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                           <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-start gap-3">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Briefcase className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold text-lg group-hover:text-primary">{job.title}</h3>
                                    <Badge variant={job.status === "PUBLISHED" ? "default" : "secondary"}>
                                      {job.status}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap mt-1">
                                    <div className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</div>
                                    <div className="flex items-center gap-1"><Users className="h-4 w-4" />{job._count?.applications || 0} applicants</div>
                                    <div className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(job.createdAt).toLocaleDateString()}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" asChild onClick={(e) => { e.stopPropagation(); e.preventDefault(); router.push(`/dashboard/employer/jobs/${job.id}/edit`); }}>
                                <Link href={`/dashboard/employer/jobs/${job.id}/edit`}><Edit className="h-4 w-4" /></Link>
                              </Button>
                              <Button variant="ghost" size="icon" onClick={(e) => handleDeleteJob(job.id, e)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Link>
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