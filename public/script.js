const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Maintain the conversation history to provide context to Gemini
let conversation = [];

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  // Get health profile data from inputs
  const gender = document.getElementById('gender')?.value;
  const age = document.getElementById('age')?.value;
  const height = document.getElementById('height')?.value;
  const weight = document.getElementById('weight')?.value;


  if (!gender || !age || !height || !weight) {
    alert('Lengkapi data diri dulu ya');
    return;
  }

  const userMessage = input.value.trim();
  if (!userMessage) return;


  // 1. Add user message to UI
  appendMessage('user', userMessage);

  // Prepare context for AI: Prepend profile details to the first message only
  let aiMessagePayload = userMessage;
  
  if (conversation.length === 0) {
    aiMessagePayload = `[Profil: ${gender}, ${age} tahun, ${height}cm, ${weight}kg] ${userMessage}`;

    lockProfile(); 
  }


  // Add to conversation history
  conversation.push({ role: 'user', text: aiMessagePayload });


  if (conversation.length === 1) {
    document.querySelector('.chips').style.display = 'none';
  }

  // Clear and disable input during processing
  input.value = '';
  input.disabled = true;
  const submitBtn = form.querySelector('button');
  if (submitBtn) submitBtn.disabled = true;

  // 2. Show a temporary "Thinking..." bot message
  const botMessageElement = appendMessage('bot', '');
  botMessageElement.innerHTML = `
    <div class="typing">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;

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
      botMessageElement.innerHTML = data.result;
      // Add the model's response to the history for future turns
      conversation.push({ role: 'model', text: data.result });
    } else {
      botMessageElement.innerHTML = 'Sorry, no response received.';
    }
  } catch (error) {
    console.error('Chat Error:', error);
    botMessageElement.innerHTML = 'Failed to get response from server.';
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


function lockProfile() {
  const profile = document.querySelector('.profile');
  profile.classList.add('locked');

  document.querySelectorAll('.profile input, .profile select')
    .forEach(el => el.disabled = true);
}

const toggleBtn = document.getElementById('theme-toggle');

// load saved theme
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
}

toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');

  localStorage.setItem(
    'theme',
    document.body.classList.contains('dark') ? 'dark' : 'light'
  );
});

document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    input.value = chip.textContent;
    input.focus();
  });
});