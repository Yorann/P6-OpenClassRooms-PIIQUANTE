const dotenv = require("dotenv");
const express = require("express");
const connectDB = require("./src/models/index");
const cors = require("cors");
const path = require("path");
//Permet de cacher les données sencibles
dotenv.config();

const UserRoutes = require("./src/routes/user");
const SaucesRoute = require("./src/routes/sauces");

const app = express();

connectDB();

app.use(express.json()); //Body-parser présent dans express. Permet de lire le contenu JSON renvoyé par les requêtes POST
app.use(
  cors({
    origin: "http://localhost:4200",
  })
);
app.use("/api/auth", UserRoutes);
app.use("/api/sauces", SaucesRoute);
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
