import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import api from '../lib/axios';

export default function Checkout() {
  const { items, getCartTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // PrivateRoute handles authentication redirect — no need to duplicate here.
  // Handle edge case: cart emptied while on checkout page
  if (items.length === 0) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
        <p className="label">Your bag is empty</p>
        <button className="btn-ghost" onClick={() => navigate('/products')}>
          Explore Collection
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/orders', {
        shipping_address: address,
        items: items.map(i => ({
          product_id: i.product.id,
          variant_id: i.variant?.id || null,
          quantity: i.quantity,
        })),
      });
      clearCart();
      navigate('/account');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 32px 80px' }}>
      <h1 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '28px',
        fontWeight: '300',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        textAlign: 'center',
        marginBottom: '48px',
      }}>
        Checkout
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '64px', alignItems: 'start' }}
           className="flex flex-col lg:grid">
        {/* Form */}
        <div>
          <p className="label" style={{ marginBottom: '24px', color: 'var(--color-brand-black)' }}>1 — Delivery information</p>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              padding: '12px 16px', fontSize: '12px', color: '#c0392b', marginBottom: '20px',
            }}>
              {error}
            </div>
          )}

          {/* Contact info */}
          <div style={{
            border: '1px solid var(--color-brand-border)',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <p className="label" style={{ marginBottom: '4px' }}>Contact</p>
              <p style={{ fontSize: '13px', color: 'var(--color-brand-black)' }}>{user?.name} — {user?.email}</p>
            </div>
          </div>

          <form id="checkout-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="label" style={{ display: 'block', marginBottom: '8px', color: 'var(--color-brand-black)' }}>
                Shipping Address
              </label>
              <textarea
                required
                rows={4}
                className="input-field"
                placeholder="Street address, city, postal code, country"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ height: 'auto', padding: '14px 16px', resize: 'none', fontFamily: 'var(--font-sans)', fontSize: '13px' }}
              />
            </div>

            <div style={{ marginTop: '24px' }}>
              <p className="label" style={{ marginBottom: '16px', color: 'var(--color-brand-black)' }}>2 — Payment</p>
              <div style={{
                border: '1.5px solid var(--color-brand-black)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'var(--color-brand-off)',
              }}>
                <div style={{
                  width: '16px', height: '16px', borderRadius: '50%',
                  border: '5px solid var(--color-brand-black)',
                  flexShrink: 0,
                }} />
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '500', marginBottom: '2px' }}>Cash on Delivery</p>
                  <p style={{ fontSize: '11px', color: 'var(--color-brand-mid)' }}>Pay when your order arrives</p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div style={{
          border: '1px solid var(--color-brand-border)',
          padding: '28px',
          position: 'sticky',
          top: '80px',
        }}>
          <p className="label" style={{ marginBottom: '24px', color: 'var(--color-brand-black)' }}>Order Summary</p>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
            {items.map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '64px', aspectRatio: '2/3',
                  background: 'var(--color-brand-off)', flexShrink: 0, overflow: 'hidden',
                }}>
                  <img
                    src={item.product.images?.[0]?.image_url || ''}
                    alt={item.product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>{item.product.name}</p>
                  {item.variant && <p style={{ fontSize: '11px', color: 'var(--color-brand-mid)' }}>Size: {item.variant.size}</p>}
                  <p style={{ fontSize: '11px', color: 'var(--color-brand-mid)', marginTop: '2px' }}>Qty: {item.quantity}</p>
                </div>
                <p style={{ fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap' }}>
                  ${(Number(item.product.price) * item.quantity).toFixed(2)}
                </p>
              </li>
            ))}
          </ul>

          <div style={{ borderTop: '1px solid var(--color-brand-border)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-brand-mid)' }}>Subtotal</span>
              <span style={{ fontSize: '12px' }}>${Number(getCartTotal()).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-brand-mid)' }}>Shipping</span>
              <span style={{ fontSize: '12px' }}>Free</span>
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              borderTop: '1px solid var(--color-brand-border)', paddingTop: '16px', marginBottom: '24px',
            }}>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Total</span>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>${Number(getCartTotal()).toFixed(2)}</span>
            </div>

            <button
              type="submit"
              form="checkout-form"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
