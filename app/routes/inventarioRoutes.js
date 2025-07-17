const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');
const upload = require('../../config/multerConfig');


router.get('/por-serie/:nseries', inventarioController.obtenerPorNumeroSerie);

router.get('/', inventarioController.obtenerEquipos);
router.get('/:id', inventarioController.obtenerEquipoPorId);

router.put('/:id', upload.array('imagenes',5),inventarioController.actualizarEquipoConImagenes);

router.delete('/:id', inventarioController.eliminarEquipo);

router.put('/qr/:codigoQR', inventarioController.actualizarEstadoPorQR);

router.get('/categoria/:categoria', inventarioController.obtenerPorCategoria);
router.get('/estado/:estado', inventarioController.obtenerPorEstado);

router.post('/crear', upload.array('imagenes',5), inventarioController.registrarEquipoConImagenes);

module.exports = router;

