const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../database/index');

const registerController = {
    authenticateToken: (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Extrahiere den Token
    
        if (!token) return res.status(401).json({ error: 'Kein Token bereitgestellt.' });
    
        jwt.verify(token, 'secretKey', (err, user) => {
            if (err) {
                console.error('Token Überprüfung Fehlgeschlagen:', err);
                return res.status(403).json({ error: 'Ungültiger Token.' });
            }
            req.user = user; // Die Benutzerinformationen aus dem Token zur Verfügung stellen
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
            const sql = `
                INSERT INTO lernender (benutzername, passwort, name, vorname, beruf, berufsschule)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const values = [benutzername, hashedPassword, name, vorname, beruf, berufsschule];
            await pool.query(sql, values);

            res.status(201).json({ message: "Lernender erfolgreich registriert." });
        } catch (error) {
            console.error("Fehler bei der Lernenden-Registrierung:", error);
            res.status(500).json({ error: "Fehler bei der Lernenden-Registrierung." });
        }
    },


};

module.exports = registerController;