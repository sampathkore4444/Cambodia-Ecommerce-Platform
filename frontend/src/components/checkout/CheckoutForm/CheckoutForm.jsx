import React, { useState } from 'react';
import { Check } from 'lucide-react';
import AddressForm from '../AddressForm/AddressForm';
import PaymentMethods from '../PaymentMethods/PaymentMethods';
import OrderSummary from '../OrderSummary/OrderSummary';
import styles from './CheckoutForm.module.css';

const steps = ['អាសយដ្ឋាន', 'វិធីបង់ប្រាក់', 'ពិនិត្យមុនបញ្ជា'];

export default function CheckoutForm({ buyNowItem }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [address, setAddress] = useState(null);
  const [payment, setPayment] = useState(null);

  const goNext = () => setCurrentStep(s => Math.min(2, s + 1));
  const goBack = () => setCurrentStep(s => Math.max(0, s - 1));

  return (
    <div className={styles.checkout}>
      <div className={styles.steps}>
        {steps.map((step, i) => (
          <div key={i} className={`${styles.step} ${i <= currentStep ? styles.active : ''} ${i < currentStep ? styles.completed : ''}`}>
            <div className={styles.stepCircle}>{i < currentStep ? <Check size={16} /> : i + 1}</div>
            <span className={styles.stepLabel}>{step}</span>
          </div>
        ))}
      </div>

      <div className={styles.content}>
        {currentStep === 0 && <AddressForm onComplete={(data) => { setAddress(data); goNext(); }} />}
        {currentStep === 1 && <PaymentMethods selected={payment} onSelect={(data) => { setPayment(data); goNext(); }} onBack={goBack} />}
        {currentStep === 2 && <OrderSummary address={address} payment={payment} onBack={goBack} buyNowItem={buyNowItem} />}
      </div>
    </div>
  );
}
