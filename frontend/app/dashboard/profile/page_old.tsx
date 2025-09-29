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
import { User, Briefcase, Plus, X, Save, Camera, AlertCircle, Loader2, Edit3 } from "lucide-react"
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

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Basic Info */}
        <div className="space-y-6">
          {/* Profile Picture & Basic Info */}
          <Card>
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
                  <AvatarFallback className="text-lg">
                    {formData.firstName[0]}
                    {formData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button variant="outline" size="sm">
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
                      onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} disabled className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    {isEditing && (
                      <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addSkill()}
                  />
                  <Button onClick={addSkill} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Professional Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Professional Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Current Job Title</Label>
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, jobTitle: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="about">About Me</Label>
                <Textarea
                  id="about"
                  rows={4}
                  value={formData.about}
                  onChange={(e) => setFormData((prev) => ({ ...prev, about: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>

          {/* Work Experience */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Work Experience
              </CardTitle>
              {isEditing && (
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {formData.experience.map((exp) => (
                  <div key={exp.id} className="border-l-2 border-muted pl-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{exp.position}</h4>
                        <p className="text-sm text-muted-foreground">{exp.company}</p>
                        <p className="text-xs text-muted-foreground">
                          {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                        </p>
                      </div>
                      {exp.current && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{exp.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education
              </CardTitle>
              {isEditing && (
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {formData.education.map((edu) => (
                  <div key={edu.id} className="border-l-2 border-muted pl-4 space-y-2">
                    <div>
                      <h4 className="font-semibold">{edu.degree}</h4>
                      <p className="text-sm text-muted-foreground">{edu.institution}</p>
                      <p className="text-xs text-muted-foreground">
                        {edu.startDate} - {edu.endDate}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">{edu.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
