import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import CartSlideover from './components/Cart/CartSlideover';
import PrivateRoute from './components/Auth/PrivateRoute';
import { EtheralShadow } from './components/ui/EtheralShadow';

// Lazy-loaded pages for performance
const Catalog = lazy(() => import('./pages/Catalog'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Account = lazy(() => import('./pages/Account'));
const Admin = lazy(() => import('./pages/Admin'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));

function PageLoader() {
  return (
    <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p className="label">Loading...</p>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
      <p className="label">404 — Page not found</p>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '64px', fontWeight: '300', color: 'var(--color-brand-black)' }}>Not Found</h1>
      <a href="/" style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: '600', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-brand-mid)', textDecoration: 'underline' }}>
        Return to Collection
      </a>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div style={{
        minHeight: '100svh',
        background: 'var(--color-brand-white)',
        color: 'var(--color-brand-black)',
        position: 'relative',
        zIndex: 0,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-sans)',
      }}>
        <EtheralShadow
          style={{ position: 'fixed', width: '100vw', height: '100vh' }}
          color="rgba(0, 0, 0, 0.15)"    /* <-- Modifie le 0.15 pour rendre l'ombre plus claire/foncée */
          noise={{ opacity: 0.05, scale: 1.2 }} /* <-- Modifie le 0.05 pour plus ou moins d'effet 'télévision' */
          sizing="stretch"
        />
        <Navbar />
        <CartSlideover />

        <main style={{ flex: 1, width: '100%' }}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Catalog />} />
              <Route path="/products" element={<Catalog />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes — auth required */}
              <Route path="/checkout" element={
                <PrivateRoute>
                  <Checkout />
                </PrivateRoute>
              } />
              <Route path="/account" element={
                <PrivateRoute>
                  <Account />
                </PrivateRoute>
              } />

              {/* Admin Routes — admin role required */}
              <Route path="/admin" element={
                <PrivateRoute requiredRole="admin">
                  <Admin />
                </PrivateRoute>
              } />

              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
