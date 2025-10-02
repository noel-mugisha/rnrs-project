import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 bg-gradient-to-r from-primary/10 to-blue-500/10" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="animate-in fade-in zoom-in-95 duration-500"
            style={{ animationDelay: `${100 + i * 50}ms` }}
          >
            <Card className="hover:shadow-md transition-shadow duration-300 border-l-4 border-l-transparent">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-7 w-16 bg-gradient-to-r from-primary/20 to-blue-500/20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Card Skeleton */}
          <div className="animate-in fade-in slide-in-from-left-4 duration-500 delay-300">
          <Card className="border-2 border-dashed border-primary/20">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-60" />
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-2 w-full" />
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="flex gap-3 pt-2">
                  <Skeleton className="h-10 w-36" />
                </div>
              </div>
            </div>
          </Card>
          </div>

          {/* Applications Card Skeleton */}
          <div className="animate-in fade-in slide-in-from-left-4 duration-500 delay-[400ms]">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-9 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-500"
                    style={{ animationDelay: `${500 + i * 100}ms` }}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-4 rounded" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-8">
          {/* Suggested Jobs */}
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 delay-500">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="p-4 border rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-500"
                      style={{ animationDelay: `${600 + i * 100}ms` }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-3 w-32" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 delay-[600ms]">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-28" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-in fade-in slide-in-from-right-2 duration-500"
                    style={{ animationDelay: `${700 + i * 100}ms` }}
                  >
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
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
