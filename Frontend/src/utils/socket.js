import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

let socket;

export const initializeSocket = () => {
  socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ['websocket']
  });
  return socket;
};

export const getSocket = () => {
  if (!socket) throw new Error('Socket not initialized!');
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};