"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Briefcase,
  FileText,
  Eye,
  TrendingUp,
  Clock,
  MapPin,
  Building,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Star,
  Calendar,
  Plus,
  Search,
  Send,
  Users,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { api, type Application, type Job, type User } from "@/lib/api"
import { calculateProfileCompleteness, getStatusColor, formatRelativeTime, type ProfileCompleteness } from "@/lib/profile-utils"
import { motion } from "framer-motion"

// Helper Interfaces
interface DashboardStats {
  totalApplications: number
  activeApplications: number
  interviews: number
}

interface DashboardData {
  stats: DashboardStats
  recentApplications: Application[]
  suggestedJobs: Job[]
  profileCompleteness: ProfileCompleteness
}

// --- START: HELPER & SKELETON COMPONENTS ---

const StatCard = ({ icon: Icon, title, value, color }: { icon: any, title: string, value: number, color: string }) => (
  <Card className={`hover:shadow-md transition-shadow duration-300 border-l-4 border-l-${color}-500`}>
    <CardContent className="p-5">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 bg-${color}-100 dark:bg-${color}-900/50 rounded-lg flex items-center justify-center shrink-0`}>
          <Icon className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} />
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}>{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ProfileCompletenessCard = ({ completeness }: { completeness: ProfileCompleteness }) => {
  if (completeness.percentage === 100) {
    return (
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-950/50 dark:to-emerald-950/50 dark:border-green-800/50">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center shrink-0">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-800 dark:text-green-300">Your Profile is Complete!</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              You're all set to attract top employers.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/dashboard/profile">
              View Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-lg font-bold">Complete Your Profile</div>
            <div className="text-sm text-muted-foreground font-normal">Boost your visibility to employers</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Profile Progress</span>
            <span className="font-mono">{completeness.percentage}%</span>
          </div>
          <Progress value={completeness.percentage} className="h-2" />
        </div>
        
        {completeness.suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              Next steps:
            </p>
            <ul className="space-y-1.5 list-disc pl-5 text-sm text-muted-foreground">
              {completeness.suggestions.slice(0, 2).map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
        
        <Button asChild className="bg-gradient-to-r from-primary to-blue-600">
          <Link href={completeness.percentage < 50 ? "/dashboard/profile/setup" : "/dashboard/profile"}>
            <Plus className="mr-2 h-4 w-4" />
            Improve Profile
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

const RecentApplications = ({ applications }: { applications: Application[] }) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg">Recent Applications</CardTitle>
        {applications.length > 0 && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/applications">
              View All <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        )}
      </div>
    </CardHeader>
    <CardContent>
      {applications.length === 0 ? (
        <div className="text-center py-10 space-y-3">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Send className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">No applications yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Start applying to jobs to track your progress here.
            </p>
          </div>
          <Button asChild>
            <Link href="/jobs">
              <Search className="h-4 w-4 mr-2" />
              Browse Jobs
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((application) => (
            <Link href={`/dashboard/applications`} key={application.id} className="block group">
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                      {application.job.title}
                    </h4>
                    <Badge className={`${getStatusColor(application.status)} text-white text-xs`} variant="secondary">
                      {application.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5"><Building className="h-3 w-3" />{application.job.employer.name}</div>
                    <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" />{formatRelativeTime(application.appliedAt)}</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
)

const SuggestedJobs = ({ jobs }: { jobs: Job[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Suggested Jobs</CardTitle>
    </CardHeader>
    <CardContent>
      {jobs.length === 0 ? (
        <div className="text-center py-10 space-y-3">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Briefcase className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">No suggestions yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Complete your profile to get personalized recommendations.
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/profile">
              <Users className="h-4 w-4 mr-2" />
              Update Profile
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link href={`/jobs/${job.id}`} key={job.id} className="block group">
              <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-sm group-hover:text-primary transition-colors mb-1">{job.title}</h4>
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800">
                    <Star className="h-3 w-3 mr-1" />
                    Match
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Building className="h-3 w-3" />
                  {job.employer.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
)

const QuickActions = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Quick Actions</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <Button className="w-full justify-start h-auto p-3" asChild>
        <Link href="/dashboard/resumes">
          <FileText className="mr-3 h-4 w-4" />
          <span className="font-semibold">Manage Resumes</span>
        </Link>
      </Button>
      <Button variant="outline" className="w-full justify-start h-auto p-3" asChild>
        <Link href="/dashboard/profile">
          <Users className="mr-3 h-4 w-4" />
          <span className="font-semibold">Update Profile</span>
        </Link>
      </Button>
    </CardContent>
  </Card>
)


// --- END: HELPER COMPONENTS ---

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      // Redirect employers to their proper dashboard immediately
      if (user.role === "JOBPROVIDER") {
        router.replace("/dashboard/employer")
        return
      }
      // Only load dashboard data for job seekers
      loadDashboardData()
    } else {
      setIsLoading(false)
    }
  }, [user, router])

  const loadDashboardData = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const [applicationsResponse, jobsResponse] = await Promise.all([
        api.getMyApplications({ limit: 3 }),
        api.getRecommendedJobs(3)
      ])

      const profileCompleteness = calculateProfileCompleteness(user, user.jobSeekerProfile)
      const applications = applicationsResponse.success ? (applicationsResponse.data?.applications || []) : []
      
      const stats: DashboardStats = {
        totalApplications: applicationsResponse.success ? (applicationsResponse.data?.pagination?.total || 0) : 0,
        activeApplications: applications.filter(app => ['APPLIED', 'VIEWED', 'SHORTLISTED'].includes(app.status)).length,
        interviews: applications.filter(app => app.status === 'INTERVIEW_SCHEDULED').length,
      }

      setDashboardData({
        stats,
        recentApplications: applications,
        suggestedJobs: jobsResponse.success ? (jobsResponse.data?.jobs || []) : [],
        profileCompleteness,
      })
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    // This is handled by ProtectedRoute, but it prevents flicker.
    return null;
  }
  
  // Redirect employers to their proper dashboard (handled in useEffect, but this prevents flicker)
  if (user.role === "JOBPROVIDER") {
    return null
  }

  // Loading state is now handled by loading.tsx, but this is a good fallback.
  if (isLoading) {
    return null
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={loadDashboardData} variant="outline">
          <TrendingUp className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  if (!dashboardData) return null

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {user.firstName}!
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your job search today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/jobs">
                <Search className="h-4 w-4 mr-2" />
                Browse Jobs
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/profile">
                <Users className="h-4 w-4 mr-2" />
                View Profile
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <StatCard icon={Send} title="Total Applications" value={dashboardData.stats.totalApplications} color="red" />
        <StatCard icon={Clock} title="Active Applications" value={dashboardData.stats.activeApplications} color="blue" />
        <StatCard icon={Calendar} title="Interviews" value={dashboardData.stats.interviews} color="green" />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid lg:grid-cols-3 gap-8"
      >
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <ProfileCompletenessCard completeness={dashboardData.profileCompleteness} />
          <RecentApplications applications={dashboardData.recentApplications} />
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <SuggestedJobs jobs={dashboardData.suggestedJobs} />
          <QuickActions />
        </div>
      </motion.div>
    </div>
  )
}