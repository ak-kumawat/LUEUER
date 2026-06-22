import Image from 'next/image'

export default function PosterFrame({ src, alt, variant = 'dark', className = '' }) {
  return (
    <div 
      className={`poster-frame poster-frame--${variant} ${className}`.trim()}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <Image 
        src={src || '/images/tshirt.webp'} 
        alt={alt} 
        fill
        sizes="100vw"
        style={{ objectFit: 'cover' }}
        loading="lazy" 
      />
    </div>
  )
}
