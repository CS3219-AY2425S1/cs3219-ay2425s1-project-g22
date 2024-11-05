import io from 'socket.io-client';

const socket = io('http://localhost:8081');

const socketService = {
  register: (username) => {
    socket.emit('register', username);
  },

  sendMatchRequest: (matchRequest) => {
    socket.emit('matching-request', matchRequest);
  },

  sendMatchCancel: (matchRequest) => {
    console.log('Cancelling match request:', matchRequest);
    socket.emit('match-cancel', matchRequest);
  },

  onMatchResult: (callback) => {
    socket.on('match-result', callback);
  },

  offMatchResult: () => {
    socket.off('match-result');
  },

  onMatchTimeout: (callback) => {
    socket.on('match-timeout', callback);
  },

  offMatchTimeout: () => {
    socket.off('match-timeout');
  },

  sendAcceptanceStatus: (acceptanceStatus) => {
    socket.emit('acceptance-status', acceptanceStatus);
  },

  onAcceptanceUpdate: (callback) => {
    socket.on('matched-user-acceptance-update', callback);
  },

  offAcceptanceUpdate: () => {
    socket.off('matched-user-acceptance-update');
  },

  sendToCollabRoom: (collabRoomData) => {
    socket.emit('collab-room-data', collabRoomData);
  },

  onCollabRoom: (callback) => {
    socket.on('open-collab-room', callback);
  },

  // sendRematchNotification: (rematchData) => {
  //   socket.emit('rematch-notification', rematchData);
  // },
};

export default socketService;
