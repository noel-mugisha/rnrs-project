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
  // Job seeker profile data (included when role is JOBSEEKER)
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
  // Employer profile data (included when role is JOBPROVIDER)
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
  title: string
  slug: string
  description: string
  responsibilities: string[]
  requirements: string[]
  location?: string
  remote: boolean
  jobType: string
  experienceLevel: string
  salaryRange?: any
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED'
  postedAt?: string
  expiresAt?: string
  employer: Employer
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
  job: Job
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

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const token = this.getAuthToken()

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        // Handle validation errors (422) specially
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

  // Authentication API
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
    })
  }

  async refreshToken(): Promise<ApiResponse<{ accessToken: string }>> {
    return this.request('/auth/refresh', {
      method: 'POST',
    })
  }

  async logout(): Promise<ApiResponse> {
    return this.request('/auth/logout', {
      method: 'POST',
    })
  }

  // User API
  async getMe(): Promise<ApiResponse<User>> {
    return this.request('/users/me')
  }

  async updateMe(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    })
  }

  // Meta API
  async getWorkCategories(): Promise<ApiResponse<WorkCategory[]>> {
    return this.request('/meta/work-categories')
  }

  // Job Seeker Profile API (Note: This is handled through the main user profile endpoint)
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

  // Resume API
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

  // Employer API
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

  // Jobs API
  async searchJobs(params: {
    q?: string
    location?: string
    remote?: boolean
    page?: number
    limit?: number
  }): Promise<ApiResponse<{ jobs: Job[]; total: number; page: number; pages: number }>> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })
    return this.request(`/jobs/search?${searchParams.toString()}`)
  }

  async getJob(jobId: string): Promise<ApiResponse<Job>> {
    return this.request(`/jobs/${jobId}`)
  }

  async createJob(employerId: string, jobData: {
    title: string
    description: string
    responsibilities: string[]
    requirements: string[]
    location?: string
    remote: boolean
    jobType: string
    experienceLevel: string
    salaryRange?: any
  }): Promise<ApiResponse<Job>> {
    return this.request(`/employers/${employerId}/jobs`, {
      method: 'POST',
      body: JSON.stringify(jobData),
    })
  }

  async updateJob(jobId: string, jobData: Partial<Job>): Promise<ApiResponse<Job>> {
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

  // Applications API
  async applyToJob(jobId: string, applicationData: {
    resumeId?: string
    coverLetter?: string
  }, idempotencyKey?: string): Promise<ApiResponse<Application>> {
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

  // Notifications API
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

// Auth context helpers
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