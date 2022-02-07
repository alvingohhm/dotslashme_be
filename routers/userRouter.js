const express = require("express");
const router = express.Router();
const { userController } = require("../controllers");

router.put("/profile", userController.updateProfile);
router.get("/profile", userController.getProfile);
module.exports = router;
