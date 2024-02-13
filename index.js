const express = require("express");
const cors = require("cors");
const app = express();

require('dotenv').config();

app.use(cors()); // CORS-Middleware aktivieren

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const faecherRouter = require('./routes/faecher.router');
const authRouter = require('./routes/auth.router');

app.use("/api/v1/faecher", faecherRouter);
app.use("/api/v1/auth", authRouter);

const PORT = process.env.PORT || 3307; // Verwenden Sie einen anderen freien Port

app.listen(PORT, () => {
    console.log("Server is running....");
});
