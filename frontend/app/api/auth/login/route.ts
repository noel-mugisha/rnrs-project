import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (email === "demo@jobseeker.com" && password === "password123") {
      return NextResponse.json({
        success: true,
        user: {
          id: 1,
          email: "demo@jobseeker.com",
          name: "John Doe",
          role: "JOBSEEKER",
        },
        token: "mock_jwt_token_jobseeker",
      });
    }

    if (email === "demo@employer.com" && password === "password123") {
      return NextResponse.json({
        success: true,
        user: {
          id: 2,
          email: "demo@employer.com",
          name: "Jane Smith",
          role: "JOBPROVIDER",
          company: "Tech Corp",
        },
        token: "mock_jwt_token_employer",
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
