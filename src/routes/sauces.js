const express = require('express');
const router = express.Router();

const saucesController = require('../controllers/sauces');
const auth = require ('../middleware/auth.js');
const multer = require('../middleware/multer-config.js');

router.post('/', auth, multer, saucesController.createSauce);
router.post('/:id/like', auth, multer, saucesController.likeSauce);
router.put('/:id', auth, multer, saucesController.modifySauce);
router.delete('/:id', auth, saucesController.deleteSauce);
router.get('/', auth, saucesController.getSauce);
router.get('/:id', auth, saucesController.getSauceById)

module.exports = router