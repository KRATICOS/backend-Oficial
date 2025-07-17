
exports.subirArchivos = (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No se subieron archivos' });
    }

    console.log('Archivos recibidos:', req.files);

    const archivos = req.files.map(file => ({
        filename: file.filename,
        url: `http://localhost:3001/uploads/${file}`


    }));

    res.json({
        message: 'Archivos subidos correctamente',
        archivos
    });
};
