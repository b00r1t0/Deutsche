const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000; // Use environment variable for Render or default to 3000

// Debug: Print the current directory
console.log("Current directory:", __dirname);

// Middleware
app.use(cors()); // Allow requests from other origins (e.g., your frontend)
app.use(bodyParser.json()); // Parse JSON requests

// In-memory storage for Word Bank (or load from file)
let wordBank = [];

// Load Word Bank data from a file (if exists)
if (fs.existsSync('wordbank.json')) {
    wordBank = JSON.parse(fs.readFileSync('wordbank.json', 'utf8'));
    console.log("Loaded Word Bank Data:", wordBank); // Debug loaded data
}

// Routes
// GET: Fetch Word Bank
app.get('/wordbank', (req, res) => {
    res.json(wordBank);
});

// POST: Save Word Bank
app.post('/wordbank', (req, res) => {
    console.log("Received Word Bank Data:", req.body); // Debug incoming data
    wordBank = req.body;

    // Save to file
    try {
        fs.writeFileSync('wordbank.json', JSON.stringify(wordBank, null, 2)); // Save to file
        console.log("Word Bank saved to file: wordbank.json");
        res.status(200).send('Word Bank updated successfully!');
    } catch (error) {
        console.error("Error writing to file:", error);
        res.status(500).send('Failed to save Word Bank.');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});