const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routen importieren
const educationRouter = require('./routes/education.router');
const homeworkRouter = require('./routes/homework.router');
const examRouter = require('./routes/exam.router');

// Routen zuweisen
app.use('/api/education', educationRouter);
app.use('/api/homework', homeworkRouter);
app.use('/api/exam', examRouter)

// Fehlerbehandlung
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Etwas ist schiefgelaufen!');
});

// Server starten
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}....`);
});
