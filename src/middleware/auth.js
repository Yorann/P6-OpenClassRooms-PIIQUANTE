const jwt = require('jsonwebtoken');
const User = require("../models/User")

module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, "My_Token");
        const userId = decodedToken.userId;
        
        const user = await User.findOne({_id: userId})
        if(!user){
            return res.status(401).json()
        }
        next()
    } catch (error) {
        res.status(401).json({error: error | 'Requête non authentifiée !'});
    }
}