import { type NextRequest, NextResponse } from "next/server"

const mockJobs = [
  {
    id: 1,
    title: "Senior Software Engineer",
    company: "Tech Innovators Ltd",
    location: "Kigali, Rwanda",
    type: "Full-time",
    remote: true,
    salary: "$80,000 - $120,000",
    description: "We are looking for a Senior Software Engineer to join our growing team...",
    requirements: ["5+ years experience", "React", "Node.js", "TypeScript"],
    postedDate: "2024-01-15",
    applicationDeadline: "2024-02-15",
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    title: "Product Manager",
    company: "Digital Solutions Inc",
    location: "Kigali, Rwanda",
    type: "Full-time",
    remote: false,
    salary: "$70,000 - $100,000",
    description: "Join our product team to drive innovation and growth...",
    requirements: ["3+ years PM experience", "Agile", "Analytics", "Leadership"],
    postedDate: "2024-01-14",
    applicationDeadline: "2024-02-14",
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    title: "UX Designer",
    company: "Creative Agency",
    location: "Kigali, Rwanda",
    type: "Contract",
    remote: true,
    salary: "$50,000 - $70,000",
    description: "Create amazing user experiences for our clients...",
    requirements: ["Figma", "User Research", "Prototyping", "Design Systems"],
    postedDate: "2024-01-13",
    applicationDeadline: "2024-02-13",
    logo: "/placeholder.svg?height=40&width=40",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const location = searchParams.get("location") || ""
    const type = searchParams.get("type") || ""
    const remote = searchParams.get("remote")

    let filteredJobs = mockJobs

    if (search) {
      filteredJobs = filteredJobs.filter(
        (job) =>
          job.title.toLowerCase().includes(search.toLowerCase()) ||
          job.company.toLowerCase().includes(search.toLowerCase()) ||
          job.requirements.some((req) => req.toLowerCase().includes(search.toLowerCase())),
      )
    }

    if (location) {
      filteredJobs = filteredJobs.filter((job) => job.location.toLowerCase().includes(location.toLowerCase()))
    }

    if (type) {
      filteredJobs = filteredJobs.filter((job) => job.type.toLowerCase() === type.toLowerCase())
    }

    if (remote === "true") {
      filteredJobs = filteredJobs.filter((job) => job.remote)
    }

    return NextResponse.json({
      success: true,
      jobs: filteredJobs,
      total: filteredJobs.length,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const jobData = await request.json()

    // Mock job creation
    const newJob = {
      id: Math.floor(Math.random() * 1000),
      ...jobData,
      postedDate: new Date().toISOString().split("T")[0],
      logo: "/placeholder.svg?height=40&width=40",
    }

    return NextResponse.json({
      success: true,
      job: newJob,
      message: "Job posted successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
