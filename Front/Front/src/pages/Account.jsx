import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../lib/axios';

const STATUS_COLORS = {
  pending:    { bg: '#fef9c3', text: '#713f12' },
  processing: { bg: '#dbeafe', text: '#1e3a8a' },
  shipped:    { bg: '#ede9fe', text: '#4c1d95' },
  delivered:  { bg: '#dcfce7', text: '#14532d' },
  cancelled:  { bg: '#fee2e2', text: '#7f1d1d' },
};

export default function Account() {
  // PrivateRoute already handles auth redirect — no guard needed here
  const { user, logout, fetchUser } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  // Fetch user profile if not already loaded (runs once)
  useEffect(() => {
    if (!user) fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch orders (runs once on mount)
  useEffect(() => {
    api.get('/orders')
      .then(({ data }) => setOrders(data))
      .catch(() => setOrdersError('Unable to load orders. Please try again.'))
      .finally(() => setLoadingOrders(false));
  }, []);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 32px 80px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        borderBottom: '1px solid var(--color-brand-border)', paddingBottom: '24px', marginBottom: '48px',
      }}>
        <div>
          <p className="label" style={{ marginBottom: '8px' }}>My Account</p>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '30px',
            fontWeight: '300',
            letterSpacing: '0.05em',
          }}>
            {user?.name || 'Welcome back'}
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--color-brand-mid)', marginTop: '4px' }}>{user?.email}</p>
        </div>
        <button
          className="btn-ghost"
          onClick={() => { logout(); navigate('/'); }}
        >
          Sign Out
        </button>
      </div>

      {/* Order History */}
      <section>
        <p className="label" style={{ marginBottom: '24px', color: 'var(--color-brand-black)' }}>Order History</p>

        {loadingOrders ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1,2].map(i => (
              <div key={i} style={{ height: '96px', background: 'var(--color-brand-off)', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : ordersError ? (
          <div style={{
            padding: '32px',
            textAlign: 'center',
            border: '1px solid #fecaca',
            background: '#fef2f2',
            color: '#c0392b',
            fontSize: '13px',
          }}>
            {ordersError}
          </div>
        ) : orders.length === 0 ? (
          <div style={{
            padding: '64px 32px',
            textAlign: 'center',
            border: '1px solid var(--color-brand-border)',
          }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: '300', marginBottom: '16px', color: 'var(--color-brand-mid)' }}>
              No orders yet
            </p>
            <button onClick={() => navigate('/products')} className="btn-ghost">
              Explore Collection
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', border: '1px solid var(--color-brand-border)' }}>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr 140px 100px 100px',
              gap: '16px',
              padding: '12px 20px',
              background: 'var(--color-brand-off)',
            }}>
              {['Order', 'Date', 'Status', 'Total', 'Items'].map(h => (
                <span key={h} className="label">{h}</span>
              ))}
            </div>

            {orders.map((order) => {
              const statusStyle = STATUS_COLORS[order.status] || { bg: '#f3f4f6', text: '#374151' };
              return (
                <div
                  key={order.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr 140px 100px 100px',
                    gap: '16px',
                    padding: '18px 20px',
                    borderTop: '1px solid var(--color-brand-border)',
                    alignItems: 'center',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-brand-off)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-brand-mid)' }}>#{order.id}</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-brand-mid)' }}>
                    {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 10px',
                    background: statusStyle.bg,
                    color: statusStyle.text,
                    fontSize: '10px',
                    fontWeight: '700',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    width: 'fit-content',
                  }}>
                    {order.status}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>${Number(order.total_amount).toFixed(2)}</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-brand-mid)' }}>
                    {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
