const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../database/index');

const educationController = {
    // Middleware zur Authentifizierung des Tokens
    authenticateToken: (req, res, next) => {
        const token = req.headers['authorization'];
        if (!token) return res.status(401).json({ error: 'Kein Token bereitgestellt.' });

        jwt.verify(token, 'secretKey', (err, user) => {
            if (err) return res.status(403).json({ error: 'Ungültiger Token.' });
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
            const sql = `
                INSERT INTO admin (benutzername, passwort)
                VALUES (?, ?)
            `;
            const values = [benutzername, hashedPassword];
            await pool.query(sql, values);

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
            const sql = `
                INSERT INTO lehrbetrieb (name, adresse, benutzername, passwort)
                VALUES (?, ?, ?, ?)
            `;
            const values = [name, adresse, benutzername, hashedPassword];
            await pool.query(sql, values);

            res.status(201).json({ message: "Lehrbetrieb erfolgreich registriert." });
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
            const sql = `
                INSERT INTO berufsbildner (lehrbetrieb_id, benutzername, passwort, name, vorname)
                VALUES (?, ?, ?, ?, ?)
            `;
            const values = [lehrbetriebId, benutzername, hashedPassword, name, vorname];
            await pool.query(sql, values);

            res.status(201).json({ message: "Berufsbildner erfolgreich registriert." });
        } catch (error) {
            console.error("Fehler bei der Berufsbildner-Registrierung:", error);
            res.status(500).json({ error: "Fehler bei der Berufsbildner-Registrierung." });
        }
    },

    // Lernenden-Registrierung
    registerLernender: async (req, res) => {
        try {
            const berufsbildnerId = req.user.id; // Authentifizierter Berufsbildner
            const { benutzername, passwort, name, vorname, beruf, berufsschule } = req.body;

            const [existingLernender] = await pool.query("SELECT * FROM lernender WHERE benutzername = ?", [benutzername]);
            if (existingLernender.length > 0) {
                return res.status(400).json({ error: "Benutzername bereits vergeben." });
            }

            const hashedPassword = await bcrypt.hash(passwort, 10);
            const sql = `
                INSERT INTO lernender (berufsbildner_id, benutzername, passwort, name, vorname, beruf, berufsschule)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            const values = [berufsbildnerId, benutzername, hashedPassword, name, vorname, beruf, berufsschule];
            await pool.query(sql, values);

            res.status(201).json({ message: "Lernender erfolgreich registriert." });
        } catch (error) {
            console.error("Fehler bei der Lernenden-Registrierung:", error);
            res.status(500).json({ error: "Fehler bei der Lernenden-Registrierung." });
        }
    },

    // Login für Admin, Berufsbildner, Lernende und Lehrbetrieb
    login: async (req, res) => {
        try {
            const { benutzername, passwort } = req.body;

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

            const validPassword = await bcrypt.compare(passwort, user.passwort);
            if (!validPassword) {
                return res.status(400).json({ error: "Benutzername oder Passwort falsch." });
            }

            const token = jwt.sign({ id: user.id, benutzername: user.benutzername, userType }, 'secretKey', { expiresIn: '1h' });
            res.json({ token, userType });
        } catch (error) {
            console.error("Fehler beim Login:", error);
            res.status(500).json({ error: "Fehler beim Login." });
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

    // Lernenden hinzufügen
    addLernender: async (req, res) => {
        try {
            const berufsbildnerId = req.user.id;
            const { benutzername, passwort, name, vorname, beruf, berufsschule } = req.body;

            const [existingLernender] = await pool.query("SELECT * FROM lernender WHERE benutzername = ?", [benutzername]);
            if (existingLernender.length > 0) {
                return res.status(400).json({ error: "Benutzername bereits vergeben." });
            }

            const hashedPassword = await bcrypt.hash(passwort, 10);
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

    // Fach hinzufügen
    addFach: async (req, res) => {
        try {
            const { lernenderId } = req.params;
            const { name } = req.body;

            const sql = `
                INSERT INTO fach (lernender_id, name)
                VALUES (?, ?)
            `;
            const values = [lernenderId, name];
            await pool.query(sql, values);

            res.status(201).json({ message: "Fach erfolgreich hinzugefügt." });
        } catch (error) {
            console.error("Fehler beim Hinzufügen des Fachs:", error);
            res.status(500).json({ error: "Fehler beim Hinzufügen des Fachs." });
        }
    },

    // Note hinzufügen
    addNote: async (req, res) => {
        try {
            const { lernenderId, fachId } = req.params;
            const { note } = req.body;

            const [fach] = await pool.query(`
                SELECT * FROM fach WHERE id = ? AND lernender_id = ?
            `, [fachId, lernenderId]);

            if (fach.length === 0) {
                return res.status(404).json({ error: "Fach für diesen Lernenden nicht gefunden." });
            }

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
    }
};

module.exports = educationController;
