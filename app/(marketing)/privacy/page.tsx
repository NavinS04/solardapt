import type { Metadata } from 'next';
import { LegalPage } from '@/components/ui/LegalPage';
import { site } from '@/lib/site';

export const metadata: Metadata = { title: 'Privacy Notice' };

const PROCESSORS = [
  ['Microsoft (Microsoft 365, Outlook)', 'Email, documents, records'],
  ['Google (Google Drive)', 'File storage'],
  ['Vercel and Cloudflare', 'Website hosting, domain and security'],
  ['Cal.com', 'Call and survey booking'],
  ['Make.com', 'Moving data between our systems (automation), including enquiries sent from this website'],
  ['Twilio', 'Text messages'],
  ['Brevo', 'Transactional email'],
];

export default function Privacy() {
  const { legal } = site;
  return (
    <LegalPage title="Privacy Notice" updated="27 October 2026">
      <h2>Who we are</h2>
      <p>
        {legal.name ? (
          <>
            {site.name} is a trading name of {legal.name}
            {legal.companyNumber && `, a company registered in ${legal.registeredIn} (number ${legal.companyNumber})`}
            {legal.address && `, registered office ${legal.address}`}.
          </>
        ) : (
          <>{site.name} is run by {site.founder}.</>
        )}{' '}
        We help established UK solar installers turn enquiries into booked home surveys. For anything
        in this notice, email <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
      {legal.icoNumber && <p>ICO registration number: {legal.icoNumber}.</p>}

      <h2>What we collect and why</h2>
      <table>
        <thead>
          <tr>
            <th>Whose data</th>
            <th>What</th>
            <th>Why, and our lawful basis</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>People who contact us or book a call</td>
            <td>Name, business, email, phone, what you tell us</td>
            <td>To reply, hold the call and follow up as you asked. Legitimate interests, or steps before a contract.</td>
          </tr>
          <tr>
            <td>Business contacts at UK solar installers we research</td>
            <td>Name, job role, business email and phone, company details, notes about the business</td>
            <td>
              To contact businesses that may benefit from our service. Legitimate interests (business-to-business
              marketing). Phone numbers are screened against the TPS and CTPS before any call. Email marketing goes
              only to corporate subscribers, as UK law allows.
            </td>
          </tr>
          <tr>
            <td>Our clients and their staff</td>
            <td>Contact and billing details, account access we’re given</td>
            <td>To deliver and bill our service. Contract.</td>
          </tr>
          <tr>
            <td>Homeowners who enquire with one of our installer clients</td>
            <td>What the homeowner enters in the installer’s enquiry form, booking details, messages</td>
            <td>
              We process this <strong>on behalf of the installer</strong>, under a written data processing agreement.
              The installer is the controller, and its own privacy notice applies.
            </td>
          </tr>
          <tr>
            <td>Visitors to this website</td>
            <td>Standard server logs (IP address, browser, pages requested)</td>
            <td>
              To run and secure the site. Legitimate interests. We do not use analytics or advertising cookies; see
              our <a href="/cookies">cookie notice</a>.
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Where business contact details come from</h2>
      <p>
        Public business sources: companies’ own websites, Companies House and the MCS installer register. We record
        the source and the date for every contact.
      </p>

      <h2>Who we share it with</h2>
      <p>We don’t sell personal data. We use these service providers to run the business, each under their own data protection terms:</p>
      <table>
        <thead>
          <tr>
            <th>Provider</th>
            <th>Used for</th>
          </tr>
        </thead>
        <tbody>
          {PROCESSORS.map(([who, what]) => (
            <tr key={who}>
              <td>{who}</td>
              <td>{what}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Some of these providers process data outside the UK, including in the USA and the EU. Where they do, we rely
        on the safeguards UK law requires, such as UK adequacy regulations, the UK Extension to the EU-US Data Privacy
        Framework, or the UK International Data Transfer Addendum.
      </p>

      <h2>How long we keep it</h2>
      <ul>
        <li>Business contacts we’ve researched but who haven’t engaged: reviewed at 90 days and deleted if no longer needed.</li>
        <li>If you ask us not to contact you, we keep a minimal record (name, business, contact detail and date) only so we never contact you again.</li>
        <li>Client records: for the contract, then as long as tax and accounting law requires.</li>
        <li>Homeowner enquiry data: as the installer instructs in our data processing agreement, then deleted or returned.</li>
      </ul>

      <h2>Your rights</h2>
      <p>
        You can ask to see, correct or delete your data, object to how we use it, or ask us to restrict it.{' '}
        <strong>You can object to direct marketing at any time, and we will stop immediately</strong>. Reply “stop” to
        any message or email us. We’ll respond within one month.
      </p>
      <p>
        If you’re unhappy with how we’ve handled your data, please tell us first. You can also complain to the
        Information Commissioner’s Office at{' '}
        <a href="https://ico.org.uk/make-a-complaint/" rel="noopener noreferrer">
          ico.org.uk
        </a>{' '}
        or on 0303 123 1113.
      </p>
    </LegalPage>
  );
}
