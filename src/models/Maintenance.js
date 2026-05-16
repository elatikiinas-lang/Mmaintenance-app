const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Equipement = require("./Equipement");
const User = require("./User");

const Maintenance = sequelize.define("Maintenance", {
  titre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  type: {
    type: DataTypes.ENUM("PREVENTIVE", "CORRECTIVE"),
    defaultValue: "PREVENTIVE",
  },
  datePrevue: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  dateRealisation: {
    type: DataTypes.DATE,
  },
  statut: {
    type: DataTypes.ENUM("PROGRAMMEE", "EN_COURS", "TERMINEE", "ANNULEE", "EN_RETARD"),
    defaultValue: "PROGRAMMEE",
  },
  commentaire: {
    type: DataTypes.TEXT,
  },
});

Equipement.hasMany(Maintenance, {
  foreignKey: "equipementId",
  onDelete: "CASCADE",
});
Maintenance.belongsTo(Equipement, {
  foreignKey: "equipementId",
});

User.hasMany(Maintenance, {
  foreignKey: "technicienId",
  as: "maintenancesTechnicien",
});
Maintenance.belongsTo(User, {
  foreignKey: "technicienId",
  as: "technicien",
});

module.exports = Maintenance;
