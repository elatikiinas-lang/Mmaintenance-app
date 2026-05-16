const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Equipement = require("./Equipement");
const User = require("./User");

const Intervention = sequelize.define("Intervention", {
  titre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  type: {
    type: DataTypes.ENUM("PANNE", "MAINTENANCE", "INSTALLATION", "AUTRE"),
    defaultValue: "PANNE",
  },
  priorite: {
    type: DataTypes.ENUM("BASSE", "NORMALE", "HAUTE", "URGENTE"),
    defaultValue: "NORMALE",
  },
  statut: {
    type: DataTypes.ENUM("OUVERTE", "EN_COURS", "TERMINEE", "ANNULEE"),
    defaultValue: "OUVERTE",
  },
  dateDebut: {
    type: DataTypes.DATE,
  },
  dateFin: {
    type: DataTypes.DATE,
  },
  commentaire: {
    type: DataTypes.TEXT,
  },
});

Equipement.hasMany(Intervention, {
  foreignKey: "equipementId",
  onDelete: "CASCADE",
});
Intervention.belongsTo(Equipement, {
  foreignKey: "equipementId",
});

User.hasMany(Intervention, {
  foreignKey: "technicienId",
  as: "interventionsTechnicien",
});
Intervention.belongsTo(User, {
  foreignKey: "technicienId",
  as: "technicien",
});

User.hasMany(Intervention, {
  foreignKey: "demandeurId",
  as: "interventionsDemandeur",
});
Intervention.belongsTo(User, {
  foreignKey: "demandeurId",
  as: "demandeur",
});

module.exports = Intervention;
