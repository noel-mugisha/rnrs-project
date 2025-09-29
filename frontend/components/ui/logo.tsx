import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-auto",
    md: "h-12 w-auto",
    lg: "h-16 w-auto",
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image src="/images/logo.png" alt="RNRS Logo" width={64} height={64} className={sizeClasses[size]} />
      <div className="flex flex-col">
        <span className="font-bold text-lg leading-tight">RNRS</span>
        <span className="text-xs text-muted-foreground leading-tight">Employer to Employee</span>
      </div>
    </div>
  )
}
