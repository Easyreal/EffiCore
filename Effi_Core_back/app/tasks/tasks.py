from app.tasks.celery_settings import celery

from pydantic import EmailStr
from app.tasks.email_templates import create_confirm_email_template, create_reset_password_template
import smtplib
from app.config import settings

@celery.task
def send_confirm_email(
        email_to: EmailStr,
):
    email_to_mock = email_to
    msg_content = create_confirm_email_template(email_to_mock)

    with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.login(settings.SMTP_EMAIL, settings.SMTP_PASS)
        server.send_message(msg_content)

@celery.task
def send_reset_password(
        email_to: EmailStr,
):
    email_to_mock = email_to
    msg_content = create_reset_password_template(email_to_mock)

    with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.login(settings.SMTP_EMAIL, settings.SMTP_PASS)
        server.send_message(msg_content)
