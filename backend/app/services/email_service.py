import logging
from datetime import datetime

logger = logging.getLogger(__name__)


def build_order_confirmation_email(order, user) -> dict:
    year = datetime.now().year
    addr = order.shipping_address or {}
    items_html = ""
    for item in (order.items or []):
        items_html += f"""<tr>
            <td style="padding:8px;border-bottom:1px solid #eee">{item.product_title}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">{item.quantity}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${item.total:.2f}</td>
        </tr>"""

    html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
<div style="background:#00897B;padding:30px;text-align:center;border-radius:12px 12px 0 0">
<h1 style="color:white;margin:0">KhmerMarket</h1></div>
<div style="background:#f9f9f9;padding:30px;border:1px solid #e0e0e0">
<h2 style="color:#333">Order Confirmed!</h2>
<p>Thank you for your order. We will process it soon.</p>
<table style="width:100%;border-collapse:collapse;margin:20px 0;background:white;border-radius:8px">
<tr style="background:#f5f5f5"><th style="padding:8px;text-align:left">Item</th><th style="padding:8px">Qty</th><th style="padding:8px;text-align:right">Total</th></tr>
{items_html}
</table>
<p><strong>Order:</strong> {order.order_number}</p>
<p><strong>Total:</strong> ${order.total:.2f}</p>
<p><strong>Ship to:</strong> {addr.get('full_name','')} {addr.get('phone','')}<br>{addr.get('address','')} {addr.get('province','')}</p>
</div>
<div style="text-align:center;padding:20px;color:#666;font-size:12px">
<p>&copy; {year} KhmerMarket</p></div>
</body></html>"""
    return {"subject": f"Order {order.order_number} Confirmed", "html": html}


def build_shipping_email(order, user) -> dict:
    year = datetime.now().year
    html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
<div style="background:#00897B;padding:30px;text-align:center;border-radius:12px 12px 0 0">
<h1 style="color:white;margin:0">KhmerMarket</h1></div>
<div style="background:#f9f9f9;padding:30px;border:1px solid #e0e0e0">
<h2 style="color:#333">Your order is on the way!</h2>
<p>Your order <strong>{order.order_number}</strong> has been shipped and is on its way to you.</p>
<p><strong>Total:</strong> ${order.total:.2f}</p>
</div>
<div style="text-align:center;padding:20px;color:#666;font-size:12px">
<p>&copy; {year} KhmerMarket</p></div>
</body></html>"""
    return {"subject": f"Order {order.order_number} Shipped", "html": html}
