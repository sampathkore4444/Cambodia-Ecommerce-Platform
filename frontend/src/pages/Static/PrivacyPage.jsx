import React from 'react';
import styles from './StaticPages.module.css';

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>គោលការណ៍ឯកជនភាព</h1>
        <p className={styles.subtitle}>Privacy Policy</p>
        <p className={styles.lastUpdated}>បានកែប្រែចុងក្រោយ: ថ្ងៃទី ១ ខែ មករា ឆ្នាំ ២០២៤</p>
      </section>

      <section className={styles.termsSection}>
        <h2>១. ការប្រមូលទិន្នន័យ / Data Collection</h2>
        <p>
          យើងប្រមូលទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នកនៅពេលអ្នកចុះឈ្មោះគណនី ដាក់បញ្ជាទិញ ឬទំនាក់ទំនងជាមួយយើង។
          ទិន្នន័យដែលយើងប្រមូលរួមមាន៖ ឈ្មោះ អ៊ីមែល លេខទូរស័ព្ទ អាសយដ្ឋាន ព័ត៌មានបង់ប្រាក់ និងប្រវត្តិការបញ្ជាទិញ។
        </p>
        <p>
          We collect your personal data when you register an account, place an order, or contact us.
          Data we collect includes: name, email, phone number, address, payment information, and order history.
        </p>
      </section>

      <section className={styles.termsSection}>
        <h2>២. ការប្រើប្រាស់ទិន្នន័យ / Data Use</h2>
        <p>
          យើងប្រើប្រាស់ទិន្នន័យរបស់អ្នកដើម្បី៖ ដំណើរការការបញ្ជាទិញ ផ្តល់សេវាកម្មអតិថិជន កែលម្អបទពិសោធន៍ទិញដូរ
          ផ្ញើព័ត៌មានអំពីការបញ្ជាទិញ និងផ្តល់ព័ត៌មានអំពីការផ្សាយពាណិជ្ជកម្ម (ប្រសិនបើអ្នកយល់ព្រម)។
          យើងមិនលក់ទិន្នន័យរបស់អ្នកឱ្យភាគីទីបីឡើយ។
        </p>
      </section>

      <section className={styles.termsSection}>
        <h2>៣. គោលការណ៍ Cookies</h2>
        <p>
          វេបសាយរបស់យើងប្រើ cookies ដើម្បីជួយសម្គាល់អ្នក និងកែលម្អបទពិសោធន៍របស់អ្នក។
          Cookies គឺជាឯកសារតូចៗដែលត្រូវបានរក្សាទុកនៅលើកុំព្យូទ័ររបស់អ្នក។
          អ្នកអាចបិទ cookies នៅក្នុងការកំណត់កម្មវិធីរុករករបស់អ្នក។
        </p>
      </section>

      <section className={styles.termsSection}>
        <h2>៤. ភាគីទីបី / Third Parties</h2>
        <p>
          យើងចែករំលែកទិន្នន័យជាមួយភាគីទីបីតែនៅពេលចាំបាច់ប៉ុណ្ណោះ៖
          ក្រុមហ៊ុនដឹកជញ្ជូន (ដើម្បីដឹកជញ្ជូនទំនិញ) ប្រព័ន្ធបង់ប្រាក់ (ដើម្បីដំណើរការការបង់ប្រាក់)។
          ភាគីទីបីទាំងនេះត្រូវតែរក្សាការសម្ងាត់នៃទិន្នន័យរបស់អ្នក។
        </p>
      </section>

      <section className={styles.termsSection}>
        <h2>៥. សុវត្ថិភាពទិន្នន័យ / Data Security</h2>
        <p>
          យើងប្រើប្រាស់បច្ចេកវិទ្យាអ៊ិនគ្រីប SSL និងវិធានការសុវត្ថិភាពផ្សេងទៀតដើម្បីការពារទិន្នន័យរបស់អ្នក។
          យើងរក្សាទុកព័ត៌មានបង់ប្រាក់នៅលើម៉ាស៊ីនមេដែលមានសុវត្ថិភាព និងមិនរក្សាទុកព័ត៌មានប័ណ្ណឥណទានលើម៉ាស៊ីនមេរបស់យើងឡើយ។
        </p>
      </section>

      <section className={styles.termsSection}>
        <h2>៦. សិទ្ធិរបស់អ្នក / User Rights</h2>
        <p>
          អ្នកមានសិទ្ធិ៖ មើលទិន្នន័យដែលយើងរក្សាទុកអំពីអ្នក ស្នើសុំកែប្រែឬលុបទិន្នន័យរបស់អ្នក
          បដិសេធការដំណើរការទិន្នន័យរបស់អ្នក និងដកការយល់ព្រមលើការប្រើប្រាស់ទិន្នន័យរបស់អ្នក។
          ដើម្បីអនុវត្តសិទ្ធិទាំងនេះ សូមទាក់ទងយើងតាមរយៈ privacy@khmermarket.com។
        </p>
      </section>

      <section className={styles.termsSection}>
        <h2>៧. ទំនាក់ទំនង / Contact</h2>
        <p>
          សម្រាប់សំណួរអំពីគោលការណ៍ឯកជនភាពរបស់យើង សូមទាក់ទង៖
        </p>
        <p>
          អ៊ីមែល: privacy@khmermarket.com<br />
          ទូរស័ព្ទ: +855 23 123 456<br />
          អាសយដ្ឋាន: ផ្ទះលេខ 123 ផ្លូវព្រះមេហ្គុន សង្កាត់វត្តភ្នំ រាជធានីភ្នំពេញ
        </p>
      </section>
    </div>
  );
}
