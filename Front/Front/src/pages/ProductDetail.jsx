import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import api from '../lib/axios';

const ACCORDION_CONTENT = {
  'Composition & Care': 'Made from 100% natural fibers. Dry clean or hand wash cold. Do not tumble dry. Iron on low heat if needed.',
  'Shipping & Returns': 'Free standard shipping on all orders. Express delivery available at checkout. Returns accepted within 30 days of delivery in original condition.',
  'Sustainability': 'We are committed to ethical sourcing and sustainable manufacturing. All materials are responsibly sourced and our packaging is 100% recyclable.',
};

const SIZE_GUIDE = [
  { size: 'XS', chest: '82-86', waist: '62-66', hips: '88-92' },
  { size: 'S',  chest: '86-90', waist: '66-70', hips: '92-96' },
  { size: 'M',  chest: '90-94', waist: '70-74', hips: '96-100' },
  { size: 'L',  chest: '94-98', waist: '74-78', hips: '100-104' },
  { size: 'XL', chest: '98-102', waist: '78-82', hips: '104-108' },
];

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem, openCart } = useCartStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [addedMsg, setAddedMsg] = useState(false);
  const [openSection, setOpenSection] = useState(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const { data } = await api.get(`/products/${slug}`);
        setProduct(data);
      } catch {
        setProduct(null);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    addItem(product, selectedVariant, 1);
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 2000);
    openCart();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-brand-mid)' }} className="label">
        Loading...
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
        <p className="label">Product not found</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '48px', fontWeight: '300', color: 'var(--color-brand-black)' }}>Unavailable</h1>
        <p style={{ fontSize: '13px', color: 'var(--color-brand-mid)', maxWidth: '360px', textAlign: 'center', lineHeight: '1.7' }}>
          This product may have been removed or is temporarily unavailable.
        </p>
        <button className="btn-ghost" onClick={() => navigate('/products')}>
          Back to Collection
        </button>
      </div>
    );
  }

  const image = product.images?.[0]?.image_url || '';
  const sizes = product.variants || [];
  const hasVariants = sizes.length > 0;
  const canAdd = !hasVariants || selectedVariant;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 32px 80px' }}>
      {/* Breadcrumb */}
      <div style={{ padding: '20px 0', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button onClick={() => navigate('/products')} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: '600',
          letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-brand-mid)',
        }}>
          ← Back
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'start' }}
           className="flex flex-col md:grid">
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '2/3', background: 'var(--color-brand-off)', overflow: 'hidden' }}>
          {image && <img src={image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          {!product.is_active && (
            <div style={{
              position: 'absolute', top: '16px', left: '16px',
              background: 'white', padding: '6px 12px',
              fontSize: '9px', fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase',
            }}>
              Sold Out
            </div>
          )}
        </div>

        {/* Details */}
        <div style={{ position: 'sticky', top: '80px', paddingTop: '24px' }}>
          <p className="label" style={{ marginBottom: '12px' }}>New Arrival</p>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '32px',
            fontWeight: '300',
            color: 'var(--color-brand-black)',
            marginBottom: '12px',
          }}>
            {product.name}
          </h1>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            fontWeight: '400',
            color: 'var(--color-brand-black)',
            marginBottom: '32px',
          }}>
            ${Number(product.price).toFixed(2)}
          </p>

          {/* Description */}
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            lineHeight: '1.8',
            color: 'var(--color-brand-mid)',
            marginBottom: '36px',
          }}>
            {product.description}
          </p>

          {/* Size Selector */}
          {hasVariants && (
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span className="label">Select Size</span>
                <button className="btn-ghost" style={{ fontSize: '10px' }} onClick={() => setShowSizeGuide(true)}>Size Guide</button>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {sizes.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  const isSoldOut = v.stock === 0;
                  return (
                    <button
                      key={v.id}
                      disabled={isSoldOut}
                      onClick={() => setSelectedVariant(v)}
                      style={{
                        width: '52px',
                        height: '52px',
                        border: isSelected ? '1.5px solid var(--color-brand-black)' : '1px solid var(--color-brand-border)',
                        background: isSelected ? 'var(--color-brand-black)' : 'transparent',
                        color: isSelected ? 'white' : isSoldOut ? 'var(--color-brand-light)' : 'var(--color-brand-black)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11px',
                        fontWeight: '600',
                        letterSpacing: '0.08em',
                        cursor: isSoldOut ? 'not-allowed' : 'pointer',
                        textDecoration: isSoldOut ? 'line-through' : 'none',
                        transition: 'all 0.2s',
                      }}
                    >
                      {v.size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add to Bag */}
          <button
            className="btn-primary"
            onClick={handleAddToCart}
            disabled={!canAdd}
            style={{ marginBottom: '16px' }}
          >
            {addedMsg ? '✓ Added to Bag' : 'Add to Bag'}
          </button>

          {hasVariants && !selectedVariant && (
            <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--color-brand-mid)' }}>
              Please select a size
            </p>
          )}

          {/* Info Accordion */}
          <div style={{ borderTop: '1px solid var(--color-brand-border)', marginTop: '36px' }}>
            {Object.entries(ACCORDION_CONTENT).map(([title, content]) => {
              const isOpen = openSection === title;
              return (
                <div key={title} style={{ borderBottom: '1px solid var(--color-brand-border)' }}>
                  <div
                    onClick={() => setOpenSection(isOpen ? null : title)}
                    style={{
                      padding: '18px 0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <span className="label" style={{ color: 'var(--color-brand-black)' }}>{title}</span>
                    <span style={{
                      fontSize: '18px', color: 'var(--color-brand-mid)', fontWeight: '300',
                      transition: 'transform 0.3s',
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                    }}>+</span>
                  </div>
                  {isOpen && (
                    <div style={{
                      paddingBottom: '18px',
                      fontSize: '12px',
                      lineHeight: '1.8',
                      color: 'var(--color-brand-mid)',
                      animation: 'fade-up 0.3s ease both',
                    }}>
                      {content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          className="animate-fade-in"
        >
          <div onClick={() => setShowSizeGuide(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(8,8,8,0.35)', backdropFilter: 'blur(4px)' }} />
          <div style={{
            position: 'relative', background: 'var(--color-brand-white)',
            padding: '36px', maxWidth: '500px', width: '90%',
            boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span className="label" style={{ color: 'var(--color-brand-black)' }}>Size Guide</span>
              <button onClick={() => setShowSizeGuide(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px',
                color: 'var(--color-brand-mid)', fontWeight: '300', lineHeight: 1,
              }}>×</button>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--color-brand-mid)', marginBottom: '16px' }}>All measurements in centimeters (cm)</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-brand-border)' }}>
                  {['Size', 'Chest', 'Waist', 'Hips'].map(h => (
                    <th key={h} className="label" style={{ padding: '10px 8px', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SIZE_GUIDE.map(row => (
                  <tr key={row.size} style={{ borderBottom: '1px solid var(--color-brand-border)' }}>
                    <td style={{ padding: '10px 8px', fontWeight: '600' }}>{row.size}</td>
                    <td style={{ padding: '10px 8px', color: 'var(--color-brand-mid)' }}>{row.chest}</td>
                    <td style={{ padding: '10px 8px', color: 'var(--color-brand-mid)' }}>{row.waist}</td>
                    <td style={{ padding: '10px 8px', color: 'var(--color-brand-mid)' }}>{row.hips}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

