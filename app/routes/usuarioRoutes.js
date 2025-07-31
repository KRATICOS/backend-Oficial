const express = require('express');
const router = express.Router();
const upload = require('../../config/multerConfig'); 
const usuarioController = require('../controllers/usuarioController');

router.post('/create', upload.any(), usuarioController.createUser);
router.get('/', usuarioController.getUsers);
router.get('/:id', usuarioController.getUserById);
router.put('/:id',upload.any(), usuarioController.updateUser);
router.delete('/:id', usuarioController.deleteUser);


module.exports = router;
