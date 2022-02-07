const express = require("express");
const router = express.Router();
const { userController } = require("../controllers");

router.put("/profile/", userController.updateProfile);
module.exports = router;
