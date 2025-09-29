"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, X, Save, Eye, Trash2 } from "lucide-react"

export default function EditJobPage() {
  const router = useRouter()
  const params = useParams()
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const [formData, setFormData] = useState({
    title: "Senior Software Engineer",
    department: "Engineering",
    location: "Kigali, Rwanda",
    type: "full-time",
    remote: true,
    salaryMin: "80000",
    salaryMax: "120000",
    currency: "USD",
    description: "We are looking for a Senior Software Engineer to join our growing team...",
    responsibilities: "• Lead development of new features\n• Mentor junior developers\n• Collaborate with product team",
    requirements:
      "• 5+ years of software development experience\n• Proficiency in React and Node.js\n• Bachelor's degree in Computer Science",
    benefits: "Health insurance, flexible hours, professional development budget",
    skills: ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL"] as string[],
    experienceLevel: "senior",
    educationLevel: "bachelor",
    applicationDeadline: "2024-02-15",
    startDate: "2024-03-01",
    status: "published",
  })

  const handleSave = async (status: "draft" | "published") => {
    setIsSaving(true)

    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    router.push(`/dashboard/jobs?success=updated`)
    setIsSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this job posting? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)

    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    router.push("/dashboard/jobs?success=deleted")
    setIsDeleting(false)
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Job Posting</h1>
            <p className="text-muted-foreground">Update your job posting details</p>
          </div>
        </div>
        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
          <Trash2 className="h-4 w-4 mr-2" />
          {isDeleting ? "Deleting..." : "Delete Job"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential details about the position</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Senior Software Engineer"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    placeholder="e.g. Engineering"
                    value={formData.department}
                    onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g. Kigali, Rwanda"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Job Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remote"
                  checked={formData.remote}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, remote: checked as boolean }))}
                />
                <Label htmlFor="remote">Remote work available</Label>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Required Skills</CardTitle>
              <CardDescription>Skills needed for this position</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Status</CardTitle>
              <CardDescription>Current status: {formData.status}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => handleSave("published")} disabled={isSaving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={() => handleSave("draft")} disabled={isSaving} className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Job Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Views</span>
                <span className="font-medium">1,247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Applications</span>
                <span className="font-medium">45</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interviews</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Posted</span>
                <span className="font-medium">Jan 15, 2024</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
