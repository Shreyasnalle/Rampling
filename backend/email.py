import os
import sys

# ─── PREVENT MODULE SHADOWING ──────────────────────────────────────────────────
# If this file is named email.py, Python may treat it as the standard library 'email'
# package. We temporarily filter out the local directory from sys.path to import the
# true standard library email and smtplib modules without circular import errors.
_curr_dir = os.path.abspath(os.path.dirname(__file__))
_saved_sys_path = list(sys.path)
sys.path = [p for p in sys.path if os.path.abspath(p) != _curr_dir and p != ""]

import email
import email.mime.multipart
import email.mime.text
import smtplib
import ssl

MIMEMultipart = email.mime.multipart.MIMEMultipart
MIMEText = email.mime.text.MIMEText

# Restore sys.path so normal local imports still resolve
sys.path = _saved_sys_path
# ───────────────────────────────────────────────────────────────────────────────

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field

# Load credentials from backend/.env
load_dotenv(os.path.join(_curr_dir, ".env"))

GMAIL_USER = os.getenv("GMAIL_USER", "").strip()
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD", "").strip()

app = FastAPI(
    title="Rampling Email Service",
    description="FastAPI service for sending welcome emails to early access subscribers",
    version="1.0.0",
)

# Enable CORS for Next.js frontend (localhost:3000) and staging
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EmailRequest(BaseModel):
    email: EmailStr = Field(..., description="Subscriber email address")


EMAIL_BODY = """Hey, I am Shreyas, thanks for joining Rampling! It’s great to have you early on.
 
At its core, Rampling is designed to take the guesswork out of your backend’s security and performance. Rampling will help you build faster, ship with confidence and ensure your applications effortlessly handle real-world scale.
 
I'm reaching out to let you know that Rampling is currently in active development. Because you joined early you will be the very first to know the moment I launch, and you'll get early access too. 
 
Thank you so much for believing in this project. If you have any thoughts, ideas, or specific challenges you’d love Rampling to solve, simply hit reply to this email, I’d genuinely love to hear from you.
 
Warmly,
Shreyas Nalle"""
 
 
def build_welcome_email_html() -> str:
    """Generates simple normal email HTML without CSS styling."""
    paragraphs = EMAIL_BODY.split("\n\n")
    return "".join(f"<p style='margin:0 0 16px 0; font-size:15px; line-height:1.6;'>{p.replace(chr(10), '<br>')}</p>" for p in paragraphs)
 
 
def build_welcome_email_plain() -> str:
    """Plain text version of the email."""
    return EMAIL_BODY


def send_email_to_user(to_email: str, subject: str, html_content: str, plain_content: str = None):
    """
    Sends an email using Gmail SMTP SSL on port 465.
    Reads credentials from GMAIL_USER and GMAIL_APP_PASSWORD.
    """
    if not GMAIL_USER or not GMAIL_APP_PASSWORD:
        raise ValueError(
            "GMAIL_USER or GMAIL_APP_PASSWORD is not configured in backend/.env. "
            "Please add your Gmail address and 16-character App Password."
        )

    # Clean app password (remove spaces if user pasted 'abcd efgh ijkl mnop')
    clean_password = GMAIL_APP_PASSWORD.replace(" ", "").strip()

    msg = MIMEMultipart("alternative")
    msg["From"] = f"Rampling <{GMAIL_USER}>"
    msg["To"] = to_email
    msg["Subject"] = subject

    # Attach plain text fallback first, then HTML
    if plain_content:
        msg.attach(MIMEText(plain_content, "plain", "utf-8"))
    msg.attach(MIMEText(html_content, "html", "utf-8"))

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context, timeout=15) as server:
        server.login(GMAIL_USER, clean_password)
        server.send_message(msg)


@app.get("/")
def root():
    return {
        "service": "Rampling Email Service",
        "status": "online",
        "gmail_configured": bool(GMAIL_USER and GMAIL_APP_PASSWORD),
    }


@app.post("/api/send-welcome-email", status_code=status.HTTP_200_OK)
@app.post("/send-email", status_code=status.HTTP_200_OK)
def handle_send_welcome_email(request: EmailRequest):
    """
    Endpoint triggered when a user registers on the landing page hero section.
    Sends the welcome email notifying them of early access on launch.
    """
    subject = "Welcome to Rampling — You're on the early access list!"
    html_body = build_welcome_email_html()
    plain_body = build_welcome_email_plain()

    try:
        send_email_to_user(
            to_email=str(request.email),
            subject=subject,
            html_content=html_body,
            plain_content=plain_body,
        )
        return {
            "success": True,
            "message": f"Welcome email sent successfully to {request.email}",
        }
    except smtplib.SMTPAuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Gmail authentication failed. Please verify that 2-Step Verification "
                "is enabled on your Google account and that you generated a valid 16-character "
                "App Password in backend/.env"
            ),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email: {str(e)}",
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
