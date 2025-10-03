"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { X, Plus, Loader2 } from "lucide-react"
import { useWorkCategories } from "@/hooks/use-work-categories"
import { motion, AnimatePresence } from "framer-motion"

interface Skill {
  category: string
  work: string
}

interface SkillsSelectorProps {
  selectedSkills: Skill[]
  onSkillsChange: (skills: Skill[]) => void
  disabled?: boolean
  className?: string
}

export function SkillsSelector({ selectedSkills, onSkillsChange, disabled = false, className }: SkillsSelectorProps) {
  const { categories, isLoading, error, getCategoryWorks } = useWorkCategories()
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedWork, setSelectedWork] = useState<string>("")

  const addSkill = () => {
    if (selectedCategory && selectedWork) {
      const newSkill = { category: selectedCategory, work: selectedWork }
      const isAlreadySelected = selectedSkills.some(
        skill => skill.category === newSkill.category && skill.work === newSkill.work
      )
      
      if (!isAlreadySelected) {
        onSkillsChange([...selectedSkills, newSkill])
      }
      
      setSelectedWork("")
    }
  }

  const removeSkill = (skillToRemove: Skill) => {
    onSkillsChange(
      selectedSkills.filter(
        skill => !(skill.category === skillToRemove.category && skill.work === skillToRemove.work)
      )
    )
  }

  const availableWorks = selectedCategory ? getCategoryWorks(selectedCategory) : []

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-muted-foreground">Loading work categories...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      {/* Skill Selection */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Work Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value)
                setSelectedWork("")
              }}
              disabled={disabled}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.category} value={category.category}>
                    {category.category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="work">Specific Work</Label>
            <Select
              value={selectedWork}
              onValueChange={setSelectedWork}
              disabled={disabled || !selectedCategory}
            >
              <SelectTrigger id="work">
                <SelectValue placeholder={selectedCategory ? "Select work type" : "Select category first"} />
              </SelectTrigger>
              <SelectContent>
                {availableWorks.map((work) => (
                  <SelectItem key={work} value={work}>
                    {work}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          type="button"
          onClick={addSkill}
          disabled={disabled || !selectedCategory || !selectedWork}
          size="sm"
          className="w-full md:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </div>

      {/* Selected Skills Display */}
      {selectedSkills.length > 0 && (
        <div className="space-y-3 mt-6">
          <Label>Selected Skills</Label>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {selectedSkills.map((skill) => (
                <motion.div
                  key={`${skill.category}-${skill.work}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge variant="secondary" className="flex items-center gap-1 py-2 px-3">
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-medium text-muted-foreground">{skill.category}</span>
                      <span className="text-sm">{skill.work}</span>
                    </div>
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {selectedSkills.length === 0 && !disabled && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-muted-foreground mt-4"
        >
          <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No skills selected yet</p>
          <p className="text-sm">Choose from the categories above to add your skills</p>
        </motion.div>
      )}
    </div>
  )
}