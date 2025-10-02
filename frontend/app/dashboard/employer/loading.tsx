import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function EmployerDashboardLoading() {
  return (
    <div className="space-y-6 pb-10">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64 bg-gradient-to-r from-primary/10 to-blue-500/10" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="animate-in fade-in zoom-in-95 duration-500"
            style={{ animationDelay: `${100 + i * 50}ms` }}
          >
            <Card className="relative overflow-hidden border-l-4 border-l-transparent hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-16 bg-gradient-to-r from-primary/20 to-blue-500/20" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/30 to-blue-600/30 animate-pulse" />
            </Card>
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Jobs Section */}
        <div className="lg:col-span-2 animate-in fade-in slide-in-from-left-4 duration-500 delay-300">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-4 border rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-500"
                    style={{ animationDelay: `${400 + i * 100}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-3">
                          <Skeleton className="w-12 h-12 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-5 w-48" />
                              <Skeleton className="h-5 w-20" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 pl-15">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Section */}
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 delay-[400ms]">
          {/* Quick Actions Card */}
          <Card className="bg-gradient-to-br from-primary/5 to-blue-500/5">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-in fade-in slide-in-from-right-2 duration-500"
                  style={{ animationDelay: `${500 + i * 100}ms` }}
                >
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Company Info Card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-28" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="space-y-2 animate-in fade-in duration-500"
                  style={{ animationDelay: `${600 + i * 100}ms` }}
                >
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Loading Indicator */}
      <div className="fixed bottom-8 right-8 z-50 animate-in fade-in zoom-in-95 duration-500 delay-200">
        <Card className="shadow-2xl border-primary/20 bg-gradient-to-br from-primary/10 to-blue-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Loading your dashboard...
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
