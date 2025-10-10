import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

// Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'JOBSEEKER' | 'JOBPROVIDER' | 'ADMIN'
  emailVerified: boolean
  phone?: string
  createdAt: string
  updatedAt: string
  jobSeekerProfile?: {
    id: string
    userId: string
    desiredTitle?: string
    about?: string
    skills?: Array<{
      category: string
      work: string
    }>
    privacy?: any
    resumes?: Resume[]
  }
  employerProfile?: {
    id: string
    ownerId: string
    name: string
    website?: string
    industry?: string
    location?: string
    logoKey?: string
    jobs?: Job[]
  }
}

export interface WorkCategory {
  category: string
  works: string[]
}

export interface JobSeekerProfile {
  id: string
  userId: string
  desiredTitle?: string
  about?: string
  skills?: Array<{
    category: string
    work: string
  }>
  privacy?: any
}

export interface Employer {
  id: string
  ownerId: string
  name: string
  website?: string
  industry?: string
  location?: string
  logoKey?: string
}

export interface Job {
  id: string
  employerId: string
  workCategory: string
  workType: string
  title: string
  slug: string
  description: string
  requirements: string | string[]
  responsibilities?: string[]
  location: string
  salaryAmount: number
  salaryRange?: {
    min: number
    max: number
    currency: string
  }
  remote: boolean
  jobType: string
  experienceLevel: string
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED'
  postedAt?: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
  employer?: Employer
  _count?: {
    applications: number
  }
  userApplication?: {
    id: string
    status: string
    appliedAt: string
    createdAt: string
  }
}

export interface Application {
  id: string
  jobId: string
  jobSeekerId: string
  resumeId?: string
  coverLetter?: string
  status: 'APPLIED' | 'VIEWED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'OFFERED' | 'HIRED' | 'REJECTED'
  appliedAt: string
  updatedAt: string
  statusHistory?: Array<{
    status: string
    byUserId: string
    at: string
    note?: string
  }>
  job: Job
  jobSeeker?: {
    id: string
    userId: string
    user: {
      id: string
      firstName: string
      lastName: string
      email: string
      phone?: string
    }
  }
  resume?: {
    id: string
    fileName: string
    fileKey: string
  }
}

