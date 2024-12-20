// Load both Word Bank and Text Boxes when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadWordBank(); // Load word bank data
    loadTextBoxes(); // Load text boxes
});

// Save the left-side text boxes to localStorage
function saveTextBoxes() {
    const textBoxContainer = document.getElementById('textBoxContainer');
    const textBoxData = Array.from(textBoxContainer.querySelectorAll('textarea')).map(textarea => textarea.value.trim());
    localStorage.setItem('textBoxes', JSON.stringify(textBoxData));
}

// Load the left-side text boxes from localStorage
function loadTextBoxes() {
    const textBoxContainer = document.getElementById('textBoxContainer');
    const savedTextBoxes = JSON.parse(localStorage.getItem('textBoxes')) || [];

    textBoxContainer.innerHTML = ''; // Clear existing boxes
    if (savedTextBoxes.length === 0) {
        // Add a default empty text box if no boxes are saved
        addTextBoxWithData('');
    } else {
        savedTextBoxes.forEach(text => addTextBoxWithData(text));
    }
}

// Add a text box with specific data (used for reloading saved boxes)
function addTextBoxWithData(text = '') {
    const container = document.getElementById("textBoxContainer");
    const newBox = document.createElement("div");
    newBox.className = "dynamic-box";
    newBox.innerHTML = `
        <textarea placeholder="Enter text here..." oninput="adjustHeight(this)">${text}</textarea>
        <div class="controls">
            <button class="add-box-btn" onclick="addTextBox()">+</button>
            <button class="delete-box-btn" onclick="deleteTextBox(this)">x</button>
        </div>
    `;
    container.appendChild(newBox);
    saveTextBoxes(); // Save whenever a new box is added
}

// Add a new empty text box
function addTextBox() {
    addTextBoxWithData(''); // Add an empty text box
}

// Delete a text box and save changes
function deleteTextBox(button) {
    const box = button.closest(".dynamic-box");
    box.remove();
    saveTextBoxes(); // Save whenever a box is deleted
}

// Adjust the height of the textarea dynamically
function adjustHeight(element) {
    element.style.height = "auto";
    element.style.height = element.scrollHeight + "px";
    saveTextBoxes(); // Save changes when editing a text box
}

// Word Bank Functionality
function loadWordBank() {
    fetch('https://deutsche-1.onrender.com/wordbank')
        .then(response => response.json())
        .then(data => {
            console.log("Fetched Word Bank Data:", data);
            clearWordBankTable(); // Clear existing rows to avoid duplication
            data.forEach(item => addRowWithData(item.word, item.translation, item.category));
            saveToLocalStorage(data); // Save to local storage for redundancy
        })
        .catch(error => {
            console.error("Error fetching Word Bank from server:", error);
            alert("Could not fetch Word Bank. Ensure the server is running.");
        });
}

function saveWordBank() {
    const tableRows = document.querySelectorAll('#wordBankTable tbody tr');
    const wordBankArray = [];

    // Collect data from the table
    tableRows.forEach(row => {
        const word = row.querySelector('input.word-input').value.trim();
        const translation = row.querySelector('input.translation-input').value.trim();
        const category = row.querySelector('select').value;

        if (word) {
            wordBankArray.push({ word, translation, category });
        }
    });

    // Send data to the server
    fetch('https://deutsche-1.onrender.com/wordbank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wordBankArray)
    })
        .then(response => {
            if (response.ok) {
                console.log("Word Bank successfully sent to the server.");
                saveToLocalStorage(wordBankArray); // Save locally for redundancy
            } else {
                console.error("Failed to send Word Bank to the server.");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Could not connect to the server. Ensure the server is running.");
        });
}

function clearWordBankTable() {
    const tableBody = document.querySelector("#wordBankTable tbody");
    tableBody.innerHTML = ""; // Clear all rows
}

function saveToLocalStorage(data) {
    localStorage.setItem('wordBankData', JSON.stringify(data));
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
                <option value="preposition" ${categoryValue === 'preposition' ? 'selected' : ''}>Preposition</option>
                <option value="expression" ${categoryValue === 'expression' ? 'selected' : ''}>Expression</option>
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
}

function addRow() {
    addRowWithData();
    saveWordBank();
}

function deleteRow(deleteIcon) {
    const row = deleteIcon.closest('tr');
    row.remove();
    saveWordBank();
}

function updateRow(updateIcon) {
    saveWordBank();
    alert("Word bank updated.");
}

function playRowText(playIcon) {
    const row = playIcon.closest('tr');
    const word = row.querySelector('.word-input').value;
    if (word) {
        speakText(word);
    } else {
        alert("No word to play.");
    }
}

function exportWordBank() {
    const tableRows = document.querySelectorAll('#wordBankTable tbody tr');
    let words = "";

    tableRows.forEach(row => {
        const word = row.querySelector('.word-input').value.trim();
        if (word) {
            words += word + "\n";
        }
    });

    if (words) {
        const blob = new Blob([words], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "wordbank.txt";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert("No words to export. Please add some words first.");
    }
}
