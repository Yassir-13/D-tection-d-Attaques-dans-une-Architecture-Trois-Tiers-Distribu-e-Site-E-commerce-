export default function Privacy() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '64px 32px 80px' }}>
      <p className="label" style={{ marginBottom: '12px' }}>Legal</p>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '40px', fontWeight: '300', marginBottom: '40px', letterSpacing: '0.05em' }}>
        Privacy Policy
      </h1>

      <p style={{ fontSize: '11px', color: 'var(--color-brand-mid)', marginBottom: '40px' }}>
        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>

      {[
        {
          title: 'Information We Collect',
          body: 'We collect information you provide directly to us, such as your name, email address, shipping address, and payment details when you create an account or place an order. We also collect usage data automatically through cookies and analytics tools.',
        },
        {
          title: 'How We Use Your Information',
          body: 'We use your information to process orders, communicate with you about your purchases, send promotional communications (with your consent), improve our services, and comply with legal obligations.',
        },
        {
          title: 'Data Sharing',
          body: 'We do not sell your personal data. We share your information only with service providers necessary to fulfill your orders (shipping carriers, payment processors) and as required by law.',
        },
        {
          title: 'Data Retention',
          body: 'We retain your personal data for as long as necessary to provide our services and comply with legal requirements. You may request deletion of your account and associated data at any time.',
        },
        {
          title: 'Your Rights',
          body: 'You have the right to access, correct, or delete your personal data. You may also object to processing or request portability of your data. To exercise these rights, contact us at privacy@luxe.com.',
        },
        {
          title: 'Cookies',
          body: 'We use essential cookies to maintain your session and preferences. We do not use third-party advertising cookies. You may disable cookies in your browser settings, though some features may not function correctly.',
        },
        {
          title: 'Contact Us',
          body: 'For any privacy-related questions, please contact us at privacy@luxe.com or by writing to LUXE, Legal Department, [Address].',
        },
      ].map(({ title, body }) => (
        <section key={title} style={{ marginBottom: '36px' }}>
          <p className="label" style={{ color: 'var(--color-brand-black)', marginBottom: '12px' }}>{title}</p>
          <p style={{ fontSize: '13px', lineHeight: '1.9', color: 'var(--color-brand-mid)' }}>{body}</p>
        </section>
      ))}
    </div>
  );
}
