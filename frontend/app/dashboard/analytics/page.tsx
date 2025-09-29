"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, TrendingDown, Users, Eye, Send, CheckCircle } from "lucide-react"

export default function AnalyticsPage() {
  const applicationData = [
    { month: "Jan", applications: 45, interviews: 12, hires: 3 },
    { month: "Feb", applications: 52, interviews: 15, hires: 4 },
    { month: "Mar", applications: 38, interviews: 10, hires: 2 },
    { month: "Apr", applications: 61, interviews: 18, hires: 5 },
    { month: "May", applications: 55, interviews: 16, hires: 4 },
    { month: "Jun", applications: 67, interviews: 20, hires: 6 },
  ]

  const jobPerformanceData = [
    { name: "Senior Software Engineer", views: 1250, applications: 45, conversion: 3.6 },
    { name: "Product Manager", views: 980, applications: 32, conversion: 3.3 },
    { name: "UX Designer", views: 750, applications: 28, conversion: 3.7 },
    { name: "Data Scientist", views: 650, applications: 22, conversion: 3.4 },
    { name: "DevOps Engineer", views: 520, applications: 18, conversion: 3.5 },
  ]

  const sourceData = [
    { name: "Direct", value: 35, color: "#8b5cf6" },
    { name: "LinkedIn", value: 28, color: "#06b6d4" },
    { name: "Indeed", value: 20, color: "#10b981" },
    { name: "Company Website", value: 12, color: "#f59e0b" },
    { name: "Referrals", value: 5, color: "#ef4444" },
  ]

  const metrics = [
    {
      title: "Total Applications",
      value: "318",
      change: "+12.5%",
      trend: "up",
      icon: Send,
      description: "This month",
    },
    {
      title: "Job Views",
      value: "4,165",
      change: "+8.2%",
      trend: "up",
      icon: Eye,
      description: "This month",
    },
    {
      title: "Interview Rate",
      value: "18.5%",
      change: "-2.1%",
      trend: "down",
      icon: Users,
      description: "Applications to interviews",
    },
    {
      title: "Hire Rate",
      value: "4.7%",
      change: "+0.8%",
      trend: "up",
      icon: CheckCircle,
      description: "Applications to hires",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your hiring performance and job metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <div className="flex items-center gap-1">
                      {metric.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={`text-sm font-medium ${metric.trend === "up" ? "text-green-500" : "text-red-500"}`}
                      >
                        {metric.change}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </div>
                  <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Application Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Application Trends</CardTitle>
            <CardDescription>Monthly applications, interviews, and hires</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={applicationData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Bar dataKey="applications" fill="#8b5cf6" name="Applications" />
                <Bar dataKey="interviews" fill="#06b6d4" name="Interviews" />
                <Bar dataKey="hires" fill="#10b981" name="Hires" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Application Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Application Sources</CardTitle>
            <CardDescription>Where candidates are finding your jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {sourceData.map((source) => (
                <div key={source.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                  <span className="text-sm">{source.name}</span>
                  <span className="text-sm text-muted-foreground ml-auto">{source.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Job Performance</CardTitle>
          <CardDescription>How your job postings are performing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobPerformanceData.map((job) => (
              <div key={job.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{job.name}</h4>
                  <Badge variant="outline">{job.conversion}% conversion</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Views</p>
                    <p className="font-medium">{job.views.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Applications</p>
                    <p className="font-medium">{job.applications}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Conversion Rate</p>
                    <Progress value={job.conversion} className="mt-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
