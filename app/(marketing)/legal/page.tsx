import type { Metadata } from 'next';
import { LegalPage } from '@/components/ui/LegalPage';
import { site } from '@/lib/site';

export const metadata: Metadata = { title: 'Company Details' };

export default function Legal() {
  const { legal } = site;
  const rows = [
    ['Trading name', site.name],
    ['Legal name', legal.name],
    ['Company number', legal.companyNumber],
    ['Registered in', legal.companyNumber ? legal.registeredIn : ''],
    ['Registered office', legal.address],
    ['ICO registration', legal.icoNumber],
    ['Email', site.email],
    ['Phone', site.phone],
  ].filter(([, value]) => value);

  return (
    <LegalPage title="Company Details" updated="27 October 2026">
      <table>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <th>{label}</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        We serve solar installers in the United Kingdom only. See our <a href="/privacy">privacy notice</a> for how we
        handle personal data.
      </p>
    </LegalPage>
  );
}
