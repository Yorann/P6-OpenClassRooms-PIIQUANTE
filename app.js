const express = require('express')
const mongoose= require('mongoose')
const cors = require('cors')
const path = require('path')
const dotenv = require("dotenv")

const UserRoutes = require('./src/routes/user')
const SaucesRoute = require('./src/routes/sauces')
const app = express();

dotenv.config()

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*') //Autorise l'accès à l'API pour n'importe quelle origine
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization')  //Définit les Headers utilisé par l'API
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')  //Définit les méthodes utilisables
    next();
});

//CONNEXION A MONGODB
mongoose.connect(process.env.MongoConnect,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'))

app.use(express.json())    //body-parser présent dans express. Permet de lire le contenu JSON renvoyé par les requêtes POST
app.use(cors())
app.use('/api/auth', UserRoutes)
app.use('/api/sauces', SaucesRoute)
app.use('/images', express.static(path.join(__dirname, 'images')))

module.exports = app