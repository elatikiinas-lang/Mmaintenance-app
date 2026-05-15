const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Equipement = sequelize.define("Equipement", {
  reference: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  categorie: {
    type: DataTypes.STRING,
  },
  numeroSerie: {
    type: DataTypes.STRING,
  },
  dateAchat: {
    type: DataTypes.DATE,
  },
  etat: {
    type: DataTypes.STRING,
    defaultValue: "Disponible",
  },
  salle: {
    type: DataTypes.STRING,
  },
  statut: {
    type: DataTypes.STRING,
    defaultValue: "Actif",
  },
});

module.exports = Equipement;