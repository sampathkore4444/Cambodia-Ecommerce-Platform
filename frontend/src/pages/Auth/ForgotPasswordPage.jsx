import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import styles from './AuthPages.module.css';

const STEPS = { PHONE: 'phone', OTP: 'otp', NEW_PASSWORD: 'newPassword', SUCCESS: 'success' };

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.PHONE);
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [useEmail, setUseEmail] = useState(false);

  const validatePhone = (val) => /^0\d{8,9}$/.test(val);
  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const isValid = useEmail ? validateEmail(identifier) : validatePhone(identifier);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!isValid) {
      setError(useEmail ? "សូមបញ្ចូលអ៊ីមែលត្រឹមត្រូវ។" : "សូមបញ្ចូលលេខទូរស័ព្ទត្រឹមត្រូវ។");
      return;
    }
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setStep(STEPS.OTP);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('សូមបញ្ចូលកូដ ៦ ខ្ទង់ ។');
      return;
    }
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setStep(STEPS.NEW_PASSWORD);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('ពាក្យសម្ងាត់ថ្មីត្រូវតែយ៉ាងហោចណាស់ ៨ តួ ។');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('ពាក្យសម្ងាត់ទាំងពីរមិនត្រូវគ្នា ។');
      return;
    }
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setStep(STEPS.SUCCESS);
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        {step === STEPS.PHONE && (
          <>
            <h1>ភ្លេចពាក្យសម្ងាត់</h1>
            <p className={styles.authSubtitle}>Forgot Password</p>
            <p className={styles.authDesc}>
              បញ្ចូលលេខទូរស័ព្ទ ឬអ៊ីមែលរបស់អ្នកដើម្បីទទួលបានកូដផ្ទៀងផ្ទាត់។
            </p>
            <div className={styles.tabToggle}>
              <button className={!useEmail ? styles.activeTab : ''} onClick={() => { setUseEmail(false); setIdentifier(''); setError(''); }}>
                <Phone size={16} /> ទូរស័ព្ទ
              </button>
              <button className={useEmail ? styles.activeTab : ''} onClick={() => { setUseEmail(true); setIdentifier(''); setError(''); }}>
                <Mail size={16} /> អ៊ីមែល
              </button>
            </div>
            <form onSubmit={handleSendOTP}>
              <div className={styles.inputGroup}>
                <label>{useEmail ? 'អ៊ីមែល / Email' : 'លេខទូរស័ព្ទ / Phone'}</label>
                <input
                  type={useEmail ? 'email' : 'tel'}
                  value={identifier}
                  onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                  placeholder={useEmail ? 'email@example.com' : '012 345 678'}
                />
              </div>
              {error && <p className={styles.error}>{error}</p>}
              <button type="submit" className={styles.authBtn} disabled={loading || !isValid}>
                {loading ? 'កំពុងផ្ញើ...' : 'ផ្ញើកូដ / Send Code'}
              </button>
            </form>
          </>
        )}

        {step === STEPS.OTP && (
          <>
            <h1>ផ្ទៀងផ្ទាត់កូដ</h1>
            <p className={styles.authSubtitle}>Verify Code</p>
            <p className={styles.authDesc}>
              យើងបានផ្ញើកូដ ៦ ខ្ទង់ទៅ <strong>{identifier}</strong>។ សូមបញ្ចូលកូដនោះខាងក្រោម។
            </p>
            <form onSubmit={handleVerifyOTP}>
              <div className={styles.inputGroup}>
                <label>កូដផ្ទៀងផ្ទាត់ / Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                  placeholder="123456"
                  maxLength={6}
                  className={styles.otpInput}
                />
              </div>
              {error && <p className={styles.error}>{error}</p>}
              <button type="submit" className={styles.authBtn} disabled={loading || otp.length !== 6}>
                {loading ? 'កំពុងផ្ទៀងផ្ទាត់...' : 'ផ្ទៀងផ្ទាត់ / Verify'}
              </button>
              <button type="button" className={styles.linkBtn} onClick={() => setStep(STEPS.PHONE)}>
                ផ្ញើម្តងទៀត / Resend
              </button>
            </form>
          </>
        )}

        {step === STEPS.NEW_PASSWORD && (
          <>
            <h1>បង្កើតពាក្យសម្ងាត់ថ្មី</h1>
            <p className={styles.authSubtitle}>Create New Password</p>
            <form onSubmit={handleResetPassword}>
              <div className={styles.inputGroup}>
                <label>ពាក្យសម្ងាត់ថ្មី / New Password</label>
                <div className={styles.passwordField}>
                  <Lock size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                    placeholder="យ៉ាងហោចណាស់ ៨ តួ"
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label>បញ្ជាក់ពាក្យសម្ងាត់ / Confirm Password</label>
                <div className={styles.passwordField}>
                  <Lock size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                    placeholder="បញ្ជាក់ពាក្យសម្ងាត់"
                  />
                </div>
              </div>
              {error && <p className={styles.error}>{error}</p>}
              <button type="submit" className={styles.authBtn} disabled={loading}>
                {loading ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកពាក្យសម្ងាត់ / Save Password'}
              </button>
            </form>
          </>
        )}

        {step === STEPS.SUCCESS && (
          <div className={styles.successStep}>
            <CheckCircle size={64} className={styles.successIcon} />
            <h1>ជោគជ័យ!</h1>
            <p className={styles.authSubtitle}>Password Reset Successfully</p>
            <p className={styles.authDesc}>
              ពាក្យសម្ងាត់របស់អ្នកត្រូវបានកែប្រែជោគជ័យ។ អ្នកអាចចូលប្រើប្រាស់គណនីរបស់អ្នកបានហើយ។
            </p>
            <button className={styles.authBtn} onClick={() => navigate('/login')}>
              ចូលគណនី / Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
