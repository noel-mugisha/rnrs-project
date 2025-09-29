import { type NextRequest, NextResponse } from "next/server"

const mockJob = {
  id: 1,
  title: "Senior Software Engineer",
  company: "Tech Innovators Ltd",
  location: "Kigali, Rwanda",
  type: "Full-time",
  remote: true,
  salary: "$80,000 - $120,000",
  description:
    "We are looking for a Senior Software Engineer to join our growing team and help build the next generation of our platform. You'll work with cutting-edge technologies and collaborate with a talented team of engineers, designers, and product managers.",
  responsibilities: [
    "Design and develop scalable web applications",
    "Mentor junior developers and conduct code reviews",
    "Collaborate with cross-functional teams to deliver features",
    "Participate in architectural decisions and technical planning",
    "Ensure code quality and best practices",
  ],
  requirements: [
    "5+ years of software development experience",
    "Strong proficiency in React and Node.js",
    "Experience with TypeScript and modern JavaScript",
    "Knowledge of cloud platforms (AWS, Azure, or GCP)",
    "Bachelor's degree in Computer Science or related field",
  ],
  benefits: [
    "Competitive salary and equity package",
    "Health, dental, and vision insurance",
    "Flexible working hours and remote work options",
    "Professional development budget",
    "Modern office space in Kigali",
  ],
  skills: ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL"],
  experienceLevel: "Senior",
  educationLevel: "Bachelor's Degree",
  postedDate: "2024-01-15",
  applicationDeadline: "2024-02-15",
  startDate: "2024-03-01",
  logo: "/placeholder.svg?height=60&width=60",
  companyInfo: {
    name: "Tech Innovators Ltd",
    description: "A leading technology company focused on building innovative solutions for businesses across Africa.",
    size: "50-100 employees",
    industry: "Technology",
    website: "https://techinnovators.rw",
  },
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Mock job retrieval
    if (id === "1") {
      return NextResponse.json({
        success: true,
        job: mockJob,
      })
    }

    return NextResponse.json({ success: false, message: "Job not found" }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const updateData = await request.json()

    // Mock job update
    const updatedJob = {
      ...mockJob,
      ...updateData,
      id: Number.parseInt(id),
    }

    return NextResponse.json({
      success: true,
      job: updatedJob,
      message: "Job updated successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Mock job deletion
    return NextResponse.json({
      success: true,
      message: "Job deleted successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
