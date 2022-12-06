// Importation d'Express
const express = require('express');

// Création de l'application express
const app = express();

// Importation de Mongoose
const mongoose = require('mongoose');

// Importation de Morgan (logger htpp)
const morgan = require('morgan');

// Importation de Helmet (sécurité)
// Pour la protection contre les attaques de type cross-site scripting et autres injections intersites
const helmet = require('helmet');

// Importation de HPP (sécurité)
// Pour se protéger des attaques par pollution des paramètres HTTP
const hpp = require("hpp");

// Importation d'Express-mongo-sanitize (sécurité)
// Pour assainir les champs inputs des injections sql
const mongoSanitize = require("express-mongo-sanitize");

// Importation des routes
const sauceRoutes = require('./routes/sauceRoutes');
const userRoutes = require('./routes/userRoutes');

const path = require('path');
const { application } = require('express');

// Connection à la base de données MongoDB
mongoose.connect('mongodb+srv://Divhunter:FYwL8xyVRPKDg3Y@cluster0.exlqtkh.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

// Application du logger
app.use(morgan('dev'));

// Définition des entêtes CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization, Content-Type, Access-Control-Allow-Headers"
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

// Application des middlewares de sécurité 
app.use(helmet());
app.use(hpp()); 
app.use(mongoSanitize()); 

// Exportation de app.js pour pouvoir y acceder depuis un autre fichier
module.exports = app;