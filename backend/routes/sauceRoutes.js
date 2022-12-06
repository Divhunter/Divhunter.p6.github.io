// Importations
const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const sauceCtrl = require('../controllers/sauceControllers');

// Routes
router.post('/', auth, multer, sauceCtrl.addSauce);
router.post('/:id/like', auth, multer, sauceCtrl.upAndDown);
router.get('/', auth, sauceCtrl.getAllSauces);
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);

// Export des routes pour pouvoir y acceder depuis un autre fichier
module.exports = router;