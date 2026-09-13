import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { detail: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8000";

    // Forward request to FastAPI email service
    const response = await fetch(`${backendUrl}/api/send-welcome-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.trim() }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { detail: data.detail || data.message || "Failed to send email via backend service." },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in Next.js email proxy route:", error);
    return NextResponse.json(
      {
        detail:
          error.message ||
          "Could not connect to FastAPI email service at http://localhost:8000. Make sure the backend server is running.",
      },
      { status: 502 }
    );
  }
}
