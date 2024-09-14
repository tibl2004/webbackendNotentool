const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../database/index'); // Pool zur Datenbankverbindung

const examController = {
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

    // Prüfung erstellen (mit FachID)
    createExam: async (req, res) => {
        try {
            const lernenderId = req.user.id; // Authentifizierter Lernender
            const { titel, beschreibung, datum, fach_id } = req.body; // FachID wird vom Frontend übergeben

            const sql = `
                INSERT INTO pruefung (lernender_id, titel, beschreibung, datum, fach_id)
                VALUES (?, ?, ?, ?, ?)
            `;
            const values = [lernenderId, titel, beschreibung, datum, fach_id]; 
            await pool.query(sql, values);

            res.status(201).json({ message: "Prüfung erfolgreich erstellt." });
        } catch (error) {
            console.error("Fehler beim Erstellen der Prüfung:", error);
            res.status(500).json({ error: "Fehler beim Erstellen der Prüfung." });
        }
    },

    // Alle Prüfungen für einen Lernenden abrufen
    getExamsByLernenderId: async (req, res) => {
        try {
            const lernenderId = req.user.id; // Authentifizierter Lernender
            const [exams] = await pool.query("SELECT * FROM pruefung WHERE lernender_id = ?", [lernenderId]);

            res.json({ data: exams });
        } catch (error) {
            console.error("Fehler beim Abrufen der Prüfungen:", error);
            res.status(500).json({ error: "Fehler beim Abrufen der Prüfungen." });
        }
    },

    // Alle Prüfungen abrufen (mit Authentifizierung)
    getExams: async (req, res) => {
        try {
            const [exams] = await pool.query("SELECT * FROM pruefung");

            res.json({ data: exams });
        } catch (error) {
            console.error("Fehler beim Abrufen aller Prüfungen:", error);
            res.status(500).json({ error: "Fehler beim Abrufen aller Prüfungen." });
        }
    },

    // Prüfung nach ID abrufen
    getExamById: async (req, res) => {
        try {
            const { examId } = req.params;
            const lernenderId = req.user.id;
            const [exam] = await pool.query("SELECT * FROM pruefung WHERE id = ? AND lernender_id = ?", [examId, lernenderId]);

            if (exam.length === 0) {
                return res.status(404).json({ error: "Prüfung nicht gefunden oder nicht autorisiert." });
            }

            res.json({ data: exam[0] });
        } catch (error) {
            console.error("Fehler beim Abrufen der Prüfung:", error);
            res.status(500).json({ error: "Fehler beim Abrufen der Prüfung." });
        }
    },

    // Prüfung aktualisieren
    updateExam: async (req, res) => {
        try {
            const { examId } = req.params;
            const { titel, beschreibung, datum, fach_id } = req.body;
            const lernenderId = req.user.id;

            const sql = `
                UPDATE pruefung
                SET titel = ?, beschreibung = ?, datum = ?, fach_id = ?
                WHERE id = ? AND lernender_id = ?
            `;
            const values = [titel, beschreibung, datum, fach_id, examId, lernenderId];
            await pool.query(sql, values);

            res.status(200).json({ message: "Prüfung erfolgreich aktualisiert." });
        } catch (error) {
            console.error("Fehler beim Aktualisieren der Prüfung:", error);
            res.status(500).json({ error: "Fehler beim Aktualisieren der Prüfung." });
        }
    },

    // Prüfung löschen
    deleteExam: async (req, res) => {
        try {
            const { examId } = req.params;
            const lernenderId = req.user.id;

            const sql = `
                DELETE FROM pruefung
                WHERE id = ? AND lernender_id = ?
            `;
            const values = [examId, lernenderId];
            await pool.query(sql, values);

            res.status(200).json({ message: "Prüfung erfolgreich gelöscht." });
        } catch (error) {
            console.error("Fehler beim Löschen der Prüfung:", error);
            res.status(500).json({ error: "Fehler beim Löschen der Prüfung." });
        }
    }
};

module.exports = examController;
