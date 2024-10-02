const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../database/index'); // Pool zur Datenbankverbindung

const lernenderController = {
    // Authentifizierungsmiddleware
    authenticateToken: (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) return res.status(401).json({ error: 'Kein Token bereitgestellt.' });

        jwt.verify(token, 'secretKey', (err, user) => {
            if (err) {
                console.error('Token Überprüfung Fehlgeschlagen:', err);
                return res.status(403).json({ error: 'Ungültiger Token.' });
            }
            req.user = user;
            next();
        });
    },

    

    // Lernender mit ID abrufen
    getLernenderById: async (req, res) => {
        try {
            const { id } = req.params; // Lernende-ID aus URL-Parametern

            // Abrufen des Lernenden basierend auf der ID
            const [lernender] = await pool.query("SELECT * FROM lernender WHERE id = ?", [id]);

            if (lernender.length === 0) {
                return res.status(404).json({ message: "Lernender nicht gefunden." });
            }

            res.status(200).json({ data: lernender[0] });
        } catch (error) {
            console.error("Fehler beim Abrufen des Lernenden:", error);
            res.status(500).json({ error: "Fehler beim Abrufen des Lernenden." });
        }
    },

  
};

module.exports = lernenderController;
