require("dotenv").config();

const express = require("express");
const path = require("path");
const app = express();

// DB
const sequelize = require("./src/config/db");

// Models
require("./src/models/User");
require("./src/models/Equipement");
require("./src/models/Intervention");
require("./src/models/Maintenance");
require("./src/models/Notification");

// Middleware
app.use(express.json());
app.use("/app", express.static(path.join(__dirname, "public")));

app.get("/app", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/app/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Routes
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const equipementRoutes = require("./src/routes/equipementRoutes");
const interventionRoutes = require("./src/routes/interventionRoutes");
const maintenanceRoutes = require("./src/routes/maintenanceRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/equipements", equipementRoutes);
app.use("/api/interventions", interventionRoutes);
app.use("/api/maintenances", maintenanceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Backend is working");
});

// Sync DB + start server
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database synced");

    app.listen(process.env.PORT || 5000, () => {
      console.log("Server running on port " + (process.env.PORT || 5000));
    });
  })
  .catch((err) => {
    console.log("DB error:", err);
  });
