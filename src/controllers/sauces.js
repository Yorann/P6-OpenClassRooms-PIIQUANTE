const ModelsSauce = require("../models/ModelsSauce");
const fs = require("fs");
const { param } = require("../routes/user");
const { Model } = require("mongoose");

/**
 * Recupère la liste de sauces
 * @param req 
 * @param res 
 * @param next 
 */
exports.getSauces = async (req, res, next) => {
  try {
    const sauces = await ModelsSauce.find() 
    res.json(sauces);
  } catch (error) {
    res.status(500).json();
  }
};
/**
 * Récupère une sauce en partuiculier à partir de son ID
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getSauceById = async (req, res, next) => {
  try {
    const sauce = await ModelsSauce.findOne({ _id: req.params.id});
    res.json(sauce);
  } catch (error) {
    res.status(400).json({ error });
  }
};
/**
 * Créer une sauce
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns {Object}
 */
exports.createSauce = async (req, res, next) => {
  try {
    const sauceObject = await JSON.parse(req.body.sauce);

    const sauce = new ModelsSauce({
      name: sauceObject.name,
      manufacturer: sauceObject.manufacturer,
      description: sauceObject.description,
      mainPepper: sauceObject.mainPepper,
      heat: sauceObject.heat,
      userId: sauceObject.userId,
      imageUrl: `${req.protocol}://${req.get("host")}/images/${
        req.file.filename
      }`,
      likes: 0,
      dislikes: 0,
      usersLiked: [],
      usersDisliked: [],
    });
    sauce.save();

    return res.status(201).json({ message: "Sauce ajoutée" });
  } catch (error) {
    res.status(500).json({ message: "erreur survenue" });
  }
};
/**
 * Vérifie qu'une sauce existe bien et si elle appartient à un utilisateur, si oui la modifie
 * @param req 
 * @param res 
 * @param next 
 * @returns {Object} - 
 */
exports.modifySauce = async (req, res, next) => {
  try {
    const sauceId = req.params.id;
    let sauceObject = {};
    let data = {};

    const sauce = await ModelsSauce.findOne({ _id: sauceId });
    if (!sauce) {
      return res.status(404).json({ message: "Sauce introuvable" });
    }
	if (sauce.userId !== req.user._id) {
		return res.status(403).json
	}
    if (req.file) {
      data = JSON.parse(req.body.sauce);
      sauceObject.imageUrl = `${req.protocol}://${req.get("host")}/images/${
        req.file.filename
      }`;
    } else {
      data = req.body;
    }
    sauceObject = {
      ...sauceObject,
      name: data.name,
      manufacturer: data.manufacturer,
      description: data.description,
      mainPepper: data.mainPepper,
      heat: data.heat,
      userId: data.userId,
    };
    await ModelsSauce.updateOne({ _id: sauceId }, sauceObject);

    res.status(200).json({ message: "Sauce modifiée" });
  } catch (error) {
    res.status(400).json({ error });
  }
};
/**
 * Vérifie qu'une sauce existe bien si oui la supprime ainsi que son image de la base de donnée
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns {Object}
 */
exports.deleteSauce = async (req, res, next) => {
  try {
    const sauce = await ModelsSauce.findOne({ _id: req.params.id, userId: req.user.id });
    if (!sauce) {
      return res.status(204).json();
    }

    const filename = sauce.imageUrl.split("/images/")[1];
    try {
      fs.unlink(`images/${filename}`, () => {});
	  console.log(filename)
    } catch (error) {}
    await ModelsSauce.deleteOne({ _id: req.params.id });
    return res.status(200).json({message: "Sauce supprimée"});
  } catch (error) {
	console.log(error)
    return res.status(500).json();
  }
};
/**
 * Vérifie si:
 * -un utilisateur est connecté
 * -la sauce existe
 * Permet de liker ou de disliker une sauce si l'utilisateur n'a pas déjà liké ou disliké la sauce auparavant
 * Permet d'arreter de liker ou disliker si l'utilisateur à déjà liké ou disliké une sauce auparavant
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
exports.likeSauce = async (req, res, next) => {
  try {
    const like = req.body.like;
    const userId = req.body.userId;
    const sauceId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "User id obligatoire" });
    }

    const sauce = await ModelsSauce.findOne({ _id: sauceId });
    if (!sauce) {
      return res.status(404).json({ message: "Sauce introuvable" });
    }

    if (like == 1) {
      if (!sauce.usersLiked.includes(userId)) {
        await ModelsSauce.updateOne(
          { _id: req.params.id },
          { $push: { usersLiked: userId }, $inc: { likes: +1 } }
        );
      }
      if (sauce.usersDisliked.includes(userId)) {
        await ModelsSauce.updateOne(
          { _id: req.params.id },
          { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } }
        );
      }
      return res.json({ message: "Sauce liké !" });
    } else if (like == 0) {
      if (sauce.usersLiked.includes(userId)) {
        await ModelsSauce.updateOne(
          { _id: req.params.id },
          { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
        );
      }

      if (sauce.usersDisliked.includes(userId)) {
        await ModelsSauce.updateOne(
          { _id: req.params.id },
          { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } }
        );
      }
      return res.json({ message: "Cette sauce ne vous intéresse plus !" });
    } else if (like == -1) {
      if (!sauce.usersDisliked.includes(userId)) {
        await ModelsSauce.updateOne(
          { _id: req.params.id },
          { $push: { usersDisliked: req.body.userId }, $inc: { dislikes: +1 } }
        );
      }
      if (sauce.usersLiked.includes(userId)) {
        await ModelsSauce.updateOne(
          { _id: req.params.id },
          { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
        );
      }
      return res.json({ message: "Vous n'amez pas cette sauce" });
    }
    return res.json();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "erreur survenue lors du traitement" });
  }
};
