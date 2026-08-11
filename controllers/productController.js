const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        brand: true,
        variants: true,
        images: true,
      },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

exports.createProduct = async (req, res) => {
  const body = req.body;
  console.log("BODY RECIBIDO:", body);

  try {
    const title = body.title || body.name || "Producto sin título";
    
    // Obtener la primera categoría o crear una por defecto
    let category = await prisma.category.findFirst();
    if (!category) {
      category = await prisma.category.create({
        data: { name: 'General' }
      });
    }

    // Obtener la primera marca o crear una por defecto (sin slug)
    let brand = await prisma.brand.findFirst();
    if (!brand) {
      brand = await prisma.brand.create({
        data: { name: 'Genérica' }
      });
    }

    const generatedSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .concat(`-${Date.now()}`);

    const newProduct = await prisma.product.create({
      data: {
        title: title,
        slug: body.slug || generatedSlug,
        description: body.description || "",
        price: parseFloat(body.price) || 0,
        
        categoryId: body.categoryId ? parseInt(body.categoryId) : category.id,
        brandId: body.brandId ? parseInt(body.brandId) : brand.id,

        variants: {
          create: (body.variants || []).map(v => ({
            size: String(v.size),
            stock: parseInt(v.stock) || 0
          }))
        },

        images: {
          create: (body.images || []).map(img => 
            typeof img === 'string' ? { url: img } : { url: img.url }
          )
        }
      },
      include: { variants: true, images: true, category: true, brand: true }
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("ERROR EN PRISMA:", error);
    res.status(500).json({ error: 'Error al crear producto', details: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { title, name, description, price, images } = req.body;

  try {
    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        title: title || name,
        description,
        price: parseFloat(price),
        ...(images && {
          images: {
            deleteMany: {},
            create: images.map((img) => typeof img === 'string' ? { url: img } : { url: img.url })
          }
        })
      },
      include: { images: true, variants: true, brand: true }
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};