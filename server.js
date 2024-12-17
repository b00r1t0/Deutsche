const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve static files from root

// Word Bank (global wordbank.json file)
const wordBankFile = path.join(__dirname, 'wordbank.json');
let wordBank = [];

// Load Word Bank data from file (if exists)
if (fs.existsSync(wordBankFile)) {
    wordBank = JSON.parse(fs.readFileSync(wordBankFile, 'utf8'));
    console.log("Loaded Word Bank Data:", wordBank);
}

// API Routes
// GET: Fetch Word Bank
app.get('/wordbank', (req, res) => {
    res.json(wordBank);
});

// POST: Save Word Bank
app.post('/wordbank', (req, res) => {
    console.log("Received Word Bank Data:", req.body);
    wordBank = req.body;
    fs.writeFileSync(wordBankFile, JSON.stringify(wordBank, null, 2)); // Save to file
    console.log("Word Bank saved to file.");
    res.status(200).send('Word Bank updated successfully!');
});

// Serve Subdirectories for Levels (e.g., a1.1, a1.2, etc.)
app.get('/:level', (req, res) => {
    const levelPath = path.join(__dirname, req.params.level, 'index.html');
    if (fs.existsSync(levelPath)) {
        res.sendFile(levelPath);
    } else {
        res.status(404).send('Level not found.');
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
