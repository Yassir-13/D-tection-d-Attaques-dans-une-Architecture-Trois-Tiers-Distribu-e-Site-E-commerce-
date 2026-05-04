import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useNavigate } from 'react-router-dom';

export default function CartSlideover() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getCartTotal } = useCartStore();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200 }} className="animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(8,8,8,0.35)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '440px',
          background: 'var(--color-brand-white)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 48px rgba(0,0,0,0.12)',
        }}
        className="animate-slide-in-right"
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 28px',
          borderBottom: '1px solid var(--color-brand-border)',
        }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: '300', letterSpacing: '0.05em' }}>
            Shopping Bag
            {items.length > 0 && (
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-brand-mid)', marginLeft: '8px', fontWeight: '400' }}>
                ({items.length})
              </span>
            )}
          </span>
          <button onClick={closeCart} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-brand-mid)',
            display: 'flex', padding: '4px', transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-brand-black)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--color-brand-mid)'}
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
          {items.length === 0 ? (
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
              textAlign: 'center',
            }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: '300', color: 'var(--color-brand-mid)' }}>
                Your bag is empty
              </p>
              <button onClick={closeCart} className="btn-ghost">
                Explore Collection
              </button>
            </div>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {items.map((item, index) => {
                const image = item.product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=300&q=80';
                return (
                  <li key={`${item.product.id}-${item.variant?.id || ''}-${index}`} style={{ display: 'flex', gap: '16px' }}>
                    <div style={{
                      width: '88px',
                      aspectRatio: '2/3',
                      background: 'var(--color-brand-off)',
                      flexShrink: 0,
                      overflow: 'hidden',
                    }}>
                      <img src={image} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div>
                          <p style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px', letterSpacing: '0.02em' }}>{item.product.name}</p>
                          {item.variant && (
                            <p style={{ fontSize: '11px', color: 'var(--color-brand-mid)' }}>Size: {item.variant.size}</p>
                          )}
                          <p style={{ fontSize: '12px', color: 'var(--color-brand-mid)', marginTop: '4px' }}>${Number(item.product.price).toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id, item.variant?.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-brand-light)', padding: 0, flexShrink: 0, transition: 'color 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-brand-black)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--color-brand-light)'}
                        >
                          <Trash2 size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                      {/* Quantity */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid var(--color-brand-border)',
                        width: 'fit-content',
                        marginTop: '10px',
                      }}>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.variant?.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          style={{ width: '32px', height: '32px', background: 'none', border: 'none', cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand-mid)', opacity: item.quantity <= 1 ? 0.3 : 1 }}
                        >
                          <Minus size={12} strokeWidth={1.5} />
                        </button>
                        <span style={{ width: '32px', textAlign: 'center', fontSize: '12px', fontWeight: '500' }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.variant?.id, item.quantity + 1)}
                          style={{ width: '32px', height: '32px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand-mid)' }}
                        >
                          <Plus size={12} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{
            borderTop: '1px solid var(--color-brand-border)',
            padding: '24px 28px 32px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-brand-mid)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: '600' }}>Subtotal</span>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>${Number(getCartTotal()).toFixed(2)}</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--color-brand-mid)', marginBottom: '20px', textAlign: 'center' }}>
              Shipping & taxes calculated at checkout
            </p>
            <button
              className="btn-primary"
              onClick={() => { closeCart(); navigate('/checkout'); }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
