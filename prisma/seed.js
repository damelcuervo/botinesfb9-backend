const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Cargando productos de prueba...');

  // 1. Categorías
  const botinesCat = await prisma.category.upsert({
    where: { slug: 'botines' },
    update: {},
    create: { name: 'Botines', slug: 'botines', description: 'Calzado para césped natural y sintético' }
  });

  // 2. Marcas
  const nike = await prisma.brand.upsert({ where: { name: 'Nike' }, update: {}, create: { name: 'Nike' } });
  const adidas = await prisma.brand.upsert({ where: { name: 'Adidas' }, update: {}, create: { name: 'Adidas' } });

  // 3. Limpiar registros previos
  await prisma.productVariant.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});

  // 4. Crear productos usando únicamente `title`
  await prisma.product.create({
    data: {
      title: 'Botines Nike Mercurial Superfly',
      slug: 'botines-nike-mercurial-superfly',
      description: 'Botines de gama alta para máxima velocidad.',
      price: 185000,
      categoryId: botinesCat.id,
      brandId: nike.id,
      variants: {
        create: [
          { size: '40', stock: 5 },
          { size: '41', stock: 8 }
        ]
      },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800' }
        ]
      }
    }
  });

  await prisma.product.create({
    data: {
      title: 'Botines Adidas Predator Accuracy',
      slug: 'botines-adidas-predator-accuracy',
      description: 'Control total y agarre preciso.',
      price: 172000,
      categoryId: botinesCat.id,
      brandId: adidas.id,
      variants: {
        create: [
          { size: '39', stock: 4 },
          { size: '41', stock: 6 }
        ]
      },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800' }
        ]
      }
    }
  });

  console.log('¡Productos cargados con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });