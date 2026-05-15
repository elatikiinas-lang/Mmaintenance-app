const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
  nom: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING,
  role: {
    type: DataTypes.ENUM("ADMIN", "TECH", "USER"),
    defaultValue: "USER",
  },
});

module.exports = User;