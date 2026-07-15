import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button/Button';
import Spinner from '../../components/common/Loading/Spinner';
import SellerLayout from '../../components/seller/SellerLayout/SellerLayout';
import ConfirmAction from '../../components/common/ConfirmAction/ConfirmAction';
import { sellerAPI, productsAPI } from '../../api';
import toast from 'react-hot-toast';
import styles from './SellerProductsPage.module.css';

export default function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await sellerAPI.getProducts({ page, per_page: 20 });
      const data = res.data;
      setProducts(data.data?.items || data.items || data.data || []);
      const total = data.data?.total || data.total || 0;
      setTotalPages(Math.max(1, Math.ceil(total / 20)));
    } catch (err) {
      setError(err.message || 'មិនអាចផ្ទុកផលិតផលបាន។');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleBulkUpload = async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      toast.error('សូមជ្រើសរើសឯកសារ CSV ឬ Excel');
      return;
    }
    setUploading(true);
    setUploadResult(null);
    try {
      const res = await sellerAPI.bulkUpload(file);
      const data = res.data.data || res.data;
      setUploadResult(data);
      toast.success(`បានបញ្ចូលផលិតផល ${data.success_count || 0} ដោយជោគជ័យ`);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'មិនអាចបញ្ចូលបាន');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleBulkUpload(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleBulkUpload(file);
    e.target.value = '';
  };

  const handleDelete = async (id, name) => {
    try {
      await productsAPI.deleteProduct(id);
      setProducts(p => p.filter(item => item.id !== id));
      toast.success('បានលុបផលិតផល');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'មិនអាចលុបបាន។');
    }
  };

  if (loading && !products.length) {
    return <SellerLayout><div className={styles.loading}><Spinner size="lg" /></div></SellerLayout>;
  }

  return (
    <SellerLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>ផលិតផលរបស់ខ្ញុំ</h1>
          <div className={styles.headerActions}>
            <Button variant="ghost" size="sm" onClick={() => setShowUpload(true)}>
              📄 បញ្ចូលទ្រង់ទ្រាយ
            </Button>
            <Link to="/seller/products/new"><Button size="sm">+ បន្ថែមផលិតផល</Button></Link>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {!loading && products.length === 0 && (
          <div className={styles.empty}>
            <p>អ្នកមិនទាន់មានផលិតផលទេ។</p>
            <div className={styles.emptyActions}>
              <Link to="/seller/products/new"><Button>+ បន្ថែមផលិតផលដំបូង</Button></Link>
              <Button variant="ghost" onClick={() => setShowUpload(true)}>📄 បញ្ចូលទ្រង់ទ្រាយ</Button>
            </div>
          </div>
        )}

        <div className={styles.list}>
          {products.map(p => (
            <div key={p.id} className={styles.productCard}>
              <div className={styles.productImage}>
                {p.primary_image || p.images?.[0]?.url
                  ? <img src={p.primary_image || p.images[0].url} alt={p.title} />
                  : <div className={styles.placeholderImg}>📦</div>
                }
              </div>
              <div className={styles.productInfo}>
                <h3>{p.title_kh || p.title}</h3>
                {p.title_kh && p.title && <p className={styles.titleEn}>{p.title}</p>}
                <p className={styles.price}>${Number(p.price).toFixed(2)}{p.compare_price ? <span className={styles.comparePrice}>${Number(p.compare_price).toFixed(2)}</span> : ''}</p>
                <p className={styles.meta}>ស្តុក: {p.stock_quantity} | លក់បាន: {p.sold_count || 0} | ⭐ {p.rating_avg || 0}</p>
              </div>
              <div className={styles.actions}>
                <Link to={`/seller/products/${p.id}/edit`}><Button variant="ghost" size="sm">កែ</Button></Link>
                <ConfirmAction message={`តើអ្នកប្រាកដថាចង់លុប "${p.title}"?`} onConfirm={() => handleDelete(p.id, p.title)}>
                  <Button variant="ghost" size="sm" className={styles.deleteBtn}>លុប</Button>
                </ConfirmAction>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>មុន</Button>
            <span className={styles.pageInfo}>ទំព័រ {page} / {totalPages}</span>
            <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>បន្ទាប់</Button>
          </div>
        )}
      </div>

      {showUpload && (
        <div className={styles.modalOverlay} onClick={() => !uploading && setShowUpload(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>បញ្ចូលផលិតផលពីឯកសារ</h2>
            <p className={styles.modalDesc}>ជ្រើសរើសឯកសារ CSV ឬ Excel (.csv, .xlsx, .xls) ដែលមានផលិតផលរបស់អ្នក។</p>
            <div
              className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              {uploading ? (
                <Spinner size="md" />
              ) : (
                <>
                  <span className={styles.dropzoneIcon}>📁</span>
                  <span>អូស និងទម្លាក់ឯកសារនៅទីនេះ</span>
                  <span className={styles.dropzoneHint}>ឬចុចដើម្បីជ្រើសរើស</span>
                </>
              )}
              <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} hidden />
            </div>
            {uploadResult && (
              <div className={styles.uploadResult}>
                <p>បានបញ្ចូល: {uploadResult.success_count || 0} ដោយជោគជ័យ</p>
                {uploadResult.error_count > 0 && (
                  <p className={styles.uploadError}>បរាជ័យ: {uploadResult.error_count}</p>
                )}
                {uploadResult.errors?.length > 0 && (
                  <ul className={styles.errorList}>
                    {uploadResult.errors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                )}
              </div>
            )}
            <div className={styles.modalActions}>
              <Button variant="ghost" onClick={() => { setShowUpload(false); setUploadResult(null); }} disabled={uploading}>បិទ</Button>
            </div>
          </div>
        </div>
      )}
    </SellerLayout>
  );
}
