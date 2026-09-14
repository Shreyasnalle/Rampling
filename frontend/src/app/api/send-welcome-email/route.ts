import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const EMAIL_BODY = `Hey, I am Shreyas, thanks for joining Rampling! It’s great to have you early on.

At its core, Rampling is designed to take the guesswork out of your backend’s security and performance. Rampling will help you build faster, ship with confidence and ensure your applications effortlessly handle real-world scale.

I'm reaching out to let you know that Rampling is currently in active development. Because you joined early you will be the very first to know the moment I launch, and you'll get early access too. 

Thank you so much for believing in this project. If you have any thoughts, ideas, or specific challenges you’d love Rampling to solve, simply hit reply to this email, I’d genuinely love to hear from you.

Warmly,
Shreyas Nalle`;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    const gmailUser = (process.env.GMAIL_USER || "").trim().replace(/['"]/g, "");
    const gmailAppPassword = (process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "").replace(/['"]/g, "").trim();

    if (!gmailUser || !gmailAppPassword) {
      console.error("[Email API] Missing Gmail credentials in environment variables:", {
        hasUser: Boolean(gmailUser),
        userLength: gmailUser.length,
        hasPassword: Boolean(gmailAppPassword),
        passwordLength: gmailAppPassword.length,
      });
      return NextResponse.json(
        {
          detail:
            "GMAIL_USER or GMAIL_APP_PASSWORD is not configured in the frontend environment variables.",
        },
        { status: 500 }
      );
    }

    // Configure Nodemailer with direct SSL on port 465 (required for reliable delivery on Vercel/serverless cloud hosts)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });

    const subject = "Welcome to Rampling";

    // Simple, normal email without any custom CSS or complex styling
    const simpleHtml = EMAIL_BODY.split("\n\n")
      .map((paragraph) => `<p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6;">${paragraph.replace(/\n/g, "<br>")}</p>`)
      .join("");

    await transporter.sendMail({
      from: `Rampling <${gmailUser}>`,
      to: email.trim(),
      subject,
      text: EMAIL_BODY,
      html: simpleHtml,
    });

    return NextResponse.json({
      success: true,
      message: `Welcome email sent successfully to ${email.trim()}`,
    });
  } catch (error: any) {
    console.error("Error sending welcome email via Nodemailer:", error);

    // Provide user-friendly diagnostic if authentication fails
    if (error?.responseCode === 535 || error?.message?.includes("Invalid login")) {
      return NextResponse.json(
        {
          detail:
            "Gmail authentication failed. Please verify that 2-Step Verification is enabled and that you are using a valid 16-character Google App Password in GMAIL_APP_PASSWORD.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        detail: error?.message || "Failed to send welcome email. Please try again.",
      },
      { status: 500 }
    );
  }
}
