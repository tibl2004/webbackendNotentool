const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../database/index');

const educationController = {
    // Lehrbetrieb registrieren
    registerLehrbetrieb: async (req, res) => {
        try {
            const { benutzername, passwort, firma, vorname, nachname, adresse, plz, ort, telefon, email } = req.body;

            // Sicherstellen, dass die E-Mail und der Benutzername einzigartig sind
            const [existingLehrbetrieb] = await pool.query("SELECT * FROM lehrbetrieb WHERE email = ? OR benutzername = ?", [email, benutzername]);
            if (existingLehrbetrieb.length > 0) {
                return res.status(400).json({ error: "E-Mail oder Benutzername bereits vergeben." });
            }

            // Passwort verschlüsseln
            const hashedPassword = await bcrypt.hash(passwort, 10);

            const sql = `
                INSERT INTO lehrbetrieb (benutzername, passwort, firma, vorname, nachname, adresse, plz, ort, telefon, email)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const values = [benutzername, hashedPassword, firma, vorname, nachname, adresse, plz, ort, telefon, email];
            await pool.query(sql, values);
            res.status(201).json({ message: "Lehrbetrieb erfolgreich registriert." });
        } catch (error) {
            console.error("Fehler bei der Registrierung des Lehrbetriebs:", error);
            res.status(500).json({ error: "Fehler bei der Registrierung des Lehrbetriebs." });
        }
    },

    // Lehrbetrieb Login
    loginLehrbetrieb: async (req, res) => {
        try {
            const { benutzername, passwort } = req.body;
            const [rows] = await pool.query("SELECT * FROM lehrbetrieb WHERE benutzername = ?", [benutzername]);

            if (rows.length === 0) {
                return res.status(401).json({ error: "Benutzername oder Passwort ist falsch." });
            }

            const lehrbetrieb = rows[0];

            // Überprüfen, ob das Passwort übereinstimmt
            const match = await bcrypt.compare(passwort, lehrbetrieb.passwort);
            if (!match) {
                return res.status(401).json({ error: "Benutzername oder Passwort ist falsch." });
            }

            const token = jwt.sign({ id: lehrbetrieb.id, role: 'lehrbetrieb' }, 'secretKey', { expiresIn: '1h' });

            res.json({ message: "Login erfolgreich", token });
        } catch (error) {
            console.error("Fehler beim Login des Lehrbetriebs:", error);
            res.status(500).json({ error: "Fehler beim Login des Lehrbetriebs." });
        }
    },

    // Berufsbildner registrieren
    registerBerufsbildner: async (req, res) => {
        try {
            const { lehrbetriebId, vorname, nachname, benutzername, passwort } = req.body;

            // Sicherstellen, dass der Benutzername einzigartig ist
            const [existingBerufsbildner] = await pool.query("SELECT * FROM berufsbildner WHERE benutzername = ?", [benutzername]);
            if (existingBerufsbildner.length > 0) {
                return res.status(400).json({ error: "Benutzername bereits vergeben." });
            }

            // Passwort verschlüsseln
            const hashedPassword = await bcrypt.hash(passwort, 10);

            const sql = `
                INSERT INTO berufsbildner (lehrbetrieb_id, vorname, nachname, benutzername, passwort)
                VALUES (?, ?, ?, ?, ?)
            `;
            const values = [lehrbetriebId, vorname, nachname, benutzername, hashedPassword];
            await pool.query(sql, values);
            res.status(201).json({ message: "Berufsbildner erfolgreich registriert." });
        } catch (error) {
            console.error("Fehler bei der Registrierung des Berufsbildners:", error);
            res.status(500).json({ error: "Fehler bei der Registrierung des Berufsbildners." });
        }
    },

    // Berufsbildner Login
    loginBerufsbildner: async (req, res) => {
        try {
            const { benutzername, passwort } = req.body;
            const [rows] = await pool.query("SELECT * FROM berufsbildner WHERE benutzername = ?", [benutzername]);

            if (rows.length === 0) {
                return res.status(401).json({ error: "Benutzername oder Passwort ist falsch." });
            }

            const berufsbildner = rows[0];

            // Überprüfen, ob das Passwort übereinstimmt
            const match = await bcrypt.compare(passwort, berufsbildner.passwort);
            if (!match) {
                return res.status(401).json({ error: "Benutzername oder Passwort ist falsch." });
            }

            const token = jwt.sign({ id: berufsbildner.id, role: 'berufsbildner' }, 'secretKey', { expiresIn: '1h' });

            res.json({ message: "Login erfolgreich", token });
        } catch (error) {
            console.error("Fehler beim Login des Berufsbildners:", error);
            res.status(500).json({ error: "Fehler beim Login des Berufsbildners." });
        }
    },

    // Lernende abrufen
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

    // Lernende mit Fächern abrufen
    getLernendeMitFaecher: async (req, res) => {
        try {
            const berufsbildnerId = req.user.id;
            const [lernende] = await pool.query("SELECT * FROM lernender WHERE berufsbildner_id = ?", [berufsbildnerId]);

            const lernendeMitFaecher = await Promise.all(lernende.map(async (lernender) => {
                const [faecher] = await pool.query("SELECT * FROM fach WHERE lernender_id = ?", [lernender.id]);
                return {
                    ...lernender,
                    faecher
                };
            }));

            res.json({ data: lernendeMitFaecher });
        } catch (error) {
            console.error("Fehler beim Abrufen der Lernenden mit Fächern:", error);
            res.status(500).json({ error: "Fehler beim Abrufen der Lernenden mit Fächern." });
        }
    },

    // Lernenden hinzufügen (Nur für Berufsbildner oder Admin)
    addLernender: async (req, res) => {
        try {
            const berufsbildnerId = req.user.id;
            const { benutzername, passwort, name, vorname, beruf, berufsschule } = req.body;
    
            // Überprüfen, ob der Benutzername bereits vergeben ist
            const [existingLernender] = await pool.query("SELECT * FROM lernender WHERE benutzername = ?", [benutzername]);
            if (existingLernender.length > 0) {
                return res.status(400).json({ error: "Benutzername bereits vergeben." });
            }
    
            // Passwort verschlüsseln
            const hashedPassword = await bcrypt.hash(passwort, 10);
    
            // SQL-Abfrage zum Einfügen eines neuen Lernenden
            const sql = `
                INSERT INTO lernender (berufsbildner_id, benutzername, passwort, name, vorname, beruf, berufsschule)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            const values = [berufsbildnerId, benutzername, hashedPassword, name, vorname, beruf, berufsschule];
            await pool.query(sql, values);
    
            res.status(201).json({ message: "Lernender erfolgreich hinzugefügt." });
        } catch (error) {
            console.error("Fehler beim Hinzufügen des Lernenden:", error);
            res.status(500).json({ error: "Fehler beim Hinzufügen des Lernenden." });
        }
    },
    
    // Fach hinzufügen (Nur für Berufsbildner)
    addFach: async (req, res) => {
        try {
            const { lernenderId } = req.params;
            const { fachName } = req.body;
            const sql = `
                INSERT INTO fach (lernender_id, name)
                VALUES (?, ?)
            `;
            const values = [lernenderId, fachName];
            await pool.query(sql, values);
            res.status(201).json({ message: "Fach erfolgreich hinzugefügt." });
        } catch (error) {
            console.error("Fehler beim Hinzufügen des Fachs:", error);
            res.status(500).json({ error: "Fehler beim Hinzufügen des Fachs." });
        }
    },

    // Alle Fächer eines Lernenden abrufen
    getFaecher: async (req, res) => {
        try {
            const lernenderId = req.params.lernenderId;
            const [rows] = await pool.query("SELECT * FROM fach WHERE lernender_id = ?", [lernenderId]);
            res.json({ data: rows });
        } catch (error) {
            console.error("Fehler beim Abrufen der Fächer:", error);
            res.status(500).json({ error: "Fehler beim Abrufen der Fächer." });
        }
    },

    // Note hinzufügen (für ein Fach)
    addNote: async (req, res) => {
        try {
            const fachId = req.params.fachId;
            const { note } = req.body;
            const sql = `
                INSERT INTO note (fach_id, note)
                VALUES (?, ?)
            `;
            const values = [fachId, note];
            await pool.query(sql, values);
            res.status(201).json({ message: "Note erfolgreich hinzugefügt." });
        } catch (error) {
            console.error("Fehler beim Hinzufügen der Note:", error);
            res.status(500).json({ error: "Fehler beim Hinzufügen der Note." });
        }
    },

    // Alle Noten eines Fachs abrufen
    getNoten: async (req, res) => {
        try {
            const fachId = req.params.fachId;
            const [rows] = await pool.query("SELECT * FROM note WHERE fach_id = ?", [fachId]);
            res.json({ data: rows });
        } catch (error) {
            console.error("Fehler beim Abrufen der Noten:", error);
            res.status(500).json({ error: "Fehler beim Abrufen der Noten." });
        }
    },

    // Alle Lehrbetriebe abrufen
    getAllLehrbetriebe: async (req, res) => {
        try {
            const [rows] = await pool.query("SELECT * FROM lehrbetrieb");
            res.json({ data: rows });
        } catch (error) {
            console.error("Fehler beim Abrufen der Lehrbetriebe:", error);
            res.status(500).json({ error: "Fehler beim Abrufen der Lehrbetriebe." });
        }
    },

    // Lehrbetrieb-Details abrufen
    getLehrbetriebById: async (req, res) => {
        try {
            const lehrbetriebId = req.params.lehrbetriebId;
            const [rows] = await pool.query("SELECT * FROM lehrbetrieb WHERE id = ?", [lehrbetriebId]);
            if (rows.length === 0) {
                return res.status(404).json({ error: "Lehrbetrieb nicht gefunden." });
            }
            res.json({ data: rows[0] });
        } catch (error) {
            console.error("Fehler beim Abrufen der Lehrbetrieb-Details:", error);
            res.status(500).json({ error: "Fehler beim Abrufen der Lehrbetrieb-Details." });
        }
    },

    // Berufsbildner eines Lehrbetriebs abrufen
    getBerufsbildnerByLehrbetrieb: async (req, res) => {
        try {
            const lehrbetriebId = req.params.lehrbetriebId;
            const [rows] = await pool.query("SELECT * FROM berufsbildner WHERE lehrbetrieb_id = ?", [lehrbetriebId]);
            res.json({ data: rows });
        } catch (error) {
            console.error("Fehler beim Abrufen der Berufsbildner:", error);
            res.status(500).json({ error: "Fehler beim Abrufen der Berufsbildner." });
        }
    }
};

// Middleware zum Überprüfen des Tokens
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, 'secretKey', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

module.exports = { educationController, authenticateToken };
