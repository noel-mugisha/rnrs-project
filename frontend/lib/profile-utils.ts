import { User, JobSeekerProfile } from './api'

export interface ProfileCompleteness {
  percentage: number
  completedFields: string[]
  missingFields: string[]
  suggestions: string[]
}

export function calculateProfileCompleteness(user: User, profile?: JobSeekerProfile): ProfileCompleteness {
  const completedFields: string[] = []
  const missingFields: string[] = []
  const suggestions: string[] = []

  // Essential fields for job seekers
  const essentialFields = [
    { key: 'firstName', label: 'First Name', value: user.firstName },
    { key: 'lastName', label: 'Last Name', value: user.lastName },
    { key: 'email', label: 'Email', value: user.email },
    { key: 'phone', label: 'Phone Number', value: user.phone },
    { key: 'desiredTitle', label: 'Desired Job Title', value: profile?.desiredTitle },
    { key: 'about', label: 'About/Bio', value: profile?.about },
    { key: 'skills', label: 'Skills', value: profile?.skills?.length ? profile.skills : null },
  ]

  // Check each essential field
  essentialFields.forEach((field) => {
    if (field.value && (typeof field.value === 'string' ? field.value.trim() : field.value)) {
      completedFields.push(field.label)
    } else {
      missingFields.push(field.label)
      
      // Add specific suggestions based on missing fields
      switch (field.key) {
        case 'phone':
          suggestions.push('Add your phone number to help employers contact you')
          break
        case 'desiredTitle':
          suggestions.push('Specify your desired job title to get better matches')
          break
        case 'about':
          suggestions.push('Write a brief bio about yourself and your experience')
          break
        case 'skills':
          suggestions.push('Add your skills to showcase your capabilities')
          break
      }
    }
  })

  // Calculate percentage
  const percentage = Math.round((completedFields.length / essentialFields.length) * 100)

  return {
    percentage,
    completedFields,
    missingFields,
    suggestions: suggestions.slice(0, 3), // Limit to top 3 suggestions
  }
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    'APPLIED': 'bg-blue-500',
    'VIEWED': 'bg-purple-500',
    'SHORTLISTED': 'bg-yellow-500',
    'INTERVIEW_SCHEDULED': 'bg-green-500',
    'OFFERED': 'bg-emerald-500',
    'HIRED': 'bg-green-600',
    'REJECTED': 'bg-red-500',
    'Under Review': 'bg-blue-500',
    'Interview Scheduled': 'bg-green-500',
    'Shortlisted': 'bg-yellow-500',
  }
  
  return statusColors[status] || 'bg-gray-500'
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours === 1 ? '' : 's'} ago`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days === 1 ? '' : 's'} ago`
  } else if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800)
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`
  } else {
    const months = Math.floor(diffInSeconds / 2592000)
    return `${months} month${months === 1 ? '' : 's'} ago`
  }
}