from __future__ import annotations

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

logger = logging.getLogger(__name__)


class EmailService:
    def __init__(self, host: str, port: int, user: str, password: str):
        self.host = host
        self.port = port
        self.user = user
        self.password = password

    async def send_email(
        self,
        to: str,
        subject: str,
        body: str,
        html: bool = False,
    ) -> bool:
        try:
            msg = MIMEMultipart("alternative")
            msg["From"] = f"KhmerMarket <{self.user}>"
            msg["To"] = to
            msg["Subject"] = subject

            if html:
                html_part = MIMEText(body, "html", "utf-8")
                msg.attach(html_part)
            else:
                text_part = MIMEText(body, "plain", "utf-8")
                msg.attach(text_part)

            with smtplib.SMTP(self.host, self.port, timeout=30) as server:
                server.ehlo()
                if self.port == 587:
                    server.starttls()
                    server.ehlo()
                if self.user and self.password:
                    server.login(self.user, self.password)
                server.sendmail(self.user, [to], msg.as_string())
            return True
        except Exception as e:
            logger.error("Failed to send email to %s: %s", to, e)
            return False

    async def send_order_confirmation(self, order: dict) -> bool:
        to = order.get("buyer_email")
        order_number = order.get("order_number", "")
        items_html = ""
        for item in order.get("items", []):
            items_html += f"""
            <tr>
                <td style="padding:10px;border-bottom:1px solid #eee;">{item.get('product_title', '')}</td>
                <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">{item.get('quantity', 0)}</td>
                <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">${item.get('total', 0):.2f}</td>
            </tr>
            """
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h2 style="color:#e74c3c;">KhmerMarket Order Confirmation</h2>
            <p>Thank you for your order!</p>
            <p><strong>Order Number:</strong> {order_number}</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                <thead>
                    <tr style="background:#f8f9fa;">
                        <th style="padding:10px;text-align:left;">Item</th>
                        <th style="padding:10px;text-align:center;">Qty</th>
                        <th style="padding:10px;text-align:right;">Total</th>
                    </tr>
                </thead>
                <tbody>{items_html}</tbody>
            </table>
            <p><strong>Total: ${order.get('total', 0):.2f}</strong></p>
            <p>We will notify you when your order is shipped.</p>
            <hr style="border:1px solid #eee;">
            <p style="font-size:12px;color:#999;">This email was sent by KhmerMarket Cambodia E-commerce Platform.</p>
        </body>
        </html>
        """
        return await self.send_email(to, f"Order #{order_number} Confirmation", html_body, html=True)

    async def send_password_reset(self, email: str, token: str) -> bool:
        reset_url = f"https://khmermarket.com/reset-password?token={token}"
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h2 style="color:#e74c3c;">KhmerMarket Password Reset</h2>
            <p>You requested a password reset. Click the button below to reset your password:</p>
            <div style="text-align:center;margin:30px 0;">
                <a href="{reset_url}" style="background-color:#e74c3c;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;font-weight:bold;">Reset Password</a>
            </div>
            <p>This link will expire in 30 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
            <hr style="border:1px solid #eee;">
            <p style="font-size:12px;color:#999;">This email was sent by KhmerMarket Cambodia E-commerce Platform.</p>
        </body>
        </html>
        """
        return await self.send_email(email, "KhmerMarket - Password Reset Request", html_body, html=True)
