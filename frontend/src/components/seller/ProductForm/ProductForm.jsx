import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Plus, Trash2 } from 'lucide-react';
import { CATEGORIES, PRODUCT_CONDITIONS, KHMER_PROVINCES } from '../../../utils/constants';
import { productsAPI } from '../../../api';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import styles from './ProductForm.module.css';

const emptyVariant = { name: '', sku: '', price: '', stock_quantity: '', attributes: '' };

function toFormValues(product) {
  if (!product) return {
    title: '', title_kh: '', description: '', description_kh: '',
    category_id: '', condition: 'new', price: '', compare_price: '',
    stock_quantity: '', weight_grams: '', location_province: '', location_district: '',
    tags: '', shipping_class: '', min_order_qty: '1', max_order_qty: '',
    is_digital: false,
  };
  return {
    title: product.title || '',
    title_kh: product.title_kh || '',
    description: product.description || '',
    description_kh: product.description_kh || '',
    category_id: product.category_id || '',
    condition: product.condition || 'new',
    price: product.price?.toString() || '',
    compare_price: product.compare_price?.toString() || '',
    stock_quantity: product.stock_quantity?.toString() || '',
    weight_grams: product.weight_grams?.toString() || '',
    location_province: product.location_province || '',
    location_district: product.location_district || '',
    tags: (product.tags || []).join(', '),
    shipping_class: product.shipping_class || '',
    min_order_qty: product.min_order_qty?.toString() || '1',
    max_order_qty: product.max_order_qty?.toString() || '',
    is_digital: product.is_digital || false,
  };
}

