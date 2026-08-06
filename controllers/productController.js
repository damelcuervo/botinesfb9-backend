const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todos los productos
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

// Crear producto con variantes de talle y stock (Solo Admin)
exports.createProduct = async (req, res) => {
  const { name, description, price, categoryId, brandId, variants, images } = req.body;

  try {
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId,
        brandId,
        variants: {
          create: variants || [] // [{ size: "40", stock: 10 }, { size: "41", stock: 5 }]
        },
        images: {
          create: images || [] // [{ url: "https://link-imagen.jpg" }]
        }
      },
      include: {
        variants: true,
        images: true
      }
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el producto' });
  }

  // Actualizar Producto
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { title, description, price, brandName, categoryName, images, variants } = req.body;

  try {
    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        price: parseFloat(price),
        // Si tenés relaciones con marcas, imágenes y variaciones:
        ...(images && {
          images: {
            deleteMany: {},
            create: images.map((url) => ({ url }))
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

// Eliminar Producto
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    // Si tenés borrado en cascada configurado en Prisma:
    await prisma.product.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

module.exports = {
  // ... tus otros controladores
  updateProduct,
  deleteProduct
};
};