export default function Terms() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '64px 32px 80px' }}>
      <p className="label" style={{ marginBottom: '12px' }}>Legal</p>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '40px', fontWeight: '300', marginBottom: '40px', letterSpacing: '0.05em' }}>
        Terms of Use
      </h1>

      <p style={{ fontSize: '11px', color: 'var(--color-brand-mid)', marginBottom: '40px' }}>
        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>

      {[
        {
          title: '1. Acceptance of Terms',
          body: 'By accessing or using the LUXE website, you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree, please do not use our services.',
        },
        {
          title: '2. Use of the Site',
          body: 'You may use this site for lawful purposes only. You agree not to engage in any activity that interferes with or disrupts our services, servers, or networks. Unauthorized use of this site may give rise to a claim for damages.',
        },
        {
          title: '3. Products & Pricing',
          body: 'We reserve the right to modify product descriptions, images, and prices at any time without notice. All prices are listed in USD and are exclusive of taxes and shipping unless otherwise stated.',
        },
        {
          title: '4. Orders & Payment',
          body: 'All orders are subject to acceptance and availability. We reserve the right to refuse any order. Payment must be completed at the time of purchase. We accept major credit cards and other payment methods as displayed at checkout.',
        },
        {
          title: '5. Returns & Refunds',
          body: 'Items may be returned within 30 days of delivery in their original, unworn condition with all tags attached. Sale items are final sale. Refunds will be processed to the original payment method within 7–10 business days.',
        },
        {
          title: '6. Intellectual Property',
          body: 'All content on this site, including text, images, logos, and design, is the property of LUXE and is protected by copyright and trademark laws. You may not reproduce, distribute, or create derivative works without our prior written consent.',
        },
        {
          title: '7. Limitation of Liability',
          body: 'LUXE shall not be liable for any indirect, incidental, or consequential damages arising from your use of this site or products purchased through it, to the maximum extent permitted by applicable law.',
        },
        {
          title: '8. Changes to Terms',
          body: 'We reserve the right to update these terms at any time. Continued use of the site after changes constitutes acceptance of the new terms. We encourage you to review this page periodically.',
        },
        {
          title: '9. Contact',
          body: 'For questions about these Terms, contact us at legal@luxe.com.',
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
