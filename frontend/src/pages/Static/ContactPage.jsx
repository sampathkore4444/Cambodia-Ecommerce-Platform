import React, { useState } from 'react';
import { Send, MapPin, Phone, Mail, Facebook, ExternalLink } from 'lucide-react';
import styles from './StaticPages.module.css';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>ទំនាក់ទំនងយើង</h1>
        <p className={styles.subtitle}>Contact Us</p>
      </section>

      <div className={styles.contactGrid}>
        <div className={styles.contactForm}>
          <h2>ផ្ញើសារ / Send a Message</h2>
          {submitted && <div className={styles.successMsg}>សាររបស់អ្នកត្រូវបានផ្ញើ! / Your message has been sent!</div>}
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>ឈ្មោះ / Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="ឈ្មោះរបស់អ្នក" />
            </div>
            <div className={styles.formGroup}>
              <label>អ៊ីមែល / Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="email@example.com" />
            </div>
            <div className={styles.formGroup}>
              <label>ទូរស័ព្ទ / Phone</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="012 345 678" />
            </div>
            <div className={styles.formGroup}>
              <label>សារ / Message</label>
              <textarea name="message" value={form.message} onChange={handleChange} required rows={5} placeholder="សរសេរសាររបស់អ្នក..." />
            </div>
            <button type="submit" className={styles.submitBtn}>
              <Send size={16} /> ផ្ញើសារ / Send Message
            </button>
          </form>
        </div>

        <div className={styles.contactInfo}>
          <h2>ព័ត៌មានទំនាក់ទំនង / Contact Information</h2>
          <div className={styles.infoItem}>
            <MapPin size={20} />
            <div>
              <strong>អាសយដ្ឋាន / Address</strong>
              <p>ផ្ទះលេខ 123 ផ្លូវព្រះមេហ្គុន សង្កាត់វត្តភ្នំ រាជធានីភ្នំពេញ</p>
              <p className={styles.enText}>123 Preah Monivong Blvd, Wat Phnom, Phnom Penh</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <Phone size={20} />
            <div>
              <strong>ទូរស័ព្ទ / Phone</strong>
              <p>+855 23 123 456</p>
              <p>+855 12 345 678</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <Mail size={20} />
            <div>
              <strong>អ៊ីមែល / Email</strong>
              <p>info@khmermarket.com</p>
              <p>support@khmermarket.com</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <Facebook size={20} />
            <div>
              <strong>បណ្ដាញសង្គម / Social Media</strong>
              <p><a href="https://facebook.com/khmermarket" target="_blank" rel="noopener noreferrer">facebook.com/khmermarket <ExternalLink size={12} /></a></p>
              <p><a href="https://t.me/khmermarket" target="_blank" rel="noopener noreferrer">Telegram: @khmermarket <ExternalLink size={12} /></a></p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <Phone size={20} />
            <div>
              <strong>ម៉ោងធ្វើការ / Business Hours</strong>
              <p>ចន្លោះម៉ោង ៨:០០ ព្រឹក - ៨:០ះយប់ ថ្ងៃចន្ទ-សៅរ៍</p>
              <p className={styles.enText}>Monday - Saturday, 8:00 AM - 8:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
