"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { ThemeToggle } from "@/components/theme-toggle"
import { Search, MapPin, Clock, DollarSign, Building, Filter, Heart, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { api, Job } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

// Skeleton components for loading states
function JobCardSkeleton() {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="h-6 w-64" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex items-center gap-4 text-sm mb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-3" />
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-14" />
                  <Skeleton className="h-5 w-18" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 ml-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function JobSkeletonGrid() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <JobCardSkeleton key={index} />
      ))}
    </div>
  )
}

// Helper function to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  if (diffInSeconds < 2419200) return `${Math.floor(diffInSeconds / 604800)} weeks ago`
  return `${Math.floor(diffInSeconds / 2419200)} months ago`
}

// Helper function to format salary
function formatSalary(job: Job): string {
  if (job.salaryAmount) {
    return `RWF ${job.salaryAmount.toLocaleString()}`
  }
  return 'Salary not disclosed'
}

export default function JobsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  
  // State management
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [jobTypeFilter, setJobTypeFilter] = useState("all")
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [popularCategories, setPopularCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Fetch jobs from API
  const fetchJobs = async (page: number = 1, forceRefresh: boolean = false) => {
    if (forceRefresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    setError(null)

    try {
      const params = {
        page,
        limit: 10,
        ...(searchQuery && { q: searchQuery }),
        ...(locationFilter && locationFilter !== 'all' && { location: locationFilter }),
        ...(remoteOnly && { remote: true })
      }

      const response = await api.searchJobs(params)
      
      if (response.success && response.data) {
        setJobs(response.data.jobs || [])
        if (response.data.pagination) {
          setTotalPages(Math.ceil(response.data.pagination.total / response.data.pagination.limit))
        }
      } else {
        setError(response.error || 'Failed to fetch jobs')
        setJobs([])
      }
    } catch (err) {
      setError('An error occurred while fetching jobs')
      setJobs([])
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await api.getWorkCategories();
        if (response.success && response.data) {
          setPopularCategories(response.data.map(cat => cat.category));
        }
      } catch (error) {
        console.error("Failed to fetch popular categories", error);
        toast.error("Could not load job categories.");
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Initial load and search effects
  useEffect(() => {
    fetchJobs(1)
  }, [])

  // Refetch when search params change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1)
      fetchJobs(1)
    }, 500) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchQuery, locationFilter, remoteOnly])

  // Handle page changes
  useEffect(() => {
    if (currentPage > 1) {
      fetchJobs(currentPage, true)
    }
  }, [currentPage])

  // Handle View Details with authentication check
  const handleViewDetails = (jobId: string) => {
    if (!isAuthenticated) {
      toast.info('Please sign in to view job details', {
        action: {
          label: 'Sign In',
          onClick: () => router.push('/auth/login')
        }
      })
      return
    }
    router.push(`/jobs/${jobId}`)
  }

  // Filter jobs based on job type
  const filteredJobs = jobs.filter((job) => {
    const matchesJobType = jobTypeFilter === 'all' || job.jobType === jobTypeFilter
    return matchesJobType
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Logo />
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/jobs" className="text-sm font-medium text-primary">
                Find Jobs
              </Link>
              <Link href="/employers" className="text-sm font-medium hover:text-primary transition-colors">
                For Employers
              </Link>
              <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
                About
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {!isAuthenticated ? (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/auth/signup">Get Started</Link>
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Welcome, {user?.firstName}
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <div className="flex items-center justify-between lg:hidden">
                <h3 className="font-semibold">Filters</h3>
                <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilters ? "Hide" : "Show"} Filters
                </Button>
              </div>

              <div className={`space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">Search & Filter</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search jobs, companies, skills..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Location</label>
                      <Select value={locationFilter} onValueChange={setLocationFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All locations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All locations</SelectItem>
                          <SelectItem value="Kigali">Kigali</SelectItem>
                          <SelectItem value="Remote">Remote</SelectItem>
                          <SelectItem value="Butare">Butare</SelectItem>
                          <SelectItem value="Musanze">Musanze</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Job Type</label>
                      <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All types</SelectItem>
                          <SelectItem value="FULL_TIME">Full-time</SelectItem>
                          <SelectItem value="PART_TIME">Part-time</SelectItem>
                          <SelectItem value="CONTRACT">Contract</SelectItem>
                          <SelectItem value="INTERNSHIP">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="remote" checked={remoteOnly} onCheckedChange={(checked) => setRemoteOnly(Boolean(checked))} />
                      <label htmlFor="remote" className="text-sm font-medium">
                        Remote jobs only
                      </label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">Popular Categories</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {isLoadingCategories ? (
                        Array.from({ length: 6 }).map((_, index) => (
                          <Skeleton key={index} className="h-5 w-3/4" />
                        ))
                      ) : (
                        popularCategories.map((category) => (
                          <button
                            key={category}
                            className="block w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setSearchQuery(category)}
                          >
                            {category}
                          </button>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Job Opportunities</h1>
                  <p className="text-muted-foreground">
                    {isLoading ? 'Loading...' : `${filteredJobs.length} jobs found`}
                  </p>
                </div>
                <Select defaultValue="recent">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="salary-high">Salary: High to Low</SelectItem>
                    <SelectItem value="salary-low">Salary: Low to High</SelectItem>
                    <SelectItem value="company">Company A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Loading State */}
              {isLoading && <JobSkeletonGrid />}
              
              {/* Error State */}
              {error && !isLoading && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Failed to load jobs</h3>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button onClick={() => fetchJobs(currentPage, true)}>
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Jobs List */}
              {!isLoading && !error && (
                <div className="space-y-4">
                  {isRefreshing && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">Refreshing...</span>
                    </div>
                  )}
                  
                  {filteredJobs.map((job) => (
                    <Card key={job.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-lg font-semibold hover:text-primary transition-colors cursor-pointer" 
                                      onClick={() => handleViewDetails(job.id)}>
                                    {job.title}
                                  </h3>
                                  {job.status === 'PUBLISHED' && job.postedAt && (
                                    <Badge variant="secondary" className="text-xs">
                                      Featured
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                  <div className="flex items-center gap-1">
                                    <Building className="h-4 w-4" />
                                    {job.employer?.name || 'Company Name'}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {job.location}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {formatRelativeTime(job.postedAt || job.createdAt)}
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{job.description}</p>
                                <div className="flex items-center gap-2 mb-3">
                                  <Badge variant="outline">{job.jobType?.replace('_', '-') || 'Full-time'}</Badge>
                                  {job.remote && (
                                    <Badge variant="outline" className="text-green-600 border-green-600">
                                      Remote
                                    </Badge>
                                  )}
                                  <div className="flex items-center gap-1 text-sm font-medium text-primary">
                                    <DollarSign className="h-4 w-4" />
                                    {formatSalary(job)}
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {job.requirements && (
                                    Array.isArray(job.requirements) 
                                      ? job.requirements.slice(0, 4).map((skill, index) => (
                                          <Badge key={index} variant="secondary" className="text-xs">
                                            {skill}
                                          </Badge>
                                        ))
                                      : typeof job.requirements === 'string' 
                                        ? job.requirements.split(',').slice(0, 4).map((skill, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                              {skill.trim()}
                                            </Badge>
                                          ))
                                        : null
                                  )}
                                  <Badge variant="secondary" className="text-xs">
                                    {job.workCategory}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {job.experienceLevel}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <Button variant="ghost" size="sm">
                              <Heart className="h-4 w-4" />
                            </Button>
                            <Button size="sm" onClick={() => handleViewDetails(job.id)}>
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* No Jobs Found */}
              {!isLoading && !error && filteredJobs.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                    <p className="text-muted-foreground mb-4">Try adjusting your search criteria or filters</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("")
                        setLocationFilter("all")
                        setJobTypeFilter("all")
                        setRemoteOnly(false)
                        setCurrentPage(1)
                        fetchJobs(1, true)
                      }}
                    >
                      Clear all filters
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Pagination */}
              {!isLoading && !error && filteredJobs.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum ? "bg-primary text-primary-foreground" : ""}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}