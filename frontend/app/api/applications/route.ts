import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { jobId, resume, coverLetter } = await request.json()

    // Mock application submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
      application: {
        id: Math.floor(Math.random() * 1000),
        jobId,
        status: "submitted",
        submittedDate: new Date().toISOString(),
        resume,
        coverLetter,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const mockApplications = [
      {
        id: 1,
        jobTitle: "Senior Software Engineer",
        company: "Tech Innovators Ltd",
        status: "interview",
        appliedDate: "2024-01-15",
        lastUpdate: "2024-01-20",
      },
      {
        id: 2,
        jobTitle: "Product Manager",
        company: "Digital Solutions Inc",
        status: "review",
        appliedDate: "2024-01-14",
        lastUpdate: "2024-01-14",
      },
      {
        id: 3,
        jobTitle: "UX Designer",
        company: "Creative Agency",
        status: "rejected",
        appliedDate: "2024-01-10",
        lastUpdate: "2024-01-18",
      },
    ]

    return NextResponse.json({
      success: true,
      applications: mockApplications,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
