import logging
from datetime import datetime

logger = logging.getLogger(__name__)


def _wrap_template(title: str, body_html: str) -> str:
    year = datetime.now().year
    return f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
<div style="background:#00897B;padding:30px;text-align:center;border-radius:12px 12px 0 0">
<h1 style="color:white;margin:0">KhmerMarket</h1></div>
<div style="background:#f9f9f9;padding:30px;border:1px solid #e0e0e0">
<h2 style="color:#333">{title}</h2>
{body_html}
</div>
<div style="text-align:center;padding:20px;color:#666;font-size:12px">
<p>&copy; {year} KhmerMarket Cambodia</p></div>
</body></html>"""


def build_order_confirmation_email(order, user) -> dict:
    addr = order.shipping_address or {}
    items_html = ""
    for item in (order.items or []):
        items_html += f"""<tr>
            <td style="padding:8px;border-bottom:1px solid #eee">{item.product_title}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">{item.quantity}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${item.total:.2f}</td>
        </tr>"""

    html = f"""
<p>Thank you for your order. We will process it soon.</p>
<table style="width:100%;border-collapse:collapse;margin:20px 0;background:white;border-radius:8px">
<tr style="background:#f5f5f5"><th style="padding:8px;text-align:left">Item</th><th style="padding:8px">Qty</th><th style="padding:8px;text-align:right">Total</th></tr>
{items_html}
</table>
<p><strong>Order:</strong> {order.order_number}</p>
<p><strong>Total:</strong> ${order.total:.2f}</p>
<p><strong>Ship to:</strong> {addr.get('full_name','')} {addr.get('phone','')}<br>{addr.get('address','')} {addr.get('province','')}</p>"""
    return {"subject": f"Order {order.order_number} Confirmed", "html": _wrap_template("Order Confirmed!", html)}


def build_shipping_email(order, user) -> dict:
    tracking = getattr(order, 'tracking_number', None)
    partner = getattr(order, 'shipping_partner', None)
    track_html = ""
    if tracking:
        track_html = f"<p><strong>Tracking:</strong> {tracking}</p>"
        if partner:
            track_html += f"<p><strong>Carrier:</strong> {partner}</p>"

    html = f"""
<p>Your order <strong>{order.order_number}</strong> has been shipped and is on its way to you.</p>
<p><strong>Total:</strong> ${order.total:.2f}</p>
{track_html}
<p>We will notify you when it has been delivered.</p>"""
    return {"subject": f"Order {order.order_number} Shipped", "html": _wrap_template("Your Order is On the Way!", html)}


def build_order_delivered_email(order, user) -> dict:
    html = f"""
<p>Your order <strong>{order.order_number}</strong> has been delivered successfully.</p>
<p><strong>Total:</strong> ${order.total:.2f}</p>
<p>We hope you enjoy your purchase! If you have any issues, please contact us.</p>
<p>Please take a moment to rate and review your items.</p>"""
    return {"subject": f"Order {order.order_number} Delivered", "html": _wrap_template("Order Delivered!", html)}


def build_order_cancelled_email(order, user) -> dict:
    reason = getattr(order, 'cancel_reason', None) or "No reason provided"
    html = f"""
<p>Your order <strong>{order.order_number}</strong> has been cancelled.</p>
<p><strong>Reason:</strong> {reason}</p>
<p>If you paid for this order, a refund will be processed within 5-7 business days.</p>
<p>If you have any questions, please contact our support team.</p>"""
    return {"subject": f"Order {order.order_number} Cancelled", "html": _wrap_template("Order Cancelled", html)}


def build_welcome_email(user) -> dict:
    name = getattr(user, 'full_name', None) or getattr(user, 'name', None) or "Customer"
    html = f"""
<p>Welcome to KhmerMarket, <strong>{name}</strong>!</p>
<p>Thank you for joining Cambodia's premier online marketplace. You can now:</p>
<ul style="line-height:1.8">
<li>Browse thousands of products from local sellers</li>
<li>Enjoy secure payments via ABA, Wing, and Pi Pay</li>
<li>Track your orders in real-time</li>
</ul>
<p>Start shopping now and discover amazing deals!</p>"""
    return {"subject": "Welcome to KhmerMarket!", "html": _wrap_template("Welcome to KhmerMarket!", html)}


def build_seller_approved_email(user) -> dict:
    name = getattr(user, 'full_name', None) or getattr(user, 'name', None) or "Seller"
    html = f"""
<p>Hi <strong>{name}</strong>,</p>
<p>Great news! Your seller account has been approved. You can now:</p>
<ul style="line-height:1.8">
<li>List your products on KhmerMarket</li>
<li>Manage orders and inventory</li>
<li>Track your sales and analytics</li>
</ul>
<p>Log in to your seller dashboard to get started!</p>"""
    return {"subject": "Your Seller Account is Approved!", "html": _wrap_template("Seller Account Approved!", html)}


def build_review_notification_email(order, user) -> dict:
    html = f"""
<p>Hi,</p>
<p>Your order <strong>{order.order_number}</strong> has been delivered.</p>
<p>We would love to hear your feedback! Please take a moment to rate and review the products you purchased.</p>
<p>Your reviews help other customers make better decisions.</p>"""
    return {"subject": "Rate Your Recent Order", "html": _wrap_template("How Was Your Order?", html)}
