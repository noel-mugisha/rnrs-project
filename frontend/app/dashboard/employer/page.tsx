"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building, Save, Camera, Plus, X } from "lucide-react"

// Mock company data
const mockCompany = {
  name: "TechCorp Rwanda",
  logo: "",
  industry: "Technology",
  size: "50-100 employees",
  founded: "2018",
  website: "https://techcorp.rw",
  location: "Kigali, Rwanda",
  description:
    "TechCorp Rwanda is a leading technology company focused on building innovative solutions for the African market. We're passionate about using technology to solve real-world problems and create opportunities for growth.",
  benefits: ["Health Insurance", "Flexible Hours", "Remote Work", "Professional Development", "Team Events"],
  socialLinks: {
    linkedin: "https://linkedin.com/company/techcorp-rwanda",
    twitter: "https://twitter.com/techcorprw",
    facebook: "",
  },
  contactInfo: {
    email: "hr@techcorp.rw",
    phone: "+250 788 123 456",
    address: "KG 123 St, Kigali, Rwanda",
  },
}

export default function EmployerProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState(mockCompany)
  const [newBenefit, setNewBenefit] = useState("")

  const profileCompleteness = 90

  const handleSave = async () => {
    setIsSaving(true)
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    setIsEditing(false)
  }

  const addBenefit = () => {
    if (newBenefit.trim() && !formData.benefits.includes(newBenefit.trim())) {
      setFormData((prev) => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()],
      }))
      setNewBenefit("")
    }
  }

  const removeBenefit = (benefitToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((benefit) => benefit !== benefitToRemove),
    }))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Company Profile</h1>
          <p className="text-muted-foreground">Manage your company information and attract top talent</p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
                <Save className="ml-2 h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </div>
      </div>

      {/* Profile Completeness */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Profile Completeness</span>
                <span className="text-sm text-muted-foreground">{profileCompleteness}%</span>
              </div>
              <Progress value={profileCompleteness} className="h-2" />
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Complete your profile to</p>
              <p className="text-sm font-medium">attract better candidates</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Basic Info */}
        <div className="space-y-6">
          {/* Company Logo & Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Logo */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={formData.logo || "/placeholder.svg"} />
                  <AvatarFallback className="text-lg bg-primary/10">
                    {formData.name
                      .split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Logo
                  </Button>
                )}
              </div>

              {/* Basic Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, industry: value }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Construction">Construction</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select
                    value={formData.size}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, size: value }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10 employees">1-10 employees</SelectItem>
                      <SelectItem value="11-50 employees">11-50 employees</SelectItem>
                      <SelectItem value="51-100 employees">51-100 employees</SelectItem>
                      <SelectItem value="101-500 employees">101-500 employees</SelectItem>
                      <SelectItem value="500+ employees">500+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="founded">Founded</Label>
                  <Input
                    id="founded"
                    value={formData.founded}
                    onChange={(e) => setFormData((prev) => ({ ...prev, founded: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
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
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {formData.benefits.map((benefit) => (
                  <Badge key={benefit} variant="secondary" className="flex items-center gap-1">
                    {benefit}
                    {isEditing && (
                      <button onClick={() => removeBenefit(benefit)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a benefit"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addBenefit()}
                  />
                  <Button onClick={addBenefit} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Description */}
          <Card>
            <CardHeader>
              <CardTitle>About the Company</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Company Description</Label>
                <Textarea
                  id="description"
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Tell candidates about your company, culture, and mission..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">HR Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.contactInfo.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contactInfo: { ...prev.contactInfo, email: e.target.value },
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.contactInfo.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contactInfo: { ...prev.contactInfo, phone: e.target.value },
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.contactInfo.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, address: e.target.value },
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, linkedin: e.target.value },
                      }))
                    }
                    disabled={!isEditing}
                    placeholder="https://linkedin.com/company/your-company"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    type="url"
                    value={formData.socialLinks.twitter}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, twitter: e.target.value },
                      }))
                    }
                    disabled={!isEditing}
                    placeholder="https://twitter.com/your-company"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    type="url"
                    value={formData.socialLinks.facebook}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, facebook: e.target.value },
                      }))
                    }
                    disabled={!isEditing}
                    placeholder="https://facebook.com/your-company"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
