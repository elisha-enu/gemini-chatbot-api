const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Maintain the conversation history to provide context to Gemini
let conversation = [];

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // 1. Add user message to UI and history
  appendMessage('user', userMessage);
  conversation.push({ role: 'user', text: userMessage });
  
  // Clear and disable input during processing
  input.value = '';
  input.disabled = true;
  const submitBtn = form.querySelector('button');
  if (submitBtn) submitBtn.disabled = true;

  // 2. Show a temporary "Thinking..." bot message
  const botMessageElement = appendMessage('bot', 'Thinking...');

  try {
    // 3. Send the request to your Express backend
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversation }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from server.');
    }

    const data = await response.json();

    // 4. Replace "Thinking..." with the actual response
    if (data && data.result) {
      botMessageElement.textContent = data.result;
      // Add the model's response to the history for future turns
      conversation.push({ role: 'model', text: data.result });
    } else {
      botMessageElement.textContent = 'Sorry, no response received.';
    }
  } catch (error) {
    console.error('Chat Error:', error);
    botMessageElement.textContent = 'Failed to get response from server.';
  } finally {
    // Re-enable input
    input.disabled = false;
    if (submitBtn) submitBtn.disabled = false;
    input.focus();
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  const containerMsg = document.createElement('div');
  containerMsg.classList.add('message-container', sender);

  msg.classList.add('message', sender);
  msg.textContent = text;
  containerMsg.appendChild(msg);
  chatBox.appendChild(containerMsg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg; // Return the element so we can update its text later
}
