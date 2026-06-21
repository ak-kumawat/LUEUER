import { PrismaClient } from '../src/generated/prisma/index.js'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // 1. Clean existing records to avoid conflicts
  console.log('🧹 Clearing old data...')
  await prisma.brandContent.deleteMany()
  await prisma.rating.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.orderStatusHistory.deleteMany()
  await prisma.order.deleteMany()
  await prisma.address.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.wishlist.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.productCategory.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Tables cleared.')

  // 2. Create Categories
  console.log('📦 Seeding categories...')
  const tshirts = await prisma.category.create({
    data: {
      name: 'T-Shirts',
      slug: 't-shirts',
      type: 'cloth_type',
      description: 'Premium heavyweight tees. Defined by fit, built for presence.',
      imageUrl: '/images/tshirt.webp',
      displayOrder: 1
    }
  })

  const hoodies = await prisma.category.create({
    data: {
      name: 'Hoodies',
      slug: 'hoodies',
      type: 'cloth_type',
      description: 'Heavyweight French Terry hoodies. Minimal design, maximum structure.',
      imageUrl: '/images/lueuer.webp',
      displayOrder: 2
    }
  })

  const accessories = await prisma.category.create({
    data: {
      name: 'Accessories',
      slug: 'accessories',
      type: 'cloth_type',
      description: 'Minimalist daily essentials. Durable canvas bags and items.',
      imageUrl: '/images/overview.webp',
      displayOrder: 3
    }
  })

  console.log('✅ Categories seeded.')

  // 3. Create Products, Variants and Images
  console.log('👕 Seeding products...')

  // Product 1: T-Shirt
  const tee = await prisma.product.create({
    data: {
      name: 'LUEUER Heavyweight Tee',
      slug: 'lueuer-heavyweight-tee',
      description: 'Minimalist aesthetic. Premium 280 GSM pre-shrunk combed cotton. Drop shoulder boxy fit. Clean ribbed collar. Silence speaks, wear it with presence.',
      basePrice: 1499.00,
      thumbnailUrl: '/images/tshirt.webp',
      brand: 'LUEUER',
      isFeatured: true,
      categories: {
        create: { categoryId: tshirts.id }
      },
      variants: {
        create: [
          { size: 'S', color: 'Carbon Black', colorHex: '#121212', stockQuantity: 50, sku: 'LUR-TEE-BLK-S' },
          { size: 'M', color: 'Carbon Black', colorHex: '#121212', stockQuantity: 50, sku: 'LUR-TEE-BLK-M' },
          { size: 'L', color: 'Carbon Black', colorHex: '#121212', stockQuantity: 50, sku: 'LUR-TEE-BLK-L' },
          { size: 'XL', color: 'Carbon Black', colorHex: '#121212', stockQuantity: 30, sku: 'LUR-TEE-BLK-XL' },
          { size: 'S', color: 'Bone White', colorHex: '#F5F5F0', stockQuantity: 40, sku: 'LUR-TEE-WHT-S' },
          { size: 'M', color: 'Bone White', colorHex: '#F5F5F0', stockQuantity: 40, sku: 'LUR-TEE-WHT-M' },
          { size: 'L', color: 'Bone White', colorHex: '#F5F5F0', stockQuantity: 45, sku: 'LUR-TEE-WHT-L' },
          { size: 'XL', color: 'Bone White', colorHex: '#F5F5F0', stockQuantity: 25, sku: 'LUR-TEE-WHT-XL' },
        ]
      },
      images: {
        create: [
          { imageUrl: '/images/tshirt.webp', isPrimary: true, displayOrder: 1 },
          { imageUrl: '/images/cotty.webp', isPrimary: false, displayOrder: 2 },
        ]
      }
    }
  })

  // Product 2: Hoodie
  const hoodie = await prisma.product.create({
    data: {
      name: 'LUEUER Silent Hoodie',
      slug: 'lueuer-silent-hoodie',
      description: 'Heavyweight French Terry cotton. Double-lined structured hood without drawcords for a clean, minimalist silhouette. Ribbed cuffs and hem. Built in silence.',
      basePrice: 3499.00,
      thumbnailUrl: '/images/lueuer.webp',
      brand: 'LUEUER',
      isFeatured: true,
      categories: {
        create: { categoryId: hoodies.id }
      },
      variants: {
        create: [
          { size: 'S', color: 'Carbon Black', colorHex: '#121212', stockQuantity: 30, sku: 'LUR-HOD-BLK-S' },
          { size: 'M', color: 'Carbon Black', colorHex: '#121212', stockQuantity: 35, sku: 'LUR-HOD-BLK-M' },
          { size: 'L', color: 'Carbon Black', colorHex: '#121212', stockQuantity: 40, sku: 'LUR-HOD-BLK-L' },
          { size: 'XL', color: 'Carbon Black', colorHex: '#121212', stockQuantity: 20, sku: 'LUR-HOD-BLK-XL' },
          { size: 'S', color: 'Ash Gray', colorHex: '#808080', stockQuantity: 25, sku: 'LUR-HOD-GRY-S' },
          { size: 'M', color: 'Ash Gray', colorHex: '#808080', stockQuantity: 30, sku: 'LUR-HOD-GRY-M' },
          { size: 'L', color: 'Ash Gray', colorHex: '#808080', stockQuantity: 30, sku: 'LUR-HOD-GRY-L' },
        ]
      },
      images: {
        create: [
          { imageUrl: '/images/lueuer.webp', isPrimary: true, displayOrder: 1 },
          { imageUrl: '/images/silence-fabric.webp', isPrimary: false, displayOrder: 2 },
        ]
      }
    }
  })

  // Product 3: Accessory
  const accessory = await prisma.product.create({
    data: {
      name: 'LUEUER Everyday Tote',
      slug: 'lueuer-everyday-tote',
      description: 'Durable heavy-gauge cotton canvas. Deep main compartment with interior zipper pocket. Reinforced stitching at stress points. Minimalist brand print.',
      basePrice: 799.00,
      thumbnailUrl: '/images/overview.webp',
      brand: 'LUEUER',
      isFeatured: false,
      categories: {
        create: { categoryId: accessories.id }
      },
      variants: {
        create: [
          { size: 'O/S', color: 'Bone White', colorHex: '#F5F5F0', stockQuantity: 100, sku: 'LUR-TOT-WHT-OS' },
        ]
      },
      images: {
        create: [
          { imageUrl: '/images/overview.webp', isPrimary: true, displayOrder: 1 },
        ]
      }
    }
  })

  console.log('✅ Products, variants, and images seeded.')

  // 4. Seeding Brand Content
  console.log('✍️ Seeding brand content...')
  await prisma.brandContent.create({
    data: {
      tagline: 'Built in Silence. Defined by Presence.',
      motto: 'LUEUER is not about following trends. It is about creating a timeless identity.',
      heroText: 'Premium Streetwear, Crafted Differently.'
    }
  })
  console.log('✅ Brand content seeded.')

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
