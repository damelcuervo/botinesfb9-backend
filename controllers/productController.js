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
  // Leemos tanto 'name' como 'title', y asignamos valores por defecto para que nunca sean undefined
  const { 
    name, title, 
    description, price, 
    categoryId, category, 
    brandId, brand, 
    variants, images 
  } = req.body;

  try {
    const newProduct = await prisma.product.create({
      data: {
        name: name || title || "Botín sin nombre",
        description: description || "",
        price: parseFloat(price) || 0,
        // Parseo seguro de ID numéricos o asignación por defecto
        ...( (categoryId || category) && { categoryId: parseInt(categoryId || category) } ),
        ...( (brandId || brand) && { brandId: parseInt(brandId || brand) } ),
        
        // Mapeo seguro de variantes parseando stock a Int
        variants: {
          create: (variants || []).map(v => ({
            size: String(v.size),
            stock: parseInt(v.stock) || 0
          }))
        },

        // Mapeo seguro de imágenes (maneja array de objetos o array de strings)
        images: {
          create: (images || []).map(img => 
            typeof img === 'string' ? { url: img } : { url: img.url }
          )
        }
      },
      include: {
        variants: true,
        images: true
      }
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error exacto en Prisma:", error);
    res.status(500).json({ error: 'Error al crear el producto' });
  }
};

// Actualizar Producto
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { title, name, description, price, images } = req.body;

  try {
    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name: name || title,
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

// Eliminar Producto
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