import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../lib/axios';

function StatCard({ label, value, sub }) {
  return (
    <div style={{ border: '1px solid var(--color-brand-border)', padding: '28px 24px', background: 'var(--color-brand-white)' }}>
      <p className="label" style={{ marginBottom: '16px' }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: '300' }}>{value}</p>
      {sub && <p style={{ fontSize: '11px', color: 'var(--color-brand-mid)', marginTop: '6px' }}>{sub}</p>}
    </div>
  );
}

function InlineError({ msg, onDismiss }) {
  if (!msg) return null;
  return (
    <div style={{
      background: '#fef2f2', border: '1px solid #fecaca',
      padding: '12px 16px', fontSize: '12px', color: '#c0392b',
      marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <span>{msg}</span>
      {onDismiss && (
        <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b', fontSize: '16px', lineHeight: 1 }}>×</button>
      )}
    </div>
  );
}

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS = {
  pending:    '#f59e0b',
  processing: '#3b82f6',
  shipped:    '#8b5cf6',
  delivered:  '#10b981',
  cancelled:  '#ef4444',
};

export default function Admin() {
  const { user } = useAuthStore();

  const [stats, setStats]           = useState(null);
  const [orders, setOrders]         = useState([]);
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);  // T13
  const [users, setUsers]           = useState([]);   // T18
  const [tab, setTab]               = useState('overview');
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState('');

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', slug: '', price: '', stock: '', category_id: '', description: '', is_active: true,
  });
  const [imageFile, setImageFile]   = useState(null);
  const [formError, setFormError]   = useState('');   // T17
  const [actionError, setActionError] = useState(''); // T17 — for delete/status errors

  // T13: Load categories + users alongside other data
  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const results = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/admin/orders'),
        api.get('/products'),
        api.get('/admin/categories'),  // T13
        api.get('/admin/users'),       // T18
      ]);
      const [statsRes, ordersRes, productsRes, categoriesRes, usersRes] = results;

      if (statsRes.status === 'fulfilled')      setStats(statsRes.value.data);
      if (ordersRes.status === 'fulfilled')     setOrders(ordersRes.value.data.data || ordersRes.value.data);
      if (productsRes.status === 'fulfilled')   setProducts(productsRes.value.data.data || productsRes.value.data);
      if (categoriesRes.status === 'fulfilled') {
        const cats = categoriesRes.value.data;
        setCategories(cats);
        // Pre-select the first category once loaded
        if (cats.length > 0) {
          setNewProduct(prev => ({ ...prev, category_id: String(cats[0].id) }));
        }
      }
      if (usersRes.status === 'fulfilled')      setUsers(usersRes.value.data.data || usersRes.value.data);

      if (results.some(r => r.status === 'rejected')) {
        setLoadError('Some admin data failed to load. Please refresh.');
      }
    } catch (e) {
      console.error('Admin load error', e);
      setLoadError('Failed to load admin data. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // T17: replace alert() with inline state
  const updateStatus = async (orderId, status) => {
    setActionError('');
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update order status.');
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    setActionError('');
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setNewProduct(prev => ({
      ...prev,
      name,
      slug: name.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, ''),
    }));
  };

  // T13 + T17: send category_id (integer) and show precise error
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setFormError('');

    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('price', newProduct.price);
    formData.append('stock', newProduct.stock);
    formData.append('category_id', newProduct.category_id);
    formData.append('description', newProduct.description);
    formData.append('is_active', newProduct.is_active ? 1 : 0);
    if (imageFile) formData.append('image', imageFile);

    try {
      const res = await api.post('/admin/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const added = res.data.data || res.data.product || res.data;
      setProducts(prev => [added, ...prev]);
      setShowAddProduct(false);
      setNewProduct({ name: '', slug: '', price: '', stock: '', category_id: categories[0]?.id ? String(categories[0].id) : '', description: '', is_active: true });
      setImageFile(null);
    } catch (err) {
      // T17: Extract Laravel validation errors
      const errors = err.response?.data?.errors;
      if (errors) {
        const msgs = Object.values(errors).flat().join(' ');
        setFormError(msgs);
      } else {
        setFormError(err.response?.data?.message || 'Failed to add product. Please check all fields.');
      }
    }
  };

  const handleStockChange = (id, newStock) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
  };

  const saveStock = async (product) => {
    try {
      await api.put(`/admin/products/${product.id}`, { stock: product.stock });
    } catch {
      console.error('Stock update failed');
    }
  };

  // T18: Add 'users' tab
  const tabs = ['overview', 'orders', 'products', 'users'];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '40px 32px 80px' }}>

      {/* Header */}
      <div style={{
        marginBottom: '40px', paddingBottom: '24px',
        borderBottom: '1px solid var(--color-brand-border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      }}>
        <div>
          <p className="label" style={{ marginBottom: '8px' }}>Backoffice</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: '300' }}>Admin Dashboard</h1>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--color-brand-mid)' }}>{user?.email}</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '32px', marginBottom: '40px', borderBottom: '1px solid var(--color-brand-border)' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => { setTab(t); setActionError(''); }} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 16px',
            fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: '600',
            letterSpacing: '0.16em', textTransform: 'uppercase',
            color: tab === t ? 'var(--color-brand-black)' : 'var(--color-brand-mid)',
            borderBottom: tab === t ? '2px solid var(--color-brand-black)' : '2px solid transparent',
            transition: 'color 0.2s',
          }}>
            {t}
          </button>
        ))}
      </div>

      {/* Global load error */}
      {loadError && (
        <div style={{ padding: '16px 20px', background: '#fef2f2', border: '1px solid #fecaca', color: '#c0392b', fontSize: '13px', marginBottom: '32px' }}>
          {loadError}
          <button onClick={loadData} style={{ marginLeft: '16px', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b', fontSize: '13px' }}>
            Retry
          </button>
        </div>
      )}

      {/* Action error (delete / status update) — T17 */}
      <InlineError msg={actionError} onDismiss={() => setActionError('')} />

      {loading && (
        <p className="label" style={{ textAlign: 'center', padding: '48px' }}>Loading...</p>
      )}

      {/* ── Overview Tab ── */}
      {!loading && tab === 'overview' && stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1px',
          background: 'var(--color-brand-border)',
        }}>
          <StatCard label="Total Revenue"  value={`$${Number(stats.total_revenue).toFixed(0)}`}  sub="Delivered orders" />
          <StatCard label="Total Orders"   value={stats.total_orders}   sub={`${stats.pending_orders} pending`} />
          <StatCard label="Products"       value={stats.total_products} />
          <StatCard label="Users"          value={stats.total_users} />
        </div>
      )}

      {/* ── Orders Tab ── */}
      {!loading && tab === 'orders' && (
        <div>
          {orders.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '48px', color: 'var(--color-brand-mid)', fontSize: '13px' }}>No orders yet.</p>
          ) : (
            <>
              <div style={{
                background: 'var(--color-brand-off)',
                display: 'grid',
                gridTemplateColumns: '60px 1fr 180px 130px 110px 130px',
                gap: '12px', padding: '12px 16px',
              }}>
                {['ID', 'Customer', 'Address', 'Date', 'Total', 'Status'].map(h => (
                  <span key={h} className="label">{h}</span>
                ))}
              </div>
              {orders.map(order => (
                <div key={order.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 180px 130px 110px 130px',
                  gap: '12px', padding: '14px 16px',
                  borderBottom: '1px solid var(--color-brand-border)',
                  alignItems: 'center', fontSize: '12px',
                }}>
                  <span style={{ color: 'var(--color-brand-mid)' }}>#{order.id}</span>
                  <span>{order.user?.name || '—'}</span>
                  <span style={{ color: 'var(--color-brand-mid)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {order.shipping_address}
                  </span>
                  <span style={{ color: 'var(--color-brand-mid)' }}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                  <span style={{ fontWeight: '600' }}>${Number(order.total_amount).toFixed(2)}</span>
                  <select
                    value={order.status}
                    onChange={e => updateStatus(order.id, e.target.value)}
                    style={{
                      border: '1px solid var(--color-brand-border)',
                      padding: '4px 8px',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '11px', fontWeight: '600',
                      color: STATUS_COLORS[order.status] || '#000',
                      background: 'transparent', cursor: 'pointer',
                    }}
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── Products Tab ── */}
      {!loading && tab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <p className="label">Manage Products</p>
            <button
              onClick={() => { setShowAddProduct(!showAddProduct); setFormError(''); }}
              style={{ background: 'var(--color-brand-black)', color: 'var(--color-brand-white)', border: 'none', padding: '8px 16px', fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
              {showAddProduct ? 'Cancel' : '+ Add Product'}
            </button>
          </div>

          {showAddProduct && (
            <form onSubmit={handleAddProduct} style={{ background: 'var(--color-brand-off)', padding: '24px', marginBottom: '24px', border: '1px solid var(--color-brand-border)' }}>
              {/* T17: form error display */}
              <InlineError msg={formError} onDismiss={() => setFormError('')} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <input required placeholder="Product Name" value={newProduct.name} onChange={handleNameChange} className="input-field" style={{ padding: '12px' }} />
                <input required placeholder="Price" type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} className="input-field" style={{ padding: '12px' }} />
                <input required placeholder="Stock" type="number" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} className="input-field" style={{ padding: '12px' }} />

                {/* T13: dynamic categories from API */}
                <select
                  required
                  value={newProduct.category_id}
                  onChange={e => setNewProduct({ ...newProduct, category_id: e.target.value })}
                  className="input-field"
                  style={{ padding: '12px' }}
                >
                  {categories.length === 0 && <option value="">Loading categories…</option>}
                  {categories.map(c => (
                    <option key={c.id} value={String(c.id)}>{c.name}</option>
                  ))}
                </select>

                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files[0])}
                  className="input-field"
                  style={{ padding: '9px 12px', fontSize: '11px', background: 'var(--color-brand-white)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={newProduct.is_active} onChange={e => setNewProduct({ ...newProduct, is_active: e.target.checked })} />
                  <span style={{ fontSize: '12px' }}>Is Active</span>
                </div>
              </div>
              <textarea placeholder="Description" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} className="input-field" style={{ width: '100%', minHeight: '80px', marginBottom: '16px', padding: '12px' }} />
              <button type="submit" style={{ background: 'var(--color-brand-black)', color: 'var(--color-brand-white)', border: 'none', padding: '12px 24px', fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', width: '100%' }}>
                Save Product
              </button>
            </form>
          )}

          <div style={{
            background: 'var(--color-brand-off)',
            display: 'grid',
            gridTemplateColumns: '60px 1fr 100px 80px 80px 80px',
            gap: '12px', padding: '12px 16px',
          }}>
            {['ID', 'Name', 'Price', 'Stock', 'Active', 'Action'].map(h => (
              <span key={h} className="label">{h}</span>
            ))}
          </div>
          {products.length === 0 && (
            <p style={{ textAlign: 'center', padding: '48px', color: 'var(--color-brand-mid)', fontSize: '13px' }}>No products yet.</p>
          )}
          {products.map(product => (
            <div key={product.id} style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr 100px 80px 80px 80px',
              gap: '12px', padding: '14px 16px',
              borderBottom: '1px solid var(--color-brand-border)',
              alignItems: 'center', fontSize: '12px',
            }}>
              <span style={{ color: 'var(--color-brand-mid)' }}>#{product.id}</span>
              <span style={{ fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</span>
              <span>${Number(product.price).toFixed(2)}</span>
              <input
                type="number"
                value={product.stock}
                onChange={e => handleStockChange(product.id, e.target.value)}
                onBlur={() => saveStock(product)}
                style={{ border: '1px solid var(--color-brand-border)', padding: '4px 6px', width: '60px', fontSize: '11px', fontFamily: 'var(--font-sans)', background: 'var(--color-brand-white)' }}
              />
              <span style={{ color: product.is_active ? '#10b981' : '#ef4444', fontWeight: '700', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {product.is_active ? 'Yes' : 'No'}
              </span>
              <button
                onClick={() => deleteProduct(product.id)}
                style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', padding: '4px 10px', fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Users Tab — T18 ── */}
      {!loading && tab === 'users' && (
        <div>
          <div style={{
            background: 'var(--color-brand-off)',
            display: 'grid',
            gridTemplateColumns: '60px 1fr 1fr 100px 140px',
            gap: '12px', padding: '12px 16px',
          }}>
            {['ID', 'Name', 'Email', 'Role', 'Joined'].map(h => (
              <span key={h} className="label">{h}</span>
            ))}
          </div>
          {users.length === 0 && (
            <p style={{ textAlign: 'center', padding: '48px', color: 'var(--color-brand-mid)', fontSize: '13px' }}>No users found.</p>
          )}
          {users.map(u => (
            <div key={u.id} style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr 1fr 100px 140px',
              gap: '12px', padding: '14px 16px',
              borderBottom: '1px solid var(--color-brand-border)',
              alignItems: 'center', fontSize: '12px',
            }}>
              <span style={{ color: 'var(--color-brand-mid)' }}>#{u.id}</span>
              <span style={{ fontWeight: '500' }}>{u.name}</span>
              <span style={{ color: 'var(--color-brand-mid)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', padding: '3px 8px',
                background: u.role === 'admin' ? '#ede9fe' : '#f3f4f6',
                color: u.role === 'admin' ? '#4c1d95' : '#374151',
                fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase',
                width: 'fit-content',
              }}>
                {u.role}
              </span>
              <span style={{ color: 'var(--color-brand-mid)' }}>
                {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
