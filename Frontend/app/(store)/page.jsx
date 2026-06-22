import AuthWrapper from '../components/shared/AuthWrapper'
import Hero from '../components/store/Hero'
import BentoCards from '../components/store/BentoCards'
import BrandGallery from '../components/store/BrandGallery'
import ProductGrid from '../components/store/ProductGrid'
import Footer from '../components/store/Footer'
import PosterFrame from '../components/store/PosterFrame'
import HomeFAQ from '../components/store/HomeFAQ'
import { getFeaturedProducts } from '../../lib/api'
import { brandImages } from '../../lib/images'
import Link from 'next/link'

export default async function HomePage() {
  let featuredProducts = []

  try {
    const res = await getFeaturedProducts()
    featuredProducts = res.data?.data || []
  } catch {
    featuredProducts = []
  }

  return (
    <AuthWrapper>
      <Hero />

      <section className="surface-light section-padding">
        <div className="container">
          <div className="section-header-center">
            <p className="section-label section-label-dark">Featured</p>
            <h2 className="heading-dark section-title">
              Limited Drop.
              <br />
              <em>Timeless Impact.</em>
            </h2>
            <div className="divider divider-dark section-divider" />
          </div>

          <ProductGrid products={featuredProducts} light />
        </div>
      </section>

      <BentoCards />

      <BrandGallery />

      <section className="surface-dark poster-spotlight">
        <div className="container">
          <PosterFrame
            src={brandImages.silenceFabric}
            alt="Silence speaks. So does the fabric."
            variant="dark"
            className="poster-spotlight-frame"
          />
        </div>
      </section>

      <section className="surface-dark cta-section">
        <div className="container cta-inner">
          <p className="section-label">No Noise. No Rush. Just Purpose.</p>
          <h2 className="cta-heading">
            WEAR YOUR
            <br />
            IDENTITY
          </h2>
          <div className="divider cta-divider" />
          <p className="cta-subtext">LIMITED DROP · TIMELESS IMPACT</p>
          <Link href="/shop" className="btn-primary">Explore Collection</Link>
        </div>
      </section>

      <HomeFAQ />

      <Footer />
    </AuthWrapper>
  )
}
