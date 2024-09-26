const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../database/index');

const registerController = {
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

    // Admin-Registrierung
    registerAdmin: async (req, res) => {
        try {
            const { benutzername, passwort } = req.body;

            const [existingAdmin] = await pool.query("SELECT * FROM admin WHERE benutzername = ?", [benutzername]);
            if (existingAdmin.length > 0) {
                return res.status(400).json({ error: "Benutzername bereits vergeben." });
            }

            const hashedPassword = await bcrypt.hash(passwort, 10);
            const sql = "INSERT INTO admin (benutzername, passwort) VALUES (?, ?)";
            await pool.query(sql, [benutzername, hashedPassword]);

            res.status(201).json({ message: "Admin erfolgreich registriert." });
        } catch (error) {
            console.error("Fehler bei der Admin-Registrierung:", error);
            res.status(500).json({ error: "Fehler bei der Admin-Registrierung." });
        }
    },

    // Lehrbetrieb-Registrierung
    registerLehrbetrieb: async (req, res) => {
        try {
            const { name, adresse, benutzername, passwort } = req.body;

            const [existingLehrbetrieb] = await pool.query("SELECT * FROM lehrbetrieb WHERE benutzername = ?", [benutzername]);
            if (existingLehrbetrieb.length > 0) {
                return res.status(400).json({ error: "Benutzername bereits vergeben." });
            }

            const hashedPassword = await bcrypt.hash(passwort, 10);
            const licenseCode = generateLicenseCode();
            const sql = `
                INSERT INTO lehrbetrieb (name, adresse, benutzername, passwort, lizenz_code, licenseActive)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            await pool.query(sql, [name, adresse, benutzername, hashedPassword, licenseCode, false]);

            res.status(201).json({ message: "Lehrbetrieb erfolgreich registriert.", licenseCode });
        } catch (error) {
            console.error("Fehler bei der Lehrbetrieb-Registrierung:", error);
            res.status(500).json({ error: "Fehler bei der Lehrbetrieb-Registrierung." });
        }
    },

    // Berufsbildner-Registrierung
    registerBerufsbildner: async (req, res) => {
        try {
            const { benutzername, passwort, name, vorname, lehrbetriebId } = req.body;

            const [existingBerufsbildner] = await pool.query("SELECT * FROM berufsbildner WHERE benutzername = ?", [benutzername]);
            if (existingBerufsbildner.length > 0) {
                return res.status(400).json({ error: "Benutzername bereits vergeben." });
            }

            const hashedPassword = await bcrypt.hash(passwort, 10);
            const sql = "INSERT INTO berufsbildner (lehrbetrieb_id, benutzername, passwort, name, vorname) VALUES (?, ?, ?, ?, ?)";
            await pool.query(sql, [lehrbetriebId, benutzername, hashedPassword, name, vorname]);

            res.status(201).json({ message: "Berufsbildner erfolgreich registriert." });
        } catch (error) {
            console.error("Fehler bei der Berufsbildner-Registrierung:", error);
            res.status(500).json({ error: "Fehler bei der Berufsbildner-Registrierung." });
        }
    },

    // Lehrbetrieb kann Lernende hinzufügen
    registerLernender: async (req, res) => {
        try {
            const { benutzername, passwort, name, vorname, beruf, berufsschule } = req.body;

            if (req.user.userType !== 'lehrbetrieb') {
                return res.status(403).json({ error: 'Zugriff verweigert: Nur Lehrbetrieb kann Lernende hinzufügen.' });
            }

            const [existingLernender] = await pool.query("SELECT * FROM lernender WHERE benutzername = ?", [benutzername]);
            if (existingLernender.length > 0) {
                return res.status(400).json({ error: "Benutzername bereits vergeben." });
            }

            const hashedPassword = await bcrypt.hash(passwort, 10);
            const sql = "INSERT INTO lernender (benutzername, passwort, name, vorname, beruf, berufsschule) VALUES (?, ?, ?, ?, ?, ?)";
            await pool.query(sql, [benutzername, hashedPassword, name, vorname, beruf, berufsschule]);

            res.status(201).json({ message: "Lernender erfolgreich registriert." });
        } catch (error) {
            console.error("Fehler bei der Lernenden-Registrierung:", error);
            res.status(500).json({ error: "Fehler bei der Lernenden-Registrierung." });
        }
    },

    activateLicense: async (req, res) => {
        const { licenseCode } = req.body;
    
        try {
            const [lehrbetrieb] = await pool.query("SELECT * FROM lehrbetrieb WHERE lizenz_code = ?", [licenseCode]);

            if (!lehrbetrieb || lehrbetrieb.length === 0) {
                return res.status(404).json({ error: "Lehrbetrieb mit diesem Lizenzcode nicht gefunden." });
            }

            if (lehrbetrieb[0].licenseActive) {
                return res.status(400).json({ error: "Die Lizenz ist bereits aktiviert." });
            }

            await pool.query("UPDATE lehrbetrieb SET licenseActive = ? WHERE id = ?", [true, lehrbetrieb[0].id]);

            res.status(200).json({ message: "Lizenz erfolgreich aktiviert." });
        } catch (error) {
            console.error("Fehler bei der Lizenzaktivierung:", error);
            res.status(500).json({ error: "Fehler bei der Lizenzaktivierung." });
        }
    },

    getLicenseStatus: async (req, res) => {
        const { licenseCode } = req.body;
    
        try {
            // Suche nach dem Lehrbetrieb mit dem angegebenen Lizenzcode
            const [lehrbetrieb] = await pool.query("SELECT * FROM lehrbetrieb WHERE lizenz_code = ?", [licenseCode]);
    
            // Überprüfe, ob der Lehrbetrieb mit dem Lizenzcode existiert
            if (!lehrbetrieb || lehrbetrieb.length === 0) {
                return res.status(404).json({ error: "Lehrbetrieb mit diesem Lizenzcode nicht gefunden." });
            }
    
            // Gibt den aktuellen Status der Lizenz zurück
            const licenseStatus = lehrbetrieb[0].licenseActive;
            res.status(200).json({ licenseActive: licenseStatus });
        } catch (error) {
            console.error("Fehler beim Abrufen des Lizenzstatus:", error);
            res.status(500).json({ error: "Fehler beim Abrufen des Lizenzstatus." });
        }
    },
};

// Hilfsfunktion zur Generierung eines Lizenzcodes
function generateLicenseCode() {
    const generateSegment = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let segment = '';
        for (let i = 0; i < 4; i++) {
            segment += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return segment;
    };
    return `${generateSegment()}-${generateSegment()}-${generateSegment()}-${generateSegment()}-${generateSegment()}-${generateSegment()}`;
}

module.exports = registerController;
