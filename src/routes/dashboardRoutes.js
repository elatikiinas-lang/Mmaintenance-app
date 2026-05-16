const express = require("express");

const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.get(
  "/",
  verifyToken,
  authorizeRoles("ADMIN", "TECH"),
  dashboardController.getDashboardStats
);

module.exports = router;
