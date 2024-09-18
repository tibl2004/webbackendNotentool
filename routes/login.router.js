const express = require('express');
const router = express.Router();
const loginController = require('../controller/login.controller');


// Routen
router.post('/', loginController.login); // Login für Admin, Berufsbildner, Lernende und Lehrbetrieb

module.exports = router;
