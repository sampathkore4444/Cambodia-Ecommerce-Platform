import React from 'react';
import styles from './StaticPages.module.css';

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>លក្ខខណ្ឌសេវាកម្ម</h1>
        <p className={styles.subtitle}>Terms of Service</p>
        <p className={styles.lastUpdated}>បានកែប្រែចុងក្រោយ: ថ្ងៃទី ១ ខែ មករា ឆ្នាំ ២០២៤</p>
      </section>

      <section className={styles.termsSection}>
        <h2>១. ការទទួលយកលក្ខខណ្ឌ / Acceptance</h2>
        <p>
          ដោយប្រើប្រាស់វេបសាយ KhmerMarket អ្នកយល់ព្រមតាមលក្ខខណ្ឌសេវាកម្មទាំងនេះ។
          ប្រសិនបើអ្នកមិនយល់ព្រមតាមលក្ខខណ្ឌណាមួយទេ សូមកុំប្រើប្រាស់សេវាកម្មរបស់យើង។
        </p>
        <p>
          By using KhmerMarket, you agree to these terms of service. If you do not agree with any of these terms, please do not use our services.
        </p>
      </section>

      <section className={styles.termsSection}>
        <h2>២. លក្ខខណ្ឌគណនី / Account Terms</h2>
        <p>
          អ្នកត្រូវមានអាយុច្រើនជាង ១៨ ឆ្នាំដើម្បីបង្កើតគណនី។
          អ្នកទទួលខុសត្រូវចំពោះការរក្សាទុកពាក្យសម្ងាត់គណនីរបស់អ្នក។
          អ្នកមិនត្រូវប្រើប្រាស់គណនីរបស់អ្នកដើម្បីប្រព្រឹត្តអំពើខុសច្បាប់ឡើយ។
        </p>
      </section>

      <section className={styles.termsSection}>
        <h2>៣. ការចុះផ្សាយផលិតផល / Product Listings</h2>
        <p>
          អ្នកលក់ទទួលខុសត្រូវចំពោះការចុះផ្សាយព័ត៌មានពិតប្រាកដអំពីផលិតផល។
          រូបភាព តម្លៃ និងព័ត៌មានផ្សេងទៀតត្រូវតែត្រូវគ្នាជាមួយនឹងទំនិញជាក់ស្តែង។
          ហាមចុះផ្សាយទំនិញក្លែងក្លាយ ឬទំនិញដែលមិនស្របច្បាប់។
        </p>
      </section>

      <section className={styles.termsSection}>
        <h2>៤. ការបង់ប្រាក់ / Payments</h2>
        <p>
          យើងទទួលស្គាល់វិធីបង់ប្រាក់ជាច្រើនរួមមាន COD, ABA, Wing, Pi Pay, True Money និងប័ណ្ណឥណទាន។
          តម្លៃទាំងអស់បង្ហាញជាលេខដុល្លា (USD) និងរៀល (KHR) ។
          អ្នកលក់នឹងទទួលបានប្រាក់បន្ទាប់ពីអ្នកទិញបញ្ជាក់ការទទួលទំនិញ។
        </p>
      </section>

      <section className={styles.termsSection}>
        <h2>៥. ការដឹកជញ្ជូន / Shipping</h2>
        <p>
          ការដឹកជញ្ជូនត្រូវធ្វើឡើងដោយក្រុមហ៊ុនដឹកជញ្ជូនឯករាជ្យ។
          ពេលវេលាដឹកជញ្ជូនអាស្រ័យលើទីតាំង និងវិធីសាស្ត្រដឹកជញ្ជូន។
          ការខូចខាតក្នុងពេលដឹកជញ្ជូនទទួលខុសត្រូវដោយក្រុមហ៊ុនដឹកជញ្ជូន។
        </p>
      </section>

      <section className={styles.termsSection}>
        <h2>៦. ការត្រឡប់ និងសងប្រាក់ / Returns & Refunds</h2>
        <p>
          អ្នកទិញអាចស្នើសុំការត្រឡប់ក្នុងរយៈពេល ៧ ថ្ងៃបន្ទាប់ពីទទួលបានទំនិញ។
          ទំនិញត្រូវតែស្ថិតក្នុងស្ថានភាពដើម និងមិនប្រើប្រាស់។
          ការសងប្រាក់នឹងត្រូវធ្វើឡើងក្នុងរយៈពេល ៣-៥ ថ្ងៃធ្វើការបន្ទាប់ពីទទួលបានទំនិញត្រឡប់។
        </p>
      </section>

      <section className={styles.termsSection}>
        <h2>៧. សិទ្ធិអច្នៃប្រយោជន៍ / Intellectual Property</h2>
        <p>
          មាតិកាទាំងអស់លើវេបសាយរួមមានរូបភាព អត្ថបទ និងសញ្ញាពាណិជ្ជកម្ម គឺជារបស់ KhmerMarket ឬអ្នកលក់។
          អ្នកមិនត្រូវចម្លង ឬប្រើប្រាស់មាតិកាដោយគ្មានការអនុញ្ញាតឡើយ។
        </p>
      </section>

      <section className={styles.termsSection}>
        <h2>៨. កំហិតនៃទំនួលខុសត្រូវ / Limitation of Liability</h2>
        <p>
          KhmerMarket មិនទទួលខុសត្រូវចំពោះការខូចខាតផ្សេងៗដែលកើតចេញពីការប្រើប្រាស់សេវាកម្មរបស់យើងឡើយ។
          យើងធ្វើការអស់ពីចិត្តដើម្បីធានាថាសេវាកម្មដំណើរការបានយ៉ាងរលូន ប៉ុន្តែយើងមិនធានាថាមិនមានកំហុសឡើយ។
          ទំនួលខុសត្រូវរបស់យើងត្រូវបានកំណត់ត្រឹមតម្លៃនៃទំនិញដែលអ្នកបានទិញ។
        </p>
      </section>
    </div>
  );
}
