const express = require('express');
const router = express.Router();
const { educationController, authenticateToken } = require('../controller/education.controller');

// Admin-Registrierung
router.post('/admin/register', educationController.registerAdmin);

// Berufsbildner-Registrierung
router.post('/berufsbildner/register', authenticateToken,educationController.registerBerufsbildner);

// Lernenden-Registrierung
router.post('/lernender/register', authenticateToken, educationController.registerLernender);

// Login für Admin, Berufsbildner und Lernende
router.post('/login', educationController.login);

// Lernende mit Fächern abrufen
router.get('/lernende/faecher', authenticateToken, educationController.getLernendeMitFaecher);

// Lernenden hinzufügen
router.post('/lernender/add', authenticateToken, educationController.addLernender);

// Fach hinzufügen
router.post('/fach/:lernenderId/add', authenticateToken, educationController.addFach);

// Alle Fächer eines Lernenden abrufen
router.get('/fach/:lernenderId', authenticateToken, educationController.getFaecher);

// Note hinzufügen
router.post('/note/:fachId/add', authenticateToken, educationController.addNote);

// Alle Noten eines Fachs abrufen
router.get('/note/:fachId', authenticateToken, educationController.getNoten);

module.exports = router;
