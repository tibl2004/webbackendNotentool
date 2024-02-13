const express = require("express");
const router = express.Router();

const faecherController = require("../controller/faecher.controller");

router.get("/", faecherController.getAll);
router.get("/:id", faecherController.getById);
router.get("/:id/pruefungen", faecherController.getPruefungenForFach); // Ändern Sie den Controller-Namen
router.post("/", faecherController.create);
router.put("/:id", faecherController.update);
router.delete("/:id", faecherController.remove);

module.exports = router;
