import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/Product/ProductCard';
import api from '../lib/axios';
import { Search, X } from 'lucide-react';

const CATEGORIES = [
  { key: '', label: 'All' },
  { key: 'women', label: 'Women' },
  { key: 'men', label: 'Men' },
  { key: 'accessories', label: 'Accessories' },
];

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchError, setFetchError] = useState('');

  // Debounce search input by 400ms
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const params = new URLSearchParams();
      if (activeCategory) params.set('category', activeCategory);
      if (searchQuery) params.set('search', searchQuery);
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.data ?? data ?? []);
    } catch {
      setProducts([]);
      setFetchError('Unable to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const setCategory = (key) => {
    setSearchInput('');
    if (key) setSearchParams({ category: key });
    else setSearchParams({});
  };

  const heading = searchQuery
    ? `Results for "${searchQuery}"`
    : activeCategory
      ? CATEGORIES.find(c => c.key === activeCategory)?.label || 'Collection'
      : 'New Arrivals';

  return (
    <div style={{
      maxWidth: '1440px',
      margin: '0 auto',
      padding: '0 32px',
      paddingTop: '48px',
      paddingBottom: '80px',
    }}>
      {/* Page Header */}
      <div style={{ marginBottom: '48px', borderBottom: '1px solid var(--color-brand-border)', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '36px',
            fontWeight: '300',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--color-brand-black)',
          }}>
            {heading}
          </h1>
          {/* Search */}
          <div style={{ position: 'relative', width: '280px' }}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              style={{
                width: '100%',
                height: '42px',
                padding: '0 40px',
                fontSize: '12px',
                fontFamily: 'var(--font-sans)',
                color: 'var(--color-brand-black)',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                border: '1px solid var(--color-brand-border)',
                borderRadius: '8px',
                outline: 'none',
                transition: 'all 0.3s ease',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'var(--color-brand-black)';
                e.target.style.backgroundColor = '#fff';
                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--color-brand-border)';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-brand-mid)', display: 'flex' }}>
              <Search size={15} strokeWidth={1.5} />
            </div>
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-brand-mid)',
                  display: 'flex',
                  padding: '4px',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-brand-black)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-brand-mid)'}
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: '600',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: activeCategory === key ? 'var(--color-brand-black)' : 'var(--color-brand-mid)',
                borderBottom: activeCategory === key ? '1px solid var(--color-brand-black)' : '1px solid transparent',
                paddingBottom: '4px',
                transition: 'color 0.2s, border-color 0.2s',
              }}
            >
              {label}
            </button>
          ))}
          <span style={{
            marginLeft: 'auto',
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            color: 'var(--color-brand-mid)',
            alignSelf: 'flex-end',
          }}>
          </span>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '48px 24px',
        }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ aspectRatio: '2/3', background: 'var(--color-brand-off)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : fetchError ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 32px',
        }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: '300', marginBottom: '16px', color: 'var(--color-brand-black)' }}>
            Connection Error
          </p>
          <p style={{ fontSize: '12px', color: '#c0392b', marginBottom: '24px' }}>{fetchError}</p>
          <button className="btn-ghost" onClick={fetchProducts}>
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 32px',
          color: 'var(--color-brand-mid)',
        }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: '300', marginBottom: '16px' }}>
            No results found
          </p>
          <p style={{ fontSize: '12px', marginBottom: '24px' }}>Try adjusting your search or browse all products.</p>
          <button className="btn-ghost" onClick={() => { setSearchInput(''); setSearchParams({}); }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '48px 24px',
        }}>
          {products.map((product, i) => (
            <div key={product.id} style={{ animationDelay: `${i * 0.05}s` }} className="animate-fade-up">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
