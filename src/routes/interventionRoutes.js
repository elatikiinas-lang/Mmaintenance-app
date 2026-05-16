const express = require("express");

const router = express.Router();

const interventionController = require("../controllers/interventionController");
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.post("/", verifyToken, interventionController.createIntervention);
router.get("/", verifyToken, interventionController.getAllInterventions);
router.get("/:id", verifyToken, interventionController.getInterventionById);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("ADMIN", "TECH", "USER"),
  interventionController.updateIntervention
);
router.delete("/:id", verifyToken, interventionController.deleteIntervention);

module.exports = router;
