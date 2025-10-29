import { api } from './api.js'; // Import the mock API

// This function is only used internally, so we don't export it
function addMessageToChat(message, sender, videoIds = null) {
    const chatWindow = document.getElementById('chat-window');
    const wrapper = document.createElement('div');
    wrapper.className = `chat-msg-wrapper ${sender}`;
    let contentHTML = '';

    if (sender === 'ai') {
        // Handle array of messages
        const points = Array.isArray(message) ? message : [message];
        const bulletPoints = points.map(point => `<li>${point}</li>`).join('');
        contentHTML += `<ul class="list-disc list-inside space-y-2">${bulletPoints}</ul>`;
        
        if (videoIds && videoIds.length > 0) {
            contentHTML += `<h4>Related Videos:</h4>`;
            videoIds.forEach(videoId => {
                contentHTML += `<div class="video-container"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`;
            });
        }
    } else {
        contentHTML = `<p>${message}</p>`;
    }
    wrapper.innerHTML = `<div class="chat-msg ${sender}">${contentHTML}</div>`;
    chatWindow.appendChild(wrapper);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// This function is exported to be used in main.js
export async function handleChatSubmit(e) {
    e.preventDefault();
    const chatInput = document.getElementById('chat-input');
    const userInput = chatInput.value.trim();
    if (!userInput) return;

    addMessageToChat(`<strong>Your Query:</strong><br>${userInput}`, 'user');
    chatInput.value = '';

    // --- UI/UX IMPROVEMENT ---
    // 1. Create and add the "typing..." indicator
    const chatWindow = document.getElementById('chat-window');
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'chat-msg-wrapper ai';
    typingIndicator.id = 'typing-indicator'; // Give it an ID
    typingIndicator.innerHTML = `<div class="chat-msg ai">AI is typing...</div>`;
    chatWindow.appendChild(typingIndicator);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    // -------------------------

    const response = await api.getAIResponse(userInput);

    // --- UI/UX IMPROVEMENT ---
    // 2. Remove the "typing..." indicator
    document.getElementById('typing-indicator').remove();
    // -------------------------

    if (response.success) {
        addMessageToChat(response.text, 'ai', response.videos);
    } else {
        addMessageToChat(["Sorry, I'm having trouble connecting."], 'ai');
    }
}