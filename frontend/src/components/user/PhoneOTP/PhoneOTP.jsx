import React, { useState, useRef, useEffect } from 'react';
import { authAPI } from '../../../api';
import Button from '../../common/Button/Button';
import toast from 'react-hot-toast';
import styles from './PhoneOTP.module.css';

export default function PhoneOTP({ phone, onSuccess, onBack }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const refs = useRef([]);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) refs.current[index - 1]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) { toast.error('បញ្ចូលលេខ OTP ៦ ខ្ទង់'); return; }
    setLoading(true);
    try {
      const res = await authAPI.verifyOTP(phone, code);
      onSuccess(res.data);
    } catch (err) { toast.error(err.message || 'OTP មិនត្រឹមត្រូវ'); }
    finally { setLoading(false); }
  };

  const handleResend = () => { setTimer(60); toast.success('បានផ្ញើ OTP ឡើងវិញ'); };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>ផ្ទៀងផ្ទាត់លេខទូរស័ព្ទ</h3>
      <p className={styles.subtitle}>យើងបានផ្ញើលេខ ៦ ខ្ទង់ទៅ {phone}</p>
      <div className={styles.otpInputs}>
        {otp.map((digit, i) => (
          <input key={i} ref={el => refs.current[i] = el} type="tel" inputMode="numeric" maxLength={1}
            value={digit} onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)}
            className={styles.otpInput}
          />
        ))}
      </div>
      <Button fullWidth size="lg" loading={loading} onClick={handleVerify}>ផ្ទៀងផ្ទាត់</Button>
      <div className={styles.resend}>
        {timer > 0 ? <span>ផ្ញើឡើងវិញក្នុង {timer}s</span> : <button onClick={handleResend} className={styles.resendBtn}>ផ្ញើឡើងវិញ</button>}
      </div>
      <button onClick={onBack} className={styles.backBtn}>ត្រឡប់</button>
    </div>
  );
}
