 


    // Lernende abrufen (mit Authentifizierung)
getLernende: async (req, res) => {
    try {
        const berufsbildnerId = req.user.id; // Authentifizierter Berufsbildner

        // Abrufen aller Lernenden, die dem Berufsbildner zugeordnet sind
        const [lernende] = await pool.query("SELECT * FROM lernender WHERE berufsbildner_id = ?", [berufsbildnerId]);

        if (lernende.length === 0) {
            return res.status(404).json({ message: "Keine Lernenden gefunden." });
        }

        res.status(200).json({ data: lernende });
    } catch (error) {
        console.error("Fehler beim Abrufen der Lernenden:", error);
        res.status(500).json({ error: "Fehler beim Abrufen der Lernenden." });
    }
},

