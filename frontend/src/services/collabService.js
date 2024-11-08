import io from 'socket.io-client';

const socket = io('http://localhost:8888');

const chatMessageCallbacks = new Set();

let chatListenerAdded = false; // Flag to prevent duplicate listeners

const collabService = {
  register: (username) => {
    return new Promise((resolve, reject) => {
      socket.emit('register', username, (response) => {
        if (!response.success) {
          console.error('Error registering user:', response.error);
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  },

  disconnect: (username) => {
    socket.emit('disconnect-collab');
  },

  getRoomDetails: (roomId) => {
    return new Promise((resolve, reject) => {
      socket.emit('get-room-details', roomId, (response) => {
        if (!response.success) {
          console.error('Error getting room details:', response.error);
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  },

  getRoomId: (username) => {
    return new Promise((resolve, reject) => {
      socket.emit('get-roomId-from-username', username, (response) => {
        if (!response.success) {
          console.error('Error getting room ID:', response.error);
          reject(new Error(response.error));
        } else {
          resolve(response.roomId);
        }
      });
    });
  },

  sendCode: (code) => {
    socket.emit('code-change', code);
  },

  onCodeChange: (callback) => {
    socket.on('code-change', (code) => {
      callback(code);
    });
  },

  onOtherUserDisconnect: (callback) => {
    socket.on('other-user-disconnect', () => {
      callback();
    });
  },

  onChatMessage: (callback) => {
    if (!chatListenerAdded) {
      socket.on('chat-message', (data) => {
        chatMessageCallbacks.forEach((cb) => cb(data));
      });
      chatListenerAdded = true;
    }
    chatMessageCallbacks.add(callback); // Add to the Set
  },

  offChatMessage: (callback) => {
    chatMessageCallbacks.delete(callback); // Remove specific callback
  },

  sendChatMessage: (message) => {
    socket.emit('chat-message', message);
  },
};

export default collabService;