export default function ProductForm({ product, onSubmit }) {
  const [form, setForm] = useState(toFormValues(product));
  const [variants, setVariants] = useState(
    product?.variants?.length
      ? product.variants.map(v => ({ name: v.name, sku: v.sku || '', price: v.price?.toString() || '', stock_quantity: v.stock_quantity?.toString() || '', attributes: v.attributes ? JSON.stringify(v.attributes) : '' }))
      : [{ ...emptyVariant }]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState(product?.images || []);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = useCallback(async (files) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!imageFiles.length) return;
    setUploading(true);
    setError('');
    try {
      const results = await Promise.all(
        imageFiles.map(async (file) => {
          const res = await productsAPI.uploadImage(file);
          return res.data.data;
        })
      );
      setImages(prev => [...prev, ...results]);
    } catch (err) {
      setError('រូបភាពមិនអាចបញ្ចូលបាន។ សូមព្យាយាមម្តងទៀត។');
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };
  const handleFileSelect = (e) => { handleFiles(e.target.files); e.target.value = ''; };
  const removeImage = (i) => setImages(prev => prev.filter((_, idx) => idx !== i));

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const updateVariant = (i, f, v) => {
    setVariants(p => { const next = [...p]; next[i] = { ...next[i], [f]: v }; return next; });
  };

  const addVariant = () => setVariants(p => [...p, { ...emptyVariant }]);
  const removeVariant = (i) => setVariants(p => p.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        title_kh: form.title_kh || undefined,
        description: form.description || undefined,
        description_kh: form.description_kh || undefined,
        category_id: form.category_id || undefined,
        condition: form.condition,
        price: parseFloat(form.price) || 0,
        compare_price: form.compare_price ? parseFloat(form.compare_price) : undefined,
        stock_quantity: parseInt(form.stock_quantity, 10) || 0,
        weight_grams: form.weight_grams ? parseInt(form.weight_grams, 10) : undefined,
        location_province: form.location_province || undefined,
        location_district: form.location_district || undefined,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
        shipping_class: form.shipping_class || undefined,
        min_order_qty: parseInt(form.min_order_qty, 10) || 1,
        max_order_qty: form.max_order_qty ? parseInt(form.max_order_qty, 10) : undefined,
        is_digital: form.is_digital,
      };
      const validVariants = variants.filter(v => v.name && v.price);
      if (validVariants.length) {
        payload.variants = validVariants.map(v => ({
          name: v.name,
          sku: v.sku || undefined,
          price: parseFloat(v.price),
          stock_quantity: parseInt(v.stock_quantity, 10) || 0,
          attributes: v.attributes ? JSON.parse(v.attributes) : undefined,
        }));
      }
      await onSubmit(payload, images);
    } catch (err) {
      setError(err.message || 'មានបញ្ហា។ សូមព្យាយាមម្តងទៀត។');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>{product ? 'កែសម្រួលផលិតផល' : 'បន្ថែមផលិតផលថ្មី'}</h2>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.row}>
        <Input label="ឈ្មោះ (English) *" name="title" value={form.title} onChange={e => update('title', e.target.value)} required />
        <Input label="ឈ្មោះ (ខ្មែរ)" name="title_kh" value={form.title_kh} onChange={e => update('title_kh', e.target.value)} />
      </div>

      <div className={styles.row}>
        <div className={styles.textAreaGroup}>
          <label>ពិពណ៌នា (English)</label>
          <textarea className={styles.textarea} value={form.description} onChange={e => update('description', e.target.value)} rows={4} />
        </div>
        <div className={styles.textAreaGroup}>
          <label>ពិពណ៌នា (ខ្មែរ)</label>
          <textarea className={styles.textarea} value={form.description_kh} onChange={e => update('description_kh', e.target.value)} rows={4} />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.selectGroup}>
          <label>ប្រភេទ</label>
          <select className={styles.select} value={form.category_id} onChange={e => update('category_id', e.target.value)}>
            <option value="">ជ្រើសរើសប្រភេទ</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.nameKm}</option>)}
          </select>
        </div>
        <div className={styles.selectGroup}>
          <label>ស្ថានភាព</label>
          <select className={styles.select} value={form.condition} onChange={e => update('condition', e.target.value)}>
            {Object.entries(PRODUCT_CONDITIONS).map(([k, v]) => <option key={k} value={k}>{v.labelKm}</option>)}
          </select>
        </div>
      </div>

      <div className={styles.row}>
        <Input label="តម្លៃ ($) *" name="price" type="number" value={form.price} onChange={e => update('price', e.target.value)} required />
        <Input label="តម្លៃប្រៀបធៀប ($)" name="compare_price" type="number" value={form.compare_price} onChange={e => update('compare_price', e.target.value)} />
      </div>

      <div className={styles.row}>
        <Input label="ស្តុក *" name="stock_quantity" type="number" value={form.stock_quantity} onChange={e => update('stock_quantity', e.target.value)} required />
        <Input label="ទម្ងន់ (ក្រាម)" name="weight_grams" type="number" value={form.weight_grams} onChange={e => update('weight_grams', e.target.value)} />
      </div>

      <div className={styles.row}>
        <div className={styles.selectGroup}>
          <label>ខេត្ត/ទីក្រុង</label>
          <select className={styles.select} value={form.location_province} onChange={e => update('location_province', e.target.value)}>
            <option value="">ជ្រើសរើសទីតាំង</option>
            {KHMER_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <Input label="ស្រុក/ខណ្ឌ" name="location_district" value={form.location_district} onChange={e => update('location_district', e.target.value)} />
      </div>

      <div className={styles.row}>
        <Input label="ស្លាក (ដាច់ដោយក្បៀស)" name="tags" value={form.tags} onChange={e => update('tags', e.target.value)} placeholder="ឧ. ថ្មី, ពិសេស, មានកំរិត" />
        <div className={styles.selectGroup}>
          <label>ប្រភេទដឹកជញ្ជូន</label>
          <select className={styles.select} value={form.shipping_class} onChange={e => update('shipping_class', e.target.value)}>
            <option value="">ស្តង់ដា</option>
            <option value="heavy">ធ្ងន់</option>
            <option value="fragile">ងាយបែក</option>
          </select>
        </div>
      </div>

      <div className={styles.row}>
        <Input label="ចំនួនអប្បបរមា" name="min_order_qty" type="number" value={form.min_order_qty} onChange={e => update('min_order_qty', e.target.value)} />
        <Input label="ចំនួនអតិបរមា" name="max_order_qty" type="number" value={form.max_order_qty} onChange={e => update('max_order_qty', e.target.value)} />
      </div>

      <div className={styles.uploadSection}>
        <label>រូបភាព</label>
        {images.length > 0 && (
          <div className={styles.imageGrid}>
            {images.map((img, i) => (
              <div key={i} className={styles.imagePreview}>
                <img src={img.url} alt={img.alt_text || `រូបភាព ${i + 1}`} />
                <button type="button" className={styles.removeImageBtn} onClick={() => removeImage(i)}>
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div
          className={styles.uploadArea}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={32} />
          <span>{uploading ? 'កំពុងបញ្ចូលរូបភាព...' : 'អូសរូបភាពមកទីនេះ ឬចុចដើម្បីជ្រើសរើស'}</span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      <div className={styles.variantsSection}>
        <div className={styles.variantsHeader}>
          <h3>វ៉ារៀង (Variants)</h3>
          <button type="button" className={styles.addVariantBtn} onClick={addVariant}><Plus size={16} /> បន្ថែម</button>
        </div>
        {variants.map((v, i) => (
          <div key={i} className={styles.variantRow}>
            <Input label="ឈ្មោះ" value={v.name} onChange={e => updateVariant(i, 'name', e.target.value)} placeholder="ឧ. ពណ៌ក្រហម - ទំហំ XL" />
            <Input label="SKU" value={v.sku} onChange={e => updateVariant(i, 'sku', e.target.value)} />
            <Input label="តម្លៃ ($)" type="number" value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)} required />
            <Input label="ស្តុក" type="number" value={v.stock_quantity} onChange={e => updateVariant(i, 'stock_quantity', e.target.value)} />
            {variants.length > 1 && (
              <button type="button" className={styles.removeVariantBtn} onClick={() => removeVariant(i)}><Trash2 size={16} /></button>
            )}
          </div>
        ))}
      </div>

      <Button type="submit" fullWidth size="lg" loading={loading}>{product ? 'រក្សាទុក' : 'បន្ថែមផលិតផល'}</Button>
    </form>
  );
}
