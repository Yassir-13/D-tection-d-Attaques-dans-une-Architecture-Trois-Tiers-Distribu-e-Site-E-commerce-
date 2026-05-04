import { Link } from 'react-router-dom';
import { SpotlightCard } from '../ui/SpotlightCard';

export default function ProductCard({ product }) {
  const imageUrl = product.images?.[0]?.image_url
    || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=85&auto=format&fit=crop';

  return (
    <Link to={`/products/${product.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      <SpotlightCard className="h-full w-full">
        {/* Image Container */}
        <div style={{
          position: 'relative',
          aspectRatio: '2/3',
          overflow: 'hidden',
          background: 'var(--color-brand-off)',
          marginBottom: '16px',
          borderTopLeftRadius: '14px',
          borderTopRightRadius: '14px',
        }}>
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.6s var(--ease-smooth)',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />
        {!product.is_active && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'var(--color-brand-white)',
            padding: '4px 10px',
            fontSize: '9px',
            fontWeight: '600',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}>
            Sold Out
          </div>
        )}
      </div>

      {/* Details */}
      <div>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '12px',
          fontWeight: '400',
          color: 'var(--color-brand-black)',
          marginBottom: '4px',
          letterSpacing: '0.02em',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {product.name}
        </p>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '12px',
          color: 'var(--color-brand-mid)',
        }}>
          ${Number(product.price).toFixed(2)}
        </p>
      </div>
      </SpotlightCard>
    </Link>
  );
}
