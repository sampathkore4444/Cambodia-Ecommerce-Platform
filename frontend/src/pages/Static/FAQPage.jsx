import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import styles from './StaticPages.module.css';

const faqs = [
  {
    category: 'ការទិញ / Buying',
    items: [
      {
        q: 'តើខ្ញុំអាចទិញទំនិញដោយរបៀបណា? / How do I buy products?',
        a: 'ជ្រើសរើសផលិតផលដែលអ្នកចូលចិត្ត ចុច "បន្ថែមទៅរទេះ" ឬ "ទិញភ្លាម" រួចធ្វើការបង់ប្រាក់។ អ្នកអាចបង់ប្រាក់នៅពេលទទួលទំនិញ (COD) ឬតាមរយៈABA, Wing, Pi Pay ។'
      },
      {
        q: 'តើខ្ញុំអាចប្រើប្រាស់វិធីបង់ប្រាក់អ្វីបាន? / What payment methods are accepted?',
        a: 'យើងទទួលស្គាល់៖ បង់ប្រាក់ពេលទទួល (COD), ធនាគារ ABA, Wing, Pi Pay, True Money, និងប័ណ្ណឥណទាន/ឥណពិន្ទុ។'
      },
      {
        q: 'តើខ្ញុំអាចត្រឡប់ទំនិញបានទេ? / Can I return products?',
        a: 'បាទ អ្នកអាចត្រឡប់ទំនិញក្នុងរយៈពេល ៧ ថ្ងៃបន្ទាប់ពីទទួលបាន។ ទំនិញត្រូវតែស្ថិតក្នុងស្ថានភាពដើម និងមិនប្រើប្រាស់។'
      },
    ]
  },
  {
    category: 'ការលក់ / Selling',
    items: [
      {
        q: 'តើខ្ញុំអាចក្លាយជាអ្នកលក់បានដោយរបៀបណា? / How do I become a seller?',
        a: 'ចុច "លក់" នៅក្នុងម៉ឺនុយ រួចចុះឈ្មោះជាអ្នកលក់។ អ្នកនឹងត្រូវផ្តល់អត្តសញ្ញាណប័ណ្ណសម្គាល់ខ្លួន (National ID) ដើម្បីផ្ទៀងផ្ទាត់។'
      },
      {
        q: 'តើអ្នកលក់ចំណាយអ្វីខ្លះ? / What are the seller fees?',
        a: 'ការចុះឈ្មោះឥតគិតថ្លៃ! យើងគ្រាន់តែយកកម្រៃពីការលក់បានសម្រេច ៥% ប៉ុណ្ណោះ។'
      },
      {
        q: 'តើខ្ញុំអាចដាក់លក់ផលិតផលអ្វីបាន? / What products can I sell?',
        a: 'អ្នកអាចដាក់លក់ផលិតផលស្របច្បាប់ទាំងអស់។ ហាមលក់អាវុធ គ្រឿងញៀន ឬទំនិញក្លែងក្លាយ។'
      },
    ]
  },
  {
    category: 'ការដឹកជញ្ជូន / Shipping',
    items: [
      {
        q: 'តើការដឹកជញ្ជូនចំណាយពេលប៉ុន្មាន? / How long does shipping take?',
        a: 'ក្នុងរាជធានីភ្នំពេញ: ១-២ ថ្ងៃ។ ក្នុងខេត្ត: ២-៥ ថ្ងៃ។ ការដឹកជញ្ជូនឥតគិតថ្លៃសម្រាប់ការបញ្ជាទិញច្រើនជាង $20។'
      },
      {
        q: 'តើខ្ញុំអាចតាមដានការដឹកជញ្ជូនបានដោយរបៀបណា? / How do I track my shipment?',
        a: 'អ្នកនឹងទទួលបានលេខតាមដានតាមរយៈ SMS និងអ៊ីមែល។ អ្នកក៏អាចពិនិត្យស្ថានភាពបញ្ជានៅក្នុង "បញ្ជារបស់ខ្ញុំ" ផងដែរ។'
      },
    ]
  },
  {
    category: 'គណនី / Account',
    items: [
      {
        q: 'តើខ្ញុំអាចកែប្រែព័ត៌មានគណនីរបស់ខ្ញុំបានដោយរបៀបណា? / How do I update my account info?',
        a: 'ចូលទៅ "ការកំណត់" > "ប្រវត្តិរូប" ដើម្បីកែប្រែឈ្មោះ រូបភាព ឬព័ត៌មានទំនាក់ទំនងរបស់អ្នក។'
      },
      {
        q: 'តើខ្ញុំភ្លេចពាក្យសម្ងាត់គណនីធ្វើដូចម្តេច? / What if I forgot my password?',
        a: 'ចុច "ភ្លេចពាក្យសម្ងាត់?" នៅលើទំព័រចូល រួចបញ្ចូលលេខទូរស័ព្ទ ឬអ៊ីមែលរបស់អ្នក។ យើងនឹងផ្ញើកូដផ្ទៀងផ្ទាត់ឱ្យអ្នក។'
      },
    ]
  },
  {
    category: 'ការត្រឡប់ និងសងប្រាក់ / Returns & Refunds',
    items: [
      {
        q: 'តើខ្ញុំអាចស្នើសុំសងប្រាក់បាននៅពេលណា? / When can I request a refund?',
        a: 'អ្នកអាចស្នើសុំសងប្រាក់ក្នុងរយៈពេល ៧ ថ្ងៃបន្ទាប់ពីទទួលបានទំនិញ ប្រសិនបើទំនិញខូច ឬមិនដូចការពិពណ៌នា។'
      },
      {
        q: 'តើការសងប្រាក់ចំណាយពេលប៉ុន្មាន? / How long does a refund take?',
        a: 'ការសងប្រាក់តាម Wing ឬ ABA ចំណាយពេល ៣-៥ ថ្ងៃធ្វើការ។ ការសងប្រាក់ទៅប័ណ្ណឥណទានអាចចំណាយពេល ៥-១០ ថ្ងៃ។'
      },
    ]
  },
];

function FaqItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.faqItem}>
      <button className={styles.faqQuestion} onClick={() => setOpen(!open)}>
        <span>{faq.q}</span>
        {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {open && <div className={styles.faqAnswer}><p>{faq.a}</p></div>}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>សំណួរគេសួរញឹកញាប់</h1>
        <p className={styles.subtitle}>Frequently Asked Questions</p>
      </section>
      {faqs.map((section, i) => (
        <section key={i} className={styles.faqSection}>
          <h2>{section.category}</h2>
          {section.items.map((faq, j) => <FaqItem key={j} faq={faq} />)}
        </section>
      ))}
    </div>
  );
}