export interface Resume {
  id: string
  jobSeekerId: string
  fileKey: string
  fileName: string
  mimeType: string
  size: number
  parseStatus: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED'
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  type: string
  payload: any
  read: boolean
  createdAt: string
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_URL
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value: any) => void
    reject: (reason?: any) => void
  }> = []

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error)
      } else {
        resolve(token)
      }
    })
    
    this.failedQueue = []
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {},
    skipAuth = false
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const token = this.getAuthToken()

    const config: RequestInit = {
      credentials: 'include', // Important: include cookies
      headers: {
        'Content-Type': 'application/json',
        ...(token && !skipAuth && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && !skipAuth && endpoint !== '/auth/refresh' && endpoint !== '/auth/login') {
        if (this.isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject })
          }).then(() => {
            // Retry the original request with the new token
            return this.request<T>(endpoint, options, skipAuth)
          })
        }

        this.isRefreshing = true

        try {
          const refreshResponse = await this.refreshToken()
          if (refreshResponse.success && refreshResponse.data) {
            // Update stored token
            if (typeof window !== 'undefined') {
              localStorage.setItem('auth_token', refreshResponse.data.accessToken)
            }
            
            this.processQueue(null, refreshResponse.data.accessToken)
            
            // Retry the original request with the new token
            return this.request<T>(endpoint, options, skipAuth)
          } else {
            throw new Error('Token refresh failed')
          }
        } catch (refreshError) {
          this.processQueue(refreshError, null)
          clearAuthData()
          
          return {
            success: false,
            error: 'Session expired. Please login again.'
          }
        } finally {
          this.isRefreshing = false
        }
      }

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          const validationErrors = Array.isArray(data.errors) 
            ? data.errors.map((err: any) => err.message).join(', ')
            : data.message || 'Validation failed'
          throw new Error(validationErrors)
        }
        
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message
      }
    } catch (error) {
      console.error('API Error:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  async signup(userData: {
    firstName: string
    lastName: string
    email: string
    password: string
    role: 'JOBSEEKER' | 'JOBPROVIDER'
  }): Promise<ApiResponse<{ userId: string; emailVerificationSent: boolean }>> {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async verifyEmail(userId: string, otp: string): Promise<ApiResponse<{ verified: boolean; accessToken: string }>> {
    return this.request('/auth/verify-email-otp', {
      method: 'POST',
      body: JSON.stringify({ userId, otp }),
    })
  }

  async resendOTP(userId: string): Promise<ApiResponse> {
    return this.request('/auth/resend-email-otp', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    })
  }

  async login(email: string, password: string): Promise<ApiResponse<{ accessToken: string }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, true) // Skip auth header for login endpoint
  }

  async refreshToken(): Promise<ApiResponse<{ accessToken: string }>> {
    return this.request('/auth/refresh', {
      method: 'POST',
    }, true) // Skip auth header for refresh endpoint
  }

  async logout(): Promise<ApiResponse> {
    return this.request('/auth/logout', {
      method: 'POST',
    })
  }

  async getMe(): Promise<ApiResponse<User>> {
    return this.request('/users/me')
  }

  async updateMe(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    })
  }

  async getWorkCategories(): Promise<ApiResponse<WorkCategory[]>> {
    return this.request('/meta/work-categories')
  }

  async updateJobSeekerProfile(profileData: {
    phone?: string
    desiredTitle?: string
    about?: string
    skills?: Array<{
      category: string
      work: string
    }>
  }): Promise<ApiResponse<User>> {
    return this.request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    })
  }

  async getResumes(): Promise<ApiResponse<Resume[]>> {
    return this.request('/resumes')
  }

  async requestResumeUpload(fileData: {
    fileName: string
    fileType: string
    fileSize: number
  }): Promise<ApiResponse<{ 
    uploadUrl: string
    resumeId: string
    uploadParams: {
      timestamp: number
      public_id: string
      signature: string
      api_key: string
    }
  }>> {
    return this.request('/resumes/request-upload', {
      method: 'POST',
      body: JSON.stringify(fileData),
    })
  }

  async completeResumeUpload(data: {
    resumeId: string
    storageKey: string
  }): Promise<ApiResponse<Resume>> {
    return this.request('/resumes/complete-upload', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async deleteResume(resumeId: string): Promise<ApiResponse> {
    return this.request(`/resumes/${resumeId}`, {
      method: 'DELETE',
    })
  }

  async viewResumeForEmployer(resumeId: string): Promise<ApiResponse<{
    id: string
    fileName: string
    fileKey: string
    mimeType: string
    size: number
    parsedJson?: any
    createdAt: string
    downloadUrl?: string
  }>> {
    return this.request(`/resumes/view/${resumeId}`)
  }

  async createEmployer(employerData: {
    name: string
    website?: string
    industry?: string
    location?: string
  }): Promise<ApiResponse<Employer>> {
    return this.request('/employers', {
      method: 'POST',
      body: JSON.stringify(employerData),
    })
  }

  async getEmployer(employerId: string): Promise<ApiResponse<Employer>> {
    return this.request(`/employers/${employerId}`)
  }

  async updateEmployer(employerId: string, employerData: Partial<Employer>): Promise<ApiResponse<Employer>> {
    return this.request(`/employers/${employerId}`, {
      method: 'PATCH',
      body: JSON.stringify(employerData),
    })
  }

  async searchJobs(params: {
    q?: string
    location?: string
    remote?: boolean
    page?: number
    limit?: number
  } = {}): Promise<ApiResponse<{ jobs: Job[]; pagination: any }>> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })
    return this.request(`/jobs/search?${searchParams.toString()}`)
  }

  async getRecommendedJobs(limit?: number): Promise<ApiResponse<{ jobs: Job[] }>> {
    const params = limit ? `?limit=${limit}` : ''
    return this.request(`/jobs/recommended${params}`)
  }

  async getJob(jobId: string): Promise<ApiResponse<Job>> {
    return this.request(`/jobs/${jobId}`)
  }

  async createJob(jobData: {
    workCategory: string
    workType: string
    title: string
    description: string
    requirements: string
    location: string
    salaryAmount: number
    remote?: boolean
    jobType?: string
    experienceLevel?: string
    status?: 'DRAFT' | 'PUBLISHED'
  }): Promise<ApiResponse<Job>> {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    })
  }

  async getMyJobs(params: {
    status?: string
    page?: number
    limit?: number
  } = {}): Promise<ApiResponse<{ jobs: Job[]; pagination: any }>> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })
    const url = `/jobs/my-jobs?${searchParams.toString()}`
    
    // Debug: Check auth token
    const token = this.getAuthToken()
    console.log('\n=== API DEBUG: getMyJobs ===')
    console.log('URL:', `${this.baseUrl}${url}`)
    console.log('Has auth token:', !!token)
    if (token) {
      console.log('Token (first 50 chars):', token.substring(0, 50) + '...')
      // Decode JWT to see what's in it
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        console.log('Token payload:', payload)
      } catch (e) {
        console.log('Could not decode token')
      }
    }
    
    const response = await this.request(url)
    console.log('Response status:', response.success ? 'SUCCESS' : 'FAILED')
    console.log('Response data:', response.data)
    console.log('=== END DEBUG ===\n')
    
    // Handle "Job not found" as empty jobs case
    if (!response.success && (response.error === "Job not found" || response.error?.includes("not found"))) {
      return {
        success: true,
        data: {
          jobs: [],
          pagination: {
            total: 0,
            page: params.page || 1,
            limit: params.limit || 10,
            totalPages: 1
          }
        }
      }
    }
    
    return response
  }

  async getMyJob(jobId: string): Promise<ApiResponse<Job>> {
    return this.request(`/jobs/my-jobs/${jobId}`)
  }

  async updateJob(jobId: string, jobData: {
    workCategory?: string
    workType?: string
    title?: string
    description?: string
    requirements?: string
    location?: string
    salaryAmount?: number
    remote?: boolean
    jobType?: string
    experienceLevel?: string
    status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED'
  }): Promise<ApiResponse<Job>> {
    return this.request(`/jobs/${jobId}`, {
      method: 'PATCH',
      body: JSON.stringify(jobData),
    })
  }

  async publishJob(jobId: string): Promise<ApiResponse<Job>> {
    return this.request(`/jobs/${jobId}/publish`, {
      method: 'POST',
    })
  }

  async deleteJob(jobId: string): Promise<ApiResponse> {
    return this.request(`/jobs/${jobId}`, {
      method: 'DELETE',
    })
  }

  // JobProvider Application Management
  async getJobApplications(jobId: string, params: {
    status?: string
    page?: number
    limit?: number
  } = {}): Promise<ApiResponse<{ applications: Application[]; pagination: any }>> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })
    return this.request(`/applications/jobs/${jobId}?${searchParams.toString()}`)
  }

  async getEmployerApplications(params: {
    q?: string
    status?: string
    jobId?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<ApiResponse<{ applications: Application[]; pagination: any }>> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString())
      }
    })
    return this.request(`/applications/employer?${searchParams.toString()}`)
  }

  // Legacy method for backward compatibility
  async getJobApplicants(jobId: string, params: {
    status?: string
    page?: number
    limit?: number
  } = {}): Promise<ApiResponse<{ applications: Application[]; total: number }>> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })
    return this.request(`/jobs/${jobId}/applicants?${searchParams.toString()}`)
  }

  async applyToJob(jobId: string, applicationData: {
    resumeId?: string
    coverLetter?: string
  }, idempotencyKey?: string): Promise<ApiResponse<{ applicationId: string }>> {
    const headers: Record<string, string> = {}
    if (idempotencyKey) {
      headers['idempotency-key'] = idempotencyKey
    }

    return this.request(`/applications/jobs/${jobId}/apply`, {
      method: 'POST',
      headers,
      body: JSON.stringify(applicationData),
    })
  }

  async getMyApplications(params: {
    q?: string
    status?: string
    page?: number
    limit?: number
  } = {}): Promise<ApiResponse<{ applications: Application[]; pagination: any }>> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString())
      }
    })
    return this.request(`/applications?${searchParams.toString()}`)
  }

  async getApplication(applicationId: string): Promise<ApiResponse<Application>> {
    return this.request(`/applications/${applicationId}`)
  }

  async updateApplicationStatus(applicationId: string, status: string, note?: string): Promise<ApiResponse<Application>> {
    return this.request(`/applications/${applicationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    })
  }

  async getNotifications(params: {
    read?: boolean
    page?: number
    limit?: number
  } = {}): Promise<ApiResponse<{ notifications: Notification[]; unreadCount: number }>> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })
    return this.request(`/notifications?${searchParams.toString()}`)
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse> {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    })
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse> {
    return this.request('/notifications/mark-all-read', {
      method: 'PATCH',
    })
  }
}

export const api = new ApiClient()

export const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_data')
  }
}

export const setAuthData = (token: string, user: User) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('user_role', user.role)
    localStorage.setItem('user_data', JSON.stringify(user))
  }
}

export const getAuthData = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    const role = localStorage.getItem('user_role')
    const userData = localStorage.getItem('user_data')
    
    return {
      token,
      role: role as 'JOBSEEKER' | 'JOBPROVIDER' | 'ADMIN' | null,
      user: userData ? JSON.parse(userData) as User : null
    }
  }
  
  return { token: null, role: null, user: null }
}