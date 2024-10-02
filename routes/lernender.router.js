const express = require('express');
const router = express.Router();
const lernenderController = require('../controller/lernender.controller');

// Middleware zur Authentifizierung
router.use(lernenderController.authenticateToken);

router.get('/:id', lernenderController.getLernenderById);  // Lernenden abrufen

module.exports = router;
