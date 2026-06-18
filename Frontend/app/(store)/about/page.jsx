import AuthWrapper from '../../components/shared/AuthWrapper'
import Footer from '../../components/store/Footer'
import PosterFrame from '../../components/store/PosterFrame'
import { brandImages } from '../../../lib/images'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <AuthWrapper>
      <div className="surface-dark about-page">
        <section className="about-intro">
          <div className="container about-intro-grid">
            <div className="about-intro-copy">
              <p className="section-label">Our Story</p>
              <h1 className="about-title">
                Built from
                <br />
                <em>Silence.</em>
              </h1>
              <div className="divider about-divider" />
              <p className="about-lead">
                LUEUER was not born from noise. It was built in the quiet moments — the early mornings, the late nights, the spaces between words where identity is truly formed.
              </p>
            </div>

            <PosterFrame
              src={brandImages.overview}
              alt="Built in silence. Defined by presence."
              variant="dark"
              className="about-intro-poster"
            />
          </div>
        </section>

        <section className="container about-body-section">
          <div className="about-copy-block">
            <p className="about-body">
              We are not a brand for everyone. We are a brand for those who understand that true style is not loud. It does not demand attention. It simply commands presence.
            </p>

            <p className="about-body">
              Every piece of LUEUER clothing is crafted for those who move in silence and let their presence speak. Premium materials. Timeless designs. Made to last beyond trends and seasons.
            </p>

            <blockquote className="about-quote">
              "Style is loud. Elegance is silent. Confidence needs no explanation."
            </blockquote>
          </div>

          <div className="about-poster-grid">
            <PosterFrame src={brandImages.tshirt} alt="Worn with confidence" variant="dark" />
            <PosterFrame src={brandImages.cotty} alt="Not for everyone" variant="dark" />
          </div>

          <div className="about-stats">
            {[
              { number: '2026', label: 'Established' },
              { number: 'IND', label: 'Made in India' },
              { number: '100%', label: 'Premium Fabric' },
              { number: '∞', label: 'Timeless Design' },
            ].map(item => (
              <div key={item.label} className="about-stat-card">
                <p className="about-stat-number">{item.number}</p>
                <p className="section-label">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="about-cta">
            <p className="section-label">LUEUER CLOTHING · EST. 2026 · IND</p>
            <p className="about-cta-text">No Noise. No Rush. Just Purpose.</p>
            <Link href="/shop" className="btn-primary">Explore Collection</Link>
          </div>
        </section>
      </div>
      <Footer />
    </AuthWrapper>
  )
}
