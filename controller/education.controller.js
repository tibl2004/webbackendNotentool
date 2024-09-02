const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../database/index');

const educationController = {
    // Registrierung eines Berufsbildners
    registerBerufsbildner: async (req, res) => {
        try {
            const { lehrbetriebId, benutzername, passwort } = req.body;

            // Sicherstellen, dass der Benutzername einzigartig ist
            const [existingUser] = await pool.query("SELECT * FROM berufsbildner WHERE benutzername = ?", [benutzername]);
            if (existingUser.length > 0) {
                return res.status(400).json({ error: "Benutzername bereits vergeben." });
            }

            const sql = `
                INSERT INTO berufsbildner (lehrbetrieb_id, benutzername, passwort)
                VALUES (?, ?, ?)
            `;
            const values = [lehrbetriebId, benutzername, passwort];
            await pool.query(sql, values);
            res.status(201).json({ message: "Berufsbildner erfolgreich registriert." });
        } catch (error) {
            console.error("Fehler bei der Registrierung des Berufsbildners:", error);
            res.status(500).json({ error: "Fehler bei der Registrierung des Berufsbildners." });
        }
    },

    // Login eines Berufsbildners
    loginBerufsbildner: async (req, res) => {
        try {
            const { benutzername, passwort } = req.body;
            const [rows] = await pool.query("SELECT * FROM berufsbildner WHERE benutzername = ?", [benutzername]);

            if (rows.length === 0) {
                return res.status(401).json({ error: "Benutzername oder Passwort ist falsch." });
            }

            const berufsbildner = rows[0];

            // Überprüfen, ob das Passwort übereinstimmt
            if (berufsbildner.passwort !== passwort) {
                return res.status(401).json({ error: "Benutzername oder Passwort ist falsch." });
            }

            const token = jwt.sign({ id: berufsbildner.id }, 'secretKey', { expiresIn: '1h' });

            res.json({ message: "Login erfolgreich", token });
        } catch (error) {
            console.error("Fehler beim Login des Berufsbildners:", error);
            res.status(500).json({ error: "Fehler beim Login des Berufsbildners." });
        }
    },

    // Alle Lernenden des Berufsbildners abrufen
    getLernende: async (req, res) => {
        try {
            const berufsbildnerId = req.user.id;
            const [rows] = await pool.query("SELECT * FROM lernender WHERE berufsbildner_id = ?", [berufsbildnerId]);
            res.json({ data: rows });
        } catch (error) {
            console.error("Fehler beim Abrufen der Lernenden:", error);
            res.status(500).json({ error: "Fehler beim Abrufen der Lernenden." });
        }
    },

    // Lernenden hinzufügen
    addLernender: async (req, res) => {
        try {
            const { name } = req.body;
            const berufsbildnerId = req.user.id;
            const sql = `
                INSERT INTO lernender (berufsbildner_id, name)
                VALUES (?, ?)
            `;
            const values = [berufsbildnerId, name];
            await pool.query(sql, values);
            res.status(201).json({ message: "Lernender erfolgreich hinzugefügt." });
        } catch (error) {
            console.error("Fehler beim Hinzufügen des Lernenden:", error);
            res.status(500).json({ error: "Fehler beim Hinzufügen des Lernenden." });
        }
    },

    // Fächer eines Lernenden abrufen
    getFächer: async (req, res) => {
        try {
            const { lernenderId } = req.params;
            const [rows] = await pool.query("SELECT * FROM fach WHERE lernender_id = ?", [lernenderId]);
            res.json({ data: rows });
        } catch (error) {
            console.error("Fehler beim Abrufen der Fächer:", error);
            res.status(500).json({ error: "Fehler beim Abrufen der Fächer." });
        }
    },

    // Noten zu einem Fach hinzufügen
    addNote: async (req, res) => {
        try {
            const { fachId } = req.params;
            const { datum, note, titel } = req.body;
            const sql = `
                INSERT INTO note (fach_id, datum, note, titel)
                VALUES (?, ?, ?, ?)
            `;
            const values = [fachId, datum, note, titel];
            await pool.query(sql, values);
            res.status(201).json({ message: "Note erfolgreich hinzugefügt." });
        } catch (error) {
            console.error("Fehler beim Hinzufügen der Note:", error);
            res.status(500).json({ error: "Fehler beim Hinzufügen der Note." });
        }
    }
};

// Middleware zur Authentifizierung
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) return res.status(401).json({ error: "Zugriff verweigert" });

    jwt.verify(token, 'secretKey', (err, user) => {
        if (err) return res.status(403).json({ error: "Token ist ungültig" });
        req.user = user;
        next();
    });
}

module.exports = { educationController, authenticateToken };
