import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Download } from 'lucide-react'
import { formatMoney, westinProposal } from '@/lib/proposals/westinLaPalomaLaborDay'
import PackageRequestLink from './PackageRequestLink'
import ProposalRequestForm from './ProposalRequestForm'

export const metadata: Metadata = {
  title: 'Labor Day at Westin La Paloma | Blue Luna Events',
  robots: { index: false, follow: false },
}

export default function WestinProposalPage() {
  return (
    <main className="westin-proposal">
      <section className="proposal-hero">
        <div className="proposal-shell">
          <div className="proposal-client-mark">
            <span>Prepared for</span>
            <Image src="/images/westin-la-paloma-dove-wordmark.png" alt="The Westin" width={150} height={110} priority />
          </div>

          <p className="proposal-kicker">{westinProposal.kicker}</p>
          <div className="hero-grid">
            <div>
              <h1>{westinProposal.title}</h1>
              <p className="proposal-intro">{westinProposal.intro}</p>
            </div>
            <div className="pricing-note">
              <p>{westinProposal.pricingNote}</p>
              <a href={westinProposal.pdfPath} download>
                <Download size={16} />
                Download PDF
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="packages-section">
        <div className="proposal-shell">
          <div className="section-heading">
            <p>Package Options</p>
            <h2 className="package-heading">
              <span>Choose the level of</span>
              <span>resort presence.</span>
            </h2>
          </div>

          <div className="package-grid">
            {westinProposal.packages.map(pkg => (
              <article key={pkg.id} className={pkg.badge === 'Recommended' ? 'package-card featured' : 'package-card'}>
                <div className="package-top">
                  <div>
                    {pkg.badge && <span>{pkg.badge}</span>}
                    <h3>{pkg.name}</h3>
                  </div>
                  <div className="price-block">
                    <p>Westin Partner Price</p>
                    <strong>{formatMoney(pkg.partnerPrice)}</strong>
                    <em>Standard Price {formatMoney(pkg.standardPrice)}</em>
                  </div>
                </div>
                <div className="include-list">
                  {pkg.includes.map(item => (
                    <div key={`${pkg.id}-${item.title}`}>
                      <strong>{item.title}</strong>
                      {item.detail && <p>{item.detail}</p>}
                    </div>
                  ))}
                </div>
                <PackageRequestLink packageId={pkg.id} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="unit-section">
        <div className="proposal-shell unit-grid">
          <div>
            <p className="proposal-kicker">A La Carte Customization</p>
            <h2>Unit pricing keeps the package easy to adjust.</h2>
            <p className="muted-copy">
              Items can be added or removed by zone while keeping the same Standard Price and Westin Partner Price structure.
            </p>
          </div>
          <div className="unit-table" aria-label="A la carte unit pricing">
            <div className="unit-head">
              <span>Item</span>
              <span>Standard Price</span>
              <span>Westin Partner Price</span>
            </div>
            {westinProposal.unitPricing.map(item => (
              <div key={item.item} className="unit-row">
                <span>{item.item}</span>
                <span>{item.standard}</span>
                <span>{item.partner}</span>
              </div>
            ))}
          </div>
          <div className="unit-cards" aria-label="A la carte unit pricing">
            {westinProposal.unitPricing.map(item => (
              <article key={item.item} className="unit-card">
                <h3>{item.item}</h3>
                <div>
                  <span>Standard Price</span>
                  <strong>{item.standard}</strong>
                </div>
                <div>
                  <span>Westin Partner Price</span>
                  <strong>{item.partner}</strong>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="notes-section">
        <div className="proposal-shell">
          <p className="proposal-kicker">Design + Weather Notes</p>
          <div className="notes-card">
            {westinProposal.notes.map(note => (
              <p key={note}>{note}</p>
            ))}
            <Link href="/terms/balloon-decor">View full balloon decor terms</Link>
          </div>
        </div>
      </section>

      <ProposalRequestForm />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .westin-proposal {
          background: #fdfcfa;
          color: #0d0f0f;
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .proposal-shell {
          width: min(1180px, calc(100% - 48px));
          margin: 0 auto;
        }
        .proposal-hero {
          padding: 42px 0 72px;
          border-top: 3px solid #5bbfbf;
        }
        .proposal-client-mark {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: flex-end;
          gap: 8px;
          margin-bottom: clamp(46px, 7vw, 82px);
        }
        .proposal-client-mark span {
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-size: 0.68rem;
          font-weight: 900;
        }
        .proposal-client-mark img {
          width: auto;
          height: 108px;
          object-fit: contain;
        }
        .proposal-kicker {
          margin: 0 0 14px;
          color: #5bbfbf;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-size: 0.72rem;
          font-weight: 900;
        }
        .hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.75fr);
          gap: 52px;
          align-items: end;
        }
        h1, h2 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          letter-spacing: 0;
        }
        h1 {
          font-size: clamp(3.8rem, 9vw, 7rem);
          line-height: 0.9;
          margin: 0 0 24px;
          max-width: 900px;
        }
        h2 {
          font-size: clamp(2.3rem, 5vw, 4.4rem);
          line-height: 0.95;
          margin: 0;
        }
        .proposal-intro,
        .muted-copy,
        .pricing-note p,
        .notes-card p {
          color: #667085;
          font-size: 1.02rem;
          line-height: 1.75;
        }
        .pricing-note {
          border-left: 2px solid #5bbfbf;
          padding-left: 24px;
        }
        .pricing-note p {
          margin: 0 0 20px;
        }
        .pricing-note a,
        .select-link,
        .notes-card a {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #0d0f0f;
          font-weight: 800;
          text-decoration: none;
        }
        .pricing-note a {
          background: #5bbfbf;
          border-radius: 999px;
          padding: 13px 18px;
        }
        .packages-section,
        .unit-section,
        .notes-section {
          padding: 72px 0;
        }
        .packages-section {
          background: white;
          border-top: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
        }
        .section-heading {
          display: grid;
          grid-template-columns: 220px minmax(0, 1fr);
          gap: 36px;
          align-items: end;
          margin-bottom: 32px;
        }
        .section-heading p {
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-size: 0.72rem;
          font-weight: 900;
          margin: 0 0 8px;
        }
        .package-grid {
          display: grid;
          gap: 18px;
        }
        .package-card {
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          padding: clamp(22px, 4vw, 34px);
          background: #fff;
        }
        .package-card.featured {
          background: #eaf8f8;
          border-color: #5bbfbf;
        }
        .package-top {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 24px;
          align-items: start;
          margin-bottom: 22px;
        }
        .package-card h3 {
          font-size: clamp(1.25rem, 3vw, 1.8rem);
          line-height: 1.1;
          margin: 0;
        }
        .package-card span {
          color: #1b6868;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-size: 0.68rem;
          font-weight: 900;
          display: inline-block;
          margin-bottom: 8px;
        }
        .price-block {
          text-align: right;
          min-width: 180px;
        }
        .price-block p {
          color: #667085;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 0.66rem;
          font-weight: 900;
          margin: 0 0 4px;
        }
        .price-block strong {
          display: block;
          font-size: clamp(1.5rem, 4vw, 2.2rem);
          line-height: 1;
        }
        .price-block em {
          display: block;
          margin-top: 6px;
          color: #667085;
          font-size: 0.82rem;
          font-style: normal;
        }
        .include-list {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 22px;
        }
        .include-list strong {
          display: block;
          font-size: 0.94rem;
          margin-bottom: 4px;
        }
        .include-list p {
          color: #667085;
          line-height: 1.45;
          margin: 0;
          font-size: 0.88rem;
        }
        .select-link {
          color: #3a8f8f;
          border: 1px solid rgba(91,191,191,0.45);
          border-radius: 999px;
          background: #f4fbfb;
          padding: 10px 14px;
          width: fit-content;
          cursor: pointer;
          font: inherit;
          font-size: 0.86rem;
        }
        .unit-grid {
          display: grid;
          grid-template-columns: minmax(280px, 0.7fr) minmax(0, 1.3fr);
          gap: 56px;
          align-items: start;
        }
        .unit-table {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          overflow: hidden;
        }
        .unit-cards {
          display: none;
        }
        .unit-head,
        .unit-row {
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(120px, 0.7fr) minmax(150px, 0.8fr);
          gap: 18px;
          align-items: center;
          padding: 16px 20px;
        }
        .unit-head {
          background: #0d0f0f;
          color: white;
          font-weight: 900;
          font-size: 0.82rem;
        }
        .unit-row {
          border-top: 1px solid #e5e7eb;
          font-size: 0.92rem;
        }
        .unit-row span:nth-child(2),
        .unit-row span:nth-child(3) {
          text-align: right;
        }
        .unit-row span:nth-child(2) {
          color: #8a94a3;
          font-weight: 600;
        }
        .unit-row span:nth-child(3) {
          color: #0d0f0f;
          font-weight: 900;
        }
        .notes-section {
          background: white;
        }
        .notes-card {
          max-width: 860px;
          border-left: 2px solid #5bbfbf;
          padding-left: 24px;
        }
        .notes-card p {
          margin: 0 0 10px;
        }
        .notes-card a {
          color: #3a8f8f;
          margin-top: 4px;
        }
        @media (max-width: 820px) {
          .proposal-shell {
            width: min(100% - 32px, 600px);
          }
          .proposal-hero,
          .packages-section,
          .unit-section,
          .notes-section {
            padding: 42px 0;
          }
          .proposal-hero {
            padding-top: 78px;
          }
          .proposal-client-mark {
            justify-content: flex-start;
            align-items: flex-start;
            gap: 6px;
            margin-bottom: 38px;
          }
          .proposal-client-mark img {
            height: 92px;
          }
          .package-heading {
            font-size: clamp(2.35rem, 10.2vw, 3.15rem);
            max-width: 360px;
          }
          .package-heading span {
            display: block;
          }
          .hero-grid,
          .section-heading,
          .unit-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .pricing-note {
            border-left: 0;
            border-top: 2px solid #5bbfbf;
            padding: 20px 0 0;
          }
          .package-top,
          .include-list {
            grid-template-columns: 1fr;
          }
          .price-block {
            text-align: left;
          }
          .unit-table {
            display: none;
          }
          .unit-cards {
            display: grid;
            gap: 12px;
          }
          .unit-card {
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 18px;
            padding: 18px;
          }
          .unit-card h3 {
            font-size: 1rem;
            line-height: 1.25;
            margin: 0 0 16px;
          }
          .unit-card div {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            border-top: 1px solid #eef0f2;
            padding-top: 12px;
            margin-top: 12px;
          }
          .unit-card span {
            color: #667085;
            font-size: 0.82rem;
          }
          .unit-card strong {
            text-align: right;
            white-space: nowrap;
          }
          .unit-card div:first-of-type span,
          .unit-card div:first-of-type strong {
            color: #8a94a3;
            font-weight: 600;
          }
          .unit-card div:last-of-type {
            background: #f4fbfb;
            border: 1px solid rgba(91,191,191,0.34);
            border-radius: 12px;
            padding: 12px;
          }
          .unit-card div:last-of-type span {
            color: #3a8f8f;
            font-weight: 800;
          }
          .unit-card div:last-of-type strong {
            color: #0d0f0f;
            font-size: 1.02rem;
            font-weight: 900;
          }
        }
      `,
        }}
      />
    </main>
  )
}
