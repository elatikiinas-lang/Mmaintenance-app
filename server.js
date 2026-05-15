require("dotenv").config();

const express = require("express");
const app = express();

// 📦 DB
const sequelize = require("./src/config/db");

// 📦 Models
require("./src/models/User");
require("./src/models/Equipement"); // باقيين غير هادو دابا

// 🔥 Middleware
app.use(express.json());

// 🔐 Routes
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const equipementRoutes = require("./src/routes/equipementRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/equipements", equipementRoutes);

// 🌐 Test route
app.get("/", (req, res) => {
  res.send("Backend is working 🚀");
});

// 🧠 Sync DB + start server
sequelize.sync({ alter: true })
  .then(() => {
    console.log("Database synced 🚀");

    app.listen(process.env.PORT || 5000, () => {
      console.log(
        "Server running on port " + (process.env.PORT || 5000)
      );
    });
  })
  .catch((err) => {
    console.log("DB error:", err);
  });