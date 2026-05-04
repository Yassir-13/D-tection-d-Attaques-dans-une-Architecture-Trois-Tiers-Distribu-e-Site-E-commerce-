import React from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, useReducedMotion } from 'motion/react';

const FacebookIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);
const InstagramIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
);
const YoutubeIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg>
);

const footerLinks = [
  {
    label: 'Shop',
    links: [
      { title: 'Women', href: '/products?category=women' },
      { title: 'Men', href: '/products?category=men' },
      { title: 'Accessories', href: '/products?category=accessories' },
      { title: 'New Arrivals', href: '/products' },
    ],
  },
  {
    label: 'Account',
    links: [
      { title: 'My Account', href: '/account' },
      { title: 'Login', href: '/login' },
      { title: 'Register', href: '/register' },
    ],
  },
  {
    label: 'Social',
    links: [
      { title: 'Facebook', href: 'https://facebook.com', icon: FacebookIcon, external: true },
      { title: 'Instagram', href: 'https://instagram.com', icon: InstagramIcon, external: true },
      { title: 'Youtube', href: 'https://youtube.com', icon: YoutubeIcon, external: true },
    ],
  },
];

function AnimatedContainer({ className, delay = 0.1, children, style }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className} style={style}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--color-brand-border)',
      marginTop: 'auto',
      padding: '48px 32px',
      position: 'relative',
      overflow: 'hidden',
      background: 'radial-gradient(35% 128px at 50% 0%, rgba(0,0,0,0.03), transparent)'
    }}>
      {/* Subtle top glow line */}
      <div style={{
        backgroundColor: 'var(--color-brand-black)',
        opacity: 0.1,
        position: 'absolute',
        top: 0,
        left: '50%',
        height: '1px',
        width: '33%',
        transform: 'translateX(-50%) translateY(-50%)',
        borderRadius: '9999px',
        filter: 'blur(1px)'
      }} />

      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '40px',
      }}>
        {/* Brand */}
        <AnimatedContainer>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '20px',
            fontWeight: '400',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: '16px',
            color: 'var(--color-brand-black)'
          }}>
            Luxe
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-brand-mid)', lineHeight: '1.8', maxWidth: '240px' }}>
            Premium fashion curated for the modern wardrobe. Timeless design, exceptional quality.
          </p>
        </AnimatedContainer>

        {/* Mapped Link Sections */}
        {footerLinks.map((section, index) => (
          <AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
            <p style={{ marginBottom: '16px', color: 'var(--color-brand-black)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {section.label}
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', padding: 0, margin: 0 }}>
              {section.links.map((link) => {
                const isInternal = link.href.startsWith('/');
                const linkStyle = { fontSize: '12px', color: 'var(--color-brand-mid)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' };
                return (
                  <li key={link.title}>
                    {isInternal ? (
                      <Link
                        to={link.href}
                        style={linkStyle}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--color-brand-black)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--color-brand-mid)'}
                      >
                        {link.icon && <link.icon style={{ marginRight: '8px', width: '15px', height: '15px' }} strokeWidth={1.5} />}
                        {link.title}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        style={linkStyle}
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noopener noreferrer' : undefined}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--color-brand-black)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--color-brand-mid)'}
                      >
                        {link.icon && <link.icon style={{ marginRight: '8px', width: '15px', height: '15px' }} strokeWidth={1.5} />}
                        {link.title}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </AnimatedContainer>
        ))}
      </div>

      <div style={{
        maxWidth: '1440px',
        margin: '40px auto 0',
        paddingTop: '24px',
        borderTop: '1px solid var(--color-brand-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <p style={{ fontSize: '11px', color: 'var(--color-brand-mid)' }}>
          © {new Date().getFullYear()} LUXE. All rights reserved.
        </p>
        <p style={{ fontSize: '11px', color: 'var(--color-brand-mid)', display: 'flex', gap: '16px' }}>
          <Link to="/privacy" style={{ color: 'var(--color-brand-mid)', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-brand-black)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-brand-mid)'}
          >Privacy Policy</Link>
          <span>·</span>
          <Link to="/terms" style={{ color: 'var(--color-brand-mid)', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-brand-black)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-brand-mid)'}
          >Terms of Use</Link>
        </p>
      </div>
    </footer>
  );
}
