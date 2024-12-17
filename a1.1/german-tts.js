// Function to find a German voice
function getGermanVoice() {
    const voices = window.speechSynthesis.getVoices(); // Get all available voices
    return voices.find(voice => voice.lang === 'de-DE'); // Select German voice
}

// Function to speak the text in German
function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        const germanVoice = getGermanVoice();

        if (germanVoice) {
            utterance.voice = germanVoice;
        } else {
            alert("German voice not found. Please check your browser's TTS settings.");
        }

        utterance.lang = 'de-DE'; // Ensure German is set
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Your browser does not support text-to-speech.");
    }
}

// Ensure voices are loaded before speaking
window.speechSynthesis.onvoiceschanged = () => getGermanVoice();
