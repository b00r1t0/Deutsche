// Load word bank data from local storage when the page loads
document.addEventListener('DOMContentLoaded', loadWordBank);

function loadWordBank() {
    const storedData = localStorage.getItem('wordBankData');
    if (storedData) {
        const wordBankArray = JSON.parse(storedData);
        wordBankArray.forEach(item => addRowWithData(item.word, item.translation, item.category));
    }

    // Fetch initial data from the server
    fetch('https://deutsche.onrender.com/wordbank')
        .then(response => response.json())
        .then(data => {
            data.forEach(item => addRowWithData(item.word, item.translation, item.category));
            console.log("Fetched Word Bank from server:", data);
        })
        .catch(error => {
            console.error("Error fetching Word Bank from server:", error);
            alert("Could not fetch data from the server. Ensure the server is running.");
        });
}

function saveWordBank() {
    const tableRows = document.querySelectorAll('#wordBankTable tbody tr');
    const wordBankArray = [];

    // Collect all the data from the table
    tableRows.forEach(row => {
        const word = row.querySelector('input.word-input').value.trim();
        const translation = row.querySelector('input.translation-input').value.trim();
        const category = row.querySelector('select').value;

        if (word) { // Only include rows with a word
            wordBankArray.push({ word, translation, category });
        }
    });

    // Save to local storage
    localStorage.setItem('wordBankData', JSON.stringify(wordBankArray));

    // Send the updated data to the server
    fetch('https://deutsche.onrender.com/wordbank', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(wordBankArray)
    })
    .then(response => {
        if (response.ok) {
            console.log("Word Bank successfully sent to server.");
        } else {
            console.error("Failed to send Word Bank to server.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Could not connect to the server. Ensure the server is running.");
    });
}

function addRowWithData(wordValue = '', translationValue = '', categoryValue = 'noun') {
    const table = document.querySelector("#wordBankTable tbody");

    const newRow = document.createElement("tr");

    newRow.innerHTML = `
        <td><input type="text" placeholder="Enter word" class="word-input" value="${wordValue}"></td>
        <td><input type="text" placeholder="Enter translation" class="translation-input" value="${translationValue}"></td>
        <td>
            <select>
                <option value="noun" ${categoryValue === 'noun' ? 'selected' : ''}>Noun</option>
                <option value="verb" ${categoryValue === 'verb' ? 'selected' : ''}>Verb</option>
                <option value="adjective" ${categoryValue === 'adjective' ? 'selected' : ''}>Adjective</option>
                <option value="adverb" ${categoryValue === 'adverb' ? 'selected' : ''}>Adverb</option>
            </select>
        </td>
        <td class="add-row" onclick="addRow()">+</td>
        <td class="update-row" onclick="updateRow(this)">
            <button class="action-btn"><i class="fas fa-sync-alt"></i></button>
        </td>
        <td class="delete-row" onclick="deleteRow(this)">
            <button class="action-btn"><i class="fas fa-times"></i></button>
        </td>
        <td class="play-row">
            <button class="action-btn" onclick="playRowText(this)">
                <i class="fas fa-play"></i>
            </button>
        </td>
    `;

    table.appendChild(newRow);
    saveWordBank();
}

function addRow() {
    addRowWithData();
}

function deleteRow(deleteIcon) {
    const row = deleteIcon.closest('tr'); // Only select the current row
    row.remove(); // Remove the specific row
    saveWordBank(); // Save the updated table to local storage
}

function updateRow(updateIcon) {
    saveWordBank();
    alert("Word bank updated.");
}

function playRowText(playIcon) {
    const row = playIcon.closest('tr');
    const word = row.querySelector('.word-input').value;
    if (word) {
        speakText(word); // Call speakText from german-tts.js
    } else {
        alert("No word to play.");
    }
}

// Export the words in the Word Bank to a .txt file
function exportWordBank() {
    const tableRows = document.querySelectorAll('#wordBankTable tbody tr');
    let words = "";

    tableRows.forEach(row => {
        const word = row.querySelector('.word-input').value.trim();
        if (word) {
            words += word + "\n"; // Append word with a newline
        }
    });

    if (words) {
        const blob = new Blob([words], { type: "text/plain" }); // Create a .txt file
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "wordbank.txt"; // File name for download
        document.body.appendChild(link);
        link.click(); // Trigger the download
        document.body.removeChild(link); // Clean up the link
    } else {
        alert("No words to export. Please add some words first.");
    }
}
