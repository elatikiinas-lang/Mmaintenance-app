const express = require("express");

const router = express.Router();

const maintenanceController = require("../controllers/maintenanceController");
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.post(
  "/",
  verifyToken,
  authorizeRoles("ADMIN"),
  maintenanceController.createMaintenance
);
router.get(
  "/",
  verifyToken,
  authorizeRoles("ADMIN", "TECH"),
  maintenanceController.getAllMaintenances
);
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "TECH"),
  maintenanceController.getMaintenanceById
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "TECH"),
  maintenanceController.updateMaintenance
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN"),
  maintenanceController.deleteMaintenance
);

module.exports = router;
