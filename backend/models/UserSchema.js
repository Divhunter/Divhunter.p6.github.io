// Importation de Mongoose
const mongoose = require('mongoose');

// Importation d'Express-mongo-sanitize (sécurité)
// Pour assainir les champs inputs des injections sql
const uniqueValidator = require('mongoose-unique-validator');

// Création du schéma
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Application de mongoose-unique-validator au schéma
userSchema.plugin(uniqueValidator);

// Exportation du module pour pouvoir y acceder depuis un autre fichier
module.exports = mongoose.model('User', userSchema);