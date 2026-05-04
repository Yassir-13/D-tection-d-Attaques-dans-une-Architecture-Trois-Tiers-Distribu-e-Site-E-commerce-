import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, LayoutDashboard } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';

export default function Navbar() {
  const { items, openCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearchClick = () => {
    navigate('/products');
    setTimeout(() => {
      const el = document.querySelector('input[placeholder="Search products..."]');
      if (el) el.focus();
    }, 100);
  };

  const navLinks = [
    { label: 'Women', href: '/products?category=women' },
    { label: 'Men', href: '/products?category=men' },
    { label: 'New Arrivals', href: '/products' },
    { label: 'Accessories', href: '/products?category=accessories' },
  ];

  const isActive = (href) => location.pathname + location.search === href;

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-brand-border)',
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 32px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Left: Logo */}
          <Link to="/" style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '22px',
            fontWeight: '400',
            letterSpacing: '0.25em',
            color: 'var(--color-brand-black)',
            textDecoration: 'none',
            textTransform: 'uppercase',
          }}>
            Luxe
          </Link>

          {/* Center: Nav Links */}
          <nav style={{
            display: 'flex',
            gap: '40px',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
          }} className="hidden md:flex">
            {navLinks.map(({ label, href }) => (
              <Link key={href} to={href} style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: '500',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: isActive(href) ? 'var(--color-brand-black)' : 'var(--color-brand-mid)',
                textDecoration: 'none',
                transition: 'color 0.2s',
                paddingBottom: '2px',
                borderBottom: isActive(href) ? '1px solid var(--color-brand-black)' : '1px solid transparent',
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-brand-black)'}
                onMouseLeave={e => e.currentTarget.style.color = isActive(href) ? 'var(--color-brand-black)' : 'var(--color-brand-mid)'}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right: Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>

            {/* Admin Backoffice link — visible only for admins */}
            {isAdmin && (
              <Link
                to="/admin"
                title="Backoffice"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '10px',
                  fontWeight: '700',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: location.pathname === '/admin' ? 'var(--color-brand-black)' : 'var(--color-brand-mid)',
                  textDecoration: 'none',
                  padding: '4px 10px',
                  border: '1px solid',
                  borderColor: location.pathname === '/admin' ? 'var(--color-brand-black)' : 'var(--color-brand-border)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--color-brand-black)';
                  e.currentTarget.style.borderColor = 'var(--color-brand-black)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = location.pathname === '/admin' ? 'var(--color-brand-black)' : 'var(--color-brand-mid)';
                  e.currentTarget.style.borderColor = location.pathname === '/admin' ? 'var(--color-brand-black)' : 'var(--color-brand-border)';
                }}
              >
                <LayoutDashboard size={13} strokeWidth={1.5} />
                Admin
              </Link>
            )}

            <button onClick={handleSearchClick} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-brand-mid)', padding: 0 }}>
              <Search size={17} strokeWidth={1.5} />
            </button>

            <Link to={isAuthenticated ? '/account' : '/login'} style={{ color: 'var(--color-brand-mid)', display: 'flex' }}>
              <User size={17} strokeWidth={1.5} />
            </Link>

            <button
              onClick={openCart}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-brand-mid)', padding: 0, position: 'relative', display: 'flex' }}
            >
              <ShoppingBag size={17} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-7px',
                  background: 'var(--color-brand-black)',
                  color: 'white',
                  fontSize: '9px',
                  fontWeight: '700',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              className="flex md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-brand-black)', padding: 0 }}
            >
              {menuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={{
            borderTop: '1px solid var(--color-brand-border)',
            padding: '24px 32px',
            background: 'var(--color-brand-white)',
          }} className="flex md:hidden flex-col gap-6">
            {navLinks.map(({ label, href }) => (
              <Link key={href} to={href} onClick={() => setMenuOpen(false)} className="label" style={{
                color: 'var(--color-brand-black)',
                textDecoration: 'none',
              }}>
                {label}
              </Link>
            ))}
            {/* Admin link in mobile menu */}
            {isAdmin && (
              <Link to="/admin" onClick={() => setMenuOpen(false)} className="label" style={{
                color: 'var(--color-brand-black)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <LayoutDashboard size={13} strokeWidth={1.5} />
                Backoffice
              </Link>
            )}
          </div>
        )}
      </header>
    </>
  );
}
