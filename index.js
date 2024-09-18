const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routen importieren
const examRouter = require('./routes/exam.router');
const fachRouter = require('./routes/fach.router');
const homeworkRouter = require('./routes/homework.router');
const lehrbetriebRouter = require('./routes/lehrbetrieb.router');
const lernenderRouter = require('./routes/lernender.router');
const loginRouter = require('./routes/login.router');
const markRouter = require('./routes/mark.router');
const registerRouter = require('./routes/register.router');
const teacherRouter = require('./routes/teacher.router');
const notesRouter = require('./routes/notes.router');

// Routen verwenden
app.use('/api/exam', examRouter);
app.use('/api/fach', fachRouter);
app.use('/api/homework', homeworkRouter);
app.use('/api/lehrbetriebe', lehrbetriebRouter);
app.use('/api/lernender', lernenderRouter);
app.use('/api/login', loginRouter);
app.use('/api/mark', markRouter);
app.use('/api/register', registerRouter);
app.use('/api/teacher', teacherRouter);
app.use('/api/notes', notesRouter);

// Fehlerbehandlung
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err.status === 503) {
        res.status(503).send('Dienst momentan nicht verfügbar.');
    } else {
        res.status(500).send('Etwas ist schiefgelaufen!');
    }
});

// Server starten
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}....`);
});
