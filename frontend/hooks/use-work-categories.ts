"use client"

import { useState, useEffect } from 'react'
import { api, WorkCategory } from '@/lib/api'

export function useWorkCategories() {
  const [categories, setCategories] = useState<WorkCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await api.getWorkCategories()
      
      if (response.success && response.data) {
        setCategories(response.data)
      } else {
        setError('Failed to fetch work categories')
      }
    } catch (err) {
      setError('An error occurred while fetching work categories')
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryWorks = (categoryName: string): string[] => {
    const category = categories.find(cat => cat.category === categoryName)
    return category?.works || []
  }

  const getAllCategories = (): string[] => {
    return categories.map(cat => cat.category)
  }

  return {
    categories,
    isLoading,
    error,
    getCategoryWorks,
    getAllCategories,
    refetch: fetchCategories
  }
}