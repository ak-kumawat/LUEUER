import { editorialGallery } from '../../../lib/images'
import PosterFrame from './PosterFrame'

export default function BrandGallery() {
  return (
    <section className="surface-light section-padding poster-showcase">
      <div className="container">
        <div className="poster-showcase-header">
          <p className="section-label section-label-dark">Visual Story</p>
          <h2 className="heading-dark poster-showcase-title">
            Every piece carries a message.
          </h2>
        </div>

        <div className="poster-masonry">
          {editorialGallery.map((item, i) => (
            <PosterFrame
              key={i}
              src={item.src}
              alt={item.alt}
              variant="light"
              className={i === 0 || i === 3 ? 'poster-masonry-wide' : ''}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
