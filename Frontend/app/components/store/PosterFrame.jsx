export default function PosterFrame({ src, alt, variant = 'dark', className = '' }) {
  return (
    <div className={`poster-frame poster-frame--${variant} ${className}`.trim()}>
      <img src={src} alt={alt} className="poster-image" loading="lazy" />
    </div>
  )
}
