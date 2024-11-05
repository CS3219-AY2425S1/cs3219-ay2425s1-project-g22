// Room MUST be created first through website
// Connect to docker container's shell and run this file to emulate martinng01 typing

const { io } = require('socket.io-client');

code = ""

const socket = io('http://localhost:8888', {
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('Connected to server with socket ID:', socket.id);

  // Register the user after connecting
  const userId = 'martinng01';
  socket.emit('register', userId);
  console.log(`User registered: ${userId}`);

  // Simulate typing by sending each character separately with a delay
  const codeToType = `
  def reverse_string(s):
    """
    Reverses the input array of characters in-place.
    """
    left, right = 0, len(s) - 1
    while left < right:
        # Swap characters at left and right pointers
        s[left], s[right] = s[right], s[left]
        left += 1
        right -= 1
  `;
  let index = 0;

  function simulateTyping() {
    if (index < codeToType.length) {
      code += codeToType.at(index);
      console.log(`Sending code change`);
      socket.emit('code-change', code);

      index += 1;
      setTimeout(simulateTyping, Math.random() * 500 + 100);  // Random delay between 50-250 ms
    }
  }

  // Start typing simulation after a slight delay
  setTimeout(simulateTyping, 1000);  
});

// Handle disconnection
socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

socket.on('code-change', (data) => {
  console.log('Received code change:', data);
  code = data;
});

// Handle any error
socket.on('error', (err) => {
  console.error('Connection error:', err);
});
