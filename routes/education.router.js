const express = require('express');
const { educationController, authenticateToken } = require('../controller/education.controller');
const router = express.Router();

// Admin-Routen
router.post('/register-admin', educationController.registerAdmin);

// Lehrbetrieb-Routen
router.post('/register-lehrbetrieb', educationController.registerLehrbetrieb);

// Berufsbildner-Routen
router.post('/register-berufsbildner', educationController.registerBerufsbildner);

// Lernende-Routen
router.post('/register-lernender', authenticateToken, educationController.registerLernender);
router.post('/add-lernender', authenticateToken, educationController.addLernender);
router.get('/get-all-lernende', authenticateToken, educationController.getLernendeMitFaecher);

// Fach-Routen
router.post('/add-fach/:lernenderId', authenticateToken, educationController.addFach);
router.get('/faecher/:lernenderId', authenticateToken, educationController.getFaecher);
router.post('/add-note/:fachId', authenticateToken, educationController.addNote);
router.get('/noten/:fachId', authenticateToken, educationController.getNoten);

// Login-Routen
router.post('/login', educationController.login);

module.exports = router;
