const express = require("express");
const router = express.Router();

const challengesController = require("../controller/challenges.controller");

router.get("/", challengesController.getAll);
router.get("/:id", challengesController.getById);
router.post("/", challengesController.create);
router.put("/:id", challengesController.update);
router.delete("/:id", challengesController.delete);

module.exports = router;