const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../database/index');

const loginController = {
    authenticateToken: (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Extrahiere den Token

        if (!token) return res.status(401).json({ error: 'Kein Token bereitgestellt.' });

        jwt.verify(token, 'secretKey', (err, user) => {
            if (err) {
                console.error('Token Überprüfung Fehlgeschlagen:', err);
                return res.status(403).json({ error: 'Ungültiger Token.' });
            }
            req.user = user; // Benutzerinformationen aus dem Token zur Verfügung stellen
            next();
        });
    },

    // Login für Admin, Berufsbildner, Lernende und Lehrbetrieb
    login: async (req, res) => {
        try {
            const { benutzername, passwort } = req.body;

            // Versuche, den Benutzer in allen Tabellen zu finden
            const [admin] = await pool.query("SELECT * FROM admin WHERE benutzername = ?", [benutzername]);
            const [berufsbildner] = await pool.query("SELECT * FROM berufsbildner WHERE benutzername = ?", [benutzername]);
            const [lernender] = await pool.query("SELECT * FROM lernender WHERE benutzername = ?", [benutzername]);
            const [lehrbetrieb] = await pool.query("SELECT * FROM lehrbetrieb WHERE benutzername = ?", [benutzername]);

            let user = null;
            let userType = null;

            if (admin.length > 0) {
                user = admin[0];
                userType = 'admin';
            } else if (berufsbildner.length > 0) {
                user = berufsbildner[0];
                userType = 'berufsbildner';
            } else if (lernender.length > 0) {
                user = lernender[0];
                userType = 'lernender';
            } else if (lehrbetrieb.length > 0) {
                user = lehrbetrieb[0];
                userType = 'lehrbetrieb';
            } else {
                return res.status(400).json({ error: "Benutzername oder Passwort falsch." });
            }

            // Überprüfe das Passwort
            const validPassword = await bcrypt.compare(passwort, user.passwort);
            if (!validPassword) {
                return res.status(400).json({ error: "Benutzername oder Passwort falsch." });
            }

            // Lizenzstatus überprüfen
            const licenseActive = user.licenseActive; // Hier den Lizenzstatus abfragen
            if (!licenseActive) {
                return res.status(403).json({ error: "Lizenz nicht aktiviert. Bitte aktivieren Sie Ihre Lizenz." });
            }

            // Erstelle das Token-Payload
            const tokenPayload = {
                id: user.id,
                benutzername: user.benutzername,
                userType,
                licenseActive, // Lizenzstatus zum Payload hinzufügen
                ...user // Alle anderen Benutzerinformationen hinzufügen
            };

            const token = jwt.sign(tokenPayload, 'secretKey', { expiresIn: '24h' });
            res.json({ token, userType, licenseActive }); // Lizenzstatus in der Antwort zurückgeben
        } catch (error) {
            console.error("Fehler beim Login:", error);
            res.status(500).json({ error: "Fehler beim Login." });
        }
    }
};

module.exports = loginController;