import React, { useState } from 'react';
import { useCart } from '../../../hooks/useCart';
import { ordersAPI, paymentsAPI } from '../../../api';
import { formatPrice } from '../../../utils/helpers';
import { PAYMENT_METHODS } from '../../../utils/constants';
import Button from '../../common/Button/Button';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import styles from './OrderSummary.module.css';

export default function OrderSummary({ address, payment, onBack, buyNowItem }) {
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isBuyNow = !!buyNowItem;
  const displayItems = isBuyNow
    ? [{ id: buyNowItem.product.id, name: buyNowItem.product.title_kh || buyNowItem.product.name || buyNowItem.product.title, price: buyNowItem.product.price, quantity: buyNowItem.quantity, image: buyNowItem.product.images?.[0]?.url || buyNowItem.product.image }]
    : items;
  const displayTotal = isBuyNow
    ? buyNowItem.product.price * buyNowItem.quantity
    : total;

  const shippingFee = displayTotal > 50 ? 0 : 5;
  const paymentName = PAYMENT_METHODS.find(m => m.id === payment)?.nameKm || payment;

  const handleOrder = async () => {
    setLoading(true);
    try {
      const orderPayload = {
        shipping_address: address,
        payment_method: payment,
      };
      if (isBuyNow) {
        orderPayload.buy_now_product_id = buyNowItem.product.id;
        orderPayload.buy_now_quantity = buyNowItem.quantity;
      }
      const orderRes = await ordersAPI.createOrder(orderPayload);
      const orderData = orderRes.data.data || orderRes.data;
      const orderId = orderData.id;

      if (!isBuyNow) {
        await clearCart();
      }

      if (payment !== 'cod') {
        try {
          const payRes = await paymentsAPI.initiate({ order_id: orderId, method: payment });
          const payData = payRes.data.data || payRes.data;
          if (payData.paymentUrl) {
            window.location.href = payData.paymentUrl;
            return;
          }
        } catch (payErr) {
          toast.error(payErr.message || 'កំហុសក្នុងការចាប់ផ្តើមបង់ប្រាក់');
          navigate('/orders');
          return;
        }
      }

      toast.success('ដាក់បញ្ជាជោគជ័យ!');
      navigate('/orders');
    } catch (err) {
      toast.error(err.message || 'កំហុសក្នុងការដាក់បញ្ជា');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.summary}>
      <h3 className={styles.title}>ពិនិត្យមុនបញ្ជា</h3>
      <div className={styles.section}>
        <h4>អាសយដ្ឋានដឹកជញ្ជូន</h4>
        <p>{address?.recipient_name} - {address?.phone}</p>
        <p>{address?.village}, {address?.commune}, {address?.district}, {address?.province}</p>
      </div>
      <div className={styles.section}>
        <h4>វិធីបង់ប្រាក់</h4>
        <p>{paymentName}</p>
      </div>
      <div className={styles.section}>
        <h4>ផលិតផល</h4>
        {displayItems.map(item => (
          <div key={item.id || item.productId} className={styles.itemRow}>
            <span>{item.name} × {item.quantity}</span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>
      <div className={styles.totals}>
        <div className={styles.totalRow}><span>សរុបរង</span><span>{formatPrice(displayTotal)}</span></div>
        <div className={styles.totalRow}><span>ដឹកជញ្ជូន</span><span>{shippingFee === 0 ? 'ឥតគិតថ្លៃ' : formatPrice(shippingFee)}</span></div>
        <div className={`${styles.totalRow} ${styles.grandTotal}`}><span>សរុប</span><span>{formatPrice(displayTotal + shippingFee)}</span></div>
      </div>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onBack}>ត្រឡប់</Button>
        <Button size="lg" loading={loading} onClick={handleOrder}>ដាក់បញ្ជា</Button>
      </div>
    </div>
  );
}
