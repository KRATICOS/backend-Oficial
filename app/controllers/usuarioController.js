const Usuario = require('../models/usuario');
const Inventario = require('../models/inventario');
const upload = require('../../config/multerConfig');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gmflswlxghleuauuieis.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtZmxzd2x4Z2hsZXVhdXVpZWlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTQxMzgsImV4cCI6MjA2ODI5MDEzOH0.HCijwySIzbDa0-iNO_-mMSZp-ZMpKVE35YIDdnT_fdA';

const supabase = createClient(supabaseUrl, supabaseKey);


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

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const users = await Usuario.paginate({}, { page, limit, select: '-password' });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los usuarios", error });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await Usuario.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el usuario", error });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, tel, rol, matricula, grupo } = req.body;
    const files = req.files || [];

    const userExists = await Usuario.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    let imagenes = [];
    for (const file of files) {
      const resultupload = await uploadToSupabase(file);
      if (resultupload) {
        imagenes.push({ url: resultupload.path });
      }
    }

    const newUser = new Usuario({
      name,
      email,
      password,
      tel,
      rol,
      matricula,
      grupo,
      imagenes,
    });

    await newUser.save();

    res.status(201).json({ message: 'Usuario registrado correctamente', usuario: newUser });
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ message: "Error al crear el usuario", error });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, tel, matricula, grupo } = req.body;
    const files = req.files || [];

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (email) fieldsToUpdate.email = email;
    if (tel) fieldsToUpdate.tel = tel;
    if (matricula) fieldsToUpdate.matricula = matricula;
    if (grupo) fieldsToUpdate.grupo = grupo;

    if (files.length > 0) {
      let imagenes = [];
      for (const file of files) {
        const resultupload = await uploadToSupabase(file);
        if (resultupload) {
          imagenes.push({ url: resultupload.path });
        }
      }
      fieldsToUpdate.imagenes = imagenes;
    }

    const user = await Usuario.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario actualizado correctamente', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el usuario', error });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await Usuario.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el usuario", error });
  }
};
