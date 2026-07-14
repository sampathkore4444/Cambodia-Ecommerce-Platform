import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './PromoBanner.module.css';

const slides = [
  {
    title: 'ទិញផលិតផលថ្មីៗ',
    subtitle: 'ការផ្តល់ជូនពិសេសសម្រាប់អតិថិជនថ្មី',
    cta: 'ទិញឥឡូវនេះ',
    link: '/search',
    bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    title: 'ក្លាយជាអ្នកលក់',
    subtitle: 'ដាក់ផលិតផលរបស់អ្នកលក់ទៅកាន់អតិថិជនរាប់ពាន់នាក់',
    cta: 'ចាប់ផ្តើមលក់',
    link: '/sell',
    bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    title: 'ថ្ងៃនេះមានការផ្តល់ជូន',
    subtitle: 'ផលិតផលក្នុងការលក់បញ្ចុះតម្លៃរហូតដល់ ៥០%',
    cta: 'មើលការផ្តល់ជូន',
    link: '/search',
    bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
];

export default function PromoBanner() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent(c => (c + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent(c => (c - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <div className={styles.banner} style={{ background: slide.bg }}>
      <div className={styles.content}>
        <h2 className={styles.title}>{slide.title}</h2>
        <p className={styles.subtitle}>{slide.subtitle}</p>
        <a href={slide.link} className={styles.cta}>{slide.cta}</a>
      </div>
      <button className={`${styles.arrow} ${styles.prev}`} onClick={prev} aria-label="Previous"><ChevronLeft size={24} /></button>
      <button className={`${styles.arrow} ${styles.next}`} onClick={next} aria-label="Next"><ChevronRight size={24} /></button>
      <div className={styles.dots}>
        {slides.map((_, i) => (
          <button key={i} className={`${styles.dot} ${i === current ? styles.activeDot : ''}`} onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`} />
        ))}
      </div>
    </div>
  );
}
