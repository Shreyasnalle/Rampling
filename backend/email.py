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


def build_welcome_email_html() -> str:
    """Generates an HTML email styled with the Rowan serif aesthetic and Rampling's dark luxury palette."""
    return """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Rampling</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@300;400;500&display=swap');
    
    body {
      margin: 0;
      padding: 0;
      background-color: #060608;
      font-family: 'Rowan', 'Playfair Display', Georgia, Cambria, 'Times New Roman', serif;
      color: #e2e8f0;
      -webkit-font-smoothing: antialiased;
    }
    
    .wrapper {
      width: 100%;
      background-color: #060608;
      padding: 48px 16px;
    }
    
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #120F17;
      border: 1px solid rgba(192, 132, 252, 0.25);
      border-radius: 20px;
      padding: 44px 40px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 35px rgba(104, 92, 130, 0.2);
    }
    
    .logo-container {
      text-align: center;
      margin-bottom: 32px;
    }
    
    .logo-text {
      font-family: 'Rowan', 'Playfair Display', Georgia, serif;
      font-size: 24px;
      font-weight: 600;
      letter-spacing: 0.18em;
      color: #ffffff;
      text-transform: uppercase;
      display: inline-block;
      padding: 6px 18px;
      border-radius: 999px;
      background: rgba(22, 18, 30, 0.9);
      border: 1px solid rgba(192, 132, 252, 0.35);
      box-shadow: 0 2px 14px rgba(82, 39, 255, 0.2);
    }

    .divider {
      height: 1px;
      width: 100%;
      background: linear-gradient(90deg, transparent, rgba(192, 132, 252, 0.4) 25%, rgba(244, 114, 182, 0.4) 50%, rgba(56, 189, 248, 0.4) 75%, transparent);
      margin: 24px 0 32px 0;
    }
    
    .content-paragraph {
      font-family: 'Rowan', 'Playfair Display', Georgia, serif;
      font-size: 16px;
      line-height: 1.8;
      color: #e2e8f0;
      margin-bottom: 22px;
      letter-spacing: 0.01em;
    }
    
    .highlight-box {
      background: rgba(22, 18, 30, 0.75);
      border-left: 3px solid #c084fc;
      border-radius: 8px;
      padding: 16px 20px;
      margin: 24px 0;
      font-family: 'Rowan', 'Playfair Display', Georgia, serif;
      font-size: 15px;
      line-height: 1.75;
      color: #f1f5f9;
    }
    
    .signoff {
      margin-top: 36px;
      padding-top: 24px;
      border-top: 1px solid rgba(104, 92, 130, 0.2);
      font-family: 'Rowan', 'Playfair Display', Georgia, serif;
      font-size: 16px;
      line-height: 1.7;
      color: #cbd5e1;
    }
    
    .author-name {
      color: #ffffff;
      font-weight: 600;
      font-size: 17px;
    }
    
    .author-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #a78bfa;
      margin-top: 4px;
    }

    .footer {
      text-align: center;
      margin-top: 32px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 12px;
      color: #64748b;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="logo-container">
        <span class="logo-text">RAMPLING</span>
      </div>

      <div class="divider"></div>

      <p class="content-paragraph">
        Hey, I am Shreyas, thanks for joining Rampling! It’s great to have you with us early on.
      </p>

      <div class="highlight-box">
        At its core, Rampling is designed to take the guesswork out of your backend’s security and performance. Rampling will help you build faster, ship with confidence and ensure your applications effortlessly handle real-world scale.
      </div>

      <p class="content-paragraph">
        I'm reaching out today to let you know that Rampling is currently in active development. Because you joined early you will be the very first to know the moment we launch, and you'll get early access to try it out before anyone else.
      </p>

      <p class="content-paragraph">
        Thank you so much for believing in this project and being part of the journey from day one. Your early support truly means a lot to me. If you have any thoughts, ideas, or specific challenges you’d love Rampling to solve, simply hit reply to this email, I’d genuinely love to hear from you.
      </p>

      <div class="signoff">
        Warmly,<br>
        <span class="author-name">Shreyas Nalle</span>
        <div class="author-title">Creator of Rampling</div>
      </div>
    </div>

    <div class="footer">
      &copy; 2026 Rampling. All rights reserved.<br>
      Automated AST Route Parsing • Security Analysis • Load Simulation
    </div>
  </div>
</body>
</html>"""


def build_welcome_email_plain() -> str:
    """Plain text fallback version of the email."""
    return """Hey, I am Shreyas, thanks for joining Rampling! It’s great to have you with us early on.

At its core, Rampling is designed to take the guesswork out of your backend’s security and performance. Rampling will help you build faster, ship with confidence and ensure your applications effortlessly handle real-world scale.

I'm reaching out today to let you know that Rampling is currently in active development. Because you joined early you will be the very first to know the moment we launch, and you'll get early access to try it out before anyone else.

Thank you so much for believing in this project and being part of the journey from day one. Your early support truly means a lot to me. If you have any thoughts, ideas, or specific challenges you’d love Rampling to solve, simply hit reply to this email, I’d genuinely love to hear from you.

Warmly,  
Shreyas Nalle.
"""


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
