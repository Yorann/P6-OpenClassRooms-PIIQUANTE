const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const User = require("../models/User")

exports.signup = async (req, res, next) => {
  try {
    const password = req.body.password;
    const email = req.body.email;
    const passwordValidator = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
    let error = null;

    if (!passwordValidator.test(password)) {
      error =
        "Le mot de passe doit faire une taille de 8 caractères et doit obligatoirement contenir : 1 majuscule + 1 minuscule + 1 chiffre + 1 symbole";
    }

    if (error) {
      return res.status(400).json({ message: error });
    }

    const exist = await User.findOne({ email: email });
    if (exist) {
      return res.status(400).json({ message: "email déjà existant" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = new User({
      email: email,
      password: hash,
    });

    await user.save();
    res.status(201).json();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
}

exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé !" });
    }
    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Mot de passe incorrect !" });
    }
    return res.status(200).json({
      userId: user._id,
      token: jwt.sign({ userId: user._id }, "My_Token", {
        expiresIn: "24h",
      }),
    });
  
  } catch (error) {
    return res.status(500).json({message:error})
  }
};
