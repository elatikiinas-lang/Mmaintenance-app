const express = require("express");

const router = express.Router();

const equipementController = require("../controllers/equipementController");

const verifyToken = require("../middleware/authMiddleware");


// CREATE
router.post(
  "/",
  verifyToken,
  equipementController.createEquipement
);


// GET ALL
router.get(
  "/",
  verifyToken,
  equipementController.getAllEquipements
);


// GET ONE
router.get(
  "/:id",
  verifyToken,
  equipementController.getEquipementById
);


// UPDATE
router.put(
  "/:id",
  verifyToken,
  equipementController.updateEquipement
);


// DELETE
router.delete(
  "/:id",
  verifyToken,
  equipementController.deleteEquipement
);

module.exports = router;