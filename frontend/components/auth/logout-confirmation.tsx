"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { LogOut, AlertTriangle } from "lucide-react"

interface LogoutConfirmationProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  userName?: string
}

export function LogoutConfirmation({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  userName 
}: LogoutConfirmationProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <AlertDialogTitle className="text-left">
                Sign Out Confirmation
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-left pt-2">
            {userName ? (
              <>
                Hi <strong>{userName}</strong>, you are about to be signed out of your account. 
                Are you sure you want to continue?
              </>
            ) : (
              "You are about to be signed out of your account. Are you sure you want to continue?"
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <AlertDialogCancel 
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Yes, Sign Out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}