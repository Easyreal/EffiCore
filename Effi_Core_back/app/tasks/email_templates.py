from email.message import EmailMessage
from app.config import settings
from pydantic import EmailStr
from app.user.auth import JwtController


def create_confirm_email_template(
        email_to: EmailStr,
):
    email = EmailMessage()
    email['Subject'] = 'Подтверждение email'
    email['From'] = settings.SMTP_EMAIL

    email['To'] = email_to
    data_to_jwt = {'email': email_to}
    recover_link = f"http://localhost:80/confirm-email/{JwtController.create_token(data=data_to_jwt, token_type='confirm')}"
    email.set_content(
        f"""
            <h1>Efficore: Подтверждение e-mail</h1>
            Для подтверждения email, перейдите по указанной ссылке: <a href="{recover_link}">подтвердить email</a> 
            
        """,
        subtype='html'
    )
    return email


def create_reset_password_template(

        email_to: EmailStr,
):
    email = EmailMessage()
    email['Subject'] = 'Изменение пароля'
    email['From'] = settings.SMTP_EMAIL
    email['To'] = email_to
    data_to_jwt = {'email': email_to}
    recover_link = f"http://localhost:80/reset-password/{JwtController.create_token(data=data_to_jwt, token_type='reset')}"

    email.set_content(
        f"""
            <h1>Efficore: Изменения пароля</h1>
            Для изменения пароля, перейдите по указанной ссылке:<a href="{recover_link}">изменить пароль</a><br>
            Если вы не отправляли это сообщение пожалуйста измените пароль или не переходите по ссылке. 
        """,
        subtype='html'
    )
    return email