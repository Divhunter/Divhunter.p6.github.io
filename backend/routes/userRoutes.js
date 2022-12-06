// Importations
const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userControllers');
const emailValidator = require('../middleware/emailValidator');
const passwordValidator = require('../middleware/passwordValidator');
const limit = require('../middleware/logLimit');
const { route } = require('./sauceRoutes');

// Réglage des contrôleurs
router.post('/signup', emailValidator, passwordValidator, userCtrl.signup);
router.post('/login', limit.limiter, passwordValidator, userCtrl.login);

// Exportation du Router pour pouvoir y acceder depuis un autre fichier
module.exports = router;