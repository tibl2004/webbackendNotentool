const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../database/index'); // Pool zur Datenbankverbindung

const fachController = {
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


    getFaecher: async (req, res) => {
        try {
            const lernenderId = req.user.id; // Lernenden-ID aus dem Token

            // Abrufen der Fächer für den angegebenen Lernenden
            const [faecher] = await pool.query("SELECT id, fachname FROM fach WHERE lernender_id = ?", [lernenderId]);

            // Rückgabe der Fächer
            res.json({ data: faecher });
        } catch (error) {
            console.error("Fehler beim Abrufen der Fächer für den Lernenden:", error);
            res.status(500).json({ error: "Fehler beim Abrufen der Fächer für den Lernenden." });
        }
    },


    addFach: async (req, res) => {
        try {
            const { fachname } = req.body; // Fachname aus dem Request-Body
            const lernenderId = req.user.id; // Lernenden-ID aus dem JWT-Token
    
            // Überprüfen, ob der Benutzer ein Lehrbetrieb oder Berufsbildner ist
            if (req.user.userType !== 'lehrbetrieb' && req.user.userType !== 'berufsbildner') {
                return res.status(403).json({ error: 'Zugriff verweigert: Nur Lehrbetrieb oder Berufsbildner können Fächer hinzufügen.' });
            }
    
            // SQL-Query zum Hinzufügen des Fachs
            const sql = `
                INSERT INTO fach (lernender_id, fachname)
                VALUES (?, ?)
            `;
            const values = [lernenderId, fachname];
            await pool.query(sql, values);
    
            res.status(201).json({ message: "Fach erfolgreich hinzugefügt." });
        } catch (error) {
            console.error("Fehler beim Hinzufügen des Fachs:", error);
            res.status(500).json({ error: "Fehler beim Hinzufügen des Fachs." });
        }
    }
    


    // Fach aktualisieren
    updateFach: async (req, res) => {
        try {
            const { fachId } = req.params;
            const { fachname } = req.body;

            const sql = `
                UPDATE fach 
                SET fachname = ?
                WHERE id = ?
            `;
            const values = [fachname, fachId];
            await pool.query(sql, values);

            res.status(200).json({ message: "Fach erfolgreich aktualisiert." });
        } catch (error) {
            console.error("Fehler beim Aktualisieren des Fachs:", error);
            res.status(500).json({ error: "Fehler beim Aktualisieren des Fachs." });
        }
    },

    // Fach löschen
    deleteFach: async (req, res) => {
        try {
            const { fachId } = req.params;

            const sql = `
                DELETE FROM fach 
                WHERE id = ?
            `;
            const values = [fachId];
            await pool.query(sql, values);

            res.status(200).json({ message: "Fach erfolgreich gelöscht." });
        } catch (error) {
            console.error("Fehler beim Löschen des Fachs:", error);
            res.status(500).json({ error: "Fehler beim Löschen des Fachs." });
        }
    }
};

module.exports = fachController;
