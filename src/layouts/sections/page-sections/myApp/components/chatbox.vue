<script setup>
import { ref, onMounted, onBeforeMount, nextTick } from 'vue';
import { v4 as uuidv4 } from 'uuid';

const messages = ref([]);
const newMessage = ref('');
const userId = ref('');

// Function to generate or retrieve a unique user ID
function getUserId() {
  let storedId = localStorage.getItem('chatUserId');
  if (!storedId) {
    storedId = uuidv4(); // Generate a new UUID
    localStorage.setItem('chatUserId', storedId);
  }
  userId.value = storedId;
}

// Function to format the userId for display
function formatUserId(id) {
  if (id.length < 4) return id;
  return `${id.slice(0, 3)}...${id.slice(-3)}`;
}

// Function to scroll to the bottom of the chat box
function scrollToBottom() {
  nextTick(() => {
    const chatBox = document.querySelector('.chat-box');
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// Function to load chat messages from the server
function loadMessages() {
  fetch('https://harvestbuddy.site:5000/api/chat')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      messages.value = data;
      scrollToBottom();
    })
    .catch(error => {
      console.error('Failed to load messages:', error);
    });
}

// Function to send a new chat message
function sendMessage() {
  if (newMessage.value.trim()) {
    const messageData = {
      content: newMessage.value,
      timestamp: new Date().toLocaleTimeString(),
      userId: userId.value,
    };
    messages.value.push(messageData);
    scrollToBottom();

    // Send message to backend to store it in the text file
    fetch('https://harvestbuddy.site:5000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });

    newMessage.value = '';
  }
}

// Load messages and get user ID when the component is mounted
onMounted(() => {
  loadMessages();
});

onBeforeMount(() => {
  getUserId();
});
</script>

<template>
  <div class="card">
    <div class="card-header card-header-primary">
      <h4 class="card-title">Live Chat</h4>
    </div>
    <div class="card-body chat-box">
      <div v-for="message in messages" :key="message.timestamp + message.content" class="chat-message"
        :class="{ 'own-message': message.userId === userId.value, 'other-message': message.userId !== userId.value }">
        <a :href="`https://solscan.io/account/${message.userId}?cluster=custom&customUrl=https://mainnetbeta-rpc.eclipse.xyz`" target='_blank'>
          <strong>{{ formatUserId(message.userId) }} - {{ message.timestamp }}:</strong>
        </a>
        {{ message.content }}
      </div>
    </div>
    <div class="card-footer">
      <div class="input-group">
        <input v-model="newMessage" @keyup.enter="sendMessage" class="form-control" placeholder="Type a message..." />
        <div class="input-group-append">
          <button class="btn btn-primary" @click="sendMessage">Send</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-box {
  height: 300px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #ddd;
  background-color: #f8f9fa;
}

.chat-message {
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 10px;
  max-width: 70%;
  word-wrap: break-word;
}

.own-message {
  background-color: #e3f2fd;
  margin-left: auto;
  text-align: right;
}

.other-message {
  background-color: #f1f1f1;
  margin-right: auto;
  text-align: left;
}

.card-footer {
  padding-top: 10px;
  border-top: 1px solid #ddd;
}
</style>
