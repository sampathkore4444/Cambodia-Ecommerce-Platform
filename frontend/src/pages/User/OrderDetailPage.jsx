import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../../api';
import Badge from '../../components/common/Badge/Badge';
import Button from '../../components/common/Button/Button';
import ConfirmAction from '../../components/common/ConfirmAction/ConfirmAction';
import Spinner from '../../components/common/Loading/Spinner';
import { getStatusColor, getStatusLabel, formatPrice, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import styles from './OrderDetailPage.module.css';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      ordersAPI.getOrder(id),
      ordersAPI.getTracking(id).catch(() => null),
    ])
      .then(([orderRes, trackingRes]) => {
        const data = orderRes.data.data || orderRes.data;
        setOrder(data);
        if (trackingRes) {
          const td = trackingRes.data.data || trackingRes.data;
          setTracking(td.tracking || []);
        }
      })
      .catch(err => setError(err.message || 'មិនអាចផ្ទុកបញ្ជាបាន'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await ordersAPI.cancelOrder(id, 'Cancelled by user');
      toast.success('បានបោះបង់បញ្ជា');
      setOrder(prev => ({ ...prev, status: 'cancelled' }));
    } catch (err) {
      toast.error(err.message || 'មិនអាចបោះបង់បញ្ជាបាន');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    setActionLoading(true);
    try {
      await ordersAPI.confirmDelivery(id);
      toast.success('បានបញ្ជាក់ការទទួល');
      setOrder(prev => ({ ...prev, status: 'delivered' }));
    } catch (err) {
      toast.error(err.message || 'មិនអាចបញ្ជាក់បាន');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className={styles.page}><Spinner size="lg" /></div>;
  if (error) return <div className={styles.page}><div className={styles.error}>{error}</div></div>;
  if (!order) return null;

  const address = order.shipping_address || {};

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>បញ្ជា {order.order_number}</h1>
          <p className={styles.date}>កាលបរិច្ឆេទ: {formatDate(order.created_at)}</p>
        </div>
        <Badge variant={getStatusColor(order.status)} dot size="lg">{getStatusLabel(order.status)}</Badge>
      </div>

      <div className={styles.grid}>
        <div className={styles.section}>
          <h3>ផលិតផល</h3>
          {(order.items || []).map((item, i) => (
            <div key={i} className={styles.itemRow}>
              <span>{item.product_title} × {item.quantity}</span>
              <span>{formatPrice(item.total)}</span>
            </div>
          ))}
          <div className={styles.total}>សរុប: {formatPrice(order.total)}</div>
        </div>

        <div className={styles.section}>
          <h3>អាសយដ្ឋាន</h3>
          {address.recipient_name && <p>{address.recipient_name} - {address.phone}</p>}
          {address.district && <p>{address.village}, {address.commune}, {address.district}, {address.province}</p>}
        </div>

        <div className={styles.section}>
          <h3>វិធីបង់ប្រាក់</h3>
          <p>{order.payment_method || 'N/A'}</p>
        </div>
      </div>

      {tracking.length > 0 && (
        <div className={styles.timeline}>
          <h3>ការតាមដាន</h3>
          {tracking.map((step, i) => (
            <div key={step.status || i} className={styles.step}>
              <div
                className={styles.stepDot}
                style={{ background: step.completed ? 'var(--primary)' : 'var(--border)' }}
              />
              <div>
                <div className={styles.stepLabel} style={{ color: step.completed ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {step.label_kh || step.label}
                </div>
                {step.timestamp && (
                  <div className={styles.stepDate}>{new Date(step.timestamp).toLocaleString('km-KH')}</div>
                )}
                {step.reason && (
                  <div className={styles.stepDate}>មូលហេតុ: {step.reason}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.actions}>
        {order.status === 'shipped' && (
          <Button onClick={handleConfirmDelivery} loading={actionLoading}>បញ្ជាក់ការទទួល</Button>
        )}
        {(order.status === 'pending' || order.status === 'confirmed') && (
          <ConfirmAction message="តើអ្នកប្រាកដថាចង់បោះបង់បញ្ជានេះទេ?" onConfirm={handleCancel} variant="warning">
            <Button variant="danger" loading={actionLoading}>បោះបង់បញ្ជា</Button>
          </ConfirmAction>
        )}
      </div>
    </div>
  );
}
