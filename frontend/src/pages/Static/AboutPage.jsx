import React from 'react';
import { Store, Users, Target, Shield } from 'lucide-react';
import styles from './StaticPages.module.css';

const teamMembers = [
  { name: 'Dara Kem', role: 'CEO & Founder', roleKm: 'នាយកប្រតិបត្តិ និងអ្នកបង្កើត', avatar: '👨‍💼' },
  { name: 'Sophea Lim', role: 'CTO', roleKm: 'នាយកបច្ចេកវិទ្យា', avatar: '👩‍💻' },
  { name: 'Bopha Chan', role: 'Head of Operations', roleKm: 'ប្រធានប្រតិបត្តិការ', avatar: '👩‍🔧' },
  { name: 'Vannak Sok', role: 'Head of Marketing', roleKm: 'ប្រធានទីផ្សារ', avatar: '👨‍🎨' },
];

const values = [
  { icon: <Store size={32} />, titleEn: 'Trust', titleKm: 'ទុកចិត្ត', descEn: 'Building a marketplace where buyers and sellers can transact with confidence.', descKm: 'បង្កើតទីផ្សារដែលអ្នកទិញ និងអ្នកលក់អាចធ្វើការជួញដូរដោយទុកចិត្ត។' },
  { icon: <Users size={32} />, titleEn: 'Community', titleKm: 'សហគមន៍', descEn: 'Supporting Cambodian entrepreneurs and connecting communities across the nation.', descKm: 'គាំទ្រអ្នកជំនួញកម្ពុជា និងភ្ជាប់សហគមន៍នៅទូទាំងប្រទេស។' },
  { icon: <Target size={32} />, titleEn: 'Innovation', titleKm: 'នវានុវត្តន៍', descEn: 'Leveraging technology to make e-commerce accessible to every Cambodian.', descKm: 'ប្រើប្រាស់បច្ចេកវិទ្យាដើម្បីធ្វើឱ្យពាណិជ្ជកម្មអេឡិចត្រូនិចអាចចូលដោះស្រាយបានសម្រាប់អ្នកកម្ពុជាគ្រប់រូប។' },
  { icon: <Shield size={32} />, titleEn: 'Security', titleKm: 'សុវត្ថិភាព', descEn: 'Protecting our users with secure payment systems and data privacy.', descKm: 'ការពារអ្នកប្រើប្រាស់ជាមួយប្រព័ន្ធបង់ប្រាក់សុវត្ថិភាព និងភាពឯកជននៃទិន្នន័យ។' },
];

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>អំពី KhmerMarket</h1>
        <p className={styles.subtitle}>About KhmerMarket</p>
        <p>
          KhmerMarket គឺជាវេបសាយពាណិជ្ជកម្មអេឡិចត្រូនិចដំបូងគេរបស់កម្ពុជា ដែលភ្ជាប់អ្នកលក់ និងអ្នកទិញនៅទូទាំងប្រទេស។
          យើងបង្កើតឡើងក្នុងឆ្នាំ ២០២៤ ដោយមានចក្ខុវិស័យធ្វើឱ្យការទិញលក់តាមអ៊ីនធឺណិតងាយស្រួល និងសុវត្ថិភាពសម្រាប់ទាំងអស់គ្នា។
        </p>
        <p>
          KhmerMarket is Cambodia's leading e-commerce platform connecting sellers and buyers nationwide.
          Founded in 2026, our vision is to make online buying and selling easy and secure for everyone.
        </p>
      </section>

      <section className={styles.values}>
        <h2>តម្លៃរបស់យើង / Our Values</h2>
        <div className={styles.valuesGrid}>
          {values.map((v, i) => (
            <div key={i} className={styles.valueCard}>
              <div className={styles.valueIcon}>{v.icon}</div>
              <h3>{v.titleKm} / {v.titleEn}</h3>
              <p>{v.descKm}</p>
              <p className={styles.enText}>{v.descEn}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.team}>
        <h2>ក្រុมការងាររបស់យើង / Our Team</h2>
        <div className={styles.teamGrid}>
          {teamMembers.map((m, i) => (
            <div key={i} className={styles.teamCard}>
              <div className={styles.avatar}>{m.avatar}</div>
              <h4>{m.name}</h4>
              <p>{m.roleKm}</p>
              <p className={styles.enText}>{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>10,000+</span>
          <span className={styles.statLabel}>អ្នកលក់ / Sellers</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>100,000+</span>
          <span className={styles.statLabel}>ផលិតផល / Products</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>25</span>
          <span className={styles.statLabel}>ខេត្ត / Provinces</span>
        </div>
      </section>
    </div>
  );
}
