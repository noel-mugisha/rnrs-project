"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, BellOff, Briefcase, MessageSquare, Calendar, CheckCircle, Clock, Trash2, Settings } from "lucide-react"

// Mock notifications data
const mockNotifications = [
  {
    id: "1",
    type: "application_update",
    title: "Application Status Updated",
    message: "Your application for Senior Software Engineer at TechCorp Rwanda has been moved to 'Under Review'",
    timestamp: "2024-01-15T10:30:00Z",
    read: false,
    icon: Briefcase,
    iconColor: "text-blue-500",
  },
  {
    id: "2",
    type: "interview_scheduled",
    title: "Interview Scheduled",
    message: "You have an interview scheduled for UX Designer position at Design Studio on January 20th at 2:00 PM",
    timestamp: "2024-01-14T14:15:00Z",
    read: false,
    icon: Calendar,
    iconColor: "text-green-500",
  },
  {
    id: "3",
    type: "job_match",
    title: "New Job Match",
    message: "We found 3 new jobs that match your profile. Check them out!",
    timestamp: "2024-01-13T09:00:00Z",
    read: true,
    icon: Briefcase,
    iconColor: "text-purple-500",
  },
  {
    id: "4",
    type: "profile_view",
    title: "Profile Viewed",
    message: "Your profile was viewed by a recruiter from StartupCo",
    timestamp: "2024-01-12T16:45:00Z",
    read: true,
    icon: MessageSquare,
    iconColor: "text-orange-500",
  },
  {
    id: "5",
    type: "application_reminder",
    title: "Application Reminder",
    message: "Don't forget to complete your application for Data Analyst position at Analytics Pro",
    timestamp: "2024-01-11T11:20:00Z",
    read: true,
    icon: Clock,
    iconColor: "text-yellow-500",
  },
]

const notificationSettings = {
  applicationUpdates: true,
  jobMatches: true,
  interviewReminders: true,
  profileViews: false,
  marketingEmails: false,
  weeklyDigest: true,
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [settings, setSettings] = useState(notificationSettings)
  const [showSettings, setShowSettings] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === notificationId ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId))
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"
    return date.toLocaleDateString()
  }

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">Stay updated on your job search progress</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
          <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Notification Settings */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Job Search Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="application-updates" className="text-sm">
                      Application status updates
                    </Label>
                    <Switch
                      id="application-updates"
                      checked={settings.applicationUpdates}
                      onCheckedChange={(checked) => updateSetting("applicationUpdates", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="job-matches" className="text-sm">
                      New job matches
                    </Label>
                    <Switch
                      id="job-matches"
                      checked={settings.jobMatches}
                      onCheckedChange={(checked) => updateSetting("jobMatches", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="interview-reminders" className="text-sm">
                      Interview reminders
                    </Label>
                    <Switch
                      id="interview-reminders"
                      checked={settings.interviewReminders}
                      onCheckedChange={(checked) => updateSetting("interviewReminders", checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Profile & Marketing</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="profile-views" className="text-sm">
                      Profile views
                    </Label>
                    <Switch
                      id="profile-views"
                      checked={settings.profileViews}
                      onCheckedChange={(checked) => updateSetting("profileViews", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="marketing-emails" className="text-sm">
                      Marketing emails
                    </Label>
                    <Switch
                      id="marketing-emails"
                      checked={settings.marketingEmails}
                      onCheckedChange={(checked) => updateSetting("marketingEmails", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="weekly-digest" className="text-sm">
                      Weekly digest
                    </Label>
                    <Switch
                      id="weekly-digest"
                      checked={settings.weeklyDigest}
                      onCheckedChange={(checked) => updateSetting("weeklyDigest", checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map((notification) => {
          const IconComponent = notification.icon
          return (
            <Card
              key={notification.id}
              className={`hover:shadow-md transition-shadow ${!notification.read ? "border-primary/50 bg-primary/5" : ""}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${notification.iconColor}`}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4
                          className={`font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {notification.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      </div>
                      {!notification.read && <div className="w-2 h-2 bg-primary rounded-full mt-2" />}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{formatTimestamp(notification.timestamp)}</span>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                            Mark as read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {notifications.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <BellOff className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                <p className="text-muted-foreground">You're all caught up! New notifications will appear here.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
