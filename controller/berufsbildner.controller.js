const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../database/index'); // Pool zur Datenbankverbindung

const berufsbildnerController = {
    // Authentifizierungsmiddleware
    authenticateToken: (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; 

        if (!token) return res.status(401).json({ error: 'Kein Token bereitgestellt.' });

        jwt.verify(token, 'secretKey', (err, user) => {
            if (err) {
                console.error('Token Überprüfung fehlgeschlagen:', err);
                return res.status(403).json({ error: 'Ungültiger Token.' });
            }
            req.user = user; 
            next();
        });
    },

    // Überprüfung, ob Benutzer ein Berufsbildner ist
    checkIfBerufsbildner: (req, res, next) => {
        if (req.user.userType !== 'berufsbildner') {
            return res.status(403).json({ error: 'Zugriff verweigert: Nur Berufsbildner dürfen diese Aktion ausführen.' });
        }
        next();
    },

    // Noten eines bestimmten Lernenden abrufen
    getMarksForLernender: async (req, res) => {
        try {
            const { lernenderId } = req.params; // Lernender-ID aus den URL-Parametern

            // Abrufen der Noten für den angegebenen Lernenden
            const [noten] = await pool.query(
                "SELECT n.titel, n.note, f.fachname FROM note n JOIN fach f ON n.fach_id = f.id WHERE n.lernender_id = ?", 
                [lernenderId]
            );

            if (noten.length === 0) {
                return res.status(404).json({ message: "Keine Noten für diesen Lernenden gefunden." });
            }

            res.status(200).json({ data: noten });
        } catch (error) {
            console.error("Fehler beim Abrufen der Noten für den Lernenden:", error);
            res.status(500).json({ error: "Fehler beim Abrufen der Noten." });
        }
    },

    // Fächer eines bestimmten Lernenden abrufen
    getFaecherForLernender: async (req, res) => {
        try {
            const { lernenderId } = req.params; // Lernender-ID aus den URL-Parametern

            // Abrufen der Fächer für den angegebenen Lernenden
            const [faecher] = await pool.query(
                "SELECT id, fachname FROM fach WHERE lernender_id = ?", 
                [lernenderId]
            );

            if (faecher.length === 0) {
                return res.status(404).json({ message: "Keine Fächer für diesen Lernenden gefunden." });
            }

            res.status(200).json({ data: faecher });
        } catch (error) {
            console.error("Fehler beim Abrufen der Fächer für den Lernenden:", error);
            res.status(500).json({ error: "Fehler beim Abrufen der Fächer." });
        }
    }
};

module.exports = berufsbildnerController;
