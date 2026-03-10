import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy — Drapit',
    description: 'Privacy Policy for Drapit Virtual Try-On. Learn how we collect, use, and protect your data.',
};

export default function PrivacyPolicyPage() {
    const lastUpdated = 'March 10, 2026';

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#080C14',
            color: '#F1F5F9',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
        }}>
            {/* Nav bar placeholder — inherits from layout */}

            <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 24px 120px' }}>

                {/* Header */}
                <div style={{ marginBottom: 48 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#95BF47', marginBottom: 12 }}>
                        Legal
                    </p>
                    <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.025em', marginBottom: 16 }}>
                        Privacy Policy
                    </h1>
                    <p style={{ fontSize: 15, color: 'rgba(241,245,249,0.5)', lineHeight: 1.6 }}>
                        Last updated: {lastUpdated}
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

                    {/* Intro */}
                    <Section>
                        <P>
                            Drapit (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the virtual try-on platform available at{' '}
                            <A href="https://drapit.io">drapit.io</A> and as a Shopify app. This Privacy Policy explains what data we collect,
                            how we use it, and your rights under applicable privacy laws including the GDPR (EU) and AVG (Netherlands).
                        </P>
                        <P>
                            By using Drapit, you agree to the collection and use of information as described in this policy.
                        </P>
                    </Section>

                    {/* 1. Who we are */}
                    <Section title="1. Who We Are">
                        <P>
                            Drapit is operated as a sole proprietorship by Michael Maessen, based in the Netherlands.
                            Contact: <A href="mailto:info@drapit.io">info@drapit.io</A>.
                        </P>
                        <P>
                            For the purposes of GDPR, Drapit acts as a <strong>data processor</strong> on behalf of merchants (data controllers)
                            who use our platform to provide virtual try-on functionality to their shoppers.
                        </P>
                    </Section>

                    {/* 2. Data we collect */}
                    <Section title="2. Data We Collect">
                        <SubTitle>2.1 Merchant data (Shopify store owners)</SubTitle>
                        <P>When you install Drapit via Shopify or sign up on drapit.io, we collect:</P>
                        <List items={[
                            'Shop domain and store name',
                            'Contact email address',
                            'Shopify access token (stored encrypted, used to communicate with your store)',
                            'Billing information (processed by Shopify Billing or Stripe — we do not store card details)',
                            'Usage data: number of try-ons per month, API key activity',
                        ]} />

                        <SubTitle>2.2 Shopper data (end customers using the try-on widget)</SubTitle>
                        <P>When a shopper uses the virtual try-on widget in a merchant&apos;s store:</P>
                        <List items={[
                            'The photo uploaded by the shopper is sent to our AI processing service (Replicate)',
                            'The garment/product image from the store',
                            'The generated try-on result image',
                        ]} />
                        <P>
                            <strong>We do not store shopper photos or results beyond what is needed for processing.</strong>{' '}
                            Images are retained only as long as necessary to deliver the result to the shopper,
                            and are not linked to any personal identity, account, or persistent identifier.
                        </P>

                        <SubTitle>2.3 Technical data</SubTitle>
                        <List items={[
                            'Server logs (IP addresses, request timestamps) retained for up to 30 days for security purposes',
                            'Cookies strictly necessary for authentication (no tracking or advertising cookies)',
                        ]} />
                    </Section>

                    {/* 3. How we use data */}
                    <Section title="3. How We Use Your Data">
                        <List items={[
                            'To provide and operate the virtual try-on service',
                            'To manage your account, billing, and subscription',
                            'To send transactional emails (welcome, billing receipts, service updates)',
                            'To improve our AI model quality and service reliability',
                            'To comply with legal obligations (including GDPR)',
                        ]} />
                        <P>We do not sell, rent, or share your personal data with third parties for marketing purposes.</P>
                    </Section>

                    {/* 4. Third parties */}
                    <Section title="4. Third-Party Services">
                        <P>We use the following sub-processors to deliver our service:</P>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginTop: 8 }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    {['Service', 'Purpose', 'Location'].map(h => (
                                        <th key={h} style={{ textAlign: 'left', padding: '8px 12px 12px 0', fontWeight: 600, color: 'rgba(241,245,249,0.6)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ['Supabase', 'Database & file storage', 'EU (Frankfurt)'],
                                    ['Replicate', 'AI image processing (VTON)', 'USA'],
                                    ['Stripe', 'Payment processing (direct signups)', 'USA / EU'],
                                    ['Shopify', 'Billing for App Store installs', 'Canada / Global'],
                                    ['Resend', 'Transactional email delivery', 'USA'],
                                ].map(([service, purpose, location]) => (
                                    <tr key={service} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        <td style={{ padding: '12px 12px 12px 0', fontWeight: 600 }}>{service}</td>
                                        <td style={{ padding: '12px 12px 12px 0', color: 'rgba(241,245,249,0.65)' }}>{purpose}</td>
                                        <td style={{ padding: '12px 0', color: 'rgba(241,245,249,0.65)' }}>{location}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <P style={{ marginTop: 16 }}>
                            When data is transferred to processors outside the EU (e.g. Replicate, Stripe), we rely on
                            Standard Contractual Clauses (SCCs) or equivalent safeguards as required by GDPR.
                        </P>
                    </Section>

                    {/* 5. Data retention */}
                    <Section title="5. Data Retention">
                        <List items={[
                            'Merchant account data: retained as long as your account is active, then deleted within 30 days of account closure',
                            'Shopper images: deleted immediately after the try-on result is returned (not persisted)',
                            'Try-on metadata (anonymized counts): retained for analytics purposes for up to 12 months',
                            'Billing records: retained for 7 years as required by Dutch tax law',
                            'Server logs: deleted after 30 days',
                        ]} />
                    </Section>

                    {/* 6. Your rights */}
                    <Section title="6. Your Rights (GDPR)">
                        <P>If you are in the EU/EEA, you have the following rights regarding your personal data:</P>
                        <List items={[
                            'Right of access — request a copy of the data we hold about you',
                            'Right to rectification — correct inaccurate data',
                            'Right to erasure ("right to be forgotten") — request deletion of your data',
                            'Right to restriction — limit how we process your data',
                            'Right to data portability — receive your data in a machine-readable format',
                            'Right to object — object to processing based on legitimate interests',
                        ]} />
                        <P>
                            To exercise any of these rights, contact us at{' '}
                            <A href="mailto:info@drapit.io">info@drapit.io</A>.
                            We will respond within 30 days.
                        </P>
                        <P>
                            You also have the right to lodge a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens)
                            at <A href="https://www.autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer">autoriteitpersoonsgegevens.nl</A>.
                        </P>
                    </Section>

                    {/* 7. Shopify merchants */}
                    <Section title="7. Shopify Merchants — GDPR Compliance">
                        <P>
                            As a Shopify app, Drapit complies with Shopify&apos;s GDPR webhook requirements. When Shopify notifies us of
                            a customer data request or erasure request from one of your shoppers, we process those requests automatically
                            and delete associated data within 48 hours.
                        </P>
                        <P>
                            When you uninstall Drapit from your Shopify store, your access token is immediately invalidated and your
                            shop data is queued for full deletion within 48 hours, in accordance with Shopify&apos;s data deletion requirements.
                        </P>
                    </Section>

                    {/* 8. Cookies */}
                    <Section title="8. Cookies">
                        <P>
                            Drapit uses only strictly necessary cookies for authentication (session management). We do not use
                            advertising cookies, tracking pixels, or third-party analytics cookies.
                        </P>
                        <P>
                            The Shopify embedded app uses Shopify&apos;s App Bridge, which may set cookies required for the embedded
                            iframe authentication flow. These are functional cookies and cannot be disabled without breaking the app.
                        </P>
                    </Section>

                    {/* 9. Security */}
                    <Section title="9. Security">
                        <P>
                            We implement industry-standard security measures including HTTPS-only communication, encrypted storage of
                            access tokens, HMAC verification on all Shopify webhooks, and row-level security on our database.
                        </P>
                        <P>
                            In the event of a data breach that poses a risk to your rights and freedoms, we will notify you and
                            the relevant supervisory authority within 72 hours as required by GDPR Article 33.
                        </P>
                    </Section>

                    {/* 10. Changes */}
                    <Section title="10. Changes to This Policy">
                        <P>
                            We may update this Privacy Policy from time to time. We will notify merchants of material changes
                            via email or via a notice in the Drapit dashboard. The &quot;Last updated&quot; date at the top of this page
                            always reflects the most recent version.
                        </P>
                    </Section>

                    {/* 11. Contact */}
                    <Section title="11. Contact">
                        <P>Questions about this Privacy Policy? Contact us:</P>
                        <List items={[
                            'Email: info@drapit.io',
                            'Website: drapit.io/contact',
                            'Response time: within 2 business days',
                        ]} />
                    </Section>

                </div>
            </div>
        </div>
    );
}

// ─── Helper components ───────────────────────────────────────────────────────

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
    return (
        <section>
            {title && (
                <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.015em', marginBottom: 16, color: '#F1F5F9' }}>
                    {title}
                </h2>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {children}
            </div>
        </section>
    );
}

function SubTitle({ children }: { children: React.ReactNode }) {
    return (
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'rgba(241,245,249,0.85)', marginTop: 8, marginBottom: 4 }}>
            {children}
        </h3>
    );
}

function P({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <p style={{ fontSize: 15, lineHeight: 1.75, color: 'rgba(241,245,249,0.65)', margin: 0, ...style }}>
            {children}
        </p>
    );
}

function A({ href, children, target, rel }: { href: string; children: React.ReactNode; target?: string; rel?: string }) {
    return (
        <a href={href} target={target} rel={rel} style={{ color: '#95BF47', textDecoration: 'underline', textUnderlineOffset: 3 }}>
            {children}
        </a>
    );
}

function List({ items }: { items: string[] }) {
    return (
        <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((item, i) => (
                <li key={i} style={{ fontSize: 15, lineHeight: 1.65, color: 'rgba(241,245,249,0.65)' }}>
                    {item}
                </li>
            ))}
        </ul>
    );
}
