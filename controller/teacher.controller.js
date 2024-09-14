const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../database/index'); // Pool zur Datenbankverbindung

const teacherController = {
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

    // Lehrer erstellen (mit LernenderID)
    createTeacher: async (req, res) => {
        try {
            const lernenderId = req.user.id; // Authentifizierter Lernender
            const { imglink, vorname, name, email } = req.body;

            const sql = `
                INSERT INTO lehrer (lernender_id, img_link, vorname, name, email)
                VALUES (?, ?, ?, ?, ?)
            `;
            const values = [lernenderId, imglink, vorname, name, email];
            await pool.query(sql, values);

            res.status(201).json({ message: "Lehrer erfolgreich erstellt." });
        } catch (error) {
            console.error("Fehler beim Erstellen des Lehrers:", error);
            res.status(500).json({ error: "Fehler beim Erstellen des Lehrers." });
        }
    },

    // Alle Lehrer für einen Lernenden abrufen
    getTeachersByLernenderId: async (req, res) => {
        try {
            const lernenderId = req.user.id; // Authentifizierter Lernender
            const [teachers] = await pool.query("SELECT * FROM lehrer WHERE lernender_id = ?", [lernenderId]);

            res.json({ data: teachers });
        } catch (error) {
            console.error("Fehler beim Abrufen der Lehrer:", error);
            res.status(500).json({ error: "Fehler beim Abrufen der Lehrer." });
        }
    },

    // Alle Lehrer abrufen
    getAllTeachers: async (req, res) => {
        try {
            const [teachers] = await pool.query("SELECT * FROM lehrer");

            res.json({ data: teachers });
        } catch (error) {
            console.error("Fehler beim Abrufen aller Lehrer:", error);
            res.status(500).json({ error: "Fehler beim Abrufen aller Lehrer." });
        }
    },

    // Lehrer nach ID abrufen
    getTeacherById: async (req, res) => {
        try {
            const { teacherId } = req.params;
            const lernenderId = req.user.id;
            const [teacher] = await pool.query("SELECT * FROM lehrer WHERE id = ? AND lernender_id = ?", [teacherId, lernenderId]);

            if (teacher.length === 0) {
                return res.status(404).json({ error: "Lehrer nicht gefunden oder nicht autorisiert." });
            }

            res.json({ data: teacher[0] });
        } catch (error) {
            console.error("Fehler beim Abrufen des Lehrers:", error);
            res.status(500).json({ error: "Fehler beim Abrufen des Lehrers." });
        }
    },

    // Lehrer aktualisieren
    updateTeacher: async (req, res) => {
        try {
            const { teacherId } = req.params;
            const { imglink, vorname, name, email } = req.body;
            const lernenderId = req.user.id;

            const sql = `
                UPDATE lehrer
                SET img_link = ?, vorname = ?, name = ?, email = ?
                WHERE id = ? AND lernender_id = ?
            `;
            const values = [imglink, vorname, name, email, teacherId, lernenderId];
            await pool.query(sql, values);

            res.status(200).json({ message: "Lehrer erfolgreich aktualisiert." });
        } catch (error) {
            console.error("Fehler beim Aktualisieren des Lehrers:", error);
            res.status(500).json({ error: "Fehler beim Aktualisieren des Lehrers." });
        }
    },

    // Lehrer löschen
    deleteTeacher: async (req, res) => {
        try {
            const { teacherId } = req.params;
            const lernenderId = req.user.id;

            const sql = `
                DELETE FROM lehrer
                WHERE id = ? AND lernender_id = ?
            `;
            const values = [teacherId, lernenderId];
            await pool.query(sql, values);

            res.status(200).json({ message: "Lehrer erfolgreich gelöscht." });
        } catch (error) {
            console.error("Fehler beim Löschen des Lehrers:", error);
            res.status(500).json({ error: "Fehler beim Löschen des Lehrers." });
        }
    }
};

module.exports = teacherController;
