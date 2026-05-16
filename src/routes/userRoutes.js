const express = require("express");

const router = express.Router();

const userController = require("../controllers/userController");
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.get("/", verifyToken, authorizeRoles("ADMIN"), userController.getAllUsers);
router.get("/:id", verifyToken, authorizeRoles("ADMIN"), userController.getUserById);
router.post("/", verifyToken, authorizeRoles("ADMIN"), userController.createUser);
router.put("/:id", verifyToken, authorizeRoles("ADMIN"), userController.updateUser);
router.delete("/:id", verifyToken, authorizeRoles("ADMIN"), userController.deleteUser);

module.exports = router;
