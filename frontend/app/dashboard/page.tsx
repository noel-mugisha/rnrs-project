"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
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
  profileViews: number
}

interface DashboardData {
  stats: DashboardStats
  recentApplications: Application[]
  suggestedJobs: Job[]
  profileCompleteness: ProfileCompleteness
}

// --- START: HELPER & SKELETON COMPONENTS ---

// Loading skeleton component
function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="hidden md:flex gap-3">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-14 w-14 rounded-xl" />
            </div>
          </Card>
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Card Skeleton */}
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-60" />
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-full" />
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
                <div className="flex gap-3 pt-2">
                  <Skeleton className="h-10 w-36" />
                </div>
              </div>
            </div>
          </Card>

          {/* Applications Card Skeleton */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-60" />
                </div>
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-5 border rounded-xl">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <div className="flex items-center gap-6 pt-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-xl space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Sub-components for better organization

const StatCard = ({ icon: Icon, title, value, description, color }: { icon: any, title: string, value: number, description: string, color: string }) => (
  <Card className={`hover:shadow-lg transition-all duration-300 border-l-4 border-l-${color}-500`}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <div className={`w-14 h-14 bg-${color}-100 rounded-xl flex items-center justify-center`}>
          <Icon className={`h-7 w-7 text-${color}-600`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

const ProfileCompletenessCard = ({ completeness }: { completeness: ProfileCompleteness }) => {
  if (completeness.percentage === 100) {
    return (
      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
        <CardContent className="p-6 flex items-center gap-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center shrink-0">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-800">Your Profile is Complete!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You're all set to attract top employers. Keep your profile updated for the best results.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
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
          <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-lg font-bold">Profile Completeness</div>
            <div className="text-sm text-muted-foreground font-normal">Boost your visibility to employers</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold">Your profile is {completeness.percentage}% complete</span>
            <span className="text-sm text-muted-foreground font-mono">{completeness.percentage}/100</span>
          </div>
          <Progress value={completeness.percentage} className="h-3 bg-gray-100" />
        </div>
        
        {completeness.suggestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              Suggestions to improve your profile:
            </div>
            <ul className="space-y-2">
              {completeness.suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex gap-3">
          <Button asChild className="bg-gradient-to-r from-primary to-blue-600">
            <Link href={completeness.percentage < 50 ? "/dashboard/profile/setup" : "/dashboard/profile"}>
              <Plus className="mr-2 h-4 w-4" />
              Complete Profile
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const RecentApplications = ({ applications }: { applications: Application[] }) => (
  <Card className="hover:shadow-md transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-lg flex items-center justify-center">
          <Briefcase className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <CardTitle className="text-lg">Recent Applications</CardTitle>
          <p className="text-sm text-muted-foreground font-normal">Track your latest job applications</p>
        </div>
      </div>
      {applications.length > 0 && (
        <Button variant="outline" size="sm" asChild className="shrink-0">
          <Link href="/dashboard/applications">
            View All
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      )}
    </CardHeader>
    <CardContent>
      {applications.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Send className="h-10 w-10 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
            <p className="text-muted-foreground mb-4">
              Start applying to jobs that match your skills and interests
            </p>
            <Button asChild className="bg-gradient-to-r from-primary to-blue-600">
              <Link href="/jobs">
                <Search className="h-4 w-4 mr-2" />
                Browse Jobs
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application.id}
              className="group flex items-center justify-between p-4 border rounded-xl hover:border-primary/20 hover:bg-primary/5 transition-all duration-300"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {application.job.title}
                  </h4>
                  <Badge 
                    className={`${getStatusColor(application.status)} text-white text-xs`}
                    variant="secondary"
                  >
                    {application.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Building className="h-4 w-4" />
                    {application.job.employer.name}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {application.job.location || 'Remote'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {formatRelativeTime(application.appliedAt)}
                  </div>
                </div>
              </div>
              <Button asChild variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={`/dashboard/applications`}>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

const SuggestedJobs = ({ jobs }: { jobs: Job[] }) => (
  <Card className="hover:shadow-md transition-shadow duration-300">
    <CardHeader>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-lg flex items-center justify-center">
          <Star className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <CardTitle className="text-lg">Suggested Jobs</CardTitle>
          <p className="text-sm text-muted-foreground font-normal">Based on your profile</p>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      {jobs.length === 0 ? (
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Briefcase className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <h3 className="font-semibold mb-2">No job suggestions yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Complete your profile to get personalized job recommendations
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/profile">
                <Users className="h-4 w-4 mr-2" />
                Update Profile
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Link href={`/jobs/${job.id}`} key={job.id} className="block group">
              <div className="p-4 border rounded-xl hover:border-green-300 hover:bg-green-50/50 transition-all duration-300 space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-sm group-hover:text-green-800 transition-colors">{job.title}</h4>
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                    <Star className="h-3 w-3 mr-1" />
                    Match
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Building className="h-3 w-3" />
                    {job.employer.name}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" />
                    {job.location || 'Remote'}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      <Button variant="outline" className="w-full mt-6" asChild>
        <Link href="/jobs">
          <Search className="h-4 w-4 mr-2" />
          Browse All Jobs
        </Link>
      </Button>
    </CardContent>
  </Card>
);

const QuickActions = () => (
  <Card className="bg-gradient-to-br from-primary/5 to-blue-500/5 border-primary/20">
    <CardHeader>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-blue-500/10 rounded-lg flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <div>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <p className="text-sm text-muted-foreground font-normal">Boost your job search</p>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <Button className="w-full justify-start h-auto p-3" asChild>
        <Link href="/dashboard/resumes">
          <FileText className="mr-3 h-5 w-5" />
          <div className="text-left">
            <div className="font-semibold">Upload Resume</div>
            <div className="text-xs opacity-90">Stand out to employers</div>
          </div>
        </Link>
      </Button>
      <Button variant="outline" className="w-full justify-start h-auto p-3 hover:bg-primary/5 hover:border-primary/30" asChild>
        <Link href="/dashboard/profile">
          <Users className="mr-3 h-5 w-5 text-primary" />
          <div className="text-left">
            <div className="font-semibold">Update Profile</div>
            <div className="text-xs text-muted-foreground">Improve visibility</div>
          </div>
        </Link>
      </Button>
    </CardContent>
  </Card>
);

// Job Provider Dashboard Component
function JobProviderDashboard() {
  // This remains unchanged but is necessary for the component to work.
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Employer Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your job postings and find the best candidates
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Button asChild size="sm" className="bg-gradient-to-r from-primary to-blue-600">
            <Link href="/dashboard/jobs/new">
              <Plus className="h-4 w-4 mr-2" />
              Post Job
            </Link>
          </Button>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-primary/5 to-blue-500/5 border-primary/20">
          <CardContent className="text-center py-16 space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-blue-500/10 rounded-full flex items-center justify-center mx-auto">
              <TrendingUp className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold">Enhanced Features Coming Soon</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We're building advanced tools to help you find the perfect candidates and manage your hiring process more efficiently.
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <Button asChild className="bg-gradient-to-r from-primary to-blue-600">
                <Link href="/dashboard/jobs">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Manage Jobs
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/candidates">
                  <Users className="h-4 w-4 mr-2" />
                  View Candidates
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// --- END: HELPER & SKELETON COMPONENTS ---

export default function DashboardPage() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

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
        profileViews: Math.floor(Math.random() * 50) + 10,
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

  if (!user) return null
  
  if (user.role === "JOBPROVIDER") {
    return <JobProviderDashboard />
  }

  if (isLoading) {
    return <DashboardSkeleton />
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
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Welcome back, {user.firstName}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your job search today
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Button asChild className="bg-gradient-to-r from-primary to-blue-600">
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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard icon={Send} title="Total Applications" value={dashboardData.stats.totalApplications} description="All time" color="red" />
        <StatCard icon={Clock} title="Active Applications" value={dashboardData.stats.activeApplications} description="In progress" color="blue" />
        <StatCard icon={Calendar} title="Interviews" value={dashboardData.stats.interviews} description="Scheduled" color="green" />
        <StatCard icon={Eye} title="Profile Views" value={dashboardData.stats.profileViews} description="This month" color="purple" />
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