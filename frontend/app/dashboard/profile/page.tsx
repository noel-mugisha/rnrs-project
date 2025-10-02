"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  User, 
  Briefcase, 
  Save, 
  Camera, 
  AlertCircle, 
  Loader2, 
  Edit3, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Eye,
  Sparkles,
  TrendingUp,
  Building2,
  Clock,
  DollarSign,
  Target,
  ArrowRight
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { api, Job } from "@/lib/api"
import { calculateProfileCompleteness } from "@/lib/profile-utils"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { SkillsSelector } from "@/components/ui/skills-selector"
import Link from "next/link"

interface ProfileFormData {
  firstName: string
  lastName: string
  phone: string
  desiredTitle: string
  about: string
  skills: Array<{
    category: string
    work: string
  }>
}

function JobCardSkeleton() {
  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="w-12 h-12 rounded-lg" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Profile Completeness */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-12" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-4 w-64" />
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <Skeleton className="w-24 h-24 rounded-full" />
                <Skeleton className="h-9 w-32" />
              </div>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <JobCardSkeleton key={i} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function JobCard({ job }: { job: Job }) {
  const postedDate = job.postedAt ? new Date(job.postedAt) : new Date(job.createdAt)
  const daysAgo = Math.floor((Date.now() - postedDate.getTime()) / (1000 * 60 * 60 * 24))
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/jobs/${job.id}`}>
        <Card className="hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer group">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <CardTitle className="group-hover:text-primary transition-colors">
                  {job.title}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  {job.employer.name}
                </div>
              </div>
              {job.employer.logoKey ? (
                <img
                  src={job.employer.logoKey}
                  alt={job.employer.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {job.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {job.location || (job.remote ? "Remote" : "Not specified")}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {job.jobType}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {job.experienceLevel}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}
              </div>
              {job._count && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {job._count.applications} applicants
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              View Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  )
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingJobs, setIsLoadingJobs] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([])
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    desiredTitle: '',
    about: '',
    skills: [],
  })

  // Load user data on mount
  useEffect(() => {
    if (user) {
      const jobSeekerProfile = user.jobSeekerProfile
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        desiredTitle: jobSeekerProfile?.desiredTitle || '',
        about: jobSeekerProfile?.about || '',
        skills: jobSeekerProfile?.skills || [],
      })
      setIsLoading(false)
    }
  }, [user])

  // Load recommended jobs
  useEffect(() => {
    const loadRecommendedJobs = async () => {
      if (!user || user.role !== 'JOBSEEKER') return
      
      setIsLoadingJobs(true)
      try {
        const response = await api.getRecommendedJobs(6)
        if (response.success && response.data) {
          setRecommendedJobs(response.data.jobs)
        }
      } catch (err) {
        console.error('Error loading recommended jobs:', err)
      } finally {
        setIsLoadingJobs(false)
      }
    }

    if (!isLoading) {
      loadRecommendedJobs()
    }
  }, [user, isLoading])

  const profileCompleteness = user ? calculateProfileCompleteness(user, user.jobSeekerProfile) : null

  const handleSave = async () => {
    if (!user) return
    
    setIsSaving(true)
    setError(null)
    
    try {
      const response = await api.updateJobSeekerProfile({
        phone: formData.phone,
        desiredTitle: formData.desiredTitle,
        about: formData.about,
        skills: formData.skills,
      })
      
      if (response.success) {
        await refreshUser()
        toast.success('Profile updated successfully!')
        setIsEditing(false)
        
        // Reload recommended jobs after profile update
        const jobsResponse = await api.getRecommendedJobs(6)
        if (jobsResponse.success && jobsResponse.data) {
          setRecommendedJobs(jobsResponse.data.jobs)
        }
      } else {
        setError('Failed to update profile. Please try again.')
      }
    } catch (err) {
      console.error('Profile update error:', err)
      setError('An error occurred while updating your profile.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSkillsChange = (skills: Array<{ category: string; work: string }>) => {
    setFormData(prev => ({ ...prev, skills }))
  }

  const handleCancel = () => {
    if (!user) return
    
    // Reset form data
    const jobSeekerProfile = user.jobSeekerProfile
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName, 
      phone: user.phone || '',
      desiredTitle: jobSeekerProfile?.desiredTitle || '',
      about: jobSeekerProfile?.about || '',
      skills: jobSeekerProfile?.skills || [],
    })
    setIsEditing(false)
    setError(null)
  }

  if (!user) {
    return null
  }

  if (isLoading) {
    return <ProfileSkeleton />
  }

  const hasIncompleteProfile = profileCompleteness && profileCompleteness.percentage < 100
  const hasNoSkills = !formData.skills || formData.skills.length === 0
  const hasNoDesiredTitle = !formData.desiredTitle

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your professional information and boost your visibility
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-primary to-blue-600">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="bg-gradient-to-r from-primary to-blue-600">
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </motion.div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Profile Completeness */}
      {hasIncompleteProfile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border-amber-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-5 w-5 text-amber-600" />
                    <h3 className="text-lg font-semibold">Complete Your Profile</h3>
                    <span className="text-lg font-bold text-amber-600">
                      {profileCompleteness?.percentage || 0}%
                    </span>
                  </div>
                  <Progress value={profileCompleteness?.percentage || 0} className="h-3 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Complete your profile to get better job recommendations and increase visibility
                  </p>
                </div>
                {profileCompleteness && profileCompleteness.suggestions.length > 0 && (
                  <div className="text-right space-y-1 min-w-[200px]">
                    <p className="text-sm font-medium text-amber-700">Next steps:</p>
                    {profileCompleteness.suggestions.slice(0, 2).map((suggestion, index) => (
                      <p key={index} className="text-xs text-muted-foreground">
                        • {suggestion}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid lg:grid-cols-3 gap-8"
      >
        {/* Left Column - Basic Info & Skills */}
        <div className="space-y-6">
          {/* Profile Picture & Basic Info */}
          <Card className="hover:shadow-lg transition-all duration-300 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="text-lg bg-gradient-to-br from-primary/20 via-blue-500/20 to-purple-500/20 text-primary font-semibold">
                    {user.firstName[0]}{user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button variant="outline" size="sm" disabled>
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                )}
              </div>

              {/* Basic Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      value={user.email} 
                      disabled 
                      className="bg-muted pl-10" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="+250 788 123 456"
                      className={`pl-10 ${!isEditing ? 'bg-muted' : ''}`}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Profile Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-primary/5 to-blue-500/5">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Member since</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-500/5 to-emerald-500/5">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-muted-foreground">Skills added</span>
                  </div>
                  <span className="text-sm font-semibold">{formData.skills.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-500/5 to-pink-500/5">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-muted-foreground">Profile completeness</span>
                  </div>
                  <span className="text-sm font-semibold">{profileCompleteness?.percentage || 0}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills Section */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Skills & Expertise
              </CardTitle>
              <CardDescription>
                {isEditing ? "Add or remove your skills" : "Your professional skills"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <SkillsSelector
                  selectedSkills={formData.skills}
                  onSkillsChange={handleSkillsChange}
                />
              ) : (
                <div className="space-y-4">
                  {formData.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1 py-2 px-3">
                          <div className="flex flex-col items-start">
                            <span className="text-xs text-muted-foreground">{skill.category}</span>
                            <span className="text-sm font-medium">{skill.work}</span>
                          </div>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 space-y-3 border-2 border-dashed rounded-lg">
                      <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">No skills added yet</p>
                        <p className="text-xs text-muted-foreground mt-1">Add skills to get better job matches</p>
                      </div>
                      <Button 
                        onClick={() => setIsEditing(true)} 
                        variant="outline" 
                        size="sm"
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Add Skills
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Professional Info & Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Professional Summary */}
          <Card className="hover:shadow-lg transition-all duration-300 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Professional Information
              </CardTitle>
              <CardDescription>
                Tell employers about your career goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="desiredTitle">Desired Job Title</Label>
                <Input
                  id="desiredTitle"
                  value={formData.desiredTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, desiredTitle: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="e.g., Software Engineer, Data Analyst, etc."
                  className={!isEditing ? 'bg-muted' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="about">About Me</Label>
                <Textarea
                  id="about"
                  rows={5}
                  value={formData.about}
                  onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Tell potential employers about yourself, your experience, and what makes you a great candidate..."
                  className={!isEditing ? 'bg-muted' : ''}
                />
              </div>
            </CardContent>
          </Card>

          {/* Job Recommendations */}
          <Card className="hover:shadow-lg transition-all duration-300 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Recommended Jobs for You
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {hasNoSkills || hasNoDesiredTitle 
                      ? "Complete your profile to get personalized recommendations"
                      : "Jobs matched to your skills and preferences"
                    }
                  </CardDescription>
                </div>
                {recommendedJobs.length > 0 && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/jobs">
                      View All Jobs
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingJobs ? (
                <div className="grid gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <JobCardSkeleton key={i} />
                  ))}
                </div>
              ) : recommendedJobs.length > 0 ? (
                <div className="grid gap-4">
                  <AnimatePresence mode="popLayout">
                    {recommendedJobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full flex items-center justify-center">
                    {hasNoSkills || hasNoDesiredTitle ? (
                      <Target className="h-8 w-8 text-primary" />
                    ) : (
                      <Sparkles className="h-8 w-8 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      {hasNoSkills || hasNoDesiredTitle 
                        ? "Complete Your Profile"
                        : "No Recommendations Yet"
                      }
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      {hasNoSkills || hasNoDesiredTitle
                        ? "Add your skills and desired job title to get personalized job recommendations that match your profile."
                        : "We're working on finding the perfect jobs for you. Check back soon or browse all available positions."
                      }
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    {(hasNoSkills || hasNoDesiredTitle) && (
                      <Button onClick={() => setIsEditing(true)} className="bg-gradient-to-r from-primary to-blue-600">
                        <Edit3 className="mr-2 h-4 w-4" />
                        Complete Profile
                      </Button>
                    )}
                    <Button variant="outline" asChild>
                      <Link href="/jobs">
                        Browse All Jobs
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumes */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Resume
                </CardTitle>
                <CardDescription className="mt-1">
                  Manage your uploaded resumes
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/resumes">
                  Manage Resumes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {user.jobSeekerProfile?.resumes && user.jobSeekerProfile.resumes.length > 0 ? (
                <div className="space-y-2">
                  {user.jobSeekerProfile.resumes.slice(0, 2).map((resume) => (
                    <motion.div 
                      key={resume.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{resume.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">{resume.parseStatus}</Badge>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 space-y-3 border-2 border-dashed rounded-lg">
                  <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">No resume uploaded</p>
                    <p className="text-xs text-muted-foreground mt-1">Upload your resume to apply for jobs</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/resumes">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Upload Resume
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}
