const Inventario = require('../models/inventario');
const upload = require('../../config/multerConfig');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://gmflswlxghleuauuieis.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtZmxzd2x4Z2hsZXVhdXVpZWlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTQxMzgsImV4cCI6MjA2ODI5MDEzOH0.HCijwySIzbDa0-iNO_-mMSZp-ZMpKVE35YIDdnT_fdA';

const supabase = createClient(supabaseUrl, supabaseKey);


const Estados = ['Disponible', 'Ocupado', 'En Mantenimiento'];

function normalizeFileName(filename) {
  return filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w.-]/g, '_');
}


async function uploadToSupabase(file) {
  const fileBuffer = fs.readFileSync(file.path);
  const safeFileName = normalizeFileName(file.originalname);


  const { data, error } = await supabase.storage
    .from('inventario')
    .upload(`public/${safeFileName}`, fileBuffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) {
    console.error('❌ Error al subir archivo a Supabase:', error);
    return null;
  }

  return data;
}



exports.registrarEquipoConImagenes = async (req, res) => {
  try {
    const { name, model, description, categoria, nseries, estado } = req.body;
    const files = req.files;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ message: 'No se proporcionaron imágenes' });
    }

    const equipoExistente = await Inventario.findOne({ nseries });
    if (equipoExistente) {
      return res.status(400).json({ message: 'El equipo ya está registrado' });
    }

    const imagenes = [];
    for (const file of files) {
      const resultupload = await uploadToSupabase(file);
      if (resultupload?.path) {
        imagenes.push({ url: resultupload.path });
      }
    }

    const nuevoEquipo = new Inventario({
      name,
      model,
      description,
      categoria,
      nseries,
      estado,
      imagenes,
    });

    await nuevoEquipo.save();

    res.status(201).json({
      message: 'Equipo registrado exitosamente con imágenes',
      equipo: nuevoEquipo
    });

  } catch (error) {
    console.error('Error al registrar el equipo:', error);
    res.status(500).json({ message: 'Error al registrar el equipo', error });
  }
};

// exports.registrarEquipoConImagenes = async (req, res) => {
//   try {
//     const { name, model, description, categoria, nseries, estado } = req.body;
//     const files = req.files;

//     const file = files[0]


//     const equipoExistente = await Inventario.findOne({ nseries });
//     if (equipoExistente) {
//       return res.status(400).json({ message: 'El equipo ya está registrado' });
//     }

//     const resultupload = await uploadToSupabase(file)
//     const imagenes = [{ url: resultupload.path }]


//     const nuevoEquipo = new Inventario({
//       name,
//       model,
//       description,
//       categoria,
//       nseries,
//       estado,
//       imagenes: imagenes,
//     });

//     await nuevoEquipo.save();

//     res.status(201).json({
//       message: 'Equipo registrado exitosamente con imágenes',
//       equipo: nuevoEquipo
//     });

//   } catch (error) {
//     console.error('Error al registrar el equipo:', error);
//     res.status(500).json({ message: 'Error al registrar el equipo', error });
//   }
// };


// exports.actualizarEquipoConImagenes = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, model, description, categoria, nseries, estado } = req.body;
//     const files = req.files;

//     const equipoExistente = await Inventario.findById(id);
//     if (!equipoExistente) {
//       return res.status(404).json({ message: 'Equipo no encontrado' });
//     }

//     if (files && files.length > 0) {
//       for (const imagen of equipoExistente.imagenes) {
//         const ruta = imagen.url.replace(`${supabaseUrl}/storage/v1/object/public/inventario/`, '');
//         const { error: deleteError } = await supabase.storage
//           .from('inventario')
//           .remove([`public/${ruta}`]);

//         if (deleteError) {
//           console.warn(`⚠️ No se pudo eliminar la imagen anterior: ${ruta}`, deleteError);
//         }
//       }

//       const nuevasImagenes = [];
//       for (const file of files) {
//         const result = await uploadToSupabase(file);
//         if (result) {
//           nuevasImagenes.push({ url: `${supabaseUrl}/storage/v1/object/${result.path}` });
//         }
//       }

//       equipoExistente.imagenes = nuevasImagenes;
//     }

//     equipoExistente.name = name;
//     equipoExistente.model = model;
//     equipoExistente.description = description;
//     equipoExistente.categoria = categoria;
//     equipoExistente.nseries = nseries;
//     equipoExistente.estado = estado;

//     await equipoExistente.save();

//     res.status(200).json({
//       message: 'Equipo actualizado exitosamente con imágenes',
//       equipo: equipoExistente
//     });

//   } catch (error) {
//     console.error('Error al actualizar el equipo:', error);
//     res.status(500).json({ message: 'Error al actualizar el equipo', error });
//   }
// };

