const express = require('express');
const { educationController, authenticateToken } = require('../controllers/education.controller');

const router = express.Router();

// Route für das Abrufen aller Lehrbetriebe
router.get('/lehrbetriebe', authenticateToken, educationController.getAllLehrbetriebe);

// Weitere vorhandene Routen...
router.post('/register', educationController.register);
router.post('/login', educationController.login);
router.get('/lernende', authenticateToken, educationController.getLernende);
router.post('/lernende/:lehrbetriebId', authenticateToken, educationController.addLernender);
router.post('/fach/:lernenderId', authenticateToken, educationController.addFach);
router.post('/note/:fachId', authenticateToken, educationController.addNote);

module.exports = router;
