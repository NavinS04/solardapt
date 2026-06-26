/*
 * Transactional email template. Plain React for portability; wire React Email
 * (@react-email/components) for richer rendering once the package is added.
 */
export function LeadConfirmation({ name }: { name: string }) {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#1B2026', padding: 24 }}>
      <h1 style={{ color: '#F08000' }}>Thanks, {name}.</h1>
      <p>We’ve received your details and will reach out shortly to confirm your free strategy call.</p>
      <p>
        In the meantime, you can reply to this email with any questions.
        <br />— The Solardapt team
      </p>
    </div>
  );
}
