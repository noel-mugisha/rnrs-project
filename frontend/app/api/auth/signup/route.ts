import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, role } = await request.json()

    // Mock signup logic
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: "Account created successfully. Please check your email for verification.",
      user: {
        id: Math.floor(Math.random() * 1000),
        email,
        name: `${firstName} ${lastName}`,
        role,
        emailVerified: false,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
