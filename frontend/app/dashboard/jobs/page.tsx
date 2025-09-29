"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, Eye, Edit, MoreHorizontal, Users, Calendar, DollarSign, MapPin, Clock } from "lucide-react"
import Link from "next/link"

// Mock jobs data
const mockJobs = [
  {
    id: "1",
    title: "Senior Software Engineer",
    department: "Engineering",
    location: "Kigali, Rwanda",
    type: "Full-time",
    salary: "$60,000 - $80,000",
    status: "Active",
    applicants: 24,
    views: 156,
    postedAt: "2024-01-15",
    expiresAt: "2024-02-15",
    remote: true,
  },
  {
    id: "2",
    title: "UX Designer",
    department: "Design",
    location: "Kigali, Rwanda",
    type: "Full-time",
    salary: "$50,000 - $65,000",
    status: "Active",
    applicants: 18,
    views: 89,
    postedAt: "2024-01-10",
    expiresAt: "2024-02-10",
    remote: true,
  },
  {
    id: "3",
    title: "Marketing Manager",
    department: "Marketing",
    location: "Kigali, Rwanda",
    type: "Full-time",
    salary: "$45,000 - $55,000",
    status: "Draft",
    applicants: 0,
    views: 0,
    postedAt: "2024-01-08",
    expiresAt: "2024-02-08",
    remote: false,
  },
  {
    id: "4",
    title: "Data Analyst",
    department: "Analytics",
    location: "Remote",
    type: "Contract",
    salary: "$40,000 - $50,000",
    status: "Paused",
    applicants: 12,
    views: 67,
    postedAt: "2024-01-05",
    expiresAt: "2024-02-05",
    remote: true,
  },
  {
    id: "5",
    title: "Frontend Developer",
    department: "Engineering",
    location: "Kigali, Rwanda",
    type: "Full-time",
    salary: "$45,000 - $60,000",
    status: "Expired",
    applicants: 31,
    views: 203,
    postedAt: "2023-12-01",
    expiresAt: "2024-01-01",
    remote: true,
  },
]

const statusOptions = ["All Status", "Active", "Draft", "Paused", "Expired"]
const departmentOptions = ["All Departments", "Engineering", "Design", "Marketing", "Analytics", "Sales", "HR"]

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState(mockJobs)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [departmentFilter, setDepartmentFilter] = useState("All Departments")
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null)

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "All Status" || job.status === statusFilter
    const matchesDepartment = departmentFilter === "All Departments" || job.department === departmentFilter

    return matchesSearch && matchesStatus && matchesDepartment
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500"
      case "Draft":
        return "bg-gray-500"
      case "Paused":
        return "bg-yellow-500"
      case "Expired":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusStats = () => {
    return {
      total: jobs.length,
      active: jobs.filter((j) => j.status === "Active").length,
      draft: jobs.filter((j) => j.status === "Draft").length,
      paused: jobs.filter((j) => j.status === "Paused").length,
      expired: jobs.filter((j) => j.status === "Expired").length,
    }
  }

  const handleDeleteJob = (jobId: string) => {
    setJobs((prev) => prev.filter((job) => job.id !== jobId))
    setShowDeleteDialog(null)
  }

  const handleDuplicateJob = (jobId: string) => {
    const jobToDuplicate = jobs.find((job) => job.id === jobId)
    if (jobToDuplicate) {
      const newJob = {
        ...jobToDuplicate,
        id: Date.now().toString(),
        title: `${jobToDuplicate.title} (Copy)`,
        status: "Draft",
        applicants: 0,
        views: 0,
        postedAt: new Date().toISOString().split("T")[0],
      }
      setJobs((prev) => [newJob, ...prev])
    }
  }

  const stats = getStatusStats()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Jobs</h1>
          <p className="text-muted-foreground">Create and manage your job postings</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/jobs/new">
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Jobs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-500">{stats.draft}</p>
              <p className="text-sm text-muted-foreground">Draft</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-500">{stats.paused}</p>
              <p className="text-sm text-muted-foreground">Paused</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{stats.expired}</p>
              <p className="text-sm text-muted-foreground">Expired</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(job.status)}`} />
                          <Badge variant="secondary" className="text-xs">
                            {job.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span>{job.department}</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Posted {new Date(job.postedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="outline">{job.type}</Badge>
                        {job.remote && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Remote
                          </Badge>
                        )}
                        <div className="flex items-center gap-1 font-medium text-primary">
                          <DollarSign className="h-4 w-4" />
                          {job.salary}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {job.applicants} applicants
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {job.views} views
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Expires {new Date(job.expiresAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/jobs/${job.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/dashboard/jobs/${job.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDuplicateJob(job.id)}>Duplicate Job</DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/jobs/${job.id}/applications`}>View Applications</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowDeleteDialog(job.id)} className="text-destructive">
                        Delete Job
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== "All Status" || departmentFilter !== "All Departments"
                    ? "Try adjusting your search criteria"
                    : "You haven't posted any jobs yet"}
                </p>
                <Button asChild>
                  <Link href="/dashboard/jobs/new">Post Your First Job</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job Posting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete this job posting? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => showDeleteDialog && handleDeleteJob(showDeleteDialog)}>
                Delete Job
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
