const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const Notification = sequelize.define("Notification", {
  titre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("PANNE", "MAINTENANCE", "RETARD", "INFO"),
    defaultValue: "INFO",
  },
  lu: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

User.hasMany(Notification, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
Notification.belongsTo(User, {
  foreignKey: "userId",
});

module.exports = Notification;
