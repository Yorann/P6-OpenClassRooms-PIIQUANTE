const jwt = require('jsonwebtoken');
const User = require("../models/User")

/**
 * Authentifie toutes les requêtes des utilisateurs
 * @param req 
 * @param res 
 * @param {Function} next 
 * @returns {Promise}
 */
module.exports = async (req, res, next) => {
    try {
        const secret = process.env.TOKEN_SECRET
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, secret);
        const userId = decodedToken.userId;
        
        const user = await User.findOne({_id: userId})
        if(!user){
            return res.status(401).json()
        }
        req.user = user
        next()
    } catch (error) {
        res.status(500).json({error: error | 'Requête non authentifiée !'});
    }
}