exports.actualizarEquipoConImagenes = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, model, description, categoria, nseries, estado } = req.body;
    const files = req.files || [];

    const equipoExistente = await Inventario.findById(id);
    if (!equipoExistente) {
      return res.status(404).json({ message: 'Equipo no encontrado' });
    }

    // Construir campos a actualizar dinámicamente
    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (model) fieldsToUpdate.model = model;
    if (description) fieldsToUpdate.description = description;
    if (categoria) fieldsToUpdate.categoria = categoria;
    if (nseries) fieldsToUpdate.nseries = nseries;
    if (estado) fieldsToUpdate.estado = estado;

    // Manejo de imágenes
    if (files.length > 0) {
      // Eliminar imágenes anteriores
      for (const imagen of equipoExistente.imagenes || []) {
        const ruta = imagen.url.replace(`${supabaseUrl}/storage/v1/object/public/inventario/`, '');
        const { error: deleteError } = await supabase.storage
          .from('inventario')
          .remove([`public/${ruta}`]);

        if (deleteError) {
          console.warn(`⚠️ No se pudo eliminar la imagen anterior: ${ruta}`, deleteError);
        }
      }

      // Subir nuevas imágenes en paralelo
      const uploads = await Promise.all(files.map(file => uploadToSupabase(file)));
      const nuevasImagenes = uploads
        .filter(result => result)
        .map(result => ({ url: `${supabaseUrl}/storage/v1/object/${result.path}` }));

      fieldsToUpdate.imagenes = nuevasImagenes;
    }

    // Actualizar equipo
    const equipoActualizado = await Inventario.findByIdAndUpdate(id, fieldsToUpdate, {
      new: true
    });

    res.status(200).json({
      message: 'Equipo actualizado exitosamente',
      equipo: equipoActualizado,
      nuevasImagenes: fieldsToUpdate.imagenes || []
    });

  } catch (error) {
    console.error('Error al actualizar el equipo:', error);
    res.status(500).json({ message: 'Error al actualizar el equipo', error });
  }
};
exports.eliminarEquipo = async (req, res) => {
  try {
    const { id } = req.params;

    const equipo = await Inventario.findById(id);
    if (!equipo) {
      return res.status(404).json({ message: 'Equipo no encontrado' });
    }

    for (const imagen of equipo.imagenes) {
      const ruta = imagen.url.replace(`${supabaseUrl}/storage/v1/object/public/inventario/`, '');
      const { error: deleteError } = await supabase.storage
        .from('inventario')
        .remove([`public/${ruta}`]);

      if (deleteError) {
        console.warn(`⚠️ No se pudo eliminar la imagen: ${ruta}`, deleteError);
      }
    }

    await Inventario.findByIdAndDelete(id);

    res.status(200).json({ message: 'Equipo eliminado exitosamente' });

  } catch (error) {
    console.error('Error al eliminar el equipo:', error);
    res.status(500).json({ message: 'Error al eliminar el equipo', error });
  }
};


exports.actualizarEstadoPorQR = async (req, res) => {
  try {
    const { codigoQR } = req.params;

    const equipo = await Inventario.findOne({ codigoQR });
    if (!equipo) return res.status(404).json({ message: 'Equipo no encontrado por QR' });

    const nuevoEstado = equipo.estado === 'Disponible' ? 'Ocupado' : 'Disponible';

    equipo.estado = nuevoEstado;
    await equipo.save();

    res.status(200).json({ message: `Estado cambiado a ${nuevoEstado}`, equipo });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar estado por QR', error });
  }
};

exports.obtenerPorNumeroSerie = async (req, res) => {
  try {
    const { nseries } = req.params;
    const equipo = await Inventario.findOne({ nseries });
    if (!equipo) return res.status(404).json({ message: 'Equipo no encontrado por número de serie' });
    res.status(200).json(equipo);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar por número de serie', error });
  }
};

exports.obtenerEquipos = async (req, res) => {
  try {
    const equipos = await Inventario.find();
    res.status(200).json(equipos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los equipos', error });
  }
};

exports.obtenerEquipoPorId = async (req, res) => {
  try {
    const equipo = await Inventario.findById(req.params.id);
    if (!equipo) return res.status(404).json({ message: 'Equipo no encontrado' });
    res.json(equipo);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el equipo' });
  }
};

exports.obtenerPorCategoria = async (req, res) => {
  try {
    const { categoria } = req.params;
    const equipos = await Inventario.find({ categoria });
    if (!equipos) return res.status(404).json({ message: 'Categoría no encontrada' });
    res.status(200).json(equipos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener equipos por categoría', error });
  }
};

exports.obtenerPorEstado = async (req, res) => {
  try {
    const { estado } = req.params;
    if (!Estados.includes(estado)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }
    const equipos = await Inventario.find({ estado });
    res.status(200).json(equipos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener equipos por estado', error });
  }
};
