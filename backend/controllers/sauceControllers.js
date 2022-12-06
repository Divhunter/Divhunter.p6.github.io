// Importation de SauceSchema 
const Sauce = require("../models/SauceSchema");

// Importation du module Fs :
// Pour créer des fichiers
// Pour lire des fichiers
// Pour écrire dans des fichiers
// Pour copier des fichiers
// Pour renommer des fichiers
// Pour supprimer des fichiers
const fs = require("fs");

// Importation de JWT (sécurité)
// Pour attribuer un jeton (code haché unique) relatif aux données 
const jwt = require('jsonwebtoken');

// Création du regex (Sécurité)
// Pour filtrer les chaînes de caractères et bannir les caractères non autorisés
const regex = /^[a-zA-Zéèêîçôï0-9]+(?:['\s\-\.a-zA-Zéèêîçôï0-9]+)*$/;

//=========================================================================================
// Relatif à la création de l'objets et validation du formulaire 
exports.addSauce = (req, res, next) => {
    const newSauce = JSON.parse(req.body.sauce);
    delete newSauce._id;
    delete newSauce._userId;

    if (
        !regex.test(newSauce.name) ||
        !regex.test(newSauce.manufacturer) ||
        !regex.test(newSauce.description) ||
        !regex.test(newSauce.mainPepper) ||
        !regex.test(newSauce.heat)
    ) {
        return res
        .status(400) // Erreur de Syntaxe
        .json({ error: "Vos champs doivent contenir des caractères valides !" }); 
    };

    const sauce = new Sauce({
        ...newSauce,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
  
    sauce.save()
    .then(() => { res.status(201).json({message: 'Objet enregistré !'})}) // Objet créé, requête réussie
    .catch(error => { res.status(401).json({ error })}) // Client non auhtentifié, requête échouée
  };

//=========================================================================================
// Relatif au système de liking
exports.upAndDown = (req, res, next) => {

  Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
        
          // Si l'utilisateur ne fait pas partie des utilisateurs ayant liké et qu'il souhaite liker 
          // alors on renvoi un status 200 au front avec le message : + un like
          // le back communique avec le front en renvoyant des status et messages 
          //(ex: status 200 pour réussite avec message ou 400 avec error pour un echec)
          if (!sauce.usersLiked.includes(req.body.userId) && req.body.like === 1) {
            Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId }})
              .then(() => res.status(200).json({ message: "+ un like !" })) // Requête réussie
              .catch(error => res.status(400).json({ error })); 
          } 
          
          // Si l'utilisateur fait partie des utilisateurs ayant liké et qu'il souhaite retirer son like
          // alors on renvoi un status 200 au front avec le message : - un like
          else if (sauce.usersLiked.includes(req.body.userId) && req.body.like === 0) {
            Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId }})
              .then(() => {res.status(200).json({ message: "- un like !" })})
              .catch( error => res.status(400).json({ error }));
          }
          
          // Si l'utilisateur ne fait pas parti des utilisateurs ayant déjà disliké et qu'il souhaite disliker 
          // alors on renvoi un status 200 au front avec le message : + un dislike
          if (!sauce.usersDisliked.includes(req.body.userId) && req.body.like === -1) {
            Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId }})
              .then(() => res.status(200).json({ message: "+ un dislike !" }))
              .catch( error => res.status(400).json({ error }));
          }

          // Si l'utilisateur fait partie des utilisateurs ayant déjà dislike et qu'il souhaite retirer son dislike
          // alors on renvoi un status 200 au front avec le message : - un dislike
          else if (sauce.usersDisliked.includes(req.body.userId) && req.body.like === 0) {
            Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId }})
              .then(() => { res.status(200).json({ message: "- un dislike !" })})
              .catch( error => res.status(400).json({ error }));
          }
      })
    .catch( error => res.status(500).json({ error })); 
  }
  

//=========================================================================================
// Relatif à la modification de l'objet et validation du formulaire
exports.modifySauce = (req, res, next) => {
    const sauceObjet = req.file ? {
        //L'opérateur spread ... est utilisé pour faire une copie de tous les éléments de req.body
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    if (
        !regex.test(sauceObjet.name) ||
        !regex.test(sauceObjet.manufacturer) ||
        !regex.test(sauceObjet.description) ||
        !regex.test(sauceObjet.mainPepper) ||
        !regex.test(sauceObjet.heat)
    ) {
        return res
        .status(400) // Erreur de synthaxe
        .json({ error: "Vos champs doivent contenir des caractères valides !" }); 
    };
  
    delete sauceObjet._userId;
    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message : "Erreur d'authentification"}); // Client non auhtentifié, requête échouée 
            } else {
                Sauce.updateOne({ _id: req.params.id}, { ...sauceObjet, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Objet modifié!'}))
                .catch(error => res.status(401).json({ error })); // Client non auhtentifié, requête échouée
            }
        })
        .catch((error) => {
            res.status(403).json({ error }); // Accès à la requête refusée
        });
 };

//=========================================================================================
// Relatif à la suppression de l'objet
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id})
      .then(sauce => {
          if (sauce.userId != req.auth.userId) {
              res.status(401).json({message: "Erreur d'authentification"}); // Client non auhtentifié
          } else {
              const filename = sauce.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  Sauce.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Objet supprimé !'})}) // requête réussie
                      .catch(error => res.status(401).json({ error })); // Client non auhtentifié, requête échouée
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};

//=========================================================================================
// Relatif à l'affichage d'un seul objet
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => res.status(200).json(sauce)) // requête réussie
      .catch(error => res.status(404).json({ error }));
  };

//=========================================================================================
// Relatif à l'affichage de tous les objets
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
      .then(sauces => res.status(200).json(sauces)) // requête réussie
      .catch(error => res.status(404).json({ error }));
  };