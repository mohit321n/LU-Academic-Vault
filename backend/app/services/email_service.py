import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import get_settings

settings = get_settings()


def send_verification_email(to_email: str, token: str, full_name: str) -> bool:
    try:
        frontend_url = settings.FRONTEND_URL or "http://localhost:5173"
        verify_link = f"{frontend_url}/verify-email?token={token}"

        msg = MIMEMultipart()
        msg["From"] = settings.FROM_EMAIL
        msg["To"] = to_email
        msg["Subject"] = "Verify Your LU Academic Vault Account"

        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0;">LU Academic Vault</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
                <h2>Welcome, {full_name}!</h2>
                <p>Thank you for registering. Please verify your email address to get started.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{verify_link}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email</a>
                </div>
                <p style="color: #6b7280; font-size: 14px;">If the button doesn't work, copy and paste this link:<br>{verify_link}</p>
                <p style="color: #6b7280; font-size: 14px;">This link expires in 24 hours.</p>
            </div>
            <div style="text-align: center; padding: 15px; color: #9ca3af; font-size: 12px;">
                LU Academic Vault - Lucknow University Study Platform
            </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(html, "html"))

        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.FROM_EMAIL, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Email send failed: {e}")
        return False


def send_reset_password_email(to_email: str, token: str, full_name: str) -> bool:
    try:
        frontend_url = settings.FRONTEND_URL or "http://localhost:5173"
        reset_link = f"{frontend_url}/reset-password?token={token}"

        msg = MIMEMultipart()
        msg["From"] = settings.FROM_EMAIL
        msg["To"] = to_email
        msg["Subject"] = "Reset Your LU Academic Vault Password"

        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0;">LU Academic Vault</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
                <h2>Password Reset Request</h2>
                <p>Hi {full_name}, we received a request to reset your password.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_link}" style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
                </div>
                <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
                <p style="color: #6b7280; font-size: 14px;">This link expires in 1 hour.</p>
            </div>
            <div style="text-align: center; padding: 15px; color: #9ca3af; font-size: 12px;">
                LU Academic Vault - Lucknow University Study Platform
            </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(html, "html"))

        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.FROM_EMAIL, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Reset email send failed: {e}")
        return False
