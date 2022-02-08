const express = require("express");
const router = express.Router();
const { userController } = require("../controllers");

router.put("/profile", userController.updateProfile);
router.get("/profile", userController.getProfile);

router.put("/summary", userController.updateSummary);
router.get("/summary", userController.getSummary);

router.post("/skill", userController.createSkill);
router.get("/skills", userController.getSkills);
router.get("/skill/:id", userController.getOneSkill);
router.put("/skill/:id", userController.updateSkill);

router.post("/showcase", userController.createShowcase);
router.get("/showcases", userController.getShowcases);
router.get("/showcase/:id", userController.getOneShowcase);
router.put("/showcase/:id", userController.updateShowcase);

module.exports = router;
