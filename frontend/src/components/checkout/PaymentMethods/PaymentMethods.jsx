import React from 'react';
import { Banknote, Landmark, Wallet, Smartphone, CreditCard } from 'lucide-react';
import { PAYMENT_METHODS } from '../../../utils/constants';
import Button from '../../common/Button/Button';
import styles from './PaymentMethods.module.css';

const iconMap = { banknote: Banknote, landmark: Landmark, wallet: Wallet, smartphone: Smartphone, 'credit-card': CreditCard };

export default function PaymentMethods({ selected, onSelect, onBack }) {
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>វិធីបង់ប្រាក់</h3>
      <div className={styles.grid}>
        {PAYMENT_METHODS.map(method => {
          const Icon = iconMap[method.icon] || Banknote;
          const isSelected = selected === method.id;
          return (
            <button key={method.id} className={`${styles.method} ${isSelected ? styles.selected : ''}`} onClick={() => onSelect(method.id)}>
              <Icon size={28} />
              <span className={styles.methodName}>{method.nameKm}</span>
              <span className={styles.methodDesc}>{method.name}</span>
            </button>
          );
        })}
      </div>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onBack}>ត្រឡប់</Button>
      </div>
    </div>
  );
}
