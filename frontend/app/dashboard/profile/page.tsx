"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Briefcase, Plus, X, Save, Camera, AlertCircle, Loader2, Edit3, Phone, Mail, MapPin } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { calculateProfileCompleteness } from "@/lib/profile-utils"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { SkillsSelector } from "@/components/ui/skills-selector"

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
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-24 w-full" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-20" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Profile Completeness</h3>
                  <span className="text-lg font-bold text-primary">
                    {profileCompleteness?.percentage || 0}%
                  </span>
                </div>
                <Progress value={profileCompleteness?.percentage || 0} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  {profileCompleteness?.percentage === 100
                    ? "🎉 Your profile is complete! Great job!"
                    : `Complete your profile to get ${100 - (profileCompleteness?.percentage || 0)}% more visibility`
                  }
                </p>
              </div>
              {profileCompleteness && profileCompleteness.suggestions.length > 0 && (
                <div className="text-right space-y-1">
                  <p className="text-sm font-medium">Next steps:</p>
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid lg:grid-cols-3 gap-8"
      >
        {/* Left Column - Basic Info */}
        <div className="space-y-6">
          {/* Profile Picture & Basic Info */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="text-lg bg-gradient-to-br from-primary/20 to-blue-500/20">
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
              <CardTitle>Profile Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Member since</span>
                  <span className="text-sm font-medium">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Profile views</span>
                  <span className="text-sm font-medium">Coming soon</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Skills added</span>
                  <span className="text-sm font-medium">{formData.skills.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Professional Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Professional Summary */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Professional Information
              </CardTitle>
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
                  rows={4}
                  value={formData.about}
                  onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Tell potential employers about yourself, your experience, and what makes you a great candidate..."
                  className={!isEditing ? 'bg-muted' : ''}
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Skills & Expertise</CardTitle>
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
                            <span className="text-sm">{skill.work}</span>
                          </div>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 space-y-2">
                      <p className="text-muted-foreground">No skills added yet</p>
                      <Button 
                        onClick={() => setIsEditing(true)} 
                        variant="outline" 
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Skills
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumes */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Resume</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <a href="/dashboard/resumes">
                  Manage Resumes
                </a>
              </Button>
            </CardHeader>
            <CardContent>
              {user.jobSeekerProfile?.resumes && user.jobSeekerProfile.resumes.length > 0 ? (
                <div className="space-y-2">
                  {user.jobSeekerProfile.resumes.slice(0, 2).map((resume) => (
                    <div key={resume.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Briefcase className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{resume.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <p className="text-muted-foreground">No resume uploaded</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/dashboard/resumes">
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Resume
                    </a>
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