// socket.js
import { Server } from 'socket.io';

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    socket.on('join_subject', ({ sub_id, user_id }) => {
      const roomName = `subject_${sub_id}`;
      socket.join(roomName);
      socket.userId = user_id;
      socket.currentRoom = roomName;
    });

    socket.on('leave_subject', ({ sub_id, user_id }) => {
      const roomName = `subject_${sub_id}`;
      socket.leave(roomName);
    });

    socket.on('send_message', ({ message, sub_id }) => {
      const roomName = `subject_${sub_id}`;
      
      // Broadcast to ALL clients in the room (including sender for consistency)
      io.to(roomName).emit('new_message', message);
    });

    socket.on('typing', ({ sub_id, user_id, user_name, isTyping }) => {
      const roomName = `subject_${sub_id}`;
      
      // Broadcast to others in the room (excluding sender)
      socket.to(roomName).emit('typing', { user_id, user_name, isTyping });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Add error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
};

export default setupSocket;