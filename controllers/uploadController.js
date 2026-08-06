const cloudinary = require('cloudinary').v2;

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió ningún archivo' });
    }

    // Subir archivo a Cloudinary utilizando un stream
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'botinesfb9' },
      (error, result) => {
        if (error) {
          console.error('Error Cloudinary:', error);
          return res.status(500).json({ error: 'Error al subir la imagen' });
        }
        res.json({ url: result.secure_url });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor al subir imagen' });
  }
};

module.exports = { uploadImage